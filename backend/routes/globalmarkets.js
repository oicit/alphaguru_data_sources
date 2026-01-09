const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Global Markets API Routes
 * Provides endpoints for international market data and insights
 *
 * Focus Areas:
 * - Asian Markets (Korea, Taiwan, Japan, China, Hong Kong, Singapore, India)
 * - European Markets (UK, Germany, France, Italy, Spain)
 * - Semiconductor Supply Chain (Taiwan TSMC, Korea Samsung)
 * - Cross-Market Correlations
 * - Currency Pairs
 * - International Economic Indicators
 *
 * Data Sources:
 * - Yahoo Finance API (global exchanges)
 * - Alpha Vantage (forex, international data)
 * - FMP (international stocks)
 */

// Yahoo Finance base URL (using unofficial API endpoints)
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v7/finance';
const YAHOO_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

/**
 * Major market indices by region
 */
const MARKET_INDICES = {
  asia: {
    korea: { symbol: '^KS11', name: 'KOSPI', exchange: 'KRX' },
    taiwan: { symbol: '^TWII', name: 'Taiwan Weighted', exchange: 'TWSE' },
    japan: { symbol: '^N225', name: 'Nikkei 225', exchange: 'JPX' },
    hongkong: { symbol: '^HSI', name: 'Hang Seng', exchange: 'HKEX' },
    china: { symbol: '000001.SS', name: 'Shanghai Composite', exchange: 'SSE' },
    singapore: { symbol: '^STI', name: 'Straits Times', exchange: 'SGX' },
    india: { symbol: '^BSESN', name: 'BSE Sensex', exchange: 'BSE' }
  },
  europe: {
    uk: { symbol: '^FTSE', name: 'FTSE 100', exchange: 'LSE' },
    germany: { symbol: '^GDAXI', name: 'DAX', exchange: 'XETRA' },
    france: { symbol: '^FCHI', name: 'CAC 40', exchange: 'EPA' },
    italy: { symbol: 'FTSEMIB.MI', name: 'FTSE MIB', exchange: 'BIT' },
    spain: { symbol: '^IBEX', name: 'IBEX 35', exchange: 'MCE' }
  },
  us: {
    sp500: { symbol: '^GSPC', name: 'S&P 500', exchange: 'NYSE' },
    nasdaq: { symbol: '^IXIC', name: 'NASDAQ', exchange: 'NASDAQ' },
    dow: { symbol: '^DJI', name: 'Dow Jones', exchange: 'NYSE' }
  }
};

/**
 * Major semiconductor stocks (Taiwan/Korea supply chain)
 */
const SEMICONDUCTOR_LEADERS = [
  { symbol: 'TSM', name: 'Taiwan Semiconductor (ADR)', country: 'Taiwan', exchange: 'NYSE' },
  { symbol: '2330.TW', name: 'TSMC (Taiwan)', country: 'Taiwan', exchange: 'TWSE' },
  { symbol: '005930.KS', name: 'Samsung Electronics', country: 'Korea', exchange: 'KRX' },
  { symbol: '000660.KS', name: 'SK Hynix', country: 'Korea', exchange: 'KRX' },
  { symbol: '2454.TW', name: 'MediaTek', country: 'Taiwan', exchange: 'TWSE' },
  { symbol: '3711.TW', name: 'ASE Technology', country: 'Taiwan', exchange: 'TWSE' },
  { symbol: '2303.TW', name: 'United Microelectronics', country: 'Taiwan', exchange: 'TWSE' }
];

