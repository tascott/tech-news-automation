export async function searchPositiveTechNews() {
    const res = await fetch('https://api.perplexity.ai/chat/completions',{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'sonar-small-online',
            messages: [
                {role: 'user',content: 'Summarize recent positive news about tech hiring and layoffs in the last 3 days.'}
            ]
        })
    });

    const data = await res.json();

    return data.choices[0].message.content;
}


// Cheaper API for testing
export async function searchPositiveTechNews() {
    const res = await fetch('https://cheaper-api.com/search',{
        method: 'POST',
        headers: {'Authorization': `Bearer ${process.env.CHEAPER_API_KEY}`},
        body: JSON.stringify({query: 'Positive tech hiring news in last 3 days'})
    });

    const json = await res.json();
    return json.summary;
}