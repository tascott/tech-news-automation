import {searchPositiveTechNews} from './lib/deepseek.js';
import {supabase} from './lib/supabase.js';

async function runJob() {
    console.log('Fetching tech news...');
    try {
        const newsSummary = await searchPositiveTechNews();
        // const {error} = await supabase
        //     .from('curated_content')
        //     .insert({summary: newsSummary});

        // if(error) throw error;

        console.log('News saved successfully!');
        console.log(newsSummary);
    } catch(err) {
        console.error('Error:',err);
    }
}

runJob();