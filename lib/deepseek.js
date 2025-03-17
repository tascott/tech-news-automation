import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function searchPositiveTechNews() {
    try {
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: "user",
                    content: "Provide recent positive news about tech hiring or positive layoffs in the last 3 days, with URLs if possible.",
                }
            ],
        });

        console.log('2',completion);

        return completion.choices[0].message.content;
    } catch(error) {
        console.error('DeepSeek Error:',error);
        throw error;
    }
}

export async function analyzeNewsResults(newsText) {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Extract JSON with title, summary, date, and URL fields for each news item provided in the text.",
                },
                {
                    role: "user",
                    content: newsText,
                },
            ],
        });
        console.log('1',completion);
        return JSON.parse(completion.choices[0].message.content);
    } catch(error) {
        console.error('DeepSeek Analysis Error:',error);
        throw error;
    }
}