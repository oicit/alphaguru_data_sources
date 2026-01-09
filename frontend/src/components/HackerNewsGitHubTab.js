import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function HackerNewsGitHubTab() {
  const [activeSection, setActiveSection] = useState('hackernews');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Hacker News state
  const [hnDataType, setHnDataType] = useState('top_stories');
  const [hnSearchQuery, setHnSearchQuery] = useState('');
  const [hnLimit, setHnLimit] = useState('30');

  // GitHub state
  const [ghDataType, setGhDataType] = useState('repo_stats');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [company, setCompany] = useState('');
  const [language, setLanguage] = useState('');
  const [timeRange, setTimeRange] = useState('daily');

  const hnDataTypes = [
    { value: 'top_stories', label: 'Top Stories' },
    { value: 'new_stories', label: 'New Stories' },
    { value: 'best_stories', label: 'Best Stories' },
    { value: 'search', label: 'Search Stories' },
    { value: 'tech_trends', label: 'Tech Trends' }
  ];

  const ghDataTypes = [
    { value: 'repo_stats', label: 'Repository Statistics' },
    { value: 'trending_repos', label: 'Trending Repositories' },
    { value: 'company_activity', label: 'Company GitHub Activity' },
    { value: 'contributor_stats', label: 'Contributor Statistics' },
    { value: 'issue_analysis', label: 'Issue Analysis' }
  ];

  const fetchHackerNewsData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = {};

      switch (hnDataType) {
        case 'top_stories':
          endpoint = '/api/hackernews/top-stories';
          requestData = { limit: parseInt(hnLimit) };
          break;

        case 'new_stories':
          endpoint = '/api/hackernews/new-stories';
          requestData = { limit: parseInt(hnLimit) };
          break;

        case 'best_stories':
          endpoint = '/api/hackernews/best-stories';
          requestData = { limit: parseInt(hnLimit) };
          break;

        case 'search':
          if (!hnSearchQuery) {
            setError('Please enter a search query');
            setLoading(false);
            return;
          }
          endpoint = '/api/hackernews/search';
          requestData = { query: hnSearchQuery, limit: parseInt(hnLimit) };
          break;

        case 'tech_trends':
          endpoint = '/api/hackernews/tech-trends';
          requestData = { limit: parseInt(hnLimit) };
          break;

        default:
          endpoint = '/api/hackernews/top-stories';
      }

      const response = await axios.post(endpoint, requestData);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let endpoint = '';
      let requestData = {};

      switch (ghDataType) {
        case 'repo_stats':
          if (!repoOwner || !repoName) {
            setError('Please enter repository owner and name');
            setLoading(false);
            return;
          }
          endpoint = '/api/github/repo-stats';
          requestData = { owner: repoOwner, repo: repoName };
          break;

        case 'trending_repos':
          endpoint = '/api/github/trending';
          requestData = {
            language: language || undefined,
            timeRange
          };
          break;

        case 'company_activity':
          if (!company) {
            setError('Please enter a company/organization name');
            setLoading(false);
            return;
          }
          endpoint = '/api/github/company-activity';
          requestData = { company };
          break;

        case 'contributor_stats':
          if (!repoOwner || !repoName) {
            setError('Please enter repository owner and name');
            setLoading(false);
            return;
          }
          endpoint = '/api/github/contributor-stats';
          requestData = { owner: repoOwner, repo: repoName };
          break;

        case 'issue_analysis':
          if (!repoOwner || !repoName) {
            setError('Please enter repository owner and name');
            setLoading(false);
            return;
          }
          endpoint = '/api/github/issue-analysis';
          requestData = { owner: repoOwner, repo: repoName };
          break;

        default:
          endpoint = '/api/github/repo-stats';
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
      const prefix = activeSection === 'hackernews' ? 'hn' : 'github';
      const type = activeSection === 'hackernews' ? hnDataType : ghDataType;
      exportToJSON(data, `${prefix}_${type}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (data && data.data) {
      let csvData = [];
      if (Array.isArray(data.data)) {
        csvData = data.data;
      } else if (data.data.stories && Array.isArray(data.data.stories)) {
        csvData = data.data.stories;
      } else if (data.data.repositories && Array.isArray(data.data.repositories)) {
        csvData = data.data.repositories;
      }
      if (csvData.length > 0) {
        const prefix = activeSection === 'hackernews' ? 'hn' : 'github';
        const type = activeSection === 'hackernews' ? hnDataType : ghDataType;
        exportToCSV(csvData, `${prefix}_${type}_${Date.now()}.csv`);
      }
    }
  };

  const renderHackerNewsForm = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Data Type</label>
          <select value={hnDataType} onChange={(e) => {
            setHnDataType(e.target.value);
            setData(null);
            setError(null);
          }}>
            {hnDataTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        {hnDataType === 'search' && (
          <div className="form-group">
            <label>Search Query</label>
            <input
              type="text"
              value={hnSearchQuery}
              onChange={(e) => setHnSearchQuery(e.target.value)}
              placeholder="e.g., startup, fintech, AI"
            />
          </div>
        )}
        <div className="form-group">
          <label>Limit</label>
          <select value={hnLimit} onChange={(e) => setHnLimit(e.target.value)}>
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={fetchHackerNewsData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>
    </>
  );

  const renderGitHubForm = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Data Type</label>
          <select value={ghDataType} onChange={(e) => {
            setGhDataType(e.target.value);
            setData(null);
            setError(null);
          }}>
            {ghDataTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(ghDataType === 'repo_stats' || ghDataType === 'contributor_stats' || ghDataType === 'issue_analysis') && (
        <div className="form-row">
          <div className="form-group">
            <label>Repository Owner</label>
            <input
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="e.g., facebook, microsoft"
            />
          </div>
          <div className="form-group">
            <label>Repository Name</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g., react, vscode"
            />
          </div>
        </div>
      )}

      {ghDataType === 'trending_repos' && (
        <div className="form-row">
          <div className="form-group">
            <label>Language (Optional)</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="c++">C++</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Range</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      )}

      {ghDataType === 'company_activity' && (
        <div className="form-row">
          <div className="form-group">
            <label>Company / Organization</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., google, facebook, microsoft"
            />
            <small style={{ color: '#718096', fontSize: '0.85rem' }}>
              Enter the GitHub organization name
            </small>
          </div>
        </div>
      )}

      <div className="button-group">
        <button onClick={fetchGitHubData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>
    </>
  );

  const renderHackerNewsResults = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    if (!result.stories || result.stories.length === 0) {
      return <p>No stories found</p>;
    }

    return result.stories.map((story, index) => (
      <div key={index} className="result-card">
        <h4>{story.title}</h4>
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '0.5rem',
          fontSize: '0.9rem',
          color: '#718096'
        }}>
          <span>⬆️ {story.score || story.points || 0} points</span>
          <span>💬 {story.descendants || story.comments || 0} comments</span>
          <span>by {story.by || story.author}</span>
          <span>{new Date((story.time || story.created_at) * 1000).toLocaleDateString()}</span>
        </div>
        {story.url && (
          <a href={story.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Visit Link →
          </a>
        )}
        <a
          href={`https://news.ycombinator.com/item?id=${story.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: '0.5rem', display: 'inline-block', marginLeft: '1rem' }}
        >
          View on HN →
        </a>
      </div>
    ));
  };

  const renderGitHubResults = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (ghDataType) {
      case 'repo_stats':
        return (
          <div className="result-card">
            <h4>{result.full_name || `${repoOwner}/${repoName}`}</h4>
            {result.description && (
              <p style={{ color: '#718096', marginTop: '0.5rem' }}>{result.description}</p>
            )}
            <table className="data-table" style={{ marginTop: '1rem' }}>
              <tbody>
                <tr>
                  <td><strong>Stars:</strong></td>
                  <td>⭐ {result.stargazers_count?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Forks:</strong></td>
                  <td>{result.forks_count?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Watchers:</strong></td>
                  <td>👁️ {result.watchers_count?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Open Issues:</strong></td>
                  <td>{result.open_issues_count?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Language:</strong></td>
                  <td>{result.language || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Size:</strong></td>
                  <td>{result.size ? `${(result.size / 1024).toFixed(2)} MB` : 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Created:</strong></td>
                  <td>{result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Last Updated:</strong></td>
                  <td>{result.updated_at ? new Date(result.updated_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>License:</strong></td>
                  <td>{result.license?.name || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
            {result.html_url && (
              <a href={result.html_url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1rem', display: 'inline-block' }}>
                View on GitHub →
              </a>
            )}
          </div>
        );

      case 'trending_repos':
        if (!result.repositories || result.repositories.length === 0) {
          return <p>No trending repositories found</p>;
        }
        return result.repositories.map((repo, index) => (
          <div key={index} className="result-card">
            <h4>{repo.name || repo.full_name}</h4>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>{repo.description}</p>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              color: '#718096'
            }}>
              <span>⭐ {repo.stars?.toLocaleString() || repo.stargazers_count?.toLocaleString() || 0} stars</span>
              <span>🍴 {repo.forks?.toLocaleString() || repo.forks_count?.toLocaleString() || 0} forks</span>
              <span>📈 {repo.starsToday || repo.stars_today || 0} stars today</span>
              {repo.language && <span>💻 {repo.language}</span>}
            </div>
            <a href={repo.url || repo.html_url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              View on GitHub →
            </a>
          </div>
        ));

      case 'company_activity':
        return (
          <div className="result-card">
            <h4>GitHub Activity for {company}</h4>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Total Repositories:</strong></td>
                  <td>{result.total_repos?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Public Repos:</strong></td>
                  <td>{result.public_repos?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Total Stars:</strong></td>
                  <td>⭐ {result.total_stars?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Total Forks:</strong></td>
                  <td>{result.total_forks?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td><strong>Members:</strong></td>
                  <td>{result.members?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Primary Language:</strong></td>
                  <td>{result.primary_language || 'Various'}</td>
                </tr>
              </tbody>
            </table>
            {result.top_repos && result.top_repos.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5>Top Repositories:</h5>
                {result.top_repos.map((repo, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    backgroundColor: '#f7fafc',
                    borderRadius: '4px',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ fontWeight: 500 }}>{repo.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>
                      ⭐ {repo.stars?.toLocaleString()} stars | {repo.language}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'contributor_stats':
        if (!result.contributors || result.contributors.length === 0) {
          return <p>No contributor data available</p>;
        }
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Contributor</th>
                <th>Commits</th>
                <th>Additions</th>
                <th>Deletions</th>
              </tr>
            </thead>
            <tbody>
              {result.contributors.slice(0, 20).map((contributor, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <a href={`https://github.com/${contributor.login || contributor.author}`} target="_blank" rel="noopener noreferrer">
                      {contributor.login || contributor.author}
                    </a>
                  </td>
                  <td>{contributor.contributions || contributor.commits || 0}</td>
                  <td style={{ color: 'green' }}>+{contributor.additions?.toLocaleString() || 0}</td>
                  <td style={{ color: 'red' }}>-{contributor.deletions?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'issue_analysis':
        return (
          <div className="result-card">
            <h4>Issue Analysis</h4>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Total Issues:</strong></td>
                  <td>{result.total_issues || 0}</td>
                </tr>
                <tr>
                  <td><strong>Open Issues:</strong></td>
                  <td style={{ color: 'orange' }}>{result.open_issues || 0}</td>
                </tr>
                <tr>
                  <td><strong>Closed Issues:</strong></td>
                  <td style={{ color: 'green' }}>{result.closed_issues || 0}</td>
                </tr>
                <tr>
                  <td><strong>Average Close Time:</strong></td>
                  <td>{result.avg_close_time || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Bugs:</strong></td>
                  <td>{result.bugs || 0}</td>
                </tr>
                <tr>
                  <td><strong>Enhancements:</strong></td>
                  <td>{result.enhancements || 0}</td>
                </tr>
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
        <h2>Hacker News & GitHub Alternative Data</h2>
        <p>Track tech trends, developer activity, and open source insights</p>
      </div>

      <div className="api-key-note" style={{ backgroundColor: '#e6f7ff', borderLeftColor: '#1890ff' }}>
        <strong>No API Keys Required:</strong> Both Hacker News and GitHub provide public APIs.
        Note: GitHub API has rate limits (60 requests/hour unauthenticated).
      </div>

      {/* Section Selector */}
      <div className="demo-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => {
              setActiveSection('hackernews');
              setData(null);
              setError(null);
            }}
            style={{
              flex: 1,
              backgroundColor: activeSection === 'hackernews' ? '#667eea' : '#e2e8f0',
              color: activeSection === 'hackernews' ? 'white' : '#4a5568'
            }}
          >
            Hacker News
          </button>
          <button
            onClick={() => {
              setActiveSection('github');
              setData(null);
              setError(null);
            }}
            style={{
              flex: 1,
              backgroundColor: activeSection === 'github' ? '#667eea' : '#e2e8f0',
              color: activeSection === 'github' ? 'white' : '#4a5568'
            }}
          >
            GitHub
          </button>
        </div>
      </div>

      {/* Dynamic Form based on active section */}
      <div className="demo-section">
        <h3>{activeSection === 'hackernews' ? 'Hacker News' : 'GitHub'} Configuration</h3>
        {activeSection === 'hackernews' ? renderHackerNewsForm() : renderGitHubForm()}
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Fetching data from {activeSection === 'hackernews' ? 'Hacker News' : 'GitHub'}
        </div>
      )}

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
          {activeSection === 'hackernews' ? renderHackerNewsResults() : renderGitHubResults()}
        </div>
      )}

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>About These Data Sources</h3>

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Hacker News</h4>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Hacker News is a social news website focusing on computer science and entrepreneurship.
          It's valuable for tracking:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Top Stories:</strong> Most upvoted tech and startup news</li>
          <li><strong>Tech Trends:</strong> Emerging technologies and discussions</li>
          <li><strong>Startup Activity:</strong> New launches, funding rounds, and pivots</li>
          <li><strong>Developer Sentiment:</strong> Community reactions to tech news</li>
        </ul>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>GitHub</h4>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          GitHub hosts over 100M repositories and provides insights into developer activity,
          technology adoption, and company engineering culture:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Repository Stats:</strong> Track project health and popularity</li>
          <li><strong>Trending Repos:</strong> Discover fast-growing open source projects</li>
          <li><strong>Company Activity:</strong> Analyze engineering output and focus areas</li>
          <li><strong>Developer Metrics:</strong> Understand contribution patterns</li>
        </ul>

        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Use Cases for Trading:</strong> Track developer interest in company products,
          identify emerging technologies early, analyze engineering culture at public companies.
        </p>

        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '0.5rem' }}>
          <strong>Rate Limits:</strong> GitHub allows 60 requests/hour without authentication.
          For higher limits, add a GitHub Personal Access Token (not implemented in this demo).
        </p>
      </div>
    </div>
  );
}

export default HackerNewsGitHubTab;