// Get Asian markets overview
router.get('/asian-markets', async (req, res) => {
  try {
    const indices = MARKET_INDICES.asia;
    const symbols = Object.values(indices).map(idx => idx.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketTime,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;
    const marketData = {};

    Object.entries(indices).forEach(([country, data]) => {
      const quote = quotes.find(q => q.symbol === data.symbol);
      if (quote) {
        marketData[country] = {
          name: data.name,
          exchange: data.exchange,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          open: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          lastUpdate: new Date(quote.regularMarketTime * 1000).toISOString()
        };
      }
    });

    res.json({
      success: true,
      region: 'Asia',
      markets: marketData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Asian Markets Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Asian market data',
      message: error.message
    });
  }
});

// Get European markets overview
router.get('/european-markets', async (req, res) => {
  try {
    const indices = MARKET_INDICES.europe;
    const symbols = Object.values(indices).map(idx => idx.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketTime,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;
    const marketData = {};

    Object.entries(indices).forEach(([country, data]) => {
      const quote = quotes.find(q => q.symbol === data.symbol);
      if (quote) {
        marketData[country] = {
          name: data.name,
          exchange: data.exchange,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          open: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          lastUpdate: new Date(quote.regularMarketTime * 1000).toISOString()
        };
      }
    });

    res.json({
      success: true,
      region: 'Europe',
      markets: marketData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('European Markets Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch European market data',
      message: error.message
    });
  }
});

// Get semiconductor supply chain snapshot (Taiwan/Korea leaders)
router.get('/semiconductor-leaders', async (req, res) => {
  try {
    const symbols = SEMICONDUCTOR_LEADERS.map(s => s.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,trailingPE'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;

    const semiconductorData = SEMICONDUCTOR_LEADERS.map(leader => {
      const quote = quotes.find(q => q.symbol === leader.symbol);
      if (quote) {
        return {
          symbol: leader.symbol,
          name: leader.name,
          country: leader.country,
          exchange: leader.exchange,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          pe: quote.trailingPE
        };
      }
      return null;
    }).filter(item => item !== null);

    // Calculate aggregate metrics
    const totalMarketCap = semiconductorData.reduce((sum, s) => sum + (s.marketCap || 0), 0);
    const avgChange = semiconductorData.length > 0
      ? semiconductorData.reduce((sum, s) => sum + s.changePercent, 0) / semiconductorData.length
      : 0;

    res.json({
      success: true,
      sector: 'Semiconductors',
      region: 'Asia (Taiwan/Korea)',
      count: semiconductorData.length,
      totalMarketCap: totalMarketCap,
      avgChangePercent: avgChange.toFixed(2),
      stocks: semiconductorData,
      insight: 'Early indicators for US semiconductor sector',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Semiconductor Leaders Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch semiconductor leader data',
      message: error.message
    });
  }
});

// Get global market session status
router.get('/market-sessions', async (req, res) => {
  try {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentTime = utcHour * 60 + utcMinute;

    // Trading hours in UTC (approximate)
    const sessions = {
      sydney: { open: 22 * 60, close: 6 * 60, name: 'Sydney', status: 'closed' },
      tokyo: { open: 0 * 60, close: 6 * 60, name: 'Tokyo', status: 'closed' },
      hongkong: { open: 1 * 60 + 30, close: 8 * 60, name: 'Hong Kong', status: 'closed' },
      singapore: { open: 1 * 60, close: 9 * 60, name: 'Singapore', status: 'closed' },
      india: { open: 3 * 60 + 45, close: 10 * 60, name: 'Mumbai', status: 'closed' },
      frankfurt: { open: 7 * 60, close: 15 * 60 + 30, name: 'Frankfurt', status: 'closed' },
      london: { open: 8 * 60, close: 16 * 60 + 30, name: 'London', status: 'closed' },
      newyork: { open: 13 * 60 + 30, close: 20 * 60, name: 'New York', status: 'closed' }
    };

    // Determine status
    Object.keys(sessions).forEach(key => {
      const session = sessions[key];
      if (session.open < session.close) {
        // Same day
        if (currentTime >= session.open && currentTime < session.close) {
          session.status = 'open';
        }
      } else {
        // Crosses midnight
        if (currentTime >= session.open || currentTime < session.close) {
          session.status = 'open';
        }
      }
    });

    // Identify active session
    const activeSessions = Object.entries(sessions)
      .filter(([_, s]) => s.status === 'open')
      .map(([key, s]) => s.name);

    res.json({
      success: true,
      currentTimeUTC: now.toISOString(),
      activeSessions: activeSessions,
      sessions: sessions,
      insight: activeSessions.length > 0
        ? `Currently trading in: ${activeSessions.join(', ')}`
        : 'All major markets are closed'
    });

  } catch (error) {
    console.error('Market Sessions Error:', error.message);
    res.status(500).json({
      error: 'Failed to determine market sessions',
      message: error.message
    });
  }
});

// Get international stock quote
router.post('/international-quote', async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter is required (comma-separated)' });
    }

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,currency,exchangeName'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result.map(q => ({
      symbol: q.symbol,
      name: q.shortName,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      currency: q.currency,
      exchange: q.exchangeName
    }));

    res.json({
      success: true,
      count: quotes.length,
      quotes: quotes
    });

  } catch (error) {
    console.error('International Quote Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch international quotes',
      message: error.message
    });
  }
});

