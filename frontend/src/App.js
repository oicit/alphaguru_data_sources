import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './styles/App.css';

// Import tab components
import SecEdgarTab from './components/SecEdgarTab';
import FinnhubTab from './components/FinnhubTab';
import YFinanceTab from './components/YFinanceTab';
import TrendRadarTab from './components/TrendRadarTab';
import OverviewTab from './components/OverviewTab';

function App() {
  const [apiKeys, setApiKeys] = useState({
    finnhub: localStorage.getItem('finnhub_api_key') || ''
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
