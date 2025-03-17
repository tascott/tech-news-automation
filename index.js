import {searchPositiveTechNews} from './lib/deepseek.js';
import {supabase} from './lib/supabase.js';

async function runPositiveTechNews() {
    console.log('[INFO] Running tech news script...');

    try {
        console.log('Calling LLM API...');
        const newsSummary = await searchPositiveTechNews();
        console.log('API response received:',newsSummary);

        // const {error} = await supabase
        //     .from('positive_tech_news')
        //     .insert({summary: newsSummary});

        // if(error) {
        //     console.error('Supabase error:',error);
        //     throw error;
        // }

        console.log('Inserted news to Supabase (not yet).');
    } catch(error) {
        console.error('Script error:',error);
    }
}

runPositiveTechNews();