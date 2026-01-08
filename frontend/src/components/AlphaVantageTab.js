import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function AlphaVantageTab() {
  const [apiKey, setApiKey] = useState('');
  const [activeCategory, setActiveCategory] = useState('stock-quote');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Stock Quote State
  const [symbol, setSymbol] = useState('IBM');

  // Time Series State
  const [tsSymbol, setTsSymbol] = useState('IBM');
  const [tsInterval, setTsInterval] = useState('daily');

  // Symbol Search State
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

  // Fetch Stock Quote
  const fetchStockQuote = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/stock-quote', {
        symbol: symbol,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Time Series
  const fetchTimeSeries = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/stock-timeseries', {
        symbol: tsSymbol,
        interval: tsInterval,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search Symbol
  const searchSymbol = async () => {
    if (!apiKey || !searchKeywords) {
      setError('Please enter API key and search keywords');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/symbol-search', {
        keywords: searchKeywords,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Forex
  const fetchForex = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/forex', {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        interval: forexInterval,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Crypto
  const fetchCrypto = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/crypto', {
        symbol: cryptoSymbol,
        market: cryptoMarket,
        interval: cryptoInterval,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Technical Indicator
  const fetchTechnicalIndicator = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/technical-indicator', {
        symbol: tiSymbol,
        indicator: tiIndicator,
        interval: tiInterval,
        time_period: tiTimePeriod,
        series_type: tiSeriesType,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Economic Indicator
  const fetchEconomicIndicator = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/economic-indicator', {
        indicator: economicIndicator,
        apikey: apiKey
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Market Status
  const fetchMarketStatus = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/alphavantage/market-status', {
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
      // Convert data to array format for CSV
      const dataArray = [];

      if (results.data['Global Quote']) {
        const quote = results.data['Global Quote'];
        dataArray.push(quote);
      } else if (results.data.bestMatches) {
        dataArray.push(...results.data.bestMatches);
      }

      if (dataArray.length > 0) {
        exportToCSV(dataArray, `alphavantage_${activeCategory}_${Date.now()}.csv`);
      }
    }
  };

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
        <button onClick={fetchStockQuote} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Quote'}
        </button>
      </div>
    </div>
  );

  const renderTimeSeriesForm = () => (
    <div className="demo-section">
      <h3>Time Series Data</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={tsSymbol}
            onChange={(e) => setTsSymbol(e.target.value.toUpperCase())}
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
        <button onClick={fetchTimeSeries} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Time Series'}
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
        <button onClick={searchSymbol} disabled={loading || !apiKey}>
          {loading ? 'Searching...' : 'Search Symbols'}
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
        <button onClick={fetchForex} disabled={loading || !apiKey}>
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
        <button onClick={fetchCrypto} disabled={loading || !apiKey}>
          {loading ? 'Fetching...' : 'Get Crypto Data'}
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
            <option value="SMA">SMA - Simple Moving Average</option>
            <option value="EMA">EMA - Exponential Moving Average</option>
            <option value="RSI">RSI - Relative Strength Index</option>
            <option value="MACD">MACD</option>
            <option value="BBANDS">Bollinger Bands</option>
            <option value="ADX">ADX - Average Directional Index</option>
            <option value="STOCH">Stochastic Oscillator</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Interval</label>
          <select value={tiInterval} onChange={(e) => setTiInterval(e.target.value)}>
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
        <button onClick={fetchTechnicalIndicator} disabled={loading || !apiKey}>
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
        <button onClick={fetchEconomicIndicator} disabled={loading || !apiKey}>
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
        <button onClick={fetchMarketStatus} disabled={loading || !apiKey}>
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

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>📈 Alpha Vantage</h2>
        <p>Stock market, forex, cryptocurrency, and economic data</p>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem'
        }}>
          {[
            { id: 'stock-quote', label: 'Stock Quote' },
            { id: 'time-series', label: 'Time Series' },
            { id: 'symbol-search', label: 'Symbol Search' },
            { id: 'forex', label: 'Forex' },
            { id: 'crypto', label: 'Cryptocurrency' },
            { id: 'technical', label: 'Technical Indicators' },
            { id: 'economic', label: 'Economic Indicators' },
            { id: 'market-status', label: 'Market Status' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setResults(null);
                setError(null);
              }}
              style={{
                padding: '0.75rem',
                backgroundColor: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Forms */}
      {activeCategory === 'stock-quote' && renderStockQuoteForm()}
      {activeCategory === 'time-series' && renderTimeSeriesForm()}
      {activeCategory === 'symbol-search' && renderSymbolSearchForm()}
      {activeCategory === 'forex' && renderForexForm()}
      {activeCategory === 'crypto' && renderCryptoForm()}
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
          <li><strong>Stocks:</strong> Quotes, intraday, daily, weekly, and monthly time series</li>
          <li><strong>Forex:</strong> Exchange rates and historical FX data</li>
          <li><strong>Cryptocurrencies:</strong> Digital currency data in various markets</li>
          <li><strong>Technical Indicators:</strong> 40+ indicators including SMA, EMA, RSI, MACD, Bollinger Bands</li>
          <li><strong>Economic Indicators:</strong> GDP, CPI, unemployment, interest rates, and more</li>
          <li><strong>Global Coverage:</strong> Data from major exchanges worldwide</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Free Tier Limitations:</strong> Free API keys have rate limits. For higher limits and premium features,
          consider upgrading at{' '}
          <a href="https://www.alphavantage.co/premium/" target="_blank" rel="noopener noreferrer">
            alphavantage.co/premium
          </a>
        </p>
      </div>
    </div>
  );
}

export default AlphaVantageTab;