// Get currency pairs for international trading
router.post('/currency-pairs', async (req, res) => {
  try {
    const { pairs } = req.body;

    // Default major pairs if not specified
    const currencyPairs = pairs || [
      'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCNY=X',
      'USDKRW=X', 'USDTWD=X', 'USDINR=X', 'USDSGD=X'
    ];

    const symbols = Array.isArray(currencyPairs) ? currencyPairs.join(',') : currencyPairs;

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketTime'
      },
      timeout: 10000
    });

    const rates = response.data.quoteResponse.result.map(q => ({
      pair: q.symbol.replace('=X', ''),
      rate: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      lastUpdate: new Date(q.regularMarketTime * 1000).toISOString()
    }));

    res.json({
      success: true,
      count: rates.length,
      rates: rates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Currency Pairs Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch currency pairs',
      message: error.message
    });
  }
});

// Get cross-market correlation snapshot
router.get('/cross-market-correlation', async (req, res) => {
  try {
    // Get all major indices
    const allIndices = {
      ...MARKET_INDICES.asia,
      ...MARKET_INDICES.europe,
      ...MARKET_INDICES.us
    };

    const symbols = Object.values(allIndices).map(idx => idx.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketChangePercent'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;

    // Build correlation data
    const correlationData = {
      asia: {},
      europe: {},
      us: {}
    };

    Object.entries(MARKET_INDICES).forEach(([region, countries]) => {
      Object.entries(countries).forEach(([country, data]) => {
        const quote = quotes.find(q => q.symbol === data.symbol);
        if (quote) {
          correlationData[region][country] = {
            name: data.name,
            changePercent: quote.regularMarketChangePercent || 0
          };
        }
      });
    });

    // Calculate regional averages
    const regionalAverages = {};
    Object.entries(correlationData).forEach(([region, countries]) => {
      const changes = Object.values(countries).map(c => c.changePercent);
      const avg = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
      regionalAverages[region] = avg.toFixed(2);
    });

    res.json({
      success: true,
      correlationData: correlationData,
      regionalAverages: regionalAverages,
      insight: 'Cross-market performance comparison',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cross-Market Correlation Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cross-market correlation',
      message: error.message
    });
  }
});

// Get emerging markets snapshot (India, Brazil, etc.)
router.get('/emerging-markets', async (req, res) => {
  try {
    const emergingIndices = {
      india: { symbol: '^BSESN', name: 'BSE Sensex' },
      brazil: { symbol: '^BVSP', name: 'Bovespa' },
      russia: { symbol: 'IMOEX.ME', name: 'MOEX' },
      southafrica: { symbol: 'JSE.JO', name: 'JSE' },
      mexico: { symbol: '^MXX', name: 'IPC Mexico' },
      turkey: { symbol: 'XU100.IS', name: 'BIST 100' }
    };

    const symbols = Object.values(emergingIndices).map(idx => idx.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;
    const marketData = {};

    Object.entries(emergingIndices).forEach(([country, data]) => {
      const quote = quotes.find(q => q.symbol === data.symbol);
      if (quote) {
        marketData[country] = {
          name: data.name,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume
        };
      }
    });

    res.json({
      success: true,
      category: 'Emerging Markets',
      markets: marketData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Emerging Markets Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch emerging market data',
      message: error.message
    });
  }
});

// Get international ETFs tracking specific regions
router.get('/international-etfs', async (req, res) => {
  try {
    const regionalETFs = [
      { symbol: 'EWT', name: 'iShares Taiwan', region: 'Taiwan' },
      { symbol: 'EWY', name: 'iShares South Korea', region: 'Korea' },
      { symbol: 'EWJ', name: 'iShares Japan', region: 'Japan' },
      { symbol: 'FXI', name: 'iShares China Large-Cap', region: 'China' },
      { symbol: 'EWH', name: 'iShares Hong Kong', region: 'Hong Kong' },
      { symbol: 'INDA', name: 'iShares India', region: 'India' },
      { symbol: 'EWG', name: 'iShares Germany', region: 'Germany' },
      { symbol: 'EWU', name: 'iShares UK', region: 'UK' },
      { symbol: 'VGK', name: 'Vanguard Europe', region: 'Europe' }
    ];

    const symbols = regionalETFs.map(etf => etf.symbol).join(',');

    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbols,
        fields: 'symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,fiftyTwoWeekHigh,fiftyTwoWeekLow'
      },
      timeout: 10000
    });

    const quotes = response.data.quoteResponse.result;

    const etfData = regionalETFs.map(etf => {
      const quote = quotes.find(q => q.symbol === etf.symbol);
      if (quote) {
        return {
          symbol: etf.symbol,
          name: etf.name,
          region: etf.region,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow
        };
      }
      return null;
    }).filter(item => item !== null);

    res.json({
      success: true,
      category: 'International ETFs',
      count: etfData.length,
      etfs: etfData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('International ETFs Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch international ETF data',
      message: error.message
    });
  }
});

module.exports = router;
