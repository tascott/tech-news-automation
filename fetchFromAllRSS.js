import { fetchFeeds } from './lib/rssNewsFeeds.js';
import { fetchRedditTechSuccess } from './lib/redditTechSuccess.js';
import { fetchRedditGoodNews } from './lib/fetchRedditGoodNews.js';

// Run RSS news feeds
console.log('\nRunning RSS news feeds...');
await fetchFeeds();

// Run Reddit success stories
console.log('\nRunning Reddit success stories...');
await fetchRedditTechSuccess();

// Run Reddit good news
console.log('\nRunning Reddit good news...');
await fetchRedditGoodNews();
