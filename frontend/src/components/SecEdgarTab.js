import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function SecEdgarTab() {
  const [ticker, setTicker] = useState('AAPL');
  const [filingType, setFilingType] = useState('10-K');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
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

  const downloadFiles = async () => {
    if (!filings || !filings.filings || filings.filings.length === 0) {
      return;
    }

    setDownloading(true);
    setDownloadProgress('Preparing to download files...');
    setError(null);

    try {
      setDownloadProgress(`Downloading ${filings.filings.length} files from SEC EDGAR...`);

      const response = await axios.post('/api/sec-edgar/download-filings', {
        filings: filings.filings
      }, {
        timeout: 60000 * 5 // 5 minutes timeout for bulk downloads
      });

      if (response.data.success) {
        const downloadedFilings = response.data.filings.filter(f => f.success);

        setDownloadProgress(`Downloaded ${downloadedFilings.length} files. Saving to your computer...`);

        // Download each file to user's computer
        for (let i = 0; i < downloadedFilings.length; i++) {
          const filing = downloadedFilings[i];

          // Create a blob from the content
          const blob = new Blob([filing.content], { type: 'text/html' });
          const url = URL.createObjectURL(blob);

          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download = filing.filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Small delay between downloads to prevent browser blocking
          if (i < downloadedFilings.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        setDownloadProgress(`✅ Successfully downloaded ${downloadedFilings.length} files!`);

        if (response.data.failed > 0) {
          setError(`Note: ${response.data.failed} file(s) failed to download. Check browser console for details.`);
        }

        // Clear progress message after 5 seconds
        setTimeout(() => {
          setDownloadProgress('');
        }, 5000);

      } else {
        setError('Failed to download files. Please try again.');
      }

    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to download files');
      setDownloadProgress('');
    } finally {
      setDownloading(false);
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
        <p>Search and download company filings from the SEC EDGAR database</p>
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
              max="20"
            />
            <small style={{ color: '#718096', fontSize: '0.85rem' }}>
              Max 20 files recommended for bulk download
            </small>
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

      {downloading && (
        <div className="loading" style={{ backgroundColor: '#e6f7ff', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <div style={{ fontSize: '1.1rem', color: '#0066cc', fontWeight: '500' }}>
            ⬇️ {downloadProgress}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>
            Please wait, this may take a few moments...
          </div>
        </div>
      )}

      {filings && filings.filings && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Results: {filings.count} filings found</h3>
            <div className="button-group">
              <button
                onClick={downloadFiles}
                disabled={downloading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {downloading ? 'Downloading...' : '⬇️ Download All Files'}
              </button>
              <button onClick={handleExportJSON} className="export-button">
                Export Metadata (JSON)
              </button>
              <button onClick={handleExportCSV} className="export-button">
                Export Metadata (CSV)
              </button>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #bae6fd'
          }}>
            <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.95rem' }}>
              <strong>💡 Tip:</strong> Click "Download All Files" to automatically download all {filings.count} filing document(s)
              to your Downloads folder. Files will be saved as HTML documents.
            </p>
          </div>

          {filings.filings.map((filing, index) => (
            <div key={index} className="result-card">
              <h4>{filing.title}</h4>
              <p><strong>Filing Type:</strong> {filing.filingType}</p>
              <p><strong>Filing Date:</strong> {filing.filingDate}</p>
              <p><strong>Accession Number:</strong> {filing.accessionNumber}</p>
              <p>
                <a href={filing.link} target="_blank" rel="noopener noreferrer">
                  View on SEC.gov →
                </a>
              </p>
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
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Rate Limits:</strong> SEC EDGAR allows maximum 10 requests per second.
          The download process automatically respects these limits.
        </p>
      </div>
    </div>
  );
}

export default SecEdgarTab;
