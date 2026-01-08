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

// Intraday Stock Data
router.post('/stock-intraday', async (req, res) => {
  try {
    const { symbol, interval, apikey } = req.body;

    if (!symbol || !interval || !apikey) {
      return res.status(400).json({ error: 'Symbol, interval, and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval,
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Intraday Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch intraday data',
      message: error.message
    });
  }
});

// Daily Adjusted Stock Data
router.post('/stock-daily-adjusted', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
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
    console.error('Alpha Vantage Daily Adjusted Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch daily adjusted data',
      message: error.message
    });
  }
});

// Weekly/Monthly Adjusted Stock Data
router.post('/stock-adjusted', async (req, res) => {
  try {
    const { symbol, interval, apikey } = req.body;

    if (!symbol || !interval || !apikey) {
      return res.status(400).json({ error: 'Symbol, interval, and API key are required' });
    }

    const functionMap = {
      'weekly': 'TIME_SERIES_WEEKLY_ADJUSTED',
      'monthly': 'TIME_SERIES_MONTHLY_ADJUSTED'
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
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Adjusted Data Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch adjusted data',
      message: error.message
    });
  }
});

// Company Overview (Fundamental Data)
router.post('/company-overview', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'OVERVIEW',
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
    console.error('Alpha Vantage Company Overview Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company overview',
      message: error.message
    });
  }
});

// Income Statement
router.post('/income-statement', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'INCOME_STATEMENT',
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
    console.error('Alpha Vantage Income Statement Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch income statement',
      message: error.message
    });
  }
});

// Balance Sheet
router.post('/balance-sheet', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'BALANCE_SHEET',
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
    console.error('Alpha Vantage Balance Sheet Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch balance sheet',
      message: error.message
    });
  }
});

// Cash Flow
router.post('/cash-flow', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'CASH_FLOW',
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
    console.error('Alpha Vantage Cash Flow Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cash flow',
      message: error.message
    });
  }
});

// Earnings
router.post('/earnings', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'EARNINGS',
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
    console.error('Alpha Vantage Earnings Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch earnings',
      message: error.message
    });
  }
});

// Listing Status
router.post('/listing-status', async (req, res) => {
  try {
    const { apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'LISTING_STATUS',
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Listing Status Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch listing status',
      message: error.message
    });
  }
});

// Earnings Calendar
router.post('/earnings-calendar', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const params = {
      function: 'EARNINGS_CALENDAR',
      apikey: apikey
    };

    if (symbol) params.symbol = symbol;

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: params,
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Earnings Calendar Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      message: error.message
    });
  }
});

// IPO Calendar
router.post('/ipo-calendar', async (req, res) => {
  try {
    const { apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'IPO_CALENDAR',
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage IPO Calendar Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch IPO calendar',
      message: error.message
    });
  }
});

// News & Sentiments
router.post('/news-sentiment', async (req, res) => {
  try {
    const { tickers, topics, apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const params = {
      function: 'NEWS_SENTIMENT',
      apikey: apikey
    };

    if (tickers) params.tickers = tickers;
    if (topics) params.topics = topics;

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: params,
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage News Sentiment Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch news sentiment',
      message: error.message
    });
  }
});

// Top Gainers & Losers
router.post('/top-gainers-losers', async (req, res) => {
  try {
    const { apikey } = req.body;

    if (!apikey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Top Gainers/Losers Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch top gainers/losers',
      message: error.message
    });
  }
});

// Insider Transactions
router.post('/insider-transactions', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'INSIDER_TRANSACTIONS',
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
    console.error('Alpha Vantage Insider Transactions Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch insider transactions',
      message: error.message
    });
  }
});

// Commodity Data
router.post('/commodity', async (req, res) => {
  try {
    const { commodity, interval, apikey } = req.body;

    if (!commodity || !apikey) {
      return res.status(400).json({ error: 'Commodity and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: commodity,
        interval: interval || 'monthly',
        apikey: apikey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Alpha Vantage Commodity Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch commodity data',
      message: error.message
    });
  }
});

// ETF Profile
router.post('/etf-profile', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'ETF_PROFILE',
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
    console.error('Alpha Vantage ETF Profile Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch ETF profile',
      message: error.message
    });
  }
});

// Dividends
router.post('/dividends', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'DIVIDENDS',
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
    console.error('Alpha Vantage Dividends Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch dividends',
      message: error.message
    });
  }
});

// Splits
router.post('/splits', async (req, res) => {
  try {
    const { symbol, apikey } = req.body;

    if (!symbol || !apikey) {
      return res.status(400).json({ error: 'Symbol and API key are required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SPLITS',
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
    console.error('Alpha Vantage Splits Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch splits',
      message: error.message
    });
  }
});

module.exports = router;
