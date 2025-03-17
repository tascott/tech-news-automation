import {supabase} from './lib/supabase.js';

async function runPositiveTechNews() {
    console.log('[INFO] Testing Supabase connection...');

    try {
        const now = new Date();
        const formattedDateTime = now.toLocaleString();

        const {error} = await supabase
            .from('curated_content')
            .insert({
                title: 'test',
                content: formattedDateTime
            });

        if(error) {
            console.error('Supabase error:',error);
            throw error;
        }

        console.log('Successfully inserted test record to Supabase!');
    } catch(error) {
        console.error('Script error:',error);
    }
}

runPositiveTechNews();