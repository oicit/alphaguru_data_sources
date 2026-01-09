import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function YouTubeTab() {
  const [apiKey, setApiKey] = useState('');
  const [dataType, setDataType] = useState('search_videos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [ticker, setTicker] = useState('');
  const [limit, setLimit] = useState('25');

  const dataTypes = [
    { value: 'search_videos', label: 'Search Finance Videos' },
    { value: 'video_transcript', label: 'Video Transcript' },
    { value: 'channel_latest', label: 'Channel Latest Videos' },
    { value: 'earnings_calls', label: 'Earnings Call Videos' },
    { value: 'video_stats', label: 'Video Statistics' }
  ];

  // Popular finance channels
  const popularChannels = [
    { id: 'UCvJJ_dzjViJCoLf5uKUTwoA', name: 'CNBC Television' },
    { id: 'UCrp_UI8XtuYfpiqluWLD7Lw', name: 'Yahoo Finance' },
    { id: 'UCCezIgC97PvUuR4_gbFUs5g', name: 'Bloomberg Markets and Finance' },
    { id: 'UC5vdZTUe7KfY1SQ3M5M0sKw', name: 'Financial Education' },
    { id: 'UCW0pP60TqL-VokKnD9qyb-A', name: 'Graham Stephan' },
    { id: 'UCh2dOx_dHPOGkSh9V5moXwg', name: 'Cathie Wood - ARK Invest' }
  ];

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('youtube_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('youtube_api_key', newKey);
  };

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your YouTube API Key');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = { apiKey };

      switch (dataType) {
        case 'search_videos':
          if (!searchQuery) {
            setError('Please enter a search query');
            setLoading(false);
            return;
          }
          endpoint = '/api/youtube/search';
          requestData = {
            ...requestData,
            query: searchQuery,
            limit: parseInt(limit)
          };
          break;

        case 'video_transcript':
          const vidId = extractVideoId(videoUrl || videoId);
          if (!vidId) {
            setError('Please enter a valid video URL or ID');
            setLoading(false);
            return;
          }
          endpoint = '/api/youtube/transcript';
          requestData = {
            ...requestData,
            videoId: vidId
          };
          break;

        case 'channel_latest':
          if (!channelId) {
            setError('Please select or enter a channel ID');
            setLoading(false);
            return;
          }
          endpoint = '/api/youtube/channel-videos';
          requestData = {
            ...requestData,
            channelId,
            limit: parseInt(limit)
          };
          break;

        case 'earnings_calls':
          if (!ticker) {
            setError('Please enter a ticker symbol');
            setLoading(false);
            return;
          }
          endpoint = '/api/youtube/earnings-calls';
          requestData = {
            ...requestData,
            ticker: ticker.toUpperCase(),
            limit: parseInt(limit)
          };
          break;

        case 'video_stats':
          const statsVidId = extractVideoId(videoUrl || videoId);
          if (!statsVidId) {
            setError('Please enter a valid video URL or ID');
            setLoading(false);
            return;
          }
          endpoint = '/api/youtube/video-stats';
          requestData = {
            ...requestData,
            videoId: statsVidId
          };
          break;

        default:
          endpoint = '/api/youtube/search';
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
      exportToJSON(data, `youtube_${dataType}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (data && data.data) {
      let csvData = [];
      if (Array.isArray(data.data)) {
        csvData = data.data;
      } else if (data.data.videos && Array.isArray(data.data.videos)) {
        csvData = data.data.videos;
      }
      if (csvData.length > 0) {
        exportToCSV(csvData, `youtube_${dataType}_${Date.now()}.csv`);
      }
    }
  };

  const renderConditionalFields = () => {
    switch (dataType) {
      case 'search_videos':
        return (
          <>
            <div className="form-group">
              <label>Search Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., stock market analysis, earnings call Q4 2024"
              />
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

      case 'video_transcript':
      case 'video_stats':
        return (
          <div className="form-group">
            <label>Video URL or ID</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., https://youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
            />
            <small style={{ color: '#718096', fontSize: '0.85rem' }}>
              Enter a YouTube URL or just the video ID
            </small>
          </div>
        );

      case 'channel_latest':
        return (
          <>
            <div className="form-group">
              <label>Select Popular Channel</label>
              <select value={channelId} onChange={(e) => setChannelId(e.target.value)}>
                <option value="">-- Select a channel --</option>
                {popularChannels.map(channel => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Or Enter Channel ID</label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="Channel ID (starts with UC...)"
              />
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

      case 'earnings_calls':
        return (
          <>
            <div className="form-group">
              <label>Ticker Symbol</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, TSLA, MSFT"
              />
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

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (dataType) {
      case 'search_videos':
      case 'channel_latest':
      case 'earnings_calls':
        if (!result.videos || result.videos.length === 0) {
          return <p>No videos found</p>;
        }
        return result.videos.map((video, index) => (
          <div key={index} className="result-card">
            <div style={{ display: 'flex', gap: '1rem' }}>
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{
                    width: '200px',
                    height: '112px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{video.title}</h4>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {video.channelTitle || video.channel}
                </p>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {video.description ? video.description.substring(0, 200) + '...' : 'No description'}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#718096'
                }}>
                  <span>👁️ {video.viewCount?.toLocaleString() || 'N/A'} views</span>
                  <span>👍 {video.likeCount?.toLocaleString() || 'N/A'} likes</span>
                  <span>💬 {video.commentCount?.toLocaleString() || 'N/A'} comments</span>
                  <span>📅 {new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
                <a
                  href={`https://youtube.com/watch?v=${video.videoId || video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '0.5rem' }}
                >
                  Watch on YouTube →
                </a>
              </div>
            </div>
          </div>
        ));

      case 'video_transcript':
        if (!result.transcript || result.transcript.length === 0) {
          return <p>No transcript available for this video</p>;
        }
        return (
          <div className="result-card">
            <h4>Video Transcript</h4>
            {result.videoInfo && (
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 500 }}>{result.videoInfo.title}</p>
                <p style={{ fontSize: '0.9rem', color: '#718096' }}>
                  {result.videoInfo.channel} | {new Date(result.videoInfo.publishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            <div style={{
              backgroundColor: '#f7fafc',
              padding: '1rem',
              borderRadius: '4px',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              {Array.isArray(result.transcript) ? (
                result.transcript.map((segment, idx) => (
                  <p key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>
                    {segment.timestamp && (
                      <span style={{ color: '#667eea', fontWeight: 500, marginRight: '0.5rem' }}>
                        [{segment.timestamp}]
                      </span>
                    )}
                    {segment.text}
                  </p>
                ))
              ) : (
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{result.transcript}</p>
              )}
            </div>
          </div>
        );

      case 'video_stats':
        return (
          <div className="result-card">
            <h4>Video Statistics</h4>
            {result.snippet && (
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{result.snippet.title}</p>
                <p style={{ color: '#718096' }}>{result.snippet.channelTitle}</p>
              </div>
            )}
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Views:</strong></td>
                  <td>{result.statistics?.viewCount?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Likes:</strong></td>
                  <td>{result.statistics?.likeCount?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Comments:</strong></td>
                  <td>{result.statistics?.commentCount?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Duration:</strong></td>
                  <td>{result.contentDetails?.duration || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Published:</strong></td>
                  <td>{result.snippet?.publishedAt ? new Date(result.snippet.publishedAt).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Category:</strong></td>
                  <td>{result.snippet?.categoryId || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Engagement Rate:</strong></td>
                  <td>
                    {result.statistics?.viewCount && result.statistics?.likeCount
                      ? ((result.statistics.likeCount / result.statistics.viewCount) * 100).toFixed(2) + '%'
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
            {result.snippet?.tags && result.snippet.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Tags:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {result.snippet.tags.map((tag, idx) => (
                    <span key={idx} style={{
                      backgroundColor: '#edf2f7',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.snippet?.description && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem', color: '#718096', lineHeight: '1.6' }}>
                  {result.snippet.description}
                </p>
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
        <h2>YouTube & Podcast Alternative Data</h2>
        <p>Extract insights from finance videos, earnings calls, and analyst commentary</p>
      </div>

      <div className="api-key-note">
        <strong>API Key Required:</strong> Get your free YouTube Data API key at{' '}
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
          Google Cloud Console
        </a>
        {' '}(requires Google account)
      </div>

      <div className="demo-section">
        <h3>API Configuration</h3>
        <div className="form-group">
          <label>YouTube Data API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your YouTube API key"
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

      {loading && <div className="loading">Fetching data from YouTube</div>}

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
        <h3>About YouTube Data</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          YouTube hosts a wealth of financial content including earnings calls, analyst commentary,
          market updates, and educational content. This interface provides:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Search Finance Videos:</strong> Find relevant videos by keyword search</li>
          <li><strong>Video Transcripts:</strong> Extract and analyze video transcripts for sentiment and insights</li>
          <li><strong>Channel Latest:</strong> Track updates from key financial channels and influencers</li>
          <li><strong>Earnings Calls:</strong> Find and analyze earnings call recordings</li>
          <li><strong>Video Statistics:</strong> Get engagement metrics for any video</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>API Quota:</strong> YouTube Data API v3 has a daily quota limit of 10,000 units per day
          for the free tier. Each search costs ~100 units, video details ~1 unit. Monitor your usage at{' '}
          <a href="https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas" target="_blank" rel="noopener noreferrer">
            Google Cloud Console
          </a>
        </p>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '0.5rem' }}>
          <strong>Note:</strong> Not all videos have transcripts available. Transcripts may be auto-generated
          or manually created, affecting accuracy.
        </p>
      </div>
    </div>
  );
}

export default YouTubeTab;
