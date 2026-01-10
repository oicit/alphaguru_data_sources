import React, { useState } from 'react';
import './styles/App.css';
import './styles/DataSourceTab.css';

// Import tab components
import SecEdgarTab from './components/SecEdgarTab';
import FinnhubTab from './components/FinnhubTab';
import YFinanceTab from './components/YFinanceTab';
import TrendRadarTab from './components/TrendRadarTab';
import AlphaVantageTab from './components/AlphaVantageTab';
import FmpTab from './components/FmpTab';
import RedditTab from './components/RedditTab';
import TwitterTab from './components/TwitterTab';
import YouTubeTab from './components/YouTubeTab';
import HackerNewsGitHubTab from './components/HackerNewsGitHubTab';
import GlobalMarketsTab from './components/GlobalMarketsTab';
import AlphaguruArchetypeTab from './components/AlphaguruArchetypeTab';
import DeepResearchAgentsTab from './components/DeepResearchAgentsTab';
import OverviewTab from './components/OverviewTab';
import CategoryOverview from './components/CategoryOverview';

function App() {
  const [apiKeys, setApiKeys] = useState({
    finnhub: localStorage.getItem('finnhub_api_key') || '',
    fmp: localStorage.getItem('fmp_api_key') || '',
    twitter: localStorage.getItem('twitter_api_key') || '',
    youtube: localStorage.getItem('youtube_api_key') || ''
  });

  const [activeView, setActiveView] = useState('overview');
  const [expandedCategories, setExpandedCategories] = useState({
    traditional: true,
    alternative: false,
    ai: false
  });

  const updateApiKey = (service, key) => {
    const newKeys = { ...apiKeys, [service]: key };
    setApiKeys(newKeys);
    localStorage.setItem(`${service}_api_key`, key);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const menuStructure = [
    {
      id: 'traditional',
      title: 'Traditional Financial Data',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      items: [
        { id: 'traditional-overview', label: 'Overview', icon: '📋', component: 'CategoryOverview' },
        { id: 'sec-edgar', label: 'SEC EDGAR', icon: '📋', component: 'SecEdgarTab' },
        { id: 'finnhub', label: 'Finnhub', icon: '📈', component: 'FinnhubTab' },
        { id: 'yfinance', label: 'Yahoo Finance', icon: '💹', component: 'YFinanceTab' },
        { id: 'alphavantage', label: 'Alpha Vantage', icon: '📊', component: 'AlphaVantageTab' },
        { id: 'fmp', label: 'FMP', icon: '💼', component: 'FmpTab' }
      ]
    },
    {
      id: 'alternative',
      title: 'Alternative Data',
      icon: '🌐',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      items: [
        { id: 'alternative-overview', label: 'Overview', icon: '📋', component: 'CategoryOverview' },
        { id: 'twitter', label: 'X.com/Twitter', icon: '🐦', component: 'TwitterTab' },
        { id: 'reddit', label: 'Reddit', icon: '🔴', component: 'RedditTab' },
        { id: 'hn-github', label: 'HN/GitHub', icon: '🔶', component: 'HackerNewsGitHubTab' },
        { id: 'youtube', label: 'YouTube', icon: '📺', component: 'YouTubeTab' },
        { id: 'trendradar', label: 'TrendRadar', icon: '📰', component: 'TrendRadarTab' },
        { id: 'globalmarkets', label: 'Global Markets', icon: '🌏', component: 'GlobalMarketsTab' }
      ]
    },
    {
      id: 'ai',
      title: 'AI-Powered Data',
      icon: '🤖',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      items: [
        { id: 'ai-overview', label: 'Overview', icon: '📋', component: 'CategoryOverview' },
        { id: 'archetype', label: 'Alphaguru Archetype', icon: '🧬', component: 'AlphaguruArchetypeTab' },
        { id: 'deepresearch', label: 'Deep Research AI', icon: '🤖', component: 'DeepResearchAgentsTab' }
      ]
    }
  ];

  const renderActiveComponent = () => {
    // Handle Category Overviews
    if (activeView === 'traditional-overview') {
      return <CategoryOverview category={menuStructure[0]} onNavigate={setActiveView} />;
    }
    if (activeView === 'alternative-overview') {
      return <CategoryOverview category={menuStructure[1]} onNavigate={setActiveView} />;
    }
    if (activeView === 'ai-overview') {
      return <CategoryOverview category={menuStructure[2]} onNavigate={setActiveView} />;
    }

    const components = {
      'overview': <OverviewTab />,
      'sec-edgar': <SecEdgarTab />,
      'finnhub': <FinnhubTab apiKey={apiKeys.finnhub} onApiKeyChange={(key) => updateApiKey('finnhub', key)} />,
      'yfinance': <YFinanceTab />,
      'alphavantage': <AlphaVantageTab />,
      'fmp': <FmpTab apiKey={apiKeys.fmp} onApiKeyChange={(key) => updateApiKey('fmp', key)} />,
      'twitter': <TwitterTab apiKey={apiKeys.twitter} onApiKeyChange={(key) => updateApiKey('twitter', key)} />,
      'reddit': <RedditTab />,
      'hn-github': <HackerNewsGitHubTab />,
      'youtube': <YouTubeTab apiKey={apiKeys.youtube} onApiKeyChange={(key) => updateApiKey('youtube', key)} />,
      'trendradar': <TrendRadarTab />,
      'globalmarkets': <GlobalMarketsTab />,
      'archetype': <AlphaguruArchetypeTab />,
      'deepresearch': <DeepResearchAgentsTab />
    };

    return components[activeView] || <OverviewTab />;
  };

  return (
    <div className="App">
      <div className="app-container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-container">
              <div className="logo-icon">🚀</div>
              <div className="logo-text">
                <h2>AlphaGuru</h2>
                <p>Data Sources</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {/* Overview */}
            <button
              className={`nav-item nav-item-home ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveView('overview')}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-label">Overview</span>
            </button>

            {/* Category Menus */}
            {menuStructure.map(category => (
              <div key={category.id} className="nav-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category.id)}
                  style={{ background: category.gradient }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-title">{category.title}</span>
                  <span className={`category-arrow ${expandedCategories[category.id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>

                <div className={`category-items ${expandedCategories[category.id] ? 'expanded' : ''}`}>
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                      onClick={() => setActiveView(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <p>Built with React + Node.js</p>
            <p className="warning">⚠️ Educational use only</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

