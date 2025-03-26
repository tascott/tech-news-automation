import fetch from 'node-fetch';

/**
 * Fetch success stories using Reddit's JSON API
 * @returns {Promise<Array<{title: string, description: string, url: string}>>}
 */
export async function fetchRedditAPI() {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch('https://www.reddit.com/r/EngineeringResumes/search.json?q=flair%3ASuccess&restrict_sr=1&sort=new&limit=25', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data?.data?.children) {
                throw new Error('Invalid response format from Reddit');
            }

            return data.data.children
                .map(post => ({
                    title: post.data.title,
                    url: `https://reddit.com${post.data.permalink}`,
                    description: `Posted by ${post.data.author} (Score: ${post.data.score})`
                }))
                .filter(post => post.title && post.url); // Ensure we have valid data

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed:`, error);
            
            if (attempt < maxRetries - 1) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    console.error('All retry attempts failed');
    return [];
}

// Remove the test line for production
// fetchRedditAPI().then(console.log).catch(console.error);