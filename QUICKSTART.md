# 🚀 Quick Start Guide

Get the Data Sources Dashboard running in 5 minutes!

## Step 1: Navigate to Project

```bash
cd /Users/oicit/Documents/alphaguru/data-sources-dashboard
```

## Step 2: Install Dependencies

### Option A: Use the install script (Recommended)

```bash
./install.sh
```

### Option B: Manual installation

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 3: Start the Application

### Option A: Use the start script (Recommended)

```bash
./start.sh
```

### Option B: Using npm scripts

```bash
npm run dev
```

### Option C: Manual (two separate terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Step 4: Open in Browser

The frontend will automatically open at:
```
http://localhost:3000
```

Backend API is running at:
```
http://localhost:5000
```

## Step 5: Try the Demos!

### 1. SEC EDGAR (No API key required)
- Click on "📊 SEC EDGAR" tab
- Enter: **AAPL**
- Select: **10-K**
- Click: **Fetch Filings**
- View results and export to JSON/CSV

### 2. Yahoo Finance (No API key required)
- Click on "💹 Yahoo Finance" tab
- Enter: **TSLA**
- Select: **Real-time Quote**
- Click: **Fetch Data**
- See live stock price data

### 3. Finnhub (Requires free API key)
- Visit https://finnhub.io and sign up (free)
- Get your API key
- Click on "📈 Finnhub" tab
- Enter your API key in the form
- Enter: **AAPL**
- Select: **Stock Quote**
- Click: **Fetch Data**

### 4. TrendRadar (No API key required)
- Click on "📰 TrendRadar" tab
- Select platforms: **Baidu**, **Zhihu**, **Toutiao**
- Click: **Fetch Trends**
- See trending topics from China

## Export Your Data

After fetching any data:
1. Click **"Export JSON"** for raw data structure
2. Click **"Export CSV"** for spreadsheet format (where available)

## Troubleshooting

### Port 3000 already in use?

```bash
lsof -i :3000
kill -9 <PID>
```

### Port 5000 already in use?

```bash
lsof -i :5000
kill -9 <PID>
```

### Can't connect to backend?

Make sure both servers are running. Check:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Data Sources Dashboard API is running"}`

### Installation fails?

Try cleaning npm cache and reinstalling:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json
./install.sh
```

### API errors?

- **SEC EDGAR**: Rate limit is 10 requests/second max
- **Finnhub**: Free tier is 60 calls/minute, 30 calls/second
- **Yahoo Finance**: No strict rate limits but be respectful
- **TrendRadar**: Depends on newsnow API availability

## Next Steps

- Read the full [README.md](README.md) for comprehensive documentation
- Check [DATA_SOURCES_SUMMARY.md](../DATA_SOURCES_SUMMARY.md) for detailed API info
- Customize the dashboard for your specific needs
- Add more data sources by following the pattern in existing tabs

## Need Help?

- Check existing GitHub issues
- Read the troubleshooting section in README.md
- Open a new issue with error logs

---

Happy exploring! 📊📈💹
