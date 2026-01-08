# 🚀 AlphaGuru Data Sources Dashboard

An interactive web application showcasing multiple financial data sources with real, working demos. Built with React + Node.js/Express.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Overview

The Data Sources Dashboard aggregates all major financial data sources from the AlphaGuru ecosystem into a single, user-friendly web interface. Each tab provides:

- **Real-time data fetching** from live APIs
- **Editable parameters** for custom queries
- **API key management** (stored locally in browser)
- **Data export** to JSON and CSV formats
- **Interactive demos** with visual data displays

## ✨ Features

### Data Sources Included

1. **📊 SEC EDGAR** - Company filings (10-K, 10-Q, 8-K, etc.)
2. **📈 Finnhub API** - Real-time stock quotes, fundamentals, news, sentiment
3. **💹 Yahoo Finance** - Stock quotes, historical data, symbol search
4. **📰 TrendRadar** - Trending news from 11+ Chinese platforms

### Core Functionality

- ✅ Real-time API data fetching
- ✅ Multiple demo types per data source
- ✅ API key input and management
- ✅ Export data to JSON/CSV
- ✅ Responsive, modern UI
- ✅ Error handling and loading states
- ✅ No database required

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- API keys (optional, for certain features):
  - [Finnhub API key](https://finnhub.io) (free tier available)

### Installation

1. **Clone or navigate to the project**

```bash
cd /Users/oicit/Documents/alphaguru/data-sources-dashboard
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Configure environment variables** (optional)

```bash
cd ../backend
cp .env.example .env
# Edit .env and add your API keys if you have them
```

### Running the Application

#### Option 1: Run both servers manually

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend will run on http://localhost:3000
```

#### Option 2: Use concurrent script (recommended)

Create a `package.json` in the root directory:

```json
{
  "name": "data-sources-dashboard",
  "version": "1.0.0",
  "scripts": {
    "install-all": "cd backend && npm install && cd ../frontend && npm install",
    "start-backend": "cd backend && npm start",
    "start-frontend": "cd frontend && npm start",
    "dev": "npm run start-backend & npm run start-frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Then run:
```bash
npm install
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

The backend API will be available at:
```
http://localhost:5000
```

## 📖 Usage Guide

### 1. SEC EDGAR Tab

**What it does:** Fetches company filings from the SEC EDGAR database

**How to use:**
1. Enter a stock ticker (e.g., AAPL, MSFT, TSLA)
2. Select filing type (10-K, 10-Q, 8-K, etc.)
3. Set number of results to fetch
4. Click "Fetch Filings"
5. View results and click links to see full documents on SEC.gov
6. Export to JSON or CSV

**Note:** SEC EDGAR has rate limiting (10 requests/second max). Be respectful of their API.

### 2. Finnhub Tab

**What it does:** Provides real-time stock market data, fundamentals, news, and sentiment

**How to use:**
1. **Get API Key:**
   - Visit [finnhub.io](https://finnhub.io)
   - Sign up for free account
   - Get your API key
   - Enter it in the "Finnhub API Key" field (stored in browser localStorage)

2. **Try Different Demos:**
   - **Stock Quote** - Real-time price, change, volume
   - **Company Profile** - Basic company information
   - **Company Fundamentals** - Financial metrics
   - **Company News** - Recent news articles (last 7 days)
   - **Earnings Data** - Quarterly earnings history
   - **Analyst Recommendations** - Buy/sell/hold recommendations
   - **News Sentiment** - Aggregated sentiment scores

3. Enter stock symbol and select demo type
4. Click "Fetch Data"
5. Export results to JSON

**Free tier limitations:** 60 API calls/minute, 30 calls/second

### 3. Yahoo Finance Tab

**What it does:** Stock quotes, historical data, and symbol search

**How to use:**

**Demo Types:**

**A. Real-time Quote**
- Enter stock symbol
- Click "Fetch Data"
- View current price, day high/low, volume, market cap

**B. Historical Data**
- Enter stock symbol
- Select interval (1d, 1wk, 1mo)
- Click "Fetch Data"
- Last 90 days of data (last 10 shown in table)
- Export to CSV for full dataset

**C. Symbol Search**
- Enter company name or symbol
- Click "Fetch Data"
- Browse matching symbols across global markets

**Note:** No API key required! Yahoo Finance data is free.

### 4. TrendRadar Tab

**What it does:** Aggregates trending news from 11+ Chinese platforms

**How to use:**
1. Select platforms (checkboxes):
   - Toutiao (今日头条)
   - Baidu Hot Search (百度热搜)
   - Zhihu (知乎)
   - Weibo (微博)
   - Douyin (抖音)
   - Bilibili
   - Wall Street Journal CN
   - And more...

2. Click "Fetch Trends"
3. View trending topics from each platform
4. Click links to read full articles
5. Export all trends to JSON

**Note:** Data is sourced from the [newsnow](https://github.com/ourongxing/newsnow) project API.

## 🔧 API Endpoints

The backend provides RESTful API endpoints:

### SEC EDGAR
- `POST /api/sec-edgar/filings` - Get company filings
- `POST /api/sec-edgar/filing-document` - Get specific document
- `GET /api/sec-edgar/company/:identifier` - Get company info

### Finnhub
- `POST /api/finnhub/quote` - Stock quote
- `POST /api/finnhub/company-profile` - Company profile
- `POST /api/finnhub/fundamentals` - Company fundamentals
- `POST /api/finnhub/news` - Company news
- `POST /api/finnhub/earnings` - Earnings data
- `POST /api/finnhub/recommendations` - Analyst recommendations
- `POST /api/finnhub/sentiment` - News sentiment

### Yahoo Finance
- `POST /api/yfinance/quote` - Stock quote
- `POST /api/yfinance/historical` - Historical data
- `POST /api/yfinance/search` - Symbol search

### TrendRadar
- `POST /api/trendradar/platform-trends` - Single platform
- `POST /api/trendradar/multi-platform-trends` - Multiple platforms
- `GET /api/trendradar/platforms` - Available platforms list

## 🔐 API Key Management

API keys are stored in browser's `localStorage` for persistence:

- **Finnhub:** Required for Finnhub tab
- **SEC EDGAR:** No key required
- **Yahoo Finance:** No key required
- **TrendRadar:** No key required

**Security Note:** API keys are stored locally in your browser and only sent to the official API providers. They are never sent to any other servers.

## 📦 Data Export

All tabs support data export:

- **JSON Export** - Full data structure
- **CSV Export** - Tabular data (where applicable)

Export buttons appear after successful data fetch.

## 🎨 Customization

### Adding New Data Sources

1. Create backend route in `backend/routes/`
2. Add route to `backend/server.js`
3. Create frontend component in `frontend/src/components/`
4. Add tab to `frontend/src/App.js`
5. Update this README

### Styling

Modify `frontend/src/styles/App.css` to customize appearance.

### API Configuration

Edit `backend/.env` to set default API keys or server configuration.

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### CORS Errors

**Problem:** CORS policy blocking requests

**Solution:** The backend is configured with CORS enabled. Make sure both servers are running and the frontend is accessing `http://localhost:5000`.

### API Rate Limiting

**Problem:** `429 Too Many Requests`

**Solution:**
- Wait a few seconds and try again
- Reduce request frequency
- Check API provider's rate limits

### Missing API Key

**Problem:** `API key is required`

**Solution:**
- Enter API key in the respective tab
- API key will be saved in browser localStorage
- For Finnhub, get free key at [finnhub.io](https://finnhub.io)

## 📚 Related Documentation

- [DATA_SOURCES_SUMMARY.md](../DATA_SOURCES_SUMMARY.md) - Comprehensive guide to all data sources
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [SEC EDGAR](https://www.sec.gov/edgar/searchedgar/companysearch.html)
- [Yahoo Finance](https://finance.yahoo.com)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This application is for educational and research purposes only.

- Respect API rate limits and terms of service
- Do not use for automated trading without proper authorization
- Financial data may be delayed or inaccurate
- No investment advice is provided

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io) - Financial data API
- [SEC EDGAR](https://www.sec.gov) - Public company filings
- [Yahoo Finance](https://finance.yahoo.com) - Stock market data
- [newsnow](https://github.com/ourongxing/newsnow) - Trending news aggregation

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- See [DATA_SOURCES_SUMMARY.md](../DATA_SOURCES_SUMMARY.md) for detailed data source documentation

---

**Built with ❤️ for the AlphaGuru project**

Last Updated: 2024-12-24
