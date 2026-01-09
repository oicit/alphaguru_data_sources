const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Financial Modeling Prep (FMP) API Routes
 * Provides comprehensive financial data endpoints
 */

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'; // Legacy - requires paid subscription
const FMP_BASE_URL_V4 = 'https://financialmodelingprep.com/api/v4'; // Legacy - requires paid subscription
const FMP_STABLE_URL = 'https://financialmodelingprep.com/stable'; // New free tier API

// Helper function to get API key
const getApiKey = (reqApiKey) => {
  return reqApiKey || process.env.FMP_API_KEY;
};

// Company Profile
router.post('/profile', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/profile/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Profile Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch company profile', message: error.response?.data?.error || error.message });
  }
});

// Stock Quote (using new stable API)
router.post('/quote', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const url = `${FMP_STABLE_URL}/quote`;
    console.log('FMP Request URL:', url);
    console.log('FMP Symbol:', symbol.toUpperCase());
    console.log('FMP API Key (first 10 chars):', key.substring(0, 10) + '...');

    const response = await axios.get(url, {
      params: {
        symbol: symbol.toUpperCase(),
        apikey: key
      }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Quote Error:', error.message);
    console.error('FMP Error Response:', JSON.stringify(error.response?.data));
    console.error('FMP Status Code:', error.response?.status);

    let errorMsg = error.message;
    if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        errorMsg = error.response.data['Error Message'] || JSON.stringify(error.response.data);
      } else {
        errorMsg = error.response.data;
      }
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch quote',
      message: errorMsg,
      statusCode: error.response?.status
    });
  }
});

// Income Statement
router.post('/income-statement', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/income-statement/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Income Statement Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch income statement', message: error.response?.data?.error || error.message });
  }
});

// Balance Sheet
router.post('/balance-sheet', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/balance-sheet-statement/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Balance Sheet Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch balance sheet', message: error.response?.data?.error || error.message });
  }
});

// Cash Flow Statement
router.post('/cash-flow', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/cash-flow-statement/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Cash Flow Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch cash flow statement', message: error.response?.data?.error || error.message });
  }
});

// Financial Ratios
router.post('/ratios', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/ratios/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Ratios Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch financial ratios', message: error.response?.data?.error || error.message });
  }
});

// Key Metrics
router.post('/key-metrics', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/key-metrics/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Key Metrics Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch key metrics', message: error.response?.data?.error || error.message });
  }
});

