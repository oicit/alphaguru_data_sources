const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * YouTube/Podcast API Routes
 * Provides endpoints for YouTube Data API v3
 * API Documentation: https://developers.google.com/youtube/v3
 * Quota: 10,000 units/day (free tier)
 * Note: Transcript extraction requires external library (youtube-transcript-api)
 */

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search for finance-related videos
router.post('/search-finance-videos', async (req, res) => {
  try {
    const { query, apiKey, maxResults = 25, order = 'relevance', publishedAfter } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: Math.min(maxResults, 50),
      order: order,
      key: apiKey
    };

    if (publishedAfter) {
      params.publishedAfter = publishedAfter;
    }

    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: params,
      timeout: 10000
    });

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
    }));

    res.json({
      success: true,
      query: query,
      count: videos.length,
      videos: videos
    });

  } catch (error) {
    console.error('YouTube Search Error:', error.message);
    res.status(500).json({
      error: 'Failed to search YouTube videos',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get video transcript (Note: This endpoint provides video details; transcript requires external tool)
router.post('/video-transcript', async (req, res) => {
  try {
    const { videoId, apiKey } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    // Get video details and caption list
    const videoResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: apiKey
      },
      timeout: 10000
    });

    const video = videoResponse.data.items[0];

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if captions are available
    const captionsResponse = await axios.get(`${YOUTUBE_BASE_URL}/captions`, {
      params: {
        part: 'snippet',
        videoId: videoId,
        key: apiKey
      },
      timeout: 10000
    });

    const captions = captionsResponse.data.items || [];

    res.json({
      success: true,
      videoId: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
      captionsAvailable: captions.length > 0,
      availableLanguages: captions.map(c => c.snippet.language),
      note: 'To extract actual transcript text, use youtube-transcript-api library or download caption tracks manually'
    });

  } catch (error) {
    console.error('YouTube Video Transcript Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch video details',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get latest videos from finance channels
router.post('/channel-latest', async (req, res) => {
  try {
    const { channelId, apiKey, maxResults = 10 } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    // Get channel details
    const channelResponse = await axios.get(`${YOUTUBE_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: apiKey
      },
      timeout: 10000
    });

    const channel = channelResponse.data.items[0];

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get latest videos from channel
    const videosResponse = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: channelId,
        type: 'video',
        order: 'date',
        maxResults: Math.min(maxResults, 50),
        key: apiKey
      },
      timeout: 10000
    });

    const videos = videosResponse.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
    }));

    res.json({
      success: true,
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount
      },
      videos: videos,
      count: videos.length
    });

  } catch (error) {
    console.error('YouTube Channel Latest Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch channel videos',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Search for earnings call videos
router.post('/earnings-calls', async (req, res) => {
  try {
    const { ticker, apiKey, maxResults = 10, publishedAfter } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    // Build search query for earnings calls
    const query = `${ticker} earnings call OR ${ticker} earnings conference`;

    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: Math.min(maxResults, 50),
      order: 'date',
      key: apiKey
    };

    if (publishedAfter) {
      params.publishedAfter = publishedAfter;
    }

    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: params,
      timeout: 10000
    });

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
    }));

    // Filter for likely earnings calls based on title keywords
    const earningsVideos = videos.filter(video => {
      const title = video.title.toLowerCase();
      return title.includes('earnings') || title.includes('conference call') || title.includes('investor call');
    });

    res.json({
      success: true,
      ticker: ticker.toUpperCase(),
      count: earningsVideos.length,
      totalResults: videos.length,
      videos: earningsVideos
    });

  } catch (error) {
    console.error('YouTube Earnings Calls Error:', error.message);
    res.status(500).json({
      error: 'Failed to search earnings calls',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get video statistics and engagement metrics
router.post('/video-stats', async (req, res) => {
  try {
    const { videoId, apiKey } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required (can be comma-separated for multiple videos)' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    const response = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: apiKey
      },
      timeout: 10000
    });

    const videos = response.data.items.map(video => {
      const stats = video.statistics || {};
      const viewCount = parseInt(stats.viewCount || 0);
      const likeCount = parseInt(stats.likeCount || 0);
      const commentCount = parseInt(stats.commentCount || 0);

      // Calculate engagement rate
      const engagementRate = viewCount > 0
        ? ((likeCount + commentCount) / viewCount * 100).toFixed(2)
        : 0;

      return {
        videoId: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        statistics: {
          viewCount: viewCount,
          likeCount: likeCount,
          commentCount: commentCount,
          favoriteCount: parseInt(stats.favoriteCount || 0),
          engagementRate: `${engagementRate}%`
        },
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId
      };
    });

    res.json({
      success: true,
      count: videos.length,
      videos: videos
    });

  } catch (error) {
    console.error('YouTube Video Stats Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch video statistics',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get popular videos from multiple finance channels
router.post('/popular-finance-videos', async (req, res) => {
  try {
    const { channelIds, apiKey, maxResults = 5, daysAgo = 7 } = req.body;

    if (!channelIds || !Array.isArray(channelIds)) {
      return res.status(400).json({ error: 'Channel IDs array is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    // Calculate publishedAfter date
    const publishedAfter = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const allVideos = [];

    // Fetch videos from each channel
    for (const channelId of channelIds) {
      try {
        const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
          params: {
            part: 'snippet',
            channelId: channelId,
            type: 'video',
            order: 'viewCount',
            maxResults: maxResults,
            publishedAfter: publishedAfter,
            key: apiKey
          },
          timeout: 10000
        });

        const videos = response.data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
        }));

        allVideos.push(...videos);
      } catch (err) {
        console.error(`Error fetching videos for channel ${channelId}:`, err.message);
      }
    }

    // Get statistics for all videos
    if (allVideos.length > 0) {
      const videoIds = allVideos.map(v => v.videoId).join(',');
      const statsResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
        params: {
          part: 'statistics',
          id: videoIds,
          key: apiKey
        },
        timeout: 10000
      });

      // Merge statistics with video data
      statsResponse.data.items.forEach(item => {
        const video = allVideos.find(v => v.videoId === item.id);
        if (video) {
          video.statistics = {
            viewCount: parseInt(item.statistics.viewCount || 0),
            likeCount: parseInt(item.statistics.likeCount || 0),
            commentCount: parseInt(item.statistics.commentCount || 0)
          };
        }
      });

      // Sort by view count
      allVideos.sort((a, b) => (b.statistics?.viewCount || 0) - (a.statistics?.viewCount || 0));
    }

    res.json({
      success: true,
      channelsQueried: channelIds.length,
      totalVideos: allVideos.length,
      daysAgo: daysAgo,
      videos: allVideos.slice(0, 20) // Return top 20
    });

  } catch (error) {
    console.error('YouTube Popular Finance Videos Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch popular finance videos',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get video comments
router.post('/video-comments', async (req, res) => {
  try {
    const { videoId, apiKey, maxResults = 100, order = 'relevance' } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key is required' });
    }

    const response = await axios.get(`${YOUTUBE_BASE_URL}/commentThreads`, {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: Math.min(maxResults, 100),
        order: order,
        textFormat: 'plainText',
        key: apiKey
      },
      timeout: 10000
    });

    const comments = response.data.items.map(item => {
      const comment = item.snippet.topLevelComment.snippet;
      return {
        commentId: item.id,
        author: comment.authorDisplayName,
        text: comment.textDisplay,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
        updatedAt: comment.updatedAt
      };
    });

    res.json({
      success: true,
      videoId: videoId,
      count: comments.length,
      comments: comments
    });

  } catch (error) {
    console.error('YouTube Video Comments Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch video comments',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
