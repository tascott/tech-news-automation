import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export async function saveNews(newsSummary) {
    const {error} = await supabase.from('curated_content').insert({
        summary: newsSummary,
        fetched_at: new Date()
    });

    if(error) throw error;
}