import Parser from 'rss-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const parser = new Parser();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const FEED_URLS = [
    'https://news.ycombinator.com/rss',
    'https://techcrunch.com/feed/',
    'https://www.techmeme.com/feed.xml'
];

async function analyseSentiment(title) {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You classify tech headlines into -1, 0, or 1. MOST tech news should be 0 (neutral). Only use -1 for clearly negative events."
                },
                {
                    role: "user",
                    content: "Examples:\n\n'Company X releases new API' → 0\n'Researchers discover new algorithm' → 0\n'Major data breach affects millions' → -1\n'Tech startup files for bankruptcy' → -1\n'Team achieves breakthrough in AI' → 1\n\nClassify this headline (just respond with -1, 0, or 1):\n" + title
                }
            ],
            temperature: 0
        });

        const sentiment = parseInt(completion.choices[0].message.content.trim());
        return sentiment;
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return 0; // Default to neutral on error
    }
}

export async function fetchFeeds() {
    try {
        const feedPromises = FEED_URLS.map(url => parser.parseURL(url));
        const feeds = await Promise.all(feedPromises);
        const now = new Date().toISOString();
        let successCount = 0;
        let errorCount = 0;

        for (const feed of feeds) {
            for (const item of feed.items) {
                try {


                    // Format date to show only month and year
                    const date = new Date(item.isoDate);
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const formattedDate = `${months[date.getMonth()]} ${date.getFullYear()}`;

                    // Function to clean HTML content
                    const cleanContent = (content) => {
                        if (!content) return '';
                        // Remove HTML tags
                        return content.replace(/<[^>]*>/g, ' ')
                            // Replace HTML entities
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&mdash;/g, '—')
                            .replace(/&hellip;/g, '...')
                            .replace(/&#8217;/g, "'")
                            .replace(/&#8230;/g, '...')
                            // Remove multiple spaces
                            .replace(/\s+/g, ' ')
                            .trim();
                    };

                    // Get the best content based on source
                    const getBestContent = (item, feedTitle) => {
                        // For Hacker News, return null since it only has comments
                        if (feedTitle === 'Hacker News') {
                            return null;
                        }
                        
                        // For other sources, try to get the best content
                        if (item.contentSnippet && !item.contentSnippet.includes('Comments')) {
                            return cleanContent(item.contentSnippet);
                        }
                        if (item.content && !item.content.includes('Comments')) {
                            return cleanContent(item.content);
                        }
                        return null; // Return null if no valid content found
                    };

                    // Create the news item object first
                    const newsItem = {
                        title: item.title,
                        content: getBestContent(item),
                        source_url: item.link,
                        source_name: feed.title,
                        content_type: 'RSS',
                        published_at: formattedDate,
                        added_at: now,
                        last_updated_at: now,
                        is_active: true,
                        metadata: {
                            categories: item.categories || [],
                            creator: item.creator || item['dc:creator'],
                            guid: item.guid || null
                        }
                    };

                    // Check sentiment
                    const sentiment = await analyseSentiment(item.title);
                    const sentimentLabel = sentiment === 1 ? 'positive' : sentiment === 0 ? 'neutral' : 'negative';
                    console.log(`\n${sentimentLabel}-`, item.title);

                    // Only add to DB if sentiment is positive
                    if (sentiment === 1) {
                        newsItem.sentiment = 'positive';

                        // Check if article already exists
                        const { data: existing } = await supabase
                            .from('curated_content')
                            .select('id')
                            .eq('source_url', item.link)
                            .limit(1);

                        if (!existing || existing.length === 0) {
                            const { error } = await supabase
                                .from('curated_content')
                                .insert(newsItem);

                            if (error) {
                                console.error('Error inserting item:', error);
                                errorCount++;
                            } else {
                                successCount++;
                            }
                        } else {

                        }
                    }
                } catch (error) {
                    errorCount++;
                }
            }
        }
    } catch (error) {
        throw error;
    }
}