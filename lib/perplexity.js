import dotenv from 'dotenv';
import fetch from 'node-fetch';
import {convertToJSONWithDeepSeek} from './deepseek.js';

dotenv.config();

const question = "Search the web for at least 10 tech news articles WRITTEN IN THE LAST TWO MONTHS that focus exclusively on hiring, job growth, and good news in the tech industry, and in particular future predictions for hiring and growth - double check the publish date against todays date. it's very important the news is up to date but it can be older if it references the current year. It's also important to include some articles from or about the UK. Exclude all negative stories such as layoffs or declines. For each positive news item, list them numerically with a title, brief summary of the news, the source url, source name (e.g. TechCrunch, The Guardian, etc.), and the published date (month and year only) if you can see it. Your response must be succinct, factual, and strictly limited to the requested information without any fluff or extraneous commentary. The end result should be a list of positive news items and their urls dated within the last 2 months";

export async function askPerplexity() {
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityKey) {
        throw new Error('PERPLEXITY_KEY not found in environment');
    }

    try {
        console.log('Sending request to Perplexity API...');
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${perplexityKey}`
            },
            body: JSON.stringify({
                "model": "sonar-deep-research",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant focused on providing comprehensive, well-researched information. Always cite your sources and provide detailed, structured responses."
                    },
                    {
                        "role": "user",
                        "content": question
                    }
                ],
                "temperature": 0.1,
                "top_p": 1.0,
                "stream": false,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0
            }),
            timeout: 240000 // 4 minute timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('\nPerplexity API Response:', JSON.stringify(result, null, 2));
        
        // Convert the entire response to JSON format using DeepSeek
        const jsonResults = await convertToJSONWithDeepSeek(JSON.stringify(result));
        console.log('\nConverted to JSON:', jsonResults);

        return jsonResults;

    } catch (error) {
        console.error('\nPerplexity API Error:', error.message);
        throw error;
    }
}