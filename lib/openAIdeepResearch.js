import OpenAI from 'openai';
import dotenv from 'dotenv';
import {analyzeWithDeepSeek} from './deepseek.js';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function searchNewsWithOpenAIDeepResearch() {

    // TODO: First get a list of current batch of articles from the database,
    //and make sure we don't add the same ones again. Then add the new ones to the database.
    // or, run the fetch regardless and just don't add the duplicates.

    try {
        const webSearch = await client.responses.create({
            model: "gpt-4o",
            tools: [{type: "web_search_preview"}],
            input: "Search the web for at least 10 tech news articles WRITTEN IN THE LAST TWO MONTHS that focus exclusively on hiring, job growth, and good news in the tech industry, and in particular future predictions for hiring and growth - double check the publish date against todays date. it's very important the news is up to date but it can be older if it references the current year. It's also important to include some articles from or about the UK. Exclude all negative stories such as layoffs or declines. For each positive news item, list them numerically with a title, brief summary of the news, the source url, source name (e.g. TechCrunch, The Guardian, etc.), and the published date (month and year only) if you can see it. Your response must be succinct, factual, and strictly limited to the requested information without any fluff or extraneous commentary. The end result should be a list of positive news items and their urls dated within the last 2 months",
        });

        const newsResults = await analyzeWithDeepSeek(webSearch.output_text); // Convert using DeepSeek API

        console.log('newsResults--',newsResults);
        return newsResults;
    } catch(error) {
        console.error('OpenAI Error:',error);
        throw error;
    }
}