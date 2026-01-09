const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Reddit API Routes
 * Provides endpoints for Reddit data extraction using OAuth2 API
 * API Documentation: https://www.reddit.com/dev/api/
 * Rate Limit: 100 requests/minute with OAuth
 */

const REDDIT_BASE_URL = 'https://oauth.reddit.com';
const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token';

/**
 * Get OAuth access token for Reddit API
 * @param {string} clientId - Reddit app client ID
 * @param {string} clientSecret - Reddit app client secret
 * @returns {Promise<string>} Access token
 */
async function getAccessToken(clientId, clientSecret) {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      REDDIT_AUTH_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'AlphaGuru/1.0'
        },
        timeout: 10000
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to get Reddit access token: ${error.message}`);
  }
}

// Get trending tickers from WallStreetBets
router.post('/trending-tickers', async (req, res) => {
  try {
    const { clientId, clientSecret, limit = 100, timeFilter = 'day' } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Reddit client ID and client secret are required' });
    }

    // Get access token
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Fetch hot posts from WallStreetBets
    const response = await axios.get(`${REDDIT_BASE_URL}/r/wallstreetbets/hot`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AlphaGuru/1.0'
      },
      params: {
        limit: limit,
        t: timeFilter
      },
      timeout: 10000
    });

    // Extract tickers from posts
    const posts = response.data.data.children;
    const tickerRegex = /\$([A-Z]{1,5})\b|\b([A-Z]{2,5})\b/g;
    const tickerCounts = {};

    posts.forEach(post => {
      const text = `${post.data.title} ${post.data.selftext || ''}`;
      const matches = text.match(tickerRegex) || [];

      matches.forEach(match => {
        const ticker = match.replace('$', '').trim();
        // Filter out common words
        const stopwords = ['I', 'A', 'CEO', 'IPO', 'ATH', 'DD', 'YOLO', 'FD', 'WSB', 'IMO', 'FOMO', 'THE', 'AND', 'FOR'];
        if (!stopwords.includes(ticker) && ticker.length >= 2) {
          tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
        }
      });
    });

    // Sort by frequency
    const trendingTickers = Object.entries(tickerCounts)
      .map(([ticker, count]) => ({ ticker, mentions: count }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 20);

    res.json({
      success: true,
      subreddit: 'wallstreetbets',
      timeFilter: timeFilter,
      trendingTickers: trendingTickers,
      totalPosts: posts.length
    });

  } catch (error) {
    console.error('Reddit Trending Tickers Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trending tickers',
      message: error.message
    });
  }
});

// Get posts from a specific subreddit
router.post('/subreddit-posts', async (req, res) => {
  try {
    const { subreddit, clientId, clientSecret, limit = 25, sort = 'hot', timeFilter = 'day' } = req.body;

    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit name is required' });
    }

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Reddit client ID and client secret are required' });
    }

    // Get access token
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Fetch posts
    const response = await axios.get(`${REDDIT_BASE_URL}/r/${subreddit}/${sort}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AlphaGuru/1.0'
      },
      params: {
        limit: limit,
        t: timeFilter
      },
      timeout: 10000
    });

    const posts = response.data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      score: post.data.score,
      upvoteRatio: post.data.upvote_ratio,
      numComments: post.data.num_comments,
      created: new Date(post.data.created_utc * 1000).toISOString(),
      url: post.data.url,
      selftext: post.data.selftext,
      flair: post.data.link_flair_text,
      permalink: `https://reddit.com${post.data.permalink}`
    }));

    res.json({
      success: true,
      subreddit: subreddit,
      sort: sort,
      timeFilter: timeFilter,
      count: posts.length,
      posts: posts
    });

  } catch (error) {
    console.error('Reddit Subreddit Posts Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch subreddit posts',
      message: error.message
    });
  }
});

