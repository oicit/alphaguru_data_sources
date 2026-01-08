const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Yahoo Finance Routes
 * Provides endpoints for stock data via Yahoo Finance
 */

const YAHOO_FINANCE_BASE = 'https://query2.finance.yahoo.com/v8/finance';

// Get stock quote
router.post('/quote', async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbol.toUpperCase()
      }
    });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: response.data.quoteResponse.result[0] || null
    });

  } catch (error) {
    console.error('Yahoo Finance Quote Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch stock quote',
      message: error.message
    });
  }
});

// Get historical data
router.post('/historical', async (req, res) => {
  try {
    const { symbol, period1, period2, interval = '1d' } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    // Default to last 3 months if not provided
    const end = period2 || Math.floor(Date.now() / 1000);
    const start = period1 || Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/chart/${symbol.toUpperCase()}`, {
      params: {
        period1: start,
        period2: end,
        interval: interval,
        events: 'history'
      }
    });

    const result = response.data.chart.result[0];

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      period: { start, end },
      interval: interval,
      data: {
        timestamp: result.timestamp,
        indicators: result.indicators.quote[0],
        meta: result.meta
      }
    });

  } catch (error) {
    console.error('Yahoo Finance Historical Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
});

// Search symbols
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get('https://query2.finance.yahoo.com/v1/finance/search', {
      params: {
        q: query,
        quotesCount: 10,
        newsCount: 0
      }
    });

    res.json({
      success: true,
      query: query,
      data: response.data.quotes || []
    });

  } catch (error) {
    console.error('Yahoo Finance Search Error:', error.message);
    res.status(500).json({
      error: 'Failed to search symbols',
      message: error.message
    });
  }
});

module.exports = router;
