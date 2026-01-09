import React from 'react';

function OverviewTab() {
  const dataSources = [
    {
      name: 'SEC EDGAR',
      description: 'Company filings, 10-K, 10-Q, 8-K reports',
      icon: '📊',
      features: ['Regulatory filings', 'Insider transactions', 'Institutional holdings']
    },
    {
      name: 'Finnhub',
      description: 'Real-time market data, fundamentals, news',
      icon: '📈',
      features: ['Stock quotes', 'Company fundamentals', 'News & sentiment', 'Analyst ratings', 'Earnings calendar']
    },
    {
      name: 'Yahoo Finance',
      description: 'Stock quotes, historical data',
      icon: '💹',
      features: ['Real-time quotes', 'Historical prices', 'Symbol search']
    },
    {
      name: 'TrendRadar',
      description: 'Trending news from 11+ platforms',
      icon: '📰',
      features: ['Multi-platform trends', 'Hot topics', 'News aggregation']
    },
    {
      name: 'Alpha Vantage',
      description: 'Comprehensive stock data, fundamentals, and indicators',
      icon: '📊',
      features: ['Intraday & daily prices', 'Financial statements', 'Technical indicators', 'News & sentiment', 'Earnings & IPO calendars']
    },
    {
      name: 'FMP (Financial Modeling Prep)',
      description: 'Professional-grade financial data (⚠️ Paid subscription required for most features)',
      icon: '💼',
      features: ['Financial statements', 'DCF valuations', 'Insider & senate trading', 'Market calendars', 'Note: Free tier very limited as of 2025']
    }
  ];

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Welcome to AlphaGuru Data Sources Dashboard</h2>
        <p>
          Explore and interact with multiple financial data sources in one place.
          Each tab provides real, working demos with editable parameters.
        </p>
      </div>

      <div className="demo-section">
        <h3>🚀 Quick Start</h3>
        <ol style={{ lineHeight: '1.8', color: '#4a5568' }}>
          <li>Navigate to any data source tab above</li>
          <li>Enter parameters (stock symbols, date ranges, etc.)</li>
          <li>Some sources require API keys (stored locally in your browser)</li>
          <li>Click "Fetch Data" to see real results</li>
          <li>Export data as JSON or CSV for further analysis</li>
        </ol>
      </div>

      <div className="feature-grid">
        {dataSources.map((source, index) => (
          <div key={index} className="feature-card">
            <h3>
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>
                {source.icon}
              </span>
              {source.name}
            </h3>
            <p style={{ marginBottom: '1rem' }}>{source.description}</p>
            <ul style={{ color: '#718096', lineHeight: '1.6' }}>
              {source.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>📖 Documentation</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          For detailed information about each data source, setup instructions, and API documentation,
          see <code>DATA_SOURCES_SUMMARY.md</code> in the project root directory.
        </p>
      </div>

      <div className="api-key-note" style={{ marginTop: '1rem' }}>
        <strong>Note:</strong> API keys are stored locally in your browser's localStorage.
        They are never sent to any server except the official API providers.
      </div>
    </div>
  );
}

export default OverviewTab;