// Analyze sentiment for a specific ticker across finance subreddits
router.post('/ticker-sentiment', async (req, res) => {
  try {
    const { ticker, clientId, clientSecret, limit = 50 } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Reddit client ID and client secret are required' });
    }

    // Get access token
    const accessToken = await getAccessToken(clientId, clientSecret);

    const subreddits = ['wallstreetbets', 'stocks', 'investing'];
    const allPosts = [];

    // Search for ticker in multiple subreddits
    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(`${REDDIT_BASE_URL}/r/${subreddit}/search`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'AlphaGuru/1.0'
          },
          params: {
            q: ticker,
            restrict_sr: true,
            limit: limit,
            sort: 'relevance',
            t: 'week'
          },
          timeout: 10000
        });

        const posts = response.data.data.children.map(post => ({
          subreddit: subreddit,
          title: post.data.title,
          score: post.data.score,
          numComments: post.data.num_comments,
          upvoteRatio: post.data.upvote_ratio,
          created: new Date(post.data.created_utc * 1000).toISOString()
        }));

        allPosts.push(...posts);
      } catch (err) {
        console.error(`Error fetching from r/${subreddit}:`, err.message);
      }
    }

    // Calculate aggregate sentiment metrics
    const totalPosts = allPosts.length;
    const avgScore = totalPosts > 0 ? allPosts.reduce((sum, p) => sum + p.score, 0) / totalPosts : 0;
    const avgUpvoteRatio = totalPosts > 0 ? allPosts.reduce((sum, p) => sum + p.upvoteRatio, 0) / totalPosts : 0;
    const totalComments = allPosts.reduce((sum, p) => sum + p.numComments, 0);

    res.json({
      success: true,
      ticker: ticker.toUpperCase(),
      totalPosts: totalPosts,
      avgScore: Math.round(avgScore),
      avgUpvoteRatio: avgUpvoteRatio.toFixed(3),
      totalComments: totalComments,
      posts: allPosts.slice(0, 20), // Return top 20 posts
      sentiment: avgUpvoteRatio > 0.7 ? 'positive' : avgUpvoteRatio > 0.5 ? 'neutral' : 'negative'
    });

  } catch (error) {
    console.error('Reddit Ticker Sentiment Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze ticker sentiment',
      message: error.message
    });
  }
});

// Get Due Diligence (DD) posts
router.post('/dd-posts', async (req, res) => {
  try {
    const { subreddit = 'wallstreetbets', clientId, clientSecret, limit = 25, timeFilter = 'week' } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Reddit client ID and client secret are required' });
    }

    // Get access token
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Search for DD-tagged posts
    const response = await axios.get(`${REDDIT_BASE_URL}/r/${subreddit}/search`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AlphaGuru/1.0'
      },
      params: {
        q: 'flair:"DD" OR flair:"Due Diligence"',
        restrict_sr: true,
        limit: limit,
        sort: 'hot',
        t: timeFilter
      },
      timeout: 10000
    });

    const posts = response.data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      score: post.data.score,
      upvoteRatio: post.data.upvote_ratio,
      numComments: post.data.num_comments,
      created: new Date(post.data.created_utc * 1000).toISOString(),
      url: post.data.url,
      selftext: post.data.selftext.substring(0, 500), // First 500 chars
      flair: post.data.link_flair_text,
      permalink: `https://reddit.com${post.data.permalink}`
    }));

    res.json({
      success: true,
      subreddit: subreddit,
      timeFilter: timeFilter,
      count: posts.length,
      posts: posts
    });

  } catch (error) {
    console.error('Reddit DD Posts Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch DD posts',
      message: error.message
    });
  }
});

// Analyze comments on a specific post
router.post('/comment-analysis', async (req, res) => {
  try {
    const { subreddit, postId, clientId, clientSecret, limit = 100 } = req.body;

    if (!subreddit || !postId) {
      return res.status(400).json({ error: 'Subreddit and post ID are required' });
    }

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Reddit client ID and client secret are required' });
    }

    // Get access token
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Fetch post comments
    const response = await axios.get(`${REDDIT_BASE_URL}/r/${subreddit}/comments/${postId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AlphaGuru/1.0'
      },
      params: {
        limit: limit,
        depth: 1 // Only top-level comments for performance
      },
      timeout: 10000
    });

    // Parse comments (response[1] contains comments)
    const commentData = response.data[1]?.data?.children || [];
    const comments = commentData
      .filter(c => c.kind === 't1') // Filter actual comments
      .map(comment => ({
        id: comment.data.id,
        author: comment.data.author,
        body: comment.data.body,
        score: comment.data.score,
        created: new Date(comment.data.created_utc * 1000).toISOString()
      }));

    // Calculate comment metrics
    const totalComments = comments.length;
    const avgScore = totalComments > 0 ? comments.reduce((sum, c) => sum + c.score, 0) / totalComments : 0;
    const topComments = comments.sort((a, b) => b.score - a.score).slice(0, 10);

    res.json({
      success: true,
      subreddit: subreddit,
      postId: postId,
      totalComments: totalComments,
      avgCommentScore: Math.round(avgScore),
      topComments: topComments
    });

  } catch (error) {
    console.error('Reddit Comment Analysis Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze comments',
      message: error.message
    });
  }
});

module.exports = router;
