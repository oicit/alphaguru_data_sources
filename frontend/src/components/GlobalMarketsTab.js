import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

function GlobalMarketsTab() {
  const [dataType, setDataType] = useState('asian-markets');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customSymbols, setCustomSymbols] = useState('2330.TW,005930.KS,TSM');
  const [currencyPairs, setCurrencyPairs] = useState('EURUSD=X,GBPUSD=X,USDJPY=X,USDKRW=X');

  const dataTypes = [
    { value: 'asian-markets', label: 'Asian Markets Overview', method: 'GET' },
    { value: 'european-markets', label: 'European Markets Overview', method: 'GET' },
    { value: 'semiconductor-leaders', label: 'Semiconductor Leaders (Taiwan/Korea)', method: 'GET' },
    { value: 'market-sessions', label: 'Global Market Sessions Status', method: 'GET' },
    { value: 'cross-market-correlation', label: 'Cross-Market Correlation', method: 'GET' },
    { value: 'emerging-markets', label: 'Emerging Markets', method: 'GET' },
    { value: 'international-etfs', label: 'International ETFs', method: 'GET' },
    { value: 'international-quote', label: 'Custom International Quote', method: 'POST' },
    { value: 'currency-pairs', label: 'Currency Pairs', method: 'POST' }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const selectedType = dataTypes.find(dt => dt.value === dataType);
      let response;

      if (selectedType.method === 'GET') {
        response = await axios.get(`${API_BASE_URL}/globalmarkets/${dataType}`);
      } else {
        // POST requests with parameters
        const requestData = {};
        if (dataType === 'international-quote') {
          requestData.symbols = customSymbols;
        } else if (dataType === 'currency-pairs') {
          requestData.pairs = currencyPairs.split(',').map(p => p.trim());
        }
        response = await axios.post(`${API_BASE_URL}/globalmarkets/${dataType}`, requestData);
      }

      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Global Markets API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format) => {
    if (!data) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `globalmarkets_${dataType}_${Date.now()}.json`;
      link.click();
    } else if (format === 'csv') {
      // Simple CSV export
      let csv = '';
      if (data.markets || data.stocks || data.etfs || data.quotes || data.rates) {
        const items = data.markets || data.stocks || data.etfs || data.quotes || data.rates;
        if (typeof items === 'object' && !Array.isArray(items)) {
          // Object format (like markets)
          csv = 'Market,Name,Price,Change,Change%\n';
          Object.entries(items).forEach(([key, value]) => {
            csv += `${key},${value.name},${value.price},${value.change},${value.changePercent}\n`;
          });
        } else if (Array.isArray(items)) {
          // Array format
          const keys = Object.keys(items[0]);
          csv = keys.join(',') + '\n';
          items.forEach(item => {
            csv += keys.map(k => item[k]).join(',') + '\n';
          });
        }
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `globalmarkets_${dataType}_${Date.now()}.csv`;
      link.click();
    }
  };

  const formatChange = (change, changePercent) => {
    const isPositive = change >= 0;
    const color = isPositive ? '#10b981' : '#ef4444';
    const arrow = isPositive ? '▲' : '▼';
    return (
      <span style={{ color: color, fontWeight: 'bold' }}>
        {arrow} {Math.abs(change).toFixed(2)} ({changePercent?.toFixed(2)}%)
      </span>
    );
  };

  const renderAsianMarkets = () => {
    if (!data.markets) return null;
    return (
      <div>
        <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
          <strong>💡 Insight:</strong> Asian markets trade before US markets and often provide early signals for semiconductor and tech sectors.
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Index</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Change</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.markets).map(([country, market]) => (
              <tr key={country} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{country}</td>
                <td style={{ padding: '12px' }}>{market.name} ({market.exchange})</td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>{market.price?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatChange(market.change, market.changePercent)}</td>
                <td style={{ padding: '12px', fontSize: '0.875rem', color: '#6b7280' }}>
                  {market.lastUpdate ? new Date(market.lastUpdate).toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEuropeanMarkets = () => {
    if (!data.markets) return null;
    return (
      <div>
        <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
          <strong>💡 Insight:</strong> European markets bridge Asian and US trading sessions, providing mid-day signals and correlations.
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Index</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.markets).map(([country, market]) => (
              <tr key={country} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{country}</td>
                <td style={{ padding: '12px' }}>{market.name} ({market.exchange})</td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>{market.price?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatChange(market.change, market.changePercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSemiconductorLeaders = () => {
    if (!data.stocks) return null;
    return (
      <div>
        <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <strong>🎯 Supply Chain Leaders:</strong> Taiwan and Korea dominate semiconductor manufacturing.
          These stocks often move before US chip stocks, providing early signals.
        </div>
        <div style={{ marginBottom: '15px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
          <div><strong>Total Market Cap:</strong> ${(data.totalMarketCap / 1e12).toFixed(2)}T</div>
          <div><strong>Average Change:</strong> {data.avgChangePercent}%</div>
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Symbol</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Company</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Change</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {data.stocks.map((stock) => (
              <tr key={stock.symbol} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '600' }}>{stock.symbol}</td>
                <td style={{ padding: '12px' }}>{stock.name}</td>
                <td style={{ padding: '12px' }}>{stock.country}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>${stock.price?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatChange(stock.change, stock.changePercent)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>${(stock.marketCap / 1e9).toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMarketSessions = () => {
    if (!data.sessions) return null;
    return (
      <div>
        <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#ede9fe', borderLeft: '4px solid #8b5cf6' }}>
          <strong>🌍 {data.insight}</strong>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Current Time (UTC):</strong> {new Date(data.currentTimeUTC).toLocaleString()}
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Market</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Trading Hours (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.sessions).map(([key, session]) => (
              <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontWeight: '600' }}>{session.name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: session.status === 'open' ? '#10b981' : '#6b7280',
                    color: 'white'
                  }}>
                    {session.status === 'open' ? '● OPEN' : '○ CLOSED'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  {Math.floor(session.open / 60)}:{String(session.open % 60).padStart(2, '0')} - {Math.floor(session.close / 60)}:{String(session.close % 60).padStart(2, '0')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCrossMarketCorrelation = () => {
    if (!data.correlationData) return null;
    return (
      <div>
        <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
          <strong>📊 Cross-Market Analysis:</strong> Compare regional performance and identify leading/lagging markets.
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'space-around' }}>
          {Object.entries(data.regionalAverages).map(([region, avg]) => (
            <div key={region} style={{
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '150px'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>{region}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px', color: avg >= 0 ? '#10b981' : '#ef4444' }}>
                {avg >= 0 ? '+' : ''}{avg}%
              </div>
            </div>
          ))}
        </div>
        {Object.entries(data.correlationData).map(([region, countries]) => (
          <div key={region} style={{ marginBottom: '20px' }}>
            <h4 style={{ textTransform: 'capitalize', marginBottom: '10px' }}>{region}</h4>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Index</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Change %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(countries).map(([country, data]) => (
                  <tr key={country} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{country}</td>
                    <td style={{ padding: '12px' }}>{data.name}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: data.changePercent >= 0 ? '#10b981' : '#ef4444' }}>
                      {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderGenericTable = (items, title) => {
    if (!items || items.length === 0) return null;
    const keys = Object.keys(items[0]).filter(k => k !== 'id' && k !== 'insight');
    return (
      <div>
        {data.insight && (
          <div className="insight-box" style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
            <strong>💡 Insight:</strong> {data.insight}
          </div>
        )}
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {keys.map(key => (
                <th key={key} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                {keys.map(key => (
                  <td key={key} style={{ padding: '12px' }}>
                    {typeof item[key] === 'number' ? item[key].toFixed(2) : item[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderData = () => {
    if (!data) return null;

    switch (dataType) {
      case 'asian-markets':
        return renderAsianMarkets();
      case 'european-markets':
        return renderEuropeanMarkets();
      case 'semiconductor-leaders':
        return renderSemiconductorLeaders();
      case 'market-sessions':
        return renderMarketSessions();
      case 'cross-market-correlation':
        return renderCrossMarketCorrelation();
      case 'emerging-markets':
        return renderAsianMarkets(); // Similar format
      case 'international-etfs':
        return renderGenericTable(data.etfs, 'International ETFs');
      case 'international-quote':
        return renderGenericTable(data.quotes, 'International Quotes');
      case 'currency-pairs':
        return renderGenericTable(data.rates, 'Currency Pairs');
      default:
        return <pre style={{ background: '#f9fafb', padding: '15px', borderRadius: '6px', overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🌏 Global Markets Dashboard</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Monitor international markets, semiconductor supply chain, and cross-market correlations.
        Asian markets (Korea, Taiwan) provide early signals for US tech sector.
      </p>

      <div style={{ marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Data Type:
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
          >
            {dataTypes.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        {dataType === 'international-quote' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Symbols (comma-separated, use exchange suffixes: .TW, .KS, .T, .HK, .L):
            </label>
            <input
              type="text"
              value={customSymbols}
              onChange={(e) => setCustomSymbols(e.target.value)}
              placeholder="2330.TW,005930.KS,TSM"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
              Examples: 2330.TW (TSMC Taiwan), 005930.KS (Samsung Korea), 6758.T (Sony Japan), 0700.HK (Tencent HK)
            </div>
          </div>
        )}

        {dataType === 'currency-pairs' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Currency Pairs (comma-separated, format: XXXYYY=X):
            </label>
            <input
              type="text"
              value={currencyPairs}
              onChange={(e) => setCurrencyPairs(e.target.value)}
              placeholder="EURUSD=X,GBPUSD=X,USDJPY=X"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 20px',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
          {data && (
            <>
              <button
                onClick={() => exportData('json')}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Export JSON
              </button>
              <button
                onClick={() => exportData('csv')}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading global market data...
        </div>
      )}

      {data && !loading && (
        <div style={{ marginTop: '20px' }}>
          {renderData()}
        </div>
      )}
    </div>
  );
}

export default GlobalMarketsTab;
