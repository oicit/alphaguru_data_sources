const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Import route handlers
const secEdgarRoutes = require('./routes/secEdgar');
const finnhubRoutes = require('./routes/finnhub');
const yfinanceRoutes = require('./routes/yfinance');
const akshareRoutes = require('./routes/akshare');
const trendradarRoutes = require('./routes/trendradar');
const alphavantageRoutes = require('./routes/alphavantage');
const fmpRoutes = require('./routes/fmp');
const redditRoutes = require('./routes/reddit');
const twitterRoutes = require('./routes/twitter');
const youtubeRoutes = require('./routes/youtube');
const hnGithubRoutes = require('./routes/hackernews-github');
const globalMarketsRoutes = require('./routes/globalmarkets');
const archetypeRoutes = require('./routes/archetype');

// API Routes
app.use('/api/sec-edgar', secEdgarRoutes);
app.use('/api/finnhub', finnhubRoutes);
app.use('/api/yfinance', yfinanceRoutes);
app.use('/api/akshare', akshareRoutes);
app.use('/api/trendradar', trendradarRoutes);
app.use('/api/alphavantage', alphavantageRoutes);
app.use('/api/fmp', fmpRoutes);
app.use('/api/reddit', redditRoutes);
app.use('/api/twitter', twitterRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/hn-github', hnGithubRoutes);
app.use('/api/globalmarkets', globalMarketsRoutes);
app.use('/api/archetype', archetypeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Data Sources Dashboard API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
