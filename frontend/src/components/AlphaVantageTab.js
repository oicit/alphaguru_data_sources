import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function AlphaVantageTab() {
  const [apiKey, setApiKey] = useState('');
  const [activeCategory, setActiveCategory] = useState('stock-quote');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Stock State
  const [symbol, setSymbol] = useState('IBM');
  const [intradayInterval, setIntradayInterval] = useState('5min');
  const [tsInterval, setTsInterval] = useState('daily');
  const [adjustedInterval, setAdjustedInterval] = useState('weekly');

  // Search State
  const [searchKeywords, setSearchKeywords] = useState('');

  // Forex State
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [forexInterval, setForexInterval] = useState('daily');

  // Crypto State
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoMarket, setCryptoMarket] = useState('USD');
  const [cryptoInterval, setCryptoInterval] = useState('daily');

  // Technical Indicator State
  const [tiSymbol, setTiSymbol] = useState('IBM');
  const [tiIndicator, setTiIndicator] = useState('SMA');
  const [tiInterval, setTiInterval] = useState('daily');
  const [tiTimePeriod, setTiTimePeriod] = useState('10');
  const [tiSeriesType, setTiSeriesType] = useState('close');

  // Economic Indicator State
  const [economicIndicator, setEconomicIndicator] = useState('REAL_GDP');

  // News & Sentiment State
  const [newsTickers, setNewsTickers] = useState('');
  const [newsTopics, setNewsTopics] = useState('');

  // Commodity State
  const [commodityType, setCommodityType] = useState('WTI');
  const [commodityInterval, setCommodityInterval] = useState('monthly');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('alphavantage_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('alphavantage_api_key', newKey);
  };

  // Generic fetch function
  const fetchData = async (endpoint, data) => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`/api/alphavantage/${endpoint}`, {
        ...data,
        apikey: apiKey
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (results) {
      exportToJSON(results.data, `alphavantage_${activeCategory}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (results && results.data) {
      const dataArray = [];
      if (results.data['Global Quote']) {
        dataArray.push(results.data['Global Quote']);
      } else if (results.data.bestMatches) {
        dataArray.push(...results.data.bestMatches);
      }
      if (dataArray.length > 0) {
        exportToCSV(dataArray, `alphavantage_${activeCategory}_${Date.now()}.csv`);
      }
    }
  };

  // Render Forms
  const renderStockQuoteForm = () => (
    <div className="demo-section">
      <h3>Stock Quote (Real-time)</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM, AAPL"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('stock-quote', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Quote'}
        </button>
      </div>
    </div>
  );

  const renderIntradayForm = () => (
    <div className="demo-section">
      <h3>Intraday Stock Data</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={intradayInterval} onChange={(e) => setIntradayInterval(e.target.value)}>
            <option value="1min">1 min</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="30min">30 min</option>
            <option value="60min">60 min</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('stock-intraday', { symbol, interval: intradayInterval })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Intraday Data'}
        </button>
      </div>
    </div>
  );

  const renderTimeSeriesForm = () => (
    <div className="demo-section">
      <h3>Time Series Data (Daily/Weekly/Monthly)</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={tsInterval} onChange={(e) => setTsInterval(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('stock-timeseries', { symbol, interval: tsInterval })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Time Series'}
        </button>
      </div>
    </div>
  );

  const renderDailyAdjustedForm = () => (
    <div className="demo-section">
      <h3>Daily Adjusted Stock Data</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Includes split/dividend adjusted close prices</p>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('stock-daily-adjusted', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Daily Adjusted'}
        </button>
      </div>
    </div>
  );

  const renderAdjustedForm = () => (
    <div className="demo-section">
      <h3>Weekly/Monthly Adjusted Data</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Adjusted for splits and dividends</p>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={adjustedInterval} onChange={(e) => setAdjustedInterval(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('stock-adjusted', { symbol, interval: adjustedInterval })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Adjusted Data'}
        </button>
      </div>
    </div>
  );

  const renderSymbolSearchForm = () => (
    <div className="demo-section">
      <h3>Symbol Search</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Search Keywords</label>
          <input
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="e.g., Microsoft, AAPL"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('symbol-search', { keywords: searchKeywords })} disabled={loading || !apiKey || !searchKeywords}>
          {loading ? 'Searching...' : 'Search Symbols'}
        </button>
      </div>
    </div>
  );

  const renderCompanyOverviewForm = () => (
    <div className="demo-section">
      <h3>Company Overview</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Company information, financials, and fundamentals</p>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('company-overview', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Company Overview'}
        </button>
      </div>
    </div>
  );

  const renderIncomeStatementForm = () => (
    <div className="demo-section">
      <h3>Income Statement</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('income-statement', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Income Statement'}
        </button>
      </div>
    </div>
  );

  const renderBalanceSheetForm = () => (
    <div className="demo-section">
      <h3>Balance Sheet</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('balance-sheet', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Balance Sheet'}
        </button>
      </div>
    </div>
  );

  const renderCashFlowForm = () => (
    <div className="demo-section">
      <h3>Cash Flow Statement</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('cash-flow', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Cash Flow'}
        </button>
      </div>
    </div>
  );

  const renderEarningsForm = () => (
    <div className="demo-section">
      <h3>Earnings History</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('earnings', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Earnings'}
        </button>
      </div>
    </div>
  );

  const renderListingStatusForm = () => (
    <div className="demo-section">
      <h3>Listing & Delisting Status</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>List of active and delisted US stocks and ETFs</p>
      <div className="button-group">
        <button onClick={() => fetchData('listing-status', {})} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Listing Status'}
        </button>
      </div>
    </div>
  );

  const renderEarningsCalendarForm = () => (
    <div className="demo-section">
      <h3>Earnings Calendar</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Upcoming earnings reports (optional: filter by symbol)</p>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol (Optional)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Leave empty for all"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('earnings-calendar', { symbol: symbol || undefined })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Earnings Calendar'}
        </button>
      </div>
    </div>
  );

  const renderIPOCalendarForm = () => (
    <div className="demo-section">
      <h3>IPO Calendar</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Upcoming and recent IPOs</p>
      <div className="button-group">
        <button onClick={() => fetchData('ipo-calendar', {})} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get IPO Calendar'}
        </button>
      </div>
    </div>
  );

  const renderNewsSentimentForm = () => (
    <div className="demo-section">
      <h3>News & Sentiments</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Tickers (Optional, comma-separated)</label>
          <input
            type="text"
            value={newsTickers}
            onChange={(e) => setNewsTickers(e.target.value)}
            placeholder="e.g., AAPL,TSLA"
          />
        </div>
        <div className="form-group">
          <label>Topics (Optional)</label>
          <input
            type="text"
            value={newsTopics}
            onChange={(e) => setNewsTopics(e.target.value)}
            placeholder="e.g., technology,finance"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('news-sentiment', {
          tickers: newsTickers || undefined,
          topics: newsTopics || undefined
        })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get News & Sentiment'}
        </button>
      </div>
    </div>
  );

  const renderTopGainersLosersForm = () => (
    <div className="demo-section">
      <h3>Top Gainers & Losers</h3>
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>Most actively traded stocks</p>
      <div className="button-group">
        <button onClick={() => fetchData('top-gainers-losers', {})} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Top Gainers/Losers'}
        </button>
      </div>
    </div>
  );

  const renderInsiderTransactionsForm = () => (
    <div className="demo-section">
      <h3>Insider Transactions</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('insider-transactions', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Insider Transactions'}
        </button>
      </div>
    </div>
  );

  const renderETFProfileForm = () => (
    <div className="demo-section">
      <h3>ETF Profile & Holdings</h3>
      <div className="form-row">
        <div className="form-group">
          <label>ETF Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., SPY, QQQ"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('etf-profile', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get ETF Profile'}
        </button>
      </div>
    </div>
  );

  const renderDividendsForm = () => (
    <div className="demo-section">
      <h3>Corporate Action - Dividends</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('dividends', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Dividend History'}
        </button>
      </div>
    </div>
  );

  const renderSplitsForm = () => (
    <div className="demo-section">
      <h3>Corporate Action - Splits</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('splits', { symbol })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Split History'}
        </button>
      </div>
    </div>
  );

  const renderForexForm = () => (
    <div className="demo-section">
      <h3>Forex Exchange Rate</h3>
      <div className="form-row">
        <div className="form-group">
          <label>From Currency</label>
          <input
            type="text"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
            placeholder="e.g., USD"
            maxLength="3"
          />
        </div>
        <div className="form-group">
          <label>To Currency</label>
          <input
            type="text"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
            placeholder="e.g., EUR"
            maxLength="3"
          />
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={forexInterval} onChange={(e) => setForexInterval(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('forex', {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          interval: forexInterval
        })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Forex Data'}
        </button>
      </div>
    </div>
  );

  const renderCryptoForm = () => (
    <div className="demo-section">
      <h3>Cryptocurrency Data</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Crypto Symbol</label>
          <input
            type="text"
            value={cryptoSymbol}
            onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., BTC, ETH"
          />
        </div>
        <div className="form-group">
          <label>Market</label>
          <input
            type="text"
            value={cryptoMarket}
            onChange={(e) => setCryptoMarket(e.target.value.toUpperCase())}
            placeholder="e.g., USD"
          />
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={cryptoInterval} onChange={(e) => setCryptoInterval(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('crypto', {
          symbol: cryptoSymbol,
          market: cryptoMarket,
          interval: cryptoInterval
        })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Crypto Data'}
        </button>
      </div>
    </div>
  );

  const renderCommodityForm = () => (
    <div className="demo-section">
      <h3>Commodity Prices</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Commodity</label>
          <select value={commodityType} onChange={(e) => setCommodityType(e.target.value)}>
            <option value="WTI">Crude Oil (WTI)</option>
            <option value="BRENT">Crude Oil (Brent)</option>
            <option value="NATURAL_GAS">Natural Gas</option>
            <option value="COPPER">Copper</option>
            <option value="ALUMINUM">Aluminum</option>
            <option value="WHEAT">Wheat</option>
            <option value="CORN">Corn</option>
            <option value="COTTON">Cotton</option>
            <option value="SUGAR">Sugar</option>
            <option value="COFFEE">Coffee</option>
            <option value="ALL_COMMODITIES">Global Commodities Index</option>
          </select>
        </div>
        <div className="form-group">
          <label>Interval</label>
          <select value={commodityInterval} onChange={(e) => setCommodityInterval(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('commodity', {
          commodity: commodityType,
          interval: commodityInterval
        })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Commodity Data'}
        </button>
      </div>
    </div>
  );

  const renderTechnicalIndicatorForm = () => (
    <div className="demo-section">
      <h3>Technical Indicators</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={tiSymbol}
            onChange={(e) => setTiSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
        <div className="form-group">
          <label>Indicator</label>
          <select value={tiIndicator} onChange={(e) => setTiIndicator(e.target.value)}>
            <optgroup label="Moving Averages">
              <option value="SMA">SMA - Simple Moving Average</option>
              <option value="EMA">EMA - Exponential Moving Average</option>
              <option value="WMA">WMA - Weighted Moving Average</option>
              <option value="DEMA">DEMA - Double Exponential MA</option>
              <option value="TEMA">TEMA - Triple Exponential MA</option>
              <option value="TRIMA">TRIMA - Triangular MA</option>
              <option value="KAMA">KAMA - Kaufman Adaptive MA</option>
              <option value="MAMA">MAMA - MESA Adaptive MA</option>
              <option value="T3">T3 - Triple Exponential MA</option>
            </optgroup>
            <optgroup label="Momentum Indicators">
              <option value="MACD">MACD</option>
              <option value="MACDEXT">MACDEXT - MACD with Controllable MA</option>
              <option value="STOCH">Stochastic Oscillator</option>
              <option value="STOCHF">STOCHF - Stochastic Fast</option>
              <option value="RSI">RSI - Relative Strength Index</option>
              <option value="STOCHRSI">STOCHRSI - Stochastic RSI</option>
              <option value="WILLR">Williams %R</option>
              <option value="ADX">ADX - Average Directional Index</option>
              <option value="ADXR">ADXR - Average Directional Rating</option>
              <option value="APO">APO - Absolute Price Oscillator</option>
              <option value="PPO">PPO - Percentage Price Oscillator</option>
              <option value="MOM">Momentum</option>
              <option value="BOP">BOP - Balance of Power</option>
              <option value="CCI">CCI - Commodity Channel Index</option>
              <option value="CMO">CMO - Chande Momentum Oscillator</option>
              <option value="ROC">ROC - Rate of Change</option>
              <option value="ROCR">ROCR - Rate of Change Ratio</option>
              <option value="AROON">AROON</option>
              <option value="AROONOSC">AROON Oscillator</option>
              <option value="MFI">MFI - Money Flow Index</option>
              <option value="TRIX">TRIX</option>
              <option value="ULTOSC">Ultimate Oscillator</option>
              <option value="DX">DX - Directional Movement Index</option>
              <option value="MINUS_DI">Minus Directional Indicator</option>
              <option value="PLUS_DI">Plus Directional Indicator</option>
              <option value="MINUS_DM">Minus Directional Movement</option>
              <option value="PLUS_DM">Plus Directional Movement</option>
            </optgroup>
            <optgroup label="Volume Indicators">
              <option value="AD">AD - Chaikin A/D Line</option>
              <option value="ADOSC">ADOSC - Chaikin A/D Oscillator</option>
              <option value="OBV">OBV - On Balance Volume</option>
            </optgroup>
            <optgroup label="Volatility Indicators">
              <option value="BBANDS">Bollinger Bands</option>
              <option value="MIDPOINT">Midpoint</option>
              <option value="MIDPRICE">Midprice</option>
              <option value="SAR">SAR - Parabolic SAR</option>
              <option value="TRANGE">True Range</option>
              <option value="ATR">ATR - Average True Range</option>
              <option value="NATR">NATR - Normalized ATR</option>
            </optgroup>
            <optgroup label="Cycle Indicators">
              <option value="HT_TRENDLINE">Hilbert Transform - Trendline</option>
              <option value="HT_SINE">Hilbert Transform - Sine Wave</option>
              <option value="HT_TRENDMODE">Hilbert Transform - Trend Mode</option>
              <option value="HT_DCPERIOD">Hilbert Transform - Dominant Cycle Period</option>
              <option value="HT_DCPHASE">Hilbert Transform - Dominant Cycle Phase</option>
              <option value="HT_PHASOR">Hilbert Transform - Phasor Components</option>
            </optgroup>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Interval</label>
          <select value={tiInterval} onChange={(e) => setTiInterval(e.target.value)}>
            <option value="1min">1 min</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="30min">30 min</option>
            <option value="60min">60 min</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Time Period</label>
          <input
            type="number"
            value={tiTimePeriod}
            onChange={(e) => setTiTimePeriod(e.target.value)}
            placeholder="e.g., 10"
          />
        </div>
        <div className="form-group">
          <label>Series Type</label>
          <select value={tiSeriesType} onChange={(e) => setTiSeriesType(e.target.value)}>
            <option value="close">Close</option>
            <option value="open">Open</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('technical-indicator', {
          symbol: tiSymbol,
          indicator: tiIndicator,
          interval: tiInterval,
          time_period: tiTimePeriod,
          series_type: tiSeriesType
        })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Technical Indicator'}
        </button>
      </div>
    </div>
  );

  const renderEconomicIndicatorForm = () => (
    <div className="demo-section">
      <h3>Economic Indicators</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Indicator</label>
          <select value={economicIndicator} onChange={(e) => setEconomicIndicator(e.target.value)}>
            <option value="REAL_GDP">Real GDP</option>
            <option value="REAL_GDP_PER_CAPITA">Real GDP Per Capita</option>
            <option value="TREASURY_YIELD">Treasury Yield</option>
            <option value="FEDERAL_FUNDS_RATE">Federal Funds Rate</option>
            <option value="CPI">Consumer Price Index (CPI)</option>
            <option value="INFLATION">Inflation Rate</option>
            <option value="RETAIL_SALES">Retail Sales</option>
            <option value="DURABLES">Durable Goods Orders</option>
            <option value="UNEMPLOYMENT">Unemployment Rate</option>
            <option value="NONFARM_PAYROLL">Nonfarm Payroll</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={() => fetchData('economic-indicator', { indicator: economicIndicator })} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Economic Data'}
        </button>
      </div>
    </div>
  );

  const renderMarketStatusForm = () => (
    <div className="demo-section">
      <h3>Market Status</h3>
      <p style={{ color: '#718096' }}>View current market status for global trading venues</p>
      <div className="button-group">
        <button onClick={() => fetchData('market-status', {})} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Market Status'}
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results || !results.data) return null;

    return (
      <div className="results-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Results</h3>
          <div className="button-group">
            <button onClick={handleExportJSON} className="export-button">
              Export JSON
            </button>
            <button onClick={handleExportCSV} className="export-button">
              Export CSV
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1rem',
          borderRadius: '8px',
          maxHeight: '500px',
          overflow: 'auto'
        }}>
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: '0.85rem'
          }}>
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const categories = [
    { id: 'stock-quote', label: 'Stock Quote', group: 'stocks' },
    { id: 'intraday', label: 'Intraday', group: 'stocks' },
    { id: 'time-series', label: 'Time Series', group: 'stocks' },
    { id: 'daily-adjusted', label: 'Daily Adjusted', group: 'stocks' },
    { id: 'adjusted', label: 'Weekly/Monthly Adj', group: 'stocks' },
    { id: 'symbol-search', label: 'Symbol Search', group: 'stocks' },
    { id: 'company-overview', label: 'Company Overview', group: 'fundamentals' },
    { id: 'income-statement', label: 'Income Statement', group: 'fundamentals' },
    { id: 'balance-sheet', label: 'Balance Sheet', group: 'fundamentals' },
    { id: 'cash-flow', label: 'Cash Flow', group: 'fundamentals' },
    { id: 'earnings', label: 'Earnings History', group: 'fundamentals' },
    { id: 'listing-status', label: 'Listing Status', group: 'fundamentals' },
    { id: 'earnings-calendar', label: 'Earnings Calendar', group: 'fundamentals' },
    { id: 'ipo-calendar', label: 'IPO Calendar', group: 'fundamentals' },
    { id: 'etf-profile', label: 'ETF Profile', group: 'fundamentals' },
    { id: 'dividends', label: 'Dividends', group: 'fundamentals' },
    { id: 'splits', label: 'Splits', group: 'fundamentals' },
    { id: 'news-sentiment', label: 'News & Sentiment', group: 'intelligence' },
    { id: 'top-gainers-losers', label: 'Top Gainers/Losers', group: 'intelligence' },
    { id: 'insider-transactions', label: 'Insider Transactions', group: 'intelligence' },
    { id: 'forex', label: 'Forex', group: 'other' },
    { id: 'crypto', label: 'Cryptocurrency', group: 'other' },
    { id: 'commodity', label: 'Commodities', group: 'other' },
    { id: 'technical', label: 'Technical Indicators', group: 'other' },
    { id: 'economic', label: 'Economic Indicators', group: 'other' },
    { id: 'market-status', label: 'Market Status', group: 'other' }
  ];

  const groupedCategories = {
    stocks: categories.filter(c => c.group === 'stocks'),
    fundamentals: categories.filter(c => c.group === 'fundamentals'),
    intelligence: categories.filter(c => c.group === 'intelligence'),
    other: categories.filter(c => c.group === 'other')
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>📈 Alpha Vantage</h2>
        <p>Comprehensive stock market, fundamental, forex, crypto, and economic data</p>
      </div>

      {/* API Key Input */}
      <div className="demo-section">
        <h3>API Configuration</h3>
        <div className="form-group">
          <label>Alpha Vantage API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Alpha Vantage API key"
          />
          <small style={{ color: '#718096', fontSize: '0.85rem' }}>
            Get your free API key at{' '}
            <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer">
              alphavantage.co/support/#api-key
            </a>
          </small>
        </div>
      </div>

      {/* Category Selector */}
      <div className="demo-section">
        <h3>Data Category</h3>

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2d3748', fontSize: '0.95rem' }}>Core Stock APIs</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {groupedCategories.stocks.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setResults(null); setError(null); }}
              style={{
                padding: '0.75rem',
                backgroundColor: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2d3748', fontSize: '0.95rem' }}>Fundamental Data</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {groupedCategories.fundamentals.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setResults(null); setError(null); }}
              style={{
                padding: '0.75rem',
                backgroundColor: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2d3748', fontSize: '0.95rem' }}>Alpha Intelligence</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {groupedCategories.intelligence.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setResults(null); setError(null); }}
              style={{
                padding: '0.75rem',
                backgroundColor: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2d3748', fontSize: '0.95rem' }}>Forex, Crypto, Commodities & Indicators</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
          {groupedCategories.other.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setResults(null); setError(null); }}
              style={{
                padding: '0.75rem',
                backgroundColor: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Forms */}
      {activeCategory === 'stock-quote' && renderStockQuoteForm()}
      {activeCategory === 'intraday' && renderIntradayForm()}
      {activeCategory === 'time-series' && renderTimeSeriesForm()}
      {activeCategory === 'daily-adjusted' && renderDailyAdjustedForm()}
      {activeCategory === 'adjusted' && renderAdjustedForm()}
      {activeCategory === 'symbol-search' && renderSymbolSearchForm()}
      {activeCategory === 'company-overview' && renderCompanyOverviewForm()}
      {activeCategory === 'income-statement' && renderIncomeStatementForm()}
      {activeCategory === 'balance-sheet' && renderBalanceSheetForm()}
      {activeCategory === 'cash-flow' && renderCashFlowForm()}
      {activeCategory === 'earnings' && renderEarningsForm()}
      {activeCategory === 'listing-status' && renderListingStatusForm()}
      {activeCategory === 'earnings-calendar' && renderEarningsCalendarForm()}
      {activeCategory === 'ipo-calendar' && renderIPOCalendarForm()}
      {activeCategory === 'news-sentiment' && renderNewsSentimentForm()}
      {activeCategory === 'top-gainers-losers' && renderTopGainersLosersForm()}
      {activeCategory === 'insider-transactions' && renderInsiderTransactionsForm()}
      {activeCategory === 'etf-profile' && renderETFProfileForm()}
      {activeCategory === 'dividends' && renderDividendsForm()}
      {activeCategory === 'splits' && renderSplitsForm()}
      {activeCategory === 'forex' && renderForexForm()}
      {activeCategory === 'crypto' && renderCryptoForm()}
      {activeCategory === 'commodity' && renderCommodityForm()}
      {activeCategory === 'technical' && renderTechnicalIndicatorForm()}
      {activeCategory === 'economic' && renderEconomicIndicatorForm()}
      {activeCategory === 'market-status' && renderMarketStatusForm()}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="loading">Fetching data from Alpha Vantage...</div>}

      {/* Results */}
      {renderResults()}

      {/* Documentation */}
      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>📚 About Alpha Vantage</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Alpha Vantage provides free APIs for real-time and historical market data across multiple asset classes:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Core Stock APIs:</strong> Intraday, daily, weekly, monthly time series with adjustments</li>
          <li><strong>Fundamental Data:</strong> Company overview, financial statements, earnings, dividends, splits</li>
          <li><strong>Alpha Intelligence:</strong> News sentiment, top gainers/losers, insider transactions</li>
          <li><strong>Forex & Crypto:</strong> Exchange rates and historical data</li>
          <li><strong>Commodities:</strong> WTI, Brent, natural gas, metals, agriculture</li>
          <li><strong>Technical Indicators:</strong> 50+ indicators including SMA, EMA, RSI, MACD, Bollinger Bands</li>
          <li><strong>Economic Indicators:</strong> GDP, CPI, unemployment, interest rates, and more</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Free Tier:</strong> 25 requests per day. For higher limits, visit{' '}
          <a href="https://www.alphavantage.co/premium/" target="_blank" rel="noopener noreferrer">
            alphavantage.co/premium
          </a>
        </p>
      </div>
    </div>
  );
}

export default AlphaVantageTab;