// Historical Price
router.post('/historical-price', async (req, res) => {
  try {
    const { symbol, from, to, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/historical-price-full/${symbol.toUpperCase()}`, {
      params
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Historical Price Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical price', message: error.response?.data?.error || error.message });
  }
});

// Company News
router.post('/news', async (req, res) => {
  try {
    const { symbol, limit = 10, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/stock_news`, {
      params: { tickers: symbol.toUpperCase(), limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP News Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news', message: error.response?.data?.error || error.message });
  }
});

// Analyst Estimates
router.post('/analyst-estimates', async (req, res) => {
  try {
    const { symbol, period = 'annual', limit = 5, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/analyst-estimates/${symbol.toUpperCase()}`, {
      params: { period, limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), period, data: response.data });
  } catch (error) {
    console.error('FMP Analyst Estimates Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch analyst estimates', message: error.response?.data?.error || error.message });
  }
});

// Price Target
router.post('/price-target', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL_V4}/price-target`, {
      params: { symbol: symbol.toUpperCase(), apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Price Target Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch price target', message: error.response?.data?.error || error.message });
  }
});

// Upgrades/Downgrades
router.post('/upgrades-downgrades', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL_V4}/upgrades-downgrades`, {
      params: { symbol: symbol.toUpperCase(), apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Upgrades/Downgrades Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch upgrades/downgrades', message: error.response?.data?.error || error.message });
  }
});

// Earnings Calendar
router.post('/earnings-calendar', async (req, res) => {
  try {
    const { from, to, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/earning_calendar`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Earnings Calendar Error:', error.message);
    console.error('FMP Response:', error.response?.data);

    let errorMessage = error.message;
    if (error.response?.status === 403) {
      errorMessage = 'Access forbidden. This endpoint may require a premium FMP subscription, or your API key may be invalid.';
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch earnings calendar',
      message: errorMessage
    });
  }
});

// IPO Calendar
router.post('/ipo-calendar', async (req, res) => {
  try {
    const { from, to, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/ipo_calendar`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP IPO Calendar Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch IPO calendar', message: error.response?.data?.error || error.message });
  }
});

// Economic Calendar
router.post('/economic-calendar', async (req, res) => {
  try {
    const { from, to, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/economic_calendar`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Economic Calendar Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch economic calendar', message: error.response?.data?.error || error.message });
  }
});

// Dividend Calendar
router.post('/dividend-calendar', async (req, res) => {
  try {
    const { from, to, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/stock_dividend_calendar`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Dividend Calendar Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch dividend calendar', message: error.response?.data?.error || error.message });
  }
});

// Stock Split Calendar
router.post('/stock-split-calendar', async (req, res) => {
  try {
    const { from, to, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(`${FMP_BASE_URL}/stock_split_calendar`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Stock Split Calendar Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock split calendar', message: error.response?.data?.error || error.message });
  }
});

// Insider Trading
router.post('/insider-trading', async (req, res) => {
  try {
    const { symbol, limit = 100, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL_V4}/insider-trading`, {
      params: { symbol: symbol.toUpperCase(), limit, apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Insider Trading Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch insider trading', message: error.response?.data?.error || error.message });
  }
});

// Senate Trading
router.post('/senate-trading', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (symbol) params.symbol = symbol.toUpperCase();

    const response = await axios.get(`${FMP_BASE_URL_V4}/senate-trading`, {
      params
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Senate Trading Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch senate trading', message: error.response?.data?.error || error.message });
  }
});

// SEC Filings
router.post('/sec-filings', async (req, res) => {
  try {
    const { symbol, type, limit = 10, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const params = { apikey: key };
    if (type) params.type = type;
    if (limit) params.limit = limit;

    const response = await axios.get(`${FMP_BASE_URL}/sec_filings/${symbol.toUpperCase()}`, {
      params
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP SEC Filings Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch SEC filings', message: error.response?.data?.error || error.message });
  }
});

// Market Gainers
router.post('/gainers', async (req, res) => {
  try {
    const { apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/stock_market/gainers`, {
      params: { apikey: key }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Gainers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch gainers', message: error.response?.data?.error || error.message });
  }
});

// Market Losers
router.post('/losers', async (req, res) => {
  try {
    const { apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/stock_market/losers`, {
      params: { apikey: key }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Losers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch losers', message: error.response?.data?.error || error.message });
  }
});

// Most Active
router.post('/most-active', async (req, res) => {
  try {
    const { apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/stock_market/actives`, {
      params: { apikey: key }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Most Active Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch most active stocks', message: error.response?.data?.error || error.message });
  }
});

// Sector Performance
router.post('/sector-performance', async (req, res) => {
  try {
    const { apiKey } = req.body;

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/sector-performance`, {
      params: { apikey: key }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('FMP Sector Performance Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch sector performance', message: error.response?.data?.error || error.message });
  }
});

// ETF Holder
router.post('/etf-holder', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/etf-holder/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP ETF Holder Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch ETF holders', message: error.response?.data?.error || error.message });
  }
});

// Institutional Holder
router.post('/institutional-holder', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/institutional-holder/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Institutional Holder Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch institutional holders', message: error.response?.data?.error || error.message });
  }
});

// DCF Valuation
router.post('/dcf', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/discounted-cash-flow/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP DCF Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch DCF valuation', message: error.response?.data?.error || error.message });
  }
});

// Market Cap
router.post('/market-cap', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/market-capitalization/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Market Cap Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market capitalization', message: error.response?.data?.error || error.message });
  }
});

// Earning Surprises
router.post('/earning-surprises', async (req, res) => {
  try {
    const { symbol, apiKey } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const key = getApiKey(apiKey);
    if (!key) return res.status(400).json({ error: 'FMP API key is required' });

    const response = await axios.get(`${FMP_BASE_URL}/earnings-surprises/${symbol.toUpperCase()}`, {
      params: { apikey: key }
    });

    res.json({ success: true, symbol: symbol.toUpperCase(), data: response.data });
  } catch (error) {
    console.error('FMP Earning Surprises Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch earning surprises', message: error.response?.data?.error || error.message });
  }
});

module.exports = router;
