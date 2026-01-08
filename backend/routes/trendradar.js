const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * TrendRadar Routes
 * Fetches trending news from multiple Chinese platforms via newsnow API
 * API Documentation: https://github.com/ourongxing/newsnow
 */

const NEWSNOW_BASE_URL = 'https://newsnow.busiyi.world/api/s';

// Get trending news from a specific platform
router.post('/platform-trends', async (req, res) => {
  try {
    const { platform = 'toutiao' } = req.body;

    const response = await axios.get(NEWSNOW_BASE_URL, {
      params: {
        id: platform,
        latest: ''  // Include latest parameter to get most recent data
      },
      timeout: 10000
    });

    res.json({
      success: true,
      platform: platform,
      data: response.data
    });

  } catch (error) {
    console.error('TrendRadar Platform Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch platform trends',
      message: error.message,
      platform: req.body.platform
    });
  }
});

// Get trending news from multiple platforms
router.post('/multi-platform-trends', async (req, res) => {
  try {
    const { platforms = ['toutiao', 'baidu', 'zhihu'] } = req.body;

    const promises = platforms.map(platform =>
      axios.get(NEWSNOW_BASE_URL, {
        params: {
          id: platform,
          latest: ''
        },
        timeout: 10000
      })
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
    { id: 'toutiao', name: '今日头条 (Toutiao)' },
    { id: 'baidu', name: '百度热搜 (Baidu Hot Search)' },
    { id: 'zhihu', name: '知乎 (Zhihu)' },
    { id: 'weibo', name: '微博 (Weibo)' },
    { id: 'douyin', name: '抖音 (Douyin)' },
    { id: 'bilibili-hot-search', name: 'Bilibili 热搜' },
    { id: 'wallstreetcn-hot', name: '华尔街见闻 (Wallstreet CN)' },
    { id: 'cls-hot', name: '财联社 (CLS)' },
    { id: 'thepaper', name: '澎湃新闻 (The Paper)' },
    { id: 'ifeng', name: '凤凰网 (iFeng)' },
    { id: 'tieba', name: '贴吧 (Tieba)' }
  ];

  res.json({
    success: true,
    count: platforms.length,
    platforms: platforms
  });
});

module.exports = router;
