import {searchPositiveTechNews,analyzeNewsResults} from '../lib/deepseek';
import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_BASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req,res) {
    try {
        const newsText = await searchPositiveTechNews();
        const analyzedResults = await analyzeNewsResults(newsText);

        const newsItems = analyzedResults.map(item => ({
            title: item.title,
            summary: item.summary,
            source_url: item.source_url,
            date: item.date || new Date(),
        }));

        await supabase
            .from('positive_tech_news')
            .insert(newsItems);

        res.status(200).json({status: 'success',newsItems});
    } catch(error) {
        console.error('Cron job error:',error);
        res.status(500).json({status: 'error',error: error.message});
    }
}