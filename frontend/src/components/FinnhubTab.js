import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function FinnhubTab({ apiKey, onApiKeyChange }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [demoType, setDemoType] = useState('quote');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Earnings Calendar state
  const [calendarSymbol, setCalendarSymbol] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [international, setInternational] = useState(false);

  const demos = [
    { value: 'quote', label: 'Stock Quote' },
    { value: 'profile', label: 'Company Profile' },
    { value: 'fundamentals', label: 'Company Fundamentals' },
    { value: 'news', label: 'Company News' },
    { value: 'earnings', label: 'Earnings Data' },
    { value: 'earnings-calendar', label: 'Earnings Calendar' },
    { value: 'recommendations', label: 'Analyst Recommendations' },
    { value: 'sentiment', label: 'News Sentiment' }
  ];

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your Finnhub API key');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = { symbol, apiKey };

      switch (demoType) {
        case 'quote':
          endpoint = '/api/finnhub/quote';
          break;
        case 'profile':
          endpoint = '/api/finnhub/company-profile';
          break;
        case 'fundamentals':
          endpoint = '/api/finnhub/fundamentals';
          break;
        case 'news':
          endpoint = '/api/finnhub/news';
          break;
        case 'earnings':
          endpoint = '/api/finnhub/earnings';
          break;
        case 'earnings-calendar':
          endpoint = '/api/finnhub/earnings-calendar';
          requestData = {
            from: fromDate,
            to: toDate,
            symbol: calendarSymbol || undefined,
            international: international,
            apiKey
          };
          break;
        case 'recommendations':
          endpoint = '/api/finnhub/recommendations';
          break;
        case 'sentiment':
          endpoint = '/api/finnhub/sentiment';
          break;
        default:
          endpoint = '/api/finnhub/quote';
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
      exportToJSON(data, `${symbol}_${demoType}_finnhub.json`);
    }
  };

  const renderData = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (demoType) {
      case 'quote':
        return (
          <div className="result-card">
            <h4>{symbol} - Stock Quote</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Current Price:</strong></td><td>${result.c?.toFixed(2)}</td></tr>
                <tr><td><strong>Change:</strong></td><td style={{color: result.d >= 0 ? 'green' : 'red'}}>{result.d?.toFixed(2)}</td></tr>
                <tr><td><strong>Change %:</strong></td><td style={{color: result.dp >= 0 ? 'green' : 'red'}}>{result.dp?.toFixed(2)}%</td></tr>
                <tr><td><strong>High:</strong></td><td>${result.h?.toFixed(2)}</td></tr>
                <tr><td><strong>Low:</strong></td><td>${result.l?.toFixed(2)}</td></tr>
                <tr><td><strong>Open:</strong></td><td>${result.o?.toFixed(2)}</td></tr>
                <tr><td><strong>Previous Close:</strong></td><td>${result.pc?.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'profile':
        return (
          <div className="result-card">
            <h4>{result.name}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Ticker:</strong></td><td>{result.ticker}</td></tr>
                <tr><td><strong>Exchange:</strong></td><td>{result.exchange}</td></tr>
                <tr><td><strong>Industry:</strong></td><td>{result.finnhubIndustry}</td></tr>
                <tr><td><strong>Market Cap:</strong></td><td>${(result.marketCapitalization / 1000).toFixed(2)}B</td></tr>
                <tr><td><strong>Country:</strong></td><td>{result.country}</td></tr>
                <tr><td><strong>Currency:</strong></td><td>{result.currency}</td></tr>
                <tr><td><strong>IPO Date:</strong></td><td>{result.ipo}</td></tr>
                <tr><td><strong>Website:</strong></td><td><a href={result.weburl} target="_blank" rel="noopener noreferrer">{result.weburl}</a></td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'news':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No news found for {symbol}</p>;
        }
        return result.slice(0, 10).map((article, index) => (
          <div key={index} className="result-card">
            <h4>{article.headline}</h4>
            <p style={{color: '#718096', fontSize: '0.9rem'}}>
              {new Date(article.datetime * 1000).toLocaleDateString()} | {article.source}
            </p>
            <p>{article.summary}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">Read more →</a>
          </div>
        ));

      case 'earnings':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No earnings data found for {symbol}</p>;
        }
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Actual EPS</th>
                <th>Estimate EPS</th>
                <th>Surprise</th>
                <th>Surprise %</th>
              </tr>
            </thead>
            <tbody>
              {result.map((earning, index) => (
                <tr key={index}>
                  <td>{earning.period}</td>
                  <td>${earning.actual?.toFixed(2)}</td>
                  <td>${earning.estimate?.toFixed(2)}</td>
                  <td style={{color: earning.surprise >= 0 ? 'green' : 'red'}}>
                    ${earning.surprise?.toFixed(2)}
                  </td>
                  <td style={{color: earning.surprisePercent >= 0 ? 'green' : 'red'}}>
                    {earning.surprisePercent?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'recommendations':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No recommendation data found for {symbol}</p>;
        }
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Strong Buy</th>
                <th>Buy</th>
                <th>Hold</th>
                <th>Sell</th>
                <th>Strong Sell</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 10).map((rec, index) => (
                <tr key={index}>
                  <td>{rec.period}</td>
                  <td>{rec.strongBuy}</td>
                  <td>{rec.buy}</td>
                  <td>{rec.hold}</td>
                  <td>{rec.sell}</td>
                  <td>{rec.strongSell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'sentiment':
        return (
          <div className="result-card">
            <h4>News Sentiment for {symbol}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Sentiment Score:</strong></td><td>{result.sentiment?.toFixed(3)}</td></tr>
                <tr><td><strong>Positive Score:</strong></td><td>{result.positive?.toFixed(3)}</td></tr>
                <tr><td><strong>Negative Score:</strong></td><td>{result.negative?.toFixed(3)}</td></tr>
                <tr><td><strong>Article Count:</strong></td><td>{result.articleCount}</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'earnings-calendar':
        if (!result.earningsCalendar || result.earningsCalendar.length === 0) {
          return <p>No earnings found for the selected date range</p>;
        }
        return (
          <div className="result-card">
            <h4>Earnings Calendar ({result.earningsCalendar.length} companies)</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symbol</th>
                  <th>Quarter</th>
                  <th>EPS Estimate</th>
                  <th>EPS Actual</th>
                  <th>Revenue Estimate</th>
                  <th>Revenue Actual</th>
                  <th>Hour</th>
                </tr>
              </thead>
              <tbody>
                {result.earningsCalendar.map((earning, index) => (
                  <tr key={index}>
                    <td>{earning.date}</td>
                    <td><strong>{earning.symbol}</strong></td>
                    <td>{earning.year} Q{earning.quarter}</td>
                    <td>${earning.epsEstimate?.toFixed(2) || 'N/A'}</td>
                    <td style={{color: earning.epsActual !== null && earning.epsEstimate !== null && earning.epsActual >= earning.epsEstimate ? 'green' : 'inherit'}}>
                      {earning.epsActual !== null ? `$${earning.epsActual.toFixed(2)}` : 'N/A'}
                    </td>
                    <td>{earning.revenueEstimate ? `$${(earning.revenueEstimate / 1000000).toFixed(2)}M` : 'N/A'}</td>
                    <td style={{color: earning.revenueActual !== null && earning.revenueEstimate !== null && earning.revenueActual >= earning.revenueEstimate ? 'green' : 'inherit'}}>
                      {earning.revenueActual ? `$${(earning.revenueActual / 1000000).toFixed(2)}M` : 'N/A'}
                    </td>
                    <td>{earning.hour || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>📈 Finnhub API</h2>
        <p>Real-time stock market data, fundamentals, and news</p>
      </div>

      <div className="api-key-note">
        <strong>API Key Required:</strong> Get your free API key at{' '}
        <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">finnhub.io</a>
      </div>

      <div className="demo-section">
        <h3>Configure API Access</h3>
        <div className="form-group">
          <label>Finnhub API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your Finnhub API key"
          />
        </div>
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
        </div>

        {demoType === 'earnings-calendar' ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Symbol (Optional)</label>
                <input
                  type="text"
                  value={calendarSymbol}
                  onChange={(e) => setCalendarSymbol(e.target.value.toUpperCase())}
                  placeholder="Leave empty for all stocks"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={international}
                    onChange={(e) => setInternational(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Include International Stocks
                </label>
              </div>
            </div>
          </>
        ) : (
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
        )}

        <div className="button-group">
          <button onClick={fetchData} disabled={loading || (demoType !== 'earnings-calendar' && !symbol) || !apiKey}>
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching data from Finnhub</div>}

      {data && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Results</h3>
            <button onClick={handleExportJSON} className="export-button">
              Export JSON
            </button>
          </div>
          {renderData()}
        </div>
      )}
    </div>
  );
}

export default FinnhubTab;
