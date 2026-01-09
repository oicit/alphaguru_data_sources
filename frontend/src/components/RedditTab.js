import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function RedditTab() {
  const [dataType, setDataType] = useState('trending_tickers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Parameters
  const [subreddit, setSubreddit] = useState('wallstreetbets');
  const [ticker, setTicker] = useState('');
  const [postId, setPostId] = useState('');
  const [limit, setLimit] = useState('25');

  const dataTypes = [
    { value: 'trending_tickers', label: 'Trending Tickers (WSB)' },
    { value: 'subreddit_posts', label: 'Subreddit Posts' },
    { value: 'ticker_sentiment', label: 'Ticker Sentiment' },
    { value: 'dd_posts', label: 'DD Posts (Due Diligence)' },
    { value: 'comment_analysis', label: 'Comment Analysis' }
  ];

  const subreddits = [
    'wallstreetbets',
    'stocks',
    'investing',
    'StockMarket',
    'options',
    'pennystocks',
    'Daytrading',
    'SecurityAnalysis'
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = {};

      switch (dataType) {
        case 'trending_tickers':
          endpoint = '/api/reddit/trending-tickers';
          requestData = { subreddit, limit: parseInt(limit) };
          break;
        case 'subreddit_posts':
          endpoint = '/api/reddit/subreddit-posts';
          requestData = { subreddit, limit: parseInt(limit) };
          break;
        case 'ticker_sentiment':
          if (!ticker) {
            setError('Please enter a ticker symbol');
            setLoading(false);
            return;
          }
          endpoint = '/api/reddit/ticker-sentiment';
          requestData = { ticker: ticker.toUpperCase(), subreddit };
          break;
        case 'dd_posts':
          endpoint = '/api/reddit/dd-posts';
          requestData = { subreddit, limit: parseInt(limit) };
          break;
        case 'comment_analysis':
          if (!postId) {
            setError('Please enter a post ID');
            setLoading(false);
            return;
          }
          endpoint = '/api/reddit/comment-analysis';
          requestData = { postId, subreddit };
          break;
        default:
          endpoint = '/api/reddit/trending-tickers';
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
      exportToJSON(data, `reddit_${dataType}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (data && data.data) {
      let csvData = [];
      if (Array.isArray(data.data)) {
        csvData = data.data;
      } else if (data.data.posts && Array.isArray(data.data.posts)) {
        csvData = data.data.posts;
      }
      if (csvData.length > 0) {
        exportToCSV(csvData, `reddit_${dataType}_${Date.now()}.csv`);
      }
    }
  };

  const renderConditionalFields = () => {
    switch (dataType) {
      case 'trending_tickers':
      case 'subreddit_posts':
      case 'dd_posts':
        return (
          <>
            <div className="form-group">
              <label>Subreddit</label>
              <select value={subreddit} onChange={(e) => setSubreddit(e.target.value)}>
                {subreddits.map(sr => (
                  <option key={sr} value={sr}>r/{sr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Limit</label>
              <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </>
        );

      case 'ticker_sentiment':
        return (
          <>
            <div className="form-group">
              <label>Ticker Symbol</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, TSLA"
              />
            </div>
            <div className="form-group">
              <label>Subreddit</label>
              <select value={subreddit} onChange={(e) => setSubreddit(e.target.value)}>
                {subreddits.map(sr => (
                  <option key={sr} value={sr}>r/{sr}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'comment_analysis':
        return (
          <>
            <div className="form-group">
              <label>Post ID</label>
              <input
                type="text"
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
                placeholder="Reddit post ID (e.g., abc123)"
              />
              <small style={{ color: '#718096', fontSize: '0.85rem' }}>
                Find the post ID in the URL: reddit.com/r/subreddit/comments/POST_ID/...
              </small>
            </div>
            <div className="form-group">
              <label>Subreddit</label>
              <select value={subreddit} onChange={(e) => setSubreddit(e.target.value)}>
                {subreddits.map(sr => (
                  <option key={sr} value={sr}>r/{sr}</option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (dataType) {
      case 'trending_tickers':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No trending tickers found</p>;
        }
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ticker</th>
                <th>Mentions</th>
                <th>Sentiment</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{item.ticker || item.symbol}</strong></td>
                  <td>{item.mentions || item.count}</td>
                  <td style={{
                    color: item.sentiment === 'positive' ? 'green' :
                           item.sentiment === 'negative' ? 'red' : '#718096'
                  }}>
                    {item.sentiment || 'neutral'}
                  </td>
                  <td>{item.score || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'subreddit_posts':
      case 'dd_posts':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No posts found</p>;
        }
        return result.map((post, index) => (
          <div key={index} className="result-card">
            <h4>{post.title}</h4>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>
              by u/{post.author} | {post.score || 0} upvotes | {post.num_comments || 0} comments
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
              {post.selftext ? post.selftext.substring(0, 300) + '...' : 'No text content'}
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span>Created: {new Date((post.created_utc || post.created) * 1000).toLocaleString()}</span>
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer">View on Reddit →</a>
              )}
            </div>
          </div>
        ));

      case 'ticker_sentiment':
        return (
          <div className="result-card">
            <h4>Sentiment Analysis for {ticker}</h4>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Overall Sentiment:</strong></td>
                  <td style={{
                    color: result.sentiment === 'positive' ? 'green' :
                           result.sentiment === 'negative' ? 'red' : '#718096'
                  }}>
                    {result.sentiment || 'neutral'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Total Mentions:</strong></td>
                  <td>{result.mentions || result.count || 0}</td>
                </tr>
                <tr>
                  <td><strong>Positive Mentions:</strong></td>
                  <td style={{ color: 'green' }}>{result.positive || 0}</td>
                </tr>
                <tr>
                  <td><strong>Negative Mentions:</strong></td>
                  <td style={{ color: 'red' }}>{result.negative || 0}</td>
                </tr>
                <tr>
                  <td><strong>Neutral Mentions:</strong></td>
                  <td>{result.neutral || 0}</td>
                </tr>
                <tr>
                  <td><strong>Sentiment Score:</strong></td>
                  <td>{result.score?.toFixed(2) || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
            {result.recent_posts && result.recent_posts.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5>Recent Mentions:</h5>
                {result.recent_posts.map((post, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    backgroundColor: '#f7fafc',
                    borderRadius: '4px',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ fontWeight: 500 }}>{post.title}</p>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>
                      {post.score} upvotes | {new Date(post.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'comment_analysis':
        return (
          <div className="result-card">
            <h4>Comment Analysis</h4>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Total Comments:</strong></td>
                  <td>{result.total_comments || 0}</td>
                </tr>
                <tr>
                  <td><strong>Average Sentiment:</strong></td>
                  <td>{result.avg_sentiment?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Positive Comments:</strong></td>
                  <td style={{ color: 'green' }}>{result.positive_count || 0}</td>
                </tr>
                <tr>
                  <td><strong>Negative Comments:</strong></td>
                  <td style={{ color: 'red' }}>{result.negative_count || 0}</td>
                </tr>
              </tbody>
            </table>
            {result.top_comments && result.top_comments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5>Top Comments:</h5>
                {result.top_comments.map((comment, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    backgroundColor: '#f7fafc',
                    borderRadius: '4px',
                    marginTop: '0.5rem'
                  }}>
                    <p>{comment.body}</p>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>
                      by u/{comment.author} | {comment.score} points
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Reddit Alternative Data</h2>
        <p>Track trending stocks, sentiment, and discussions from Reddit communities</p>
      </div>

      <div className="api-key-note">
        <strong>No API Key Required:</strong> This data source uses Reddit's public API.
        Please note that rate limits apply (60 requests per minute).
      </div>

      <div className="demo-section">
        <h3>Select Data Type</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Data Type</label>
            <select value={dataType} onChange={(e) => {
              setDataType(e.target.value);
              setData(null);
              setError(null);
            }}>
              {dataTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>Configure Parameters</h3>
        <div className="form-row">
          {renderConditionalFields()}
        </div>
        <div className="button-group">
          <button onClick={fetchData} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching data from Reddit</div>}

      {data && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Results</h3>
            <div className="button-group" style={{ marginTop: 0 }}>
              <button onClick={handleExportJSON} className="export-button">
                Export JSON
              </button>
              <button onClick={handleExportCSV} className="export-button">
                Export CSV
              </button>
            </div>
          </div>
          {renderResults()}
        </div>
      )}

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>About Reddit Data</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Reddit communities like r/wallstreetbets, r/stocks, and r/investing provide valuable alternative
          data for market sentiment analysis. This interface allows you to:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Trending Tickers:</strong> Discover the most mentioned stocks in real-time</li>
          <li><strong>Subreddit Posts:</strong> Browse recent posts from financial communities</li>
          <li><strong>Ticker Sentiment:</strong> Analyze sentiment for specific stocks across discussions</li>
          <li><strong>DD Posts:</strong> Find detailed Due Diligence research posts</li>
          <li><strong>Comment Analysis:</strong> Analyze sentiment and engagement in post comments</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Note:</strong> Reddit data is subject to API rate limits. For production use, consider
          implementing caching or using Reddit's official API with authentication for higher limits.
        </p>
      </div>
    </div>
  );
}

export default RedditTab;
