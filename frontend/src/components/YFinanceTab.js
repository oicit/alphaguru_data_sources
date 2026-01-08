import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function YFinanceTab() {
  const [symbol, setSymbol] = useState('AAPL');
  const [demoType, setDemoType] = useState('quote');
  const [interval, setInterval] = useState('1d');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const demos = [
    { value: 'quote', label: 'Real-time Quote' },
    { value: 'historical', label: 'Historical Data' },
    { value: 'search', label: 'Symbol Search' }
  ];

  const intervals = ['1d', '1wk', '1mo'];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = {};

      switch (demoType) {
        case 'quote':
          endpoint = '/api/yfinance/quote';
          requestData = { symbol };
          break;
        case 'historical':
          endpoint = '/api/yfinance/historical';
          const end = Math.floor(Date.now() / 1000);
          const start = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
          requestData = { symbol, period1: start, period2: end, interval };
          break;
        case 'search':
          endpoint = '/api/yfinance/search';
          requestData = { query: searchQuery || symbol };
          break;
        default:
          endpoint = '/api/yfinance/quote';
          requestData = { symbol };
      }

      const response = await axios.post(endpoint, requestData);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (data) {
      exportToJSON(data, `${symbol}_yfinance.json`);
    }
  };

  const handleExportCSV = () => {
    if (demoType === 'historical' && data && data.data) {
      const { timestamp, indicators } = data.data;
      const csvData = timestamp.map((ts, index) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: indicators.open[index],
        high: indicators.high[index],
        low: indicators.low[index],
        close: indicators.close[index],
        volume: indicators.volume[index]
      }));
      exportToCSV(csvData, `${symbol}_historical.csv`);
    } else if (demoType === 'search' && data && data.data) {
      const csvData = data.data.map(result => ({
        symbol: result.symbol,
        name: result.shortname || result.longname,
        exchange: result.exchange,
        type: result.quoteType
      }));
      exportToCSV(csvData, 'search_results.csv');
    }
  };

  const renderData = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (demoType) {
      case 'quote':
        if (!result) return <p>No quote data available</p>;
        return (
          <div className="result-card">
            <h4>{result.longName || result.shortName || symbol}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Symbol:</strong></td><td>{result.symbol}</td></tr>
                <tr><td><strong>Current Price:</strong></td><td>${result.regularMarketPrice?.toFixed(2)}</td></tr>
                <tr><td><strong>Change:</strong></td><td style={{color: result.regularMarketChange >= 0 ? 'green' : 'red'}}>
                  {result.regularMarketChange?.toFixed(2)} ({result.regularMarketChangePercent?.toFixed(2)}%)
                </td></tr>
                <tr><td><strong>Day High:</strong></td><td>${result.regularMarketDayHigh?.toFixed(2)}</td></tr>
                <tr><td><strong>Day Low:</strong></td><td>${result.regularMarketDayLow?.toFixed(2)}</td></tr>
                <tr><td><strong>Open:</strong></td><td>${result.regularMarketOpen?.toFixed(2)}</td></tr>
                <tr><td><strong>Previous Close:</strong></td><td>${result.regularMarketPreviousClose?.toFixed(2)}</td></tr>
                <tr><td><strong>Volume:</strong></td><td>{result.regularMarketVolume?.toLocaleString()}</td></tr>
                <tr><td><strong>Market Cap:</strong></td><td>${(result.marketCap / 1e9).toFixed(2)}B</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'historical':
        if (!result.timestamp || result.timestamp.length === 0) {
          return <p>No historical data available</p>;
        }
        const lastN = 10;
        const recentData = result.timestamp.slice(-lastN).reverse();
        return (
          <div>
            <p style={{marginBottom: '1rem', color: '#718096'}}>
              Showing last {lastN} data points. Export to CSV for full dataset.
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Open</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Close</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {recentData.map((ts, index) => {
                  const actualIndex = result.timestamp.length - lastN + index;
                  return (
                    <tr key={index}>
                      <td>{new Date(ts * 1000).toLocaleDateString()}</td>
                      <td>${result.indicators.open[actualIndex]?.toFixed(2)}</td>
                      <td>${result.indicators.high[actualIndex]?.toFixed(2)}</td>
                      <td>${result.indicators.low[actualIndex]?.toFixed(2)}</td>
                      <td>${result.indicators.close[actualIndex]?.toFixed(2)}</td>
                      <td>{result.indicators.volume[actualIndex]?.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'search':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No results found for "{searchQuery || symbol}"</p>;
        }
        return result.slice(0, 15).map((item, index) => (
          <div key={index} className="result-card">
            <h4>{item.shortname || item.longname}</h4>
            <p><strong>Symbol:</strong> {item.symbol}</p>
            <p><strong>Exchange:</strong> {item.exchange}</p>
            <p><strong>Type:</strong> {item.quoteType}</p>
            {item.industry && <p><strong>Industry:</strong> {item.industry}</p>}
          </div>
        ));

      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>💹 Yahoo Finance</h2>
        <p>Stock quotes, historical data, and symbol search</p>
      </div>

      <div className="demo-section">
        <h3>Try Different Demos</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Demo Type</label>
            <select value={demoType} onChange={(e) => setDemoType(e.target.value)}>
              {demos.map(demo => (
                <option key={demo.value} value={demo.value}>{demo.label}</option>
              ))}
            </select>
          </div>

          {demoType === 'search' ? (
            <div className="form-group">
              <label>Search Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Apple, Microsoft, Bitcoin"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Stock Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
              />
            </div>
          )}

          {demoType === 'historical' && (
            <div className="form-group">
              <label>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                {intervals.map(int => (
                  <option key={int} value={int}>{int}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            onClick={fetchData}
            disabled={loading || (demoType === 'search' ? !searchQuery : !symbol)}
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching data from Yahoo Finance</div>}

      {data && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Results</h3>
            <div className="button-group">
              <button onClick={handleExportJSON} className="export-button">
                Export JSON
              </button>
              {(demoType === 'historical' || demoType === 'search') && (
                <button onClick={handleExportCSV} className="export-button">
                  Export CSV
                </button>
              )}
            </div>
          </div>
          {renderData()}
        </div>
      )}

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>📚 About Yahoo Finance</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Yahoo Finance provides free access to stock market data including:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li>Real-time stock quotes and price data</li>
          <li>Historical price data with various intervals (daily, weekly, monthly)</li>
          <li>Symbol search across global markets</li>
          <li>No API key required for basic data access</li>
        </ul>
      </div>
    </div>
  );
}

export default YFinanceTab;
