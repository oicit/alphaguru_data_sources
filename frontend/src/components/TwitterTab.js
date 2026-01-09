import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function TwitterTab() {
  const [apiKey, setApiKey] = useState('');
  const [dataType, setDataType] = useState('search_cashtags');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Parameters
  const [ticker, setTicker] = useState('');
  const [cashtag, setCashtag] = useState('');
  const [username, setUsername] = useState('');
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [limit, setLimit] = useState('50');

  const dataTypes = [
    { value: 'search_cashtags', label: 'Search Cashtags' },
    { value: 'ticker_sentiment', label: 'Ticker Sentiment' },
    { value: 'influencer_tweets', label: 'Influencer Tweets' },
    { value: 'trending_finance', label: 'Trending Finance Topics' },
    { value: 'tweet_volume', label: 'Tweet Volume Analysis' }
  ];

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('twitter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('twitter_api_key', newKey);
  };

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your Twitter API Bearer Token');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = { apiKey };

      switch (dataType) {
        case 'search_cashtags':
          if (!cashtag) {
            setError('Please enter a cashtag');
            setLoading(false);
            return;
          }
          endpoint = '/api/twitter/search-cashtags';
          requestData = {
            ...requestData,
            cashtag: cashtag.startsWith('$') ? cashtag : `$${cashtag}`,
            limit: parseInt(limit),
            startDate: fromDate,
            endDate: toDate
          };
          break;

        case 'ticker_sentiment':
          if (!ticker) {
            setError('Please enter a ticker symbol');
            setLoading(false);
            return;
          }
          endpoint = '/api/twitter/ticker-sentiment';
          requestData = {
            ...requestData,
            ticker: ticker.toUpperCase(),
            startDate: fromDate,
            endDate: toDate
          };
          break;

        case 'influencer_tweets':
          if (!username) {
            setError('Please enter an influencer username');
            setLoading(false);
            return;
          }
          endpoint = '/api/twitter/influencer-tweets';
          requestData = {
            ...requestData,
            username: username.replace('@', ''),
            limit: parseInt(limit)
          };
          break;

        case 'trending_finance':
          endpoint = '/api/twitter/trending-finance';
          requestData = {
            ...requestData,
            limit: parseInt(limit)
          };
          break;

        case 'tweet_volume':
          if (!ticker) {
            setError('Please enter a ticker symbol');
            setLoading(false);
            return;
          }
          endpoint = '/api/twitter/tweet-volume';
          requestData = {
            ...requestData,
            ticker: ticker.toUpperCase(),
            startDate: fromDate,
            endDate: toDate
          };
          break;

        default:
          endpoint = '/api/twitter/search-cashtags';
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
      exportToJSON(data, `twitter_${dataType}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (data && data.data) {
      let csvData = [];
      if (Array.isArray(data.data)) {
        csvData = data.data;
      } else if (data.data.tweets && Array.isArray(data.data.tweets)) {
        csvData = data.data.tweets;
      }
      if (csvData.length > 0) {
        exportToCSV(csvData, `twitter_${dataType}_${Date.now()}.csv`);
      }
    }
  };

  const renderConditionalFields = () => {
    switch (dataType) {
      case 'search_cashtags':
        return (
          <>
            <div className="form-group">
              <label>Cashtag</label>
              <input
                type="text"
                value={cashtag}
                onChange={(e) => setCashtag(e.target.value.toUpperCase())}
                placeholder="e.g., $AAPL, $TSLA"
              />
            </div>
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
            <div className="form-group">
              <label>Limit</label>
              <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </>
        );

      case 'ticker_sentiment':
      case 'tweet_volume':
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
          </>
        );

      case 'influencer_tweets':
        return (
          <>
            <div className="form-group">
              <label>Influencer Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                placeholder="e.g., elonmusk, chamath"
              />
              <small style={{ color: '#718096', fontSize: '0.85rem' }}>
                Popular finance influencers: elonmusk, chamath, jimcramer, cathiedwood
              </small>
            </div>
            <div className="form-group">
              <label>Limit</label>
              <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </>
        );

      case 'trending_finance':
        return (
          <div className="form-group">
            <label>Limit</label>
            <select value={limit} onChange={(e) => setLimit(e.target.value)}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (dataType) {
      case 'search_cashtags':
      case 'influencer_tweets':
        if (!result.tweets || result.tweets.length === 0) {
          return <p>No tweets found</p>;
        }
        return result.tweets.map((tweet, index) => (
          <div key={index} className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>@{tweet.author || tweet.username}</p>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{tweet.text}</p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: '#718096'
            }}>
              <span>💬 {tweet.reply_count || tweet.replies || 0} replies</span>
              <span>🔄 {tweet.retweet_count || tweet.retweets || 0} retweets</span>
              <span>❤️ {tweet.like_count || tweet.likes || 0} likes</span>
              <span>📊 {tweet.impression_count || tweet.views || 'N/A'} views</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
              {new Date(tweet.created_at).toLocaleString()}
            </p>
            {tweet.sentiment && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: tweet.sentiment === 'positive' ? '#d4edda' :
                               tweet.sentiment === 'negative' ? '#f8d7da' : '#e2e8f0',
                color: tweet.sentiment === 'positive' ? '#155724' :
                       tweet.sentiment === 'negative' ? '#721c24' : '#4a5568',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '0.85rem'
              }}>
                Sentiment: {tweet.sentiment}
              </div>
            )}
          </div>
        ));

      case 'ticker_sentiment':
        return (
          <div className="result-card">
            <h4>Sentiment Analysis for ${ticker}</h4>
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
                  <td><strong>Sentiment Score:</strong></td>
                  <td>{result.score?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Total Tweets:</strong></td>
                  <td>{result.tweet_count || 0}</td>
                </tr>
                <tr>
                  <td><strong>Positive Tweets:</strong></td>
                  <td style={{ color: 'green' }}>{result.positive || 0}</td>
                </tr>
                <tr>
                  <td><strong>Negative Tweets:</strong></td>
                  <td style={{ color: 'red' }}>{result.negative || 0}</td>
                </tr>
                <tr>
                  <td><strong>Neutral Tweets:</strong></td>
                  <td>{result.neutral || 0}</td>
                </tr>
                <tr>
                  <td><strong>Total Engagement:</strong></td>
                  <td>{result.total_engagement?.toLocaleString() || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            {result.sentiment_chart && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5>Sentiment Over Time</h5>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  height: '100px',
                  alignItems: 'flex-end'
                }}>
                  {result.sentiment_chart.map((point, idx) => (
                    <div key={idx} style={{
                      flex: 1,
                      backgroundColor: point.value > 0 ? '#48bb78' : '#f56565',
                      height: `${Math.abs(point.value * 100)}%`,
                      minHeight: '5px'
                    }} title={`${point.date}: ${point.value.toFixed(2)}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'trending_finance':
        if (!Array.isArray(result) || result.length === 0) {
          return <p>No trending topics found</p>;
        }
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Topic / Hashtag</th>
                <th>Tweet Count</th>
                <th>Trend Score</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{item.topic || item.hashtag}</strong></td>
                  <td>{item.tweet_count?.toLocaleString() || 'N/A'}</td>
                  <td>{item.score || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'tweet_volume':
        return (
          <div className="result-card">
            <h4>Tweet Volume Analysis for ${ticker}</h4>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Total Tweets:</strong></td>
                  <td>{result.total_tweets?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Average Daily Volume:</strong></td>
                  <td>{result.avg_daily_volume?.toFixed(0) || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Peak Volume:</strong></td>
                  <td>{result.peak_volume?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Peak Date:</strong></td>
                  <td>{result.peak_date ? new Date(result.peak_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Volume Trend:</strong></td>
                  <td style={{
                    color: result.trend === 'increasing' ? 'green' :
                           result.trend === 'decreasing' ? 'red' : '#718096'
                  }}>
                    {result.trend || 'stable'}
                  </td>
                </tr>
              </tbody>
            </table>

            {result.daily_volumes && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5>Daily Tweet Volume</h5>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  marginTop: '1rem',
                  height: '120px',
                  alignItems: 'flex-end',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '0.5rem 0'
                }}>
                  {result.daily_volumes.map((day, idx) => {
                    const maxVol = Math.max(...result.daily_volumes.map(d => d.volume));
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%',
                          backgroundColor: '#667eea',
                          height: `${(day.volume / maxVol) * 100}%`,
                          minHeight: '2px'
                        }} title={`${day.date}: ${day.volume} tweets`} />
                        <span style={{ fontSize: '0.7rem', color: '#718096', marginTop: '0.25rem' }}>
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
        <h2>X.com / Twitter Alternative Data</h2>
        <p>Track market sentiment, trending topics, and influencer activity on Twitter</p>
      </div>

      <div className="api-key-note">
        <strong>API Key Required:</strong> Get your Twitter API Bearer Token at{' '}
        <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer">
          developer.twitter.com
        </a>
        {' '}(requires Twitter Developer Account)
      </div>

      <div className="demo-section">
        <h3>API Configuration</h3>
        <div className="form-group">
          <label>Twitter API Bearer Token</label>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Twitter API Bearer Token"
          />
          <small style={{ color: '#718096', fontSize: '0.85rem' }}>
            Your API key is stored locally in your browser
          </small>
        </div>
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
          <button onClick={fetchData} disabled={loading || !apiKey}>
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching data from Twitter</div>}

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
        <h3>About Twitter Data</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Twitter (X.com) is a rich source of real-time market sentiment and breaking financial news.
          This interface provides access to:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Cashtag Search:</strong> Search tweets mentioning specific stock symbols ($AAPL, $TSLA, etc.)</li>
          <li><strong>Ticker Sentiment:</strong> Analyze overall sentiment and engagement for any ticker</li>
          <li><strong>Influencer Tweets:</strong> Track tweets from market influencers and thought leaders</li>
          <li><strong>Trending Finance:</strong> Discover trending financial topics and hashtags</li>
          <li><strong>Tweet Volume:</strong> Track tweet volume trends to identify unusual activity</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>API Tiers:</strong> Twitter offers several API tiers. Free tier has limited requests.
          For production use, consider the Basic ($100/mo) or Pro ($5,000/mo) plans. Visit{' '}
          <a href="https://developer.twitter.com/en/products/twitter-api" target="_blank" rel="noopener noreferrer">
            Twitter API pricing
          </a>
        </p>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '0.5rem' }}>
          <strong>Note:</strong> Sentiment analysis is performed using natural language processing and may not
          be 100% accurate. Use as one signal among many for investment decisions.
        </p>
      </div>
    </div>
  );
}

export default TwitterTab;
