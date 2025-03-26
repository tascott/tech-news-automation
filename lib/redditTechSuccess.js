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

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0'
    }
});

/**
 * Fetch success stories from Reddit using RSS
 * @returns {Promise<Array<{title: string, description: string, url: string}>>}
 */
export async function fetchRedditTechSuccess() {
    try {
        console.log('Fetching Reddit RSS feed...');
        const feed = await parser.parseURL('https://reddit.com/r/EngineeringResumes/comments/1jat015/meta_rengineeringresumes_success_story_posts/.rss');
        console.log('Got RSS feed, extracting first 8000 chars of content...');
        const content = feed.items[0].content.slice(0, 8000);

        console.log('Analyzing content with Deepseek...');
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at extracting success stories from Reddit content. Extract each success story and format it as a structured object with title, content (cleaned of HTML), source_url, source_name, content_type, and published_at fields."
                },
                {
                    role: "user",
                    content: `Extract success stories from this content and format each as a news item object like this example:
                        {
                            title: "[Story title or summary]",
                            content: "[Story content, cleaned of HTML]",
                            source_url: "[URL of the story]",
                            source_name: "Reddit Engineering Resumes",
                            content_type: "rss_tech_success",
                            published_at: "[Month Year]"
                        }

                        Here's the content to analyse: ${content}`
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        console.log('Got Deepseek response, parsing JSON objects...');
        const response = completion.choices[0].message.content;
        const matches = response.match(/\{[^\}]+\}/g) || [];
        const newsItems = matches.map(match => {
            try {
                return JSON.parse(match);
            } catch (e) {
                console.error('Failed to parse item:', match);
                return null;
            }
        }).filter(Boolean);

        let successCount = 0;
        let errorCount = 0;
        const now = new Date().toISOString();

        console.log(`Found ${newsItems.length} items, processing up to 20...`);
        // Process only the first 20 items
        for (const item of newsItems.slice(0, 20)) {
            console.log('\nProcessing item:', item.title);
            try {
                // Check if article already exists
                const { data: existing } = await supabase
                    .from('curated_content')
                    .select('id')
                    .eq('source_url', item.source_url)
                    .limit(1);

                if (existing && existing.length > 0) {
                    console.log('⚠️ Found existing item, stopping further processing');
                    break; // Stop processing more items
                }

                const newsItem = {
                    ...item,
                    added_at: now,
                    last_updated_at: now,
                    is_active: true
                };

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
        return newsItems;

    } catch (error) {
        console.error('Error processing Reddit content:', error);
        return [];
    }
}