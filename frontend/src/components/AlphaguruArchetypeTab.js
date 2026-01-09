import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

function AlphaguruArchetypeTab() {
  const [symbol, setSymbol] = useState('NVDA');
  const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('ai_provider') || 'openai');
  const [data, setData] = useState(null);
  const [ontology, setOntology] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const analyzeStock = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Save API key to localStorage if provided
      if (apiKey) {
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_provider', aiProvider);
      }

      const response = await axios.post(`${API_BASE_URL}/archetype/analyze`, {
        symbol: symbol.toUpperCase(),
        apiKey: apiKey || undefined,
        aiProvider: aiProvider
      });

      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze stock');
      console.error('Archetype Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOntology = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/archetype/ontology`);
      setOntology(response.data);
    } catch (err) {
      console.error('Failed to load ontology:', err);
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
      link.download = `alphaguru_archetype_${data.symbol}_${Date.now()}.json`;
      link.click();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const renderConfidenceBar = (confidence) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${confidence}%`,
            height: '100%',
            background: getConfidenceColor(confidence),
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ fontWeight: '600', color: getConfidenceColor(confidence), minWidth: '45px' }}>
          {confidence}%
        </span>
      </div>
    );
  };

  const renderArchetypeCard = (title, value, confidence, reasoning, icon) => {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
              {title}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginTop: '4px' }}>
              {Array.isArray(value) ? value.join(', ') : value}
            </div>
          </div>
        </div>
        {renderConfidenceBar(confidence)}
        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
          {reasoning}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🧬</span>
          Alphaguru Business Archetype
        </h2>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Proprietary AI-powered system that synthesizes fundamental data and generates unique business archetype labels using advanced embeddings
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Stock Symbol:
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., NVDA, TSLA, AAPL"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
            onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontWeight: '600' }}>
              AI API Key (Optional - for enhanced analysis):
            </label>
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              style={{
                padding: '4px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {showApiKeyInput ? 'Hide' : 'Configure AI'}
            </button>
          </div>

          {showApiKeyInput && (
            <div style={{ padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#6b7280' }}>
                  AI Provider:
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                >
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#6b7280' }}>
                  API Key:
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
                  {aiProvider === 'openai' ? (
                    <>Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>OpenAI</a></>
                  ) : (
                    <>Get your key at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Anthropic Console</a></>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '10px', padding: '10px', background: '#fef3c7', borderRadius: '4px', fontSize: '0.875rem' }}>
                <strong>Note:</strong> API key stored locally. Without AI key, rule-based analysis will be used (limited insights).
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={analyzeStock}
            disabled={loading || !symbol}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Analyzing...' : '🧬 Analyze Archetype'}
          </button>

          <button
            onClick={loadOntology}
            style={{
              padding: '12px 24px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            View Ontology
          </button>

          {data && (
            <button
              onClick={() => exportData('json')}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Export JSON
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧬</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Analyzing company archetype...</div>
          <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
            {apiKey ? 'Using AI-powered analysis' : 'Using rule-based analysis'}
          </div>
        </div>
      )}

      {data && !loading && (
        <div>
          {/* Company Header */}
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', marginBottom: '24px', color: 'white' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
              {data.companyName} ({data.symbol})
            </div>
            <div style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '16px' }}>
              {data.sector} • {data.industry}
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Market Cap</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>${(data.marketCap / 1e9).toFixed(2)}B</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Analysis Method</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{data.analysisMethod}</div>
              </div>
            </div>
          </div>

          {/* Overall Archetype */}
          <div style={{ padding: '24px', background: 'white', borderRadius: '8px', marginBottom: '24px', border: '2px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Overall Business Archetype
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              {data.archetype.overallArchetype}
            </div>
            <div style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.6' }}>
              {data.archetype.investmentThesis}
            </div>
          </div>

          {/* Archetype Dimensions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {renderArchetypeCard(
              'Business Model',
              data.archetype.businessModel,
              data.archetype.businessModelConfidence,
              data.archetype.businessModelReasoning,
              '🏢'
            )}
            {renderArchetypeCard(
              'Growth Stage',
              data.archetype.growthStage,
              data.archetype.growthStageConfidence,
              data.archetype.growthStageReasoning,
              '📈'
            )}
            {renderArchetypeCard(
              'Competitive Moat',
              data.archetype.moatType,
              data.archetype.moatStrength,
              data.archetype.moatReasoning,
              '🏰'
            )}
            {renderArchetypeCard(
              'Innovation Velocity',
              data.archetype.innovationVelocity,
              data.archetype.innovationVelocityConfidence,
              data.archetype.innovationReasoning,
              '⚡'
            )}
            {renderArchetypeCard(
              'Capital Efficiency',
              data.archetype.capitalEfficiency,
              data.archetype.capitalEfficiencyConfidence,
              data.archetype.capitalReasoning,
              '💰'
            )}
            {renderArchetypeCard(
              'Market Position',
              data.archetype.marketPosition,
              data.archetype.marketPositionConfidence,
              data.archetype.marketPositionReasoning,
              '🎯'
            )}
            {renderArchetypeCard(
              'Unit Economics',
              data.archetype.unitEconomics,
              data.archetype.unitEconomicsConfidence,
              data.archetype.unitEconomicsReasoning,
              '📊'
            )}
            {renderArchetypeCard(
              'Scalability',
              data.archetype.scalability,
              data.archetype.scalabilityConfidence,
              data.archetype.scalabilityReasoning,
              '🚀'
            )}
          </div>

          {/* Risk Factors & Catalysts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#991b1b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span> Risk Factors
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                {data.archetype.riskFactors?.map((risk, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>{risk}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> Catalysts
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                {data.archetype.catalysts?.map((catalyst, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>{catalyst}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '16px' }}>Key Fundamental Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Revenue Growth', value: data.fundamentals.revenueGrowth, suffix: '%' },
                { label: 'Profit Margin', value: data.fundamentals.profitMargin, suffix: '%' },
                { label: 'Operating Margin', value: data.fundamentals.operatingMargin, suffix: '%' },
                { label: 'ROE', value: data.fundamentals.roe, suffix: '%' },
                { label: 'P/E Ratio', value: data.fundamentals.trailingPE, suffix: '' },
                { label: 'Debt/Equity', value: data.fundamentals.debtToEquity, suffix: '' }
              ].map((metric, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                    {metric.value?.toFixed(1)}{metric.suffix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ontology && (
        <div style={{ marginTop: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Archetype Ontology Reference</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{ontology.description}</p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(ontology.ontology).map(([key, values]) => (
              <div key={key} style={{ padding: '16px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '700', marginBottom: '12px', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {values.map((item, idx) => (
                    <span key={idx} style={{
                      padding: '4px 12px',
                      background: '#f3f4f6',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      color: '#4b5563'
                    }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AlphaguruArchetypeTab;
