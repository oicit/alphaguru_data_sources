import React, { useState, useEffect } from 'react';
import '../styles/DataSourceTab.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

function DeepResearchAgentsTab() {
  const [dataType, setDataType] = useState('agents');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [region, setRegion] = useState('all'); // all, western, chinese

  const dataTypes = [
    { value: 'agents', label: 'All Agents', endpoint: '/api/deepresearch/agents' },
    { value: 'comparison', label: 'Comparison', endpoint: '/api/deepresearch/comparison' },
    { value: 'benchmarks', label: 'Benchmarks', endpoint: '/api/deepresearch/benchmarks' },
    { value: 'western', label: 'Western Agents', endpoint: '/api/deepresearch/western' },
    { value: 'chinese', label: 'Chinese Agents', endpoint: '/api/deepresearch/chinese' },
    { value: 'recommendations', label: 'Recommendations', endpoint: '/api/deepresearch/recommendations' }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSelectedAgent(null);

    try {
      const selectedDataType = dataTypes.find(dt => dt.value === dataType);
      const response = await fetch(`${API_BASE}${selectedDataType.endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType]);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `deep-research-agents-${dataType}-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderAgentCard = (agent) => (
    <div key={agent.id} className="agent-card" onClick={() => setSelectedAgent(agent)}>
      <div className="agent-header">
        <h3>{agent.name}</h3>
        <span className="agent-provider">{agent.provider}</span>
      </div>
      <div className="agent-model">{agent.model}</div>
      <div className="agent-status">
        <span className={`status-badge ${agent.status.toLowerCase()}`}>
          {agent.status}
        </span>
        <span className="launch-date">{agent.launched}</span>
      </div>
      <div className="agent-features">
        {agent.features.slice(0, 3).map((feature, idx) => (
          <div key={idx} className="feature-tag">{feature}</div>
        ))}
        {agent.features.length > 3 && (
          <div className="feature-tag more">+{agent.features.length - 3} more</div>
        )}
      </div>
    </div>
  );

  const renderAgentDetail = (agent) => (
    <div className="agent-detail-modal">
      <div className="agent-detail-content">
        <button className="close-btn" onClick={() => setSelectedAgent(null)}>×</button>

        <div className="agent-detail-header">
          <h2>{agent.name}</h2>
          <div className="agent-meta">
            <span className="provider-badge">{agent.provider}</span>
            <span className="model-badge">{agent.model}</span>
            <span className={`status-badge ${agent.status.toLowerCase()}`}>{agent.status}</span>
          </div>
          <p className="launch-info">Launched: {agent.launched}</p>
          <p className="availability-info">Availability: {agent.availability}</p>
        </div>

        {agent.capabilities && (
          <div className="detail-section">
            <h3>Capabilities</h3>
            <div className="capability-grid">
              {Object.entries(agent.capabilities).map(([key, value]) => (
                <div key={key} className="capability-item">
                  <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
                  {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}
                </div>
              ))}
            </div>
          </div>
        )}

        {agent.benchmarks && Object.keys(agent.benchmarks).length > 0 && (
          <div className="detail-section">
            <h3>Benchmark Performance</h3>
            <div className="benchmark-grid">
              {Object.entries(agent.benchmarks).map(([key, value]) => (
                <div key={key} className="benchmark-item">
                  <div className="benchmark-name">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="benchmark-score">{value}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Key Features</h3>
          <ul className="feature-list">
            {agent.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>

        {agent.useCases && (
          <div className="detail-section">
            <h3>Use Cases</h3>
            <div className="usecase-tags">
              {agent.useCases.map((useCase, idx) => (
                <span key={idx} className="usecase-tag">{useCase}</span>
              ))}
            </div>
          </div>
        )}

        {agent.strengths && (
          <div className="detail-section">
            <h3>✅ Strengths</h3>
            <ul className="strength-list">
              {agent.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {agent.limitations && (
          <div className="detail-section">
            <h3>⚠️ Limitations</h3>
            <ul className="limitation-list">
              {agent.limitations.map((limitation, idx) => (
                <li key={idx}>{limitation}</li>
              ))}
            </ul>
          </div>
        )}

        {agent.pricing && (
          <div className="detail-section">
            <h3>Pricing</h3>
            <div className="pricing-info">
              {Object.entries(agent.pricing).map(([key, value]) => (
                <div key={key} className="pricing-item">
                  <strong>{key}:</strong> {typeof value === 'boolean' ? (value ? '✅ Available' : '❌ Not Available') : value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderComparison = (data) => (
    <div className="comparison-view">
      <h3>Benchmark Comparison</h3>
      {data.benchmarks && Object.entries(data.benchmarks).map(([benchmark, agents]) => (
        <div key={benchmark} className="benchmark-section">
          <h4>{benchmark.replace(/([A-Z])/g, ' $1').trim()}</h4>
          <div className="comparison-bars">
            {agents.map((item, idx) => (
              <div key={idx} className="comparison-bar-item">
                <div className="agent-name-label">{item.agent}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{width: `${item.score}%`}}
                  >
                    {item.score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h3>Research Speed</h3>
      <div className="speed-comparison">
        {data.researchSpeed && data.researchSpeed.map((item, idx) => (
          <div key={idx} className="speed-item">
            <div className="speed-agent">{item.agent}</div>
            <div className="speed-time">{item.time}</div>
            <div className="speed-usecase">{item.useCase}</div>
          </div>
        ))}
      </div>

      <h3>Specializations</h3>
      {data.specializations && (
        <div className="specialization-grid">
          {Object.entries(data.specializations).map(([category, agents]) => (
            <div key={category} className="specialization-item">
              <h4>{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <div className="spec-agents">
                {agents.map((agent, idx) => (
                  <span key={idx} className="spec-agent-tag">{agent}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBenchmarks = (data) => (
    <div className="benchmarks-view">
      {Object.entries(data).map(([benchmark, details]) => (
        <div key={benchmark} className="benchmark-detail">
          <h3>{benchmark.replace(/([A-Z])/g, ' $1').trim()}</h3>
          <p className="benchmark-description">{details.description}</p>
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Agent</th>
                <th>Provider</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {details.results.map((result) => (
                <tr key={result.rank}>
                  <td className="rank-cell">#{result.rank}</td>
                  <td>{result.agent}</td>
                  <td>{result.provider}</td>
                  <td className="score-cell">{result.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  const renderRecommendations = (data) => (
    <div className="recommendations-view">
      <h3>Use Case Recommendations</h3>
      {data.allRecommendations && Object.entries(data.allRecommendations).map(([useCase, rec]) => (
        <div key={useCase} className="recommendation-card">
          <h4>{useCase.replace(/-/g, ' ').toUpperCase()}</h4>
          <div className="primary-rec">
            <span className="rec-label">Primary:</span>
            <span className="rec-agent">{rec.primary}</span>
          </div>
          <p className="rec-reason">{rec.reason}</p>
          <div className="alternatives">
            <span className="alt-label">Alternatives:</span>
            {rec.alternatives.map((alt, idx) => (
              <span key={idx} className="alt-tag">{alt}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="data-source-tab">
      <div className="tab-header">
        <h2>🤖 Deep Research AI Agents</h2>
        <p>Comprehensive comparison of Deep Research AI agents from Western and Chinese providers</p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label>View:</label>
          <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            {dataTypes.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchData} className="fetch-btn">
          Refresh Data
        </button>

        {data && (
          <button onClick={exportToJSON} className="export-btn">
            Export JSON
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading Deep Research agents data...</div>}
      {error && <div className="error">Error: {error}</div>}

      {data && !loading && (
        <div className="results">
          {dataType === 'agents' && (
            <div className="agents-grid-view">
              <div className="region-filter">
                <button
                  className={region === 'all' ? 'active' : ''}
                  onClick={() => setRegion('all')}
                >
                  All Regions
                </button>
                <button
                  className={region === 'western' ? 'active' : ''}
                  onClick={() => setRegion('western')}
                >
                  Western
                </button>
                <button
                  className={region === 'chinese' ? 'active' : ''}
                  onClick={() => setRegion('chinese')}
                >
                  Chinese
                </button>
              </div>

              {(region === 'all' || region === 'western') && (
                <div className="agent-section">
                  <h3>🌎 Western Providers</h3>
                  <div className="agents-grid">
                    {data.western && data.western.map(agent => renderAgentCard(agent))}
                  </div>
                </div>
              )}

              {(region === 'all' || region === 'chinese') && (
                <div className="agent-section">
                  <h3>🇨🇳 Chinese Providers</h3>
                  <div className="agents-grid">
                    {data.chinese && data.chinese.map(agent => renderAgentCard(agent))}
                  </div>
                </div>
              )}
            </div>
          )}

          {dataType === 'comparison' && renderComparison(data)}
          {dataType === 'benchmarks' && renderBenchmarks(data)}
          {dataType === 'recommendations' && renderRecommendations(data)}

          {(dataType === 'western' || dataType === 'chinese') && (
            <div className="agents-grid">
              {data.agents && data.agents.map(agent => renderAgentCard(agent))}
            </div>
          )}
        </div>
      )}

      {selectedAgent && renderAgentDetail(selectedAgent)}
    </div>
  );
}

export default DeepResearchAgentsTab;
