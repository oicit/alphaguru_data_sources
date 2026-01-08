const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Alpha Vantage Routes
 * Provides access to stock market, forex, crypto, and economic data
 * API Documentation: https://www.alphavantage.co/documentation/
 */

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Stock Time Series - Quote Endpoint
router.post('/stock-quote', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Quote Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch stock quote',
      message: error.message
    });
  }
});

// Stock Time Series - Daily/Weekly/Monthly
router.post('/stock-timeseries', async (req, res) => {
  try {
    const { symbol, interval, apikey } = req.body;

    if (!symbol || !interval || !apikey) {
      return res.status(400).json({ error: 'Symbol, interval, and API key are required' });
    }

    // Map interval to Alpha Vantage function
    const functionMap = {
      'daily': 'TIME_SERIES_DAILY',
      'weekly': 'TIME_SERIES_WEEKLY',
      'monthly': 'TIME_SERIES_MONTHLY'
    };

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: functionMap[interval],
        symbol: symbol,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      interval: interval,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Time Series Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch time series data',
      message: error.message
    });
  }
});

// Symbol Search
router.post('/symbol-search', async (req, res) => {
  try {
    const { keywords, apikey } = req.body;

    if (!keywords || !apikey) {
      return res.status(400).json({ error: 'Keywords and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Symbol Search Error:', error.message);
    res.status(500).json({
      error: 'Failed to search symbols',
      message: error.message
    });
  }
});

// Forex Exchange Rate
router.post('/forex', async (req, res) => {
  try {
    const { from_currency, to_currency, interval, apikey } = req.body;

    if (!from_currency || !to_currency || !interval || !apikey) {
      return res.status(400).json({
        error: 'From currency, to currency, interval, and API key are required'
      });
    }

    const functionMap = {
      'daily': 'FX_DAILY',
      'weekly': 'FX_WEEKLY',
      'monthly': 'FX_MONTHLY'
    };

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: functionMap[interval],
        from_symbol: from_currency,
        to_symbol: to_currency,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Forex Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch forex data',
      message: error.message
    });
  }
});

// Cryptocurrency
router.post('/crypto', async (req, res) => {
  try {
    const { symbol, market, interval, apikey } = req.body;

    if (!symbol || !market || !interval || !apikey) {
      return res.status(400).json({
        error: 'Symbol, market, interval, and API key are required'
      });
    }

    const functionMap = {
      'daily': 'DIGITAL_CURRENCY_DAILY',
      'weekly': 'DIGITAL_CURRENCY_WEEKLY',
      'monthly': 'DIGITAL_CURRENCY_MONTHLY'
    };

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: functionMap[interval],
        symbol: symbol,
        market: market,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Crypto Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cryptocurrency data',
      message: error.message
    });
  }
});

// Technical Indicators
router.post('/technical-indicator', async (req, res) => {
  try {
    const { symbol, indicator, interval, time_period, series_type, apikey } = req.body;

    if (!symbol || !indicator || !interval || !apikey) {
      return res.status(400).json({
        error: 'Symbol, indicator, interval, and API key are required'
      });
    }

    const params = {
      function: indicator,
      symbol: symbol,
      interval: interval,
      apikey: apikey
    };

    // Add optional parameters
    if (time_period) params.time_period = time_period;
    if (series_type) params.series_type = series_type;

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: params,
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Technical Indicator Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch technical indicator',
      message: error.message
    });
  }
});

// Economic Indicators
router.post('/economic-indicator', async (req, res) => {
  try {
    const { indicator, apikey } = req.body;

    if (!indicator || !apikey) {
      return res.status(400).json({
        error: 'Indicator and API key are required'
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: indicator,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Economic Indicator Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch economic indicator',
      message: error.message
    });
  }
});

// Market Status
router.post('/market-status', async (req, res) => {
  try {
    const { apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'MARKET_STATUS',
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Market Status Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch market status',
      message: error.message
    });
  }
});

module.exports = router;
