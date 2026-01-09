import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './styles/App.css';

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
import OverviewTab from './components/OverviewTab';

function App() {
  const [apiKeys, setApiKeys] = useState({
    finnhub: localStorage.getItem('finnhub_api_key') || '',
    fmp: localStorage.getItem('fmp_api_key') || '',
    twitter: localStorage.getItem('twitter_api_key') || '',
    youtube: localStorage.getItem('youtube_api_key') || ''
  });

  const updateApiKey = (service, key) => {
    const newKeys = { ...apiKeys, [service]: key };
    setApiKeys(newKeys);
    localStorage.setItem(`${service}_api_key`, key);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AlphaGuru Data Sources Dashboard</h1>
        <p>Interactive demos of financial data sources</p>
      </header>

      <main className="App-main">
        <Tabs>
          <TabList>
            <Tab>📋 Overview</Tab>
            <Tab>📊 SEC EDGAR</Tab>
            <Tab>📈 Finnhub</Tab>
            <Tab>💹 Yahoo Finance</Tab>
            <Tab>📰 TrendRadar</Tab>
            <Tab>📊 Alpha Vantage</Tab>
            <Tab>💼 FMP</Tab>
            <Tab>🔴 Reddit</Tab>
            <Tab>🐦 X.com/Twitter</Tab>
            <Tab>📺 YouTube</Tab>
            <Tab>🔶 HN/GitHub</Tab>
            <Tab>🌏 Global Markets</Tab>
            <Tab>🧬 Alphaguru Archetype</Tab>
          </TabList>

          <TabPanel>
            <OverviewTab />
          </TabPanel>

          <TabPanel>
            <SecEdgarTab />
          </TabPanel>

          <TabPanel>
            <FinnhubTab
              apiKey={apiKeys.finnhub}
              onApiKeyChange={(key) => updateApiKey('finnhub', key)}
            />
          </TabPanel>

          <TabPanel>
            <YFinanceTab />
          </TabPanel>

          <TabPanel>
            <TrendRadarTab />
          </TabPanel>

          <TabPanel>
            <AlphaVantageTab />
          </TabPanel>

          <TabPanel>
            <FmpTab
              apiKey={apiKeys.fmp}
              onApiKeyChange={(key) => updateApiKey('fmp', key)}
            />
          </TabPanel>

          <TabPanel>
            <RedditTab />
          </TabPanel>

          <TabPanel>
            <TwitterTab
              apiKey={apiKeys.twitter}
              onApiKeyChange={(key) => updateApiKey('twitter', key)}
            />
          </TabPanel>

          <TabPanel>
            <YouTubeTab
              apiKey={apiKeys.youtube}
              onApiKeyChange={(key) => updateApiKey('youtube', key)}
            />
          </TabPanel>

          <TabPanel>
            <HackerNewsGitHubTab />
          </TabPanel>

          <TabPanel>
            <GlobalMarketsTab />
          </TabPanel>

          <TabPanel>
            <AlphaguruArchetypeTab />
          </TabPanel>
        </Tabs>
      </main>

      <footer className="App-footer">
        <p>AlphaGuru Data Sources Dashboard | Built with React + Node.js</p>
        <p>⚠️ For educational and research purposes only</p>
      </footer>
    </div>
  );
}

export default App;
