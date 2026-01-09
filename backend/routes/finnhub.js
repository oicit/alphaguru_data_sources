const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Finnhub API Routes
 * Provides endpoints for stock data, company fundamentals, and market news
 */

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Get stock quote
router.post('/quote', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Quote Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch stock quote',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get company profile
router.post('/company-profile', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Company Profile Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company profile',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get company fundamentals
router.post('/fundamentals', async (req, res) => {
  try {
    const { symbol, metric = 'all', apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/metric`, {
      params: {
        symbol: symbol.toUpperCase(),
        metric: metric,
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      metric: metric,
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Fundamentals Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company fundamentals',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get company news
router.post('/news', async (req, res) => {
  try {
    const { symbol, from, to, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    // Default to last 7 days if dates not provided
    const toDate = to || new Date().toISOString().split('T')[0];
    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
      params: {
        symbol: symbol.toUpperCase(),
        from: fromDate,
        to: toDate,
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      from: fromDate,
      to: toDate,
      count: response.data.length,
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub News Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company news',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get earnings data
router.post('/earnings', async (req, res) => {
  try {
    const { symbol, limit = 5, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/earnings`, {
      params: {
        symbol: symbol.toUpperCase(),
        limit: limit,
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Earnings Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch earnings data',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get recommendation trends
router.post('/recommendations', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/recommendation`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Recommendations Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch recommendation trends',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get sentiment data
router.post('/sentiment', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/news-sentiment`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: key
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Sentiment Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch sentiment data',
      message: error.response?.data?.error || error.message
    });
  }
});

// Get earnings calendar
router.post('/earnings-calendar', async (req, res) => {
  try {
    const { from, to, symbol, international, apiKey } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'Start date (from) and end date (to) are required in YYYY-MM-DD format' });
    }

    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'Finnhub API key is required' });
    }

    const params = {
      from: from,
      to: to,
      token: key
    };

    if (symbol) {
      params.symbol = symbol.toUpperCase();
    }

    if (international !== undefined) {
      params.international = international;
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/calendar/earnings`, {
      params: params
    });

    res.json({
      success: true,
      from: from,
      to: to,
      symbol: symbol ? symbol.toUpperCase() : 'all',
      count: response.data.earningsCalendar ? response.data.earningsCalendar.length : 0,
      data: response.data
    });

  } catch (error) {
    console.error('Finnhub Earnings Calendar Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      message: error.response?.data?.error || error.message
    });
  }
});

module.exports = router;
