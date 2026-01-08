const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * TrendRadar Routes
 * Fetches trending news from multiple platforms via newsnow API
 */

const NEWSNOW_BASE_URL = 'https://api.newsnow.busiyi.world';

// Get trending news from a specific platform
router.post('/platform-trends', async (req, res) => {
  try {
    const { platform = 'toutiao' } = req.body;

    const response = await axios.get(`${NEWSNOW_BASE_URL}/news/${platform}`);

    res.json({
      success: true,
      platform: platform,
      data: response.data
    });

  } catch (error) {
    console.error('TrendRadar Platform Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch platform trends',
      message: error.message
    });
  }
});

// Get trending news from multiple platforms
router.post('/multi-platform-trends', async (req, res) => {
  try {
    const { platforms = ['toutiao', 'baidu', 'zhihu'] } = req.body;

    const promises = platforms.map(platform =>
      axios.get(`${NEWSNOW_BASE_URL}/news/${platform}`)
        .then(response => ({
          platform,
          success: true,
          data: response.data
        }))
        .catch(error => ({
          platform,
          success: false,
          error: error.message
        }))
    );

    const results = await Promise.all(promises);

    res.json({
      success: true,
      platforms: platforms,
      results: results
    });

  } catch (error) {
    console.error('TrendRadar Multi-Platform Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch multi-platform trends',
      message: error.message
    });
  }
});

// Get available platforms list
router.get('/platforms', (req, res) => {
  const platforms = [
    { id: 'toutiao', name: '今日头条' },
    { id: 'baidu', name: '百度热搜' },
    { id: 'zhihu', name: '知乎' },
    { id: 'weibo', name: '微博' },
    { id: 'douyin', name: '抖音' },
    { id: 'bilibili', name: 'Bilibili' },
    { id: 'wallstreetcn-hot', name: '华尔街见闻' },
    { id: 'cls-telegraph', name: '财联社' },
    { id: 'thepaper', name: '澎湃新闻' },
    { id: 'ifeng', name: '凤凰网' },
    { id: 'tieba', name: '贴吧' }
  ];

  res.json({
    success: true,
    platforms: platforms
  });
});

module.exports = router;
