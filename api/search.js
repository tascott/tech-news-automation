import {searchPositiveTechNews} from '../lib/searchNews';
import {createClient} from '@supabase/supabase-js';

export default async function handler(req,res) {
    const supabase = createClient(
        process.env.DEEP_SUPABASE_URL,
        process.env.DEEP_SUPABASE_SERVICE_KEY
    );

    const newsResult = await searchPositiveTechNews();

    // Insert results into Supabase
    const {data,error} = await supabase
        .from('curated_content')
        .insert([{summary: newsContent,date: new Date()}]);

    if(error) {
        console.error('Supabase insert error:',error);
        return res.status(500).json({error: 'Insert failed'});
    }

    return res.status(200).json({message: 'News inserted successfully',data});
}