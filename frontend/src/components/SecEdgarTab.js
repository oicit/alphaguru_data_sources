import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function SecEdgarTab() {
  const [ticker, setTicker] = useState('AAPL');
  const [filingType, setFilingType] = useState('10-K');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filings, setFilings] = useState(null);

  const filingTypes = ['10-K', '10-Q', '8-K', 'DEF 14A', 'S-1', '13F-HR', 'SC 13G', 'All'];

  const fetchFilings = async () => {
    setLoading(true);
    setError(null);
    setFilings(null);

    try {
      const response = await axios.post('/api/sec-edgar/filings', {
        ticker,
        filingType: filingType === 'All' ? '' : filingType,
        limit: parseInt(limit)
      });

      setFilings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (filings && filings.filings) {
      exportToJSON(filings.filings, `${ticker}_${filingType}_filings.json`);
    }
  };

  const handleExportCSV = () => {
    if (filings && filings.filings) {
      const csvData = filings.filings.map(filing => ({
        title: filing.title,
        filingType: filing.filingType,
        filingDate: filing.filingDate,
        accessionNumber: filing.accessionNumber,
        link: filing.link
      }));
      exportToCSV(csvData, `${ticker}_${filingType}_filings.csv`);
    }
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>📊 SEC EDGAR Filings</h2>
        <p>Search and retrieve company filings from the SEC EDGAR database</p>
      </div>

      <div className="demo-section">
        <h3>Search Company Filings</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Stock Ticker Symbol</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
            />
          </div>

          <div className="form-group">
            <label>Filing Type</label>
            <select value={filingType} onChange={(e) => setFilingType(e.target.value)}>
              {filingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Number of Results</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="button-group">
          <button onClick={fetchFilings} disabled={loading || !ticker}>
            {loading ? 'Fetching...' : 'Fetch Filings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching SEC EDGAR filings</div>}

      {filings && filings.filings && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Results: {filings.count} filings found</h3>
            <div className="button-group">
              <button onClick={handleExportJSON} className="export-button">
                Export JSON
              </button>
              <button onClick={handleExportCSV} className="export-button">
                Export CSV
              </button>
            </div>
          </div>

          {filings.filings.map((filing, index) => (
            <div key={index} className="result-card">
              <h4>{filing.title}</h4>
              <p><strong>Filing Type:</strong> {filing.filingType}</p>
              <p><strong>Filing Date:</strong> {filing.filingDate}</p>
              <p><strong>Accession Number:</strong> {filing.accessionNumber}</p>
              {filing.link && (
                <p>
                  <a href={filing.link} target="_blank" rel="noopener noreferrer">
                    View on SEC.gov →
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>📚 About SEC EDGAR</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          The SEC's EDGAR database provides free public access to corporate information, including:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>10-K:</strong> Annual reports with comprehensive company information</li>
          <li><strong>10-Q:</strong> Quarterly reports</li>
          <li><strong>8-K:</strong> Current reports (material events)</li>
          <li><strong>DEF 14A:</strong> Proxy statements</li>
          <li><strong>S-1:</strong> Registration statements for new securities</li>
          <li><strong>13F:</strong> Institutional investment manager holdings</li>
        </ul>
      </div>
    </div>
  );
}

export default SecEdgarTab;
