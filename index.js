import {searchPositiveTechNews} from './lib/deepseek.js';
import {supabase} from './lib/supabase.js';

async function runPositiveTechNews() {
    console.log('[INFO2] Running tech news script...');

    try {
        console.log('Calling LLM API...');
        const newsSummary = await searchPositiveTechNews();
        console.log('API response received:',newsSummary);
        const now = new Date();
        const formattedDateTime = now.toLocaleString();

        const {error} = await supabase
            .from('curated_content')
            .insert({
                title: 'test',
                content: newsSummary,
                source_url: formattedDateTime,
            });

        if(error) {
            console.error('Supabase error:',error);
            throw error;
        }

        console.log('Inserted news to Supabase (not yet).');
    } catch(error) {
        console.error('Script error:',error);
    }
}

runPositiveTechNews();