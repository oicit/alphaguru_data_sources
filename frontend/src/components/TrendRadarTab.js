import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON } from '../utils/exportUtils';

function TrendRadarTab() {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['toutiao', 'baidu', 'zhihu']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    // Fetch available platforms on mount
    axios.get('/api/trendradar/platforms')
      .then(response => {
        if (response.data.success) {
          setPlatforms(response.data.platforms);
        }
      })
      .catch(err => {
        console.error('Failed to load platforms:', err);
      });
  }, []);

  const fetchTrends = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setLoading(true);
    setError(null);
    setTrends(null);

    try {
      const response = await axios.post('/api/trendradar/multi-platform-trends', {
        platforms: selectedPlatforms
      });

      setTrends(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(p => p !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleExportJSON = () => {
    if (trends) {
      exportToJSON(trends, 'trendradar_trends.json');
    }
  };

  const renderTrendItem = (item, index) => {
    return (
      <div key={index} className="result-card">
        <h4>{item.title || item.name}</h4>
        {item.hot && <p><strong>🔥 热度:</strong> {item.hot}</p>}
        {item.desc && <p style={{color: '#718096'}}>{item.desc}</p>}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            阅读更多 →
          </a>
        )}
      </div>
    );
  };

  const renderPlatformResults = (platformResult) => {
    if (!platformResult.success) {
      return (
        <div className="error-message">
          <strong>Error loading {platformResult.platform}:</strong> {platformResult.error}
        </div>
      );
    }

    const data = platformResult.data;
    if (!data || !data.data || data.data.length === 0) {
      return <p>No trending data available for this platform</p>;
    }

    return (
      <div>
        {data.data.slice(0, 10).map((item, index) => renderTrendItem(item, index))}
      </div>
    );
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>📰 TrendRadar</h2>
        <p>Trending news and hot topics from 11+ Chinese platforms</p>
      </div>

      <div className="demo-section">
        <h3>Select Platforms</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {platforms.map(platform => (
            <label
              key={platform.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedPlatforms.includes(platform.id) ? '#edf2f7' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                style={{ marginRight: '0.5rem' }}
              />
              {platform.name}
            </label>
          ))}
        </div>

        <div className="button-group">
          <button onClick={fetchTrends} disabled={loading || selectedPlatforms.length === 0}>
            {loading ? 'Fetching...' : 'Fetch Trends'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching trends from {selectedPlatforms.length} platforms</div>}

      {trends && trends.results && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Trending Topics</h3>
            <button onClick={handleExportJSON} className="export-button">
              Export JSON
            </button>
          </div>

          {trends.results.map((platformResult, index) => {
            const platformInfo = platforms.find(p => p.id === platformResult.platform);
            return (
              <div key={index} style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: '#2d3748',
                  padding: '0.75rem',
                  backgroundColor: '#f7fafc',
                  borderLeft: '4px solid #667eea',
                  marginBottom: '1rem'
                }}>
                  {platformInfo ? platformInfo.name : platformResult.platform}
                </h3>
                {renderPlatformResults(platformResult)}
              </div>
            );
          })}
        </div>
      )}

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>📚 About TrendRadar</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          TrendRadar aggregates trending news and hot topics from major Chinese platforms including:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Social Media:</strong> Weibo (微博), Douyin (抖音), Zhihu (知乎)</li>
          <li><strong>News:</strong> Toutiao (今日头条), Baidu Hot Search (百度热搜)</li>
          <li><strong>Financial:</strong> Wall Street Journal CN (华尔街见闻), Cailian (财联社)</li>
          <li><strong>Video:</strong> Bilibili, Kuaishou</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          Data is sourced from the <a href="https://github.com/ourongxing/newsnow" target="_blank" rel="noopener noreferrer">newsnow</a> project.
        </p>
      </div>
    </div>
  );
}

export default TrendRadarTab;
