const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Twitter API v2 Routes
 * Provides endpoints for Twitter data extraction
 * API Documentation: https://developer.twitter.com/en/docs/twitter-api
 * Authentication: Bearer Token (OAuth 2.0)
 * Rate Limit: 15 requests per 15-minute window (Free tier)
 */

const TWITTER_BASE_URL = 'https://api.twitter.com/2';

/**
 * Helper function to build Twitter API headers
 * @param {string} bearerToken - Twitter API Bearer token
 * @returns {Object} Headers object
 */
function getTwitterHeaders(bearerToken) {
  return {
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json'
  };
}

// Search tweets with stock cashtags
router.post('/search-cashtags', async (req, res) => {
  try {
    const { cashtag, bearerToken, maxResults = 100, startTime, endTime } = req.body;

    if (!cashtag) {
      return res.status(400).json({ error: 'Cashtag is required (e.g., $AAPL)' });
    }

    if (!bearerToken) {
      return res.status(400).json({ error: 'Twitter Bearer Token is required' });
    }

    // Build query with cashtag
    const query = cashtag.startsWith('$') ? cashtag : `$${cashtag}`;

    const params = {
      query: `${query} -is:retweet`,
      max_results: Math.min(maxResults, 100),
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'username,verified,public_metrics',
      expansions: 'author_id'
    };

    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;

    const response = await axios.get(`${TWITTER_BASE_URL}/tweets/search/recent`, {
      headers: getTwitterHeaders(bearerToken),
      params: params,
      timeout: 10000
    });

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    // Enrich tweets with user data
    const enrichedTweets = tweets.map(tweet => {
      const author = users.find(u => u.id === tweet.author_id);
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: author?.id,
          username: author?.username,
          verified: author?.verified,
          followers: author?.public_metrics?.followers_count
        },
        metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          quotes: tweet.public_metrics?.quote_count || 0
        }
      };
    });

    // Calculate aggregate metrics
    const totalEngagement = enrichedTweets.reduce((sum, t) =>
      sum + t.metrics.likes + t.metrics.retweets + t.metrics.replies, 0
    );

    res.json({
      success: true,
      cashtag: query,
      count: enrichedTweets.length,
      totalEngagement: totalEngagement,
      tweets: enrichedTweets
    });

  } catch (error) {
    console.error('Twitter Search Cashtags Error:', error.message);
    res.status(500).json({
      error: 'Failed to search tweets with cashtag',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Get sentiment for a specific ticker
router.post('/ticker-sentiment', async (req, res) => {
  try {
    const { ticker, bearerToken, maxResults = 100 } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    if (!bearerToken) {
      return res.status(400).json({ error: 'Twitter Bearer Token is required' });
    }

    // Search for both cashtag and ticker mentions
    const query = `($${ticker} OR ${ticker}) (lang:en) -is:retweet`;

    const response = await axios.get(`${TWITTER_BASE_URL}/tweets/search/recent`, {
      headers: getTwitterHeaders(bearerToken),
      params: {
        query: query,
        max_results: Math.min(maxResults, 100),
        'tweet.fields': 'created_at,public_metrics,author_id',
        'user.fields': 'username,verified,public_metrics',
        expansions: 'author_id'
      },
      timeout: 10000
    });

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    // Simple sentiment analysis based on engagement patterns
    const enrichedTweets = tweets.map(tweet => {
      const author = users.find(u => u.id === tweet.author_id);
      const metrics = tweet.public_metrics || {};
      const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0);

      return {
        text: tweet.text,
        engagement: engagement,
        author_followers: author?.public_metrics?.followers_count || 0,
        created_at: tweet.created_at
      };
    });

    // Calculate sentiment score (weighted by engagement)
    const totalEngagement = enrichedTweets.reduce((sum, t) => sum + t.engagement, 0);
    const avgEngagement = tweets.length > 0 ? totalEngagement / tweets.length : 0;

    // Simple sentiment based on positive/negative keywords
    const positiveKeywords = ['bullish', 'buy', 'long', 'moon', 'rocket', 'calls', 'up', 'gains'];
    const negativeKeywords = ['bearish', 'sell', 'short', 'down', 'puts', 'crash', 'dump'];

    let positiveCount = 0;
    let negativeCount = 0;

    enrichedTweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) positiveCount++;
      });
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) negativeCount++;
      });
    });

    const sentimentScore = positiveCount > 0 || negativeCount > 0
      ? (positiveCount - negativeCount) / (positiveCount + negativeCount)
      : 0;

    res.json({
      success: true,
      ticker: ticker.toUpperCase(),
      totalTweets: tweets.length,
      avgEngagement: Math.round(avgEngagement),
      sentiment: {
        score: sentimentScore.toFixed(3),
        label: sentimentScore > 0.2 ? 'bullish' : sentimentScore < -0.2 ? 'bearish' : 'neutral',
        positiveCount: positiveCount,
        negativeCount: negativeCount
      },
      recentTweets: enrichedTweets.slice(0, 10)
    });

  } catch (error) {
    console.error('Twitter Ticker Sentiment Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze ticker sentiment',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Track specific financial influencer accounts
router.post('/influencer-tweets', async (req, res) => {
  try {
    const { username, bearerToken, maxResults = 10 } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Twitter username is required' });
    }

    if (!bearerToken) {
      return res.status(400).json({ error: 'Twitter Bearer Token is required' });
    }

    // First, get user ID from username
    const userResponse = await axios.get(`${TWITTER_BASE_URL}/users/by/username/${username}`, {
      headers: getTwitterHeaders(bearerToken),
      params: {
        'user.fields': 'public_metrics,verified,description'
      },
      timeout: 10000
    });

    const user = userResponse.data.data;

    // Get user's recent tweets
    const tweetsResponse = await axios.get(`${TWITTER_BASE_URL}/users/${user.id}/tweets`, {
      headers: getTwitterHeaders(bearerToken),
      params: {
        max_results: Math.min(maxResults, 100),
        'tweet.fields': 'created_at,public_metrics,entities',
        exclude: 'retweets'
      },
      timeout: 10000
    });

    const tweets = tweetsResponse.data.data || [];

    const enrichedTweets = tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0
      }
    }));

    res.json({
      success: true,
      user: {
        username: user.username,
        verified: user.verified,
        description: user.description,
        followers: user.public_metrics?.followers_count || 0,
        tweets_count: user.public_metrics?.tweet_count || 0
      },
      tweets: enrichedTweets
    });

  } catch (error) {
    console.error('Twitter Influencer Tweets Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch influencer tweets',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Get trending financial topics
router.post('/trending-finance', async (req, res) => {
  try {
    const { bearerToken, maxResults = 100 } = req.body;

    if (!bearerToken) {
      return res.status(400).json({ error: 'Twitter Bearer Token is required' });
    }

    // Search for finance-related keywords
    const query = '(stocks OR trading OR investing OR market OR finance) (lang:en) -is:retweet';

    const response = await axios.get(`${TWITTER_BASE_URL}/tweets/search/recent`, {
      headers: getTwitterHeaders(bearerToken),
      params: {
        query: query,
        max_results: Math.min(maxResults, 100),
        'tweet.fields': 'created_at,public_metrics,entities',
        'user.fields': 'username,verified',
        expansions: 'author_id'
      },
      timeout: 10000
    });

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    // Extract cashtags and hashtags
    const cashtags = {};
    const hashtags = {};

    tweets.forEach(tweet => {
      // Extract cashtags
      const cashtagMatches = tweet.text.match(/\$[A-Z]{1,5}\b/g) || [];
      cashtagMatches.forEach(tag => {
        cashtags[tag] = (cashtags[tag] || 0) + 1;
      });

      // Extract hashtags
      tweet.entities?.hashtags?.forEach(tag => {
        const hashtag = `#${tag.tag}`;
        hashtags[hashtag] = (hashtags[hashtag] || 0) + 1;
      });
    });

    // Sort and get top items
    const topCashtags = Object.entries(cashtags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topHashtags = Object.entries(hashtags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      totalTweets: tweets.length,
      topCashtags: topCashtags,
      topHashtags: topHashtags
    });

  } catch (error) {
    console.error('Twitter Trending Finance Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trending finance topics',
      message: error.response?.data?.detail || error.message
    });
  }
});

// Get volume metrics for a ticker
router.post('/tweet-volume', async (req, res) => {
  try {
    const { ticker, bearerToken, startTime, endTime } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    if (!bearerToken) {
      return res.status(400).json({ error: 'Twitter Bearer Token is required' });
    }

    // Build query
    const query = `$${ticker} -is:retweet`;

    const params = {
      query: query,
      granularity: 'hour'
    };

    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;

    // Use counts endpoint for volume metrics
    const response = await axios.get(`${TWITTER_BASE_URL}/tweets/counts/recent`, {
      headers: getTwitterHeaders(bearerToken),
      params: params,
      timeout: 10000
    });

    const counts = response.data.data || [];

    // Calculate total volume and trends
    const totalVolume = counts.reduce((sum, c) => sum + c.tweet_count, 0);
    const avgVolume = counts.length > 0 ? totalVolume / counts.length : 0;

    // Calculate volume trend (comparing first half vs second half)
    const midpoint = Math.floor(counts.length / 2);
    const firstHalf = counts.slice(0, midpoint);
    const secondHalf = counts.slice(midpoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, c) => sum + c.tweet_count, 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, c) => sum + c.tweet_count, 0) / secondHalf.length
      : 0;

    const volumeTrend = firstHalfAvg > 0
      ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      ticker: ticker.toUpperCase(),
      totalVolume: totalVolume,
      avgVolumePerHour: Math.round(avgVolume),
      volumeTrend: `${volumeTrend}%`,
      dataPoints: counts.length,
      hourlyVolume: counts
    });

  } catch (error) {
    console.error('Twitter Tweet Volume Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch tweet volume',
      message: error.response?.data?.detail || error.message
    });
  }
});

module.exports = router;
