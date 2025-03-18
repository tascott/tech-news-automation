import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function analyzeWithDeepSeek(newsText) { // To be used for RSS feeds and other sources
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Extract JSON with the keys title, content, source_url, source_name, and published_at for each news item (as well as the values) provided in the text. Return the JSON only, no other text or commentary. published_at should be in the format of month and year only (e.g. 'March 2025'). If you don't see the value for any of the keys, return null for that key.",
                },
                {
                    role: "user",
                    content: newsText,
                },
            ],
        });

        // Clean up the response by removing markdown code blocks if present
        let content = completion.choices[0].message.content;
        content = content.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();

        return JSON.parse(content);
    } catch(error) {
        console.error('DeepSeek Analysis Error:',error);
        throw error;
    }
}