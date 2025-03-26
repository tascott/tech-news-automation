import Parser from 'rss-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const RSS_URL = 'http://www.reddit.com/r/UpliftingNews+goodnews.rss';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
    }
});

export async function fetchRedditGoodNews() {
    try {
        console.log('Fetching RSS feed...');
        const feed = await parser.parseURL(RSS_URL);
        
        console.log(`Found ${feed.items.length} items, processing up to 20...`);
        let successCount = 0;
        let errorCount = 0;
        const now = new Date().toISOString();

        // Process only first 20 items
        for (const item of feed.items.slice(0, 20)) {
            console.log('\nProcessing:', item.title);
            
            try {
                // Extract the actual news URL from the content HTML
                const urlMatch = item.content.match(/href="([^"]+)"\s*>\s*\[link\]/i);
                const actualUrl = urlMatch ? urlMatch[1] : item.link;

                // Format date as Month Year
                const date = new Date(item.isoDate);
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const formattedDate = `${months[date.getMonth()]} ${date.getFullYear()}`;

                const newsItem = {
                    title: item.title,
                    content: item.contentSnippet,
                    source_url: actualUrl,
                    source_name: 'Reddit Good News',
                    content_type: 'rss_reddit_goodnews',
                    published_at: formattedDate,
                    added_at: now,
                    last_updated_at: now,
                    is_active: true,
                    metadata: {
                        author: item.author,
                        reddit_id: item.id
                    }
                };

                // Check if article already exists
                const { data: existing } = await supabase
                    .from('curated_content')
                    .select('id')
                    .eq('source_url', actualUrl)
                    .limit(1);

                if (existing && existing.length > 0) {
                    console.log('⚠️ Found existing item, stopping further processing');
                    break;
                }

                const { error } = await supabase
                    .from('curated_content')
                    .insert(newsItem);

                if (error) {
                    console.error('Error inserting item:', error);
                    errorCount++;
                } else {
                    successCount++;
                    console.log('✅ Successfully added to database');
                }

            } catch (error) {
                console.error('Error processing item:', error);
                errorCount++;
            }
        }

        console.log('\n=========================');
        console.log(`📊 Processing complete\n   Success: ${successCount}\n   Errors: ${errorCount}`);
        console.log('=========================');

    } catch (error) {
        console.error('Error fetching RSS:', error);
    }
}