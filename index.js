import {searchNewsWithOpenAIDeepResearch} from './lib/openAIdeepResearch.js';
import {supabase} from './lib/supabase.js';
import {askPerplexity} from './lib/perplexity.js';


function convertLLMResponseToJSON(llmResponse) {
    console.log('Raw LLM Response:',llmResponse);
    console.log('Response type:',typeof llmResponse);
    if(typeof llmResponse === 'object') {
        console.log('Response is already an object, returning as is');
        return llmResponse;
    }
    console.log('Attempting to parse JSON string');
    return JSON.parse(llmResponse);
}

async function runPositiveTechNews() {
    console.log('[INFO] Running tech news script...');
    const now = new Date().toISOString();
    let successCount = 0;
    let errorCount = 0;

    try {
        console.log('Calling LLM APIs...');
        const openAiNewsSummary = await searchNewsWithOpenAIDeepResearch();
        console.log('OpenAI News Summary received:', openAiNewsSummary);

        const perplexityNewsSummary = await askPerplexity();
        console.log('Perplexity News Summary received:', perplexityNewsSummary);

        const openAiNewsSummaryJSON = convertLLMResponseToJSON(openAiNewsSummary);
        console.log('OpenAI Converted to JSON:', openAiNewsSummaryJSON);

        // Add content_type to each source's items
        const openAiItems = openAiNewsSummaryJSON.map(item => ({ ...item, content_type: 'openai_deep_research' }));
        const perplexityItems = perplexityNewsSummary.map(item => ({ ...item, content_type: 'perplexity_deep_research' }));

        // Combine both sources
        const allNewsItems = [...openAiItems, ...perplexityItems];
        console.log('Combined news items:', allNewsItems);

        for(const newsItem of allNewsItems) {
            try {
                console.log('Processing item:', newsItem);
                const {error} = await supabase
                    .from('curated_content')
                    .insert({
                        title: newsItem.title,
                        content: newsItem.content,
                        source_url: newsItem.source_url,
                        source_name: newsItem.source_name,
                        sentiment: null,
                        content_type: newsItem.content_type,
                        published_at: newsItem.published_at,
                        added_at: now,
                        last_updated_at: now,
                        is_active: true,
                        metadata: {}
                    });

                if(error) {
                    console.error('Error inserting item:',error);
                    errorCount++;
                } else {
                    successCount++;
                }
            } catch(itemError) {
                console.error('Error processing item:',itemError);
                errorCount++;
            }
        }

        console.log(`Successfully inserted ${successCount} items, ${errorCount} errors.`);
    } catch(error) {
        console.error('Script error:',error);
    }
}

runPositiveTechNews();