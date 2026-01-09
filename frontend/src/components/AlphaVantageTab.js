import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function AlphaVantageTab() {
  const [apiKey, setApiKey] = useState('');
  const [dataType, setDataType] = useState('GLOBAL_QUOTE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Common parameters
  const [symbol, setSymbol] = useState('IBM');
  const [interval, setInterval] = useState('5min');
  const [timePeriod, setTimePeriod] = useState('10');
  const [seriesType, setSeriesType] = useState('close');

  // Forex parameters
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  // Crypto parameters
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoMarket, setCryptoMarket] = useState('USD');

  // Commodity parameters
  const [commodityType, setCommodityType] = useState('WTI');

  // Economic indicator parameters
  const [economicIndicator, setEconomicIndicator] = useState('REAL_GDP');

  // Technical indicator parameters
  const [technicalIndicator, setTechnicalIndicator] = useState('SMA');

  // News parameters
  const [newsTickers, setNewsTickers] = useState('');
  const [newsTopics, setNewsTopics] = useState('');

  // Search parameters
  const [searchKeywords, setSearchKeywords] = useState('');

  // Options parameters
  const [optionsSymbol, setOptionsSymbol] = useState('IBM');
  const [optionsDate, setOptionsDate] = useState('');

  // Analytics parameters
  const [analyticsSymbol, setAnalyticsSymbol] = useState('IBM');
  const [analyticsRange, setAnalyticsRange] = useState('1month');
  const [analyticsInterval, setAnalyticsInterval] = useState('DAILY');
  const [analyticsOhlc, setAnalyticsOhlc] = useState('close');
  const [analyticsWindowSize, setAnalyticsWindowSize] = useState('10');
  const [analyticsCalculations, setAnalyticsCalculations] = useState('MEAN,STDDEV');

  // Earnings call transcript parameters
  const [earningsSymbol, setEarningsSymbol] = useState('IBM');
  const [earningsYear, setEarningsYear] = useState('');
  const [earningsQuarter, setEarningsQuarter] = useState('');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('alphavantage_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('alphavantage_api_key', newKey);
  };

  // Fetch data function with routing logic
  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your Alpha Vantage API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let endpoint = '';
      let data = { apikey: apiKey };

      // Route based on data type
      switch (dataType) {
        // Core Stock APIs
        case 'TIME_SERIES_INTRADAY':
          endpoint = 'stock-intraday';
          data = { ...data, symbol, interval };
          break;
        case 'TIME_SERIES_DAILY':
          endpoint = 'stock-timeseries';
          data = { ...data, symbol, interval: 'daily' };
          break;
        case 'TIME_SERIES_DAILY_ADJUSTED':
          endpoint = 'stock-daily-adjusted';
          data = { ...data, symbol };
          break;
        case 'TIME_SERIES_WEEKLY':
          endpoint = 'stock-timeseries';
          data = { ...data, symbol, interval: 'weekly' };
          break;
        case 'TIME_SERIES_WEEKLY_ADJUSTED':
          endpoint = 'stock-adjusted';
          data = { ...data, symbol, interval: 'weekly' };
          break;
        case 'TIME_SERIES_MONTHLY':
          endpoint = 'stock-timeseries';
          data = { ...data, symbol, interval: 'monthly' };
          break;
        case 'TIME_SERIES_MONTHLY_ADJUSTED':
          endpoint = 'stock-adjusted';
          data = { ...data, symbol, interval: 'monthly' };
          break;
        case 'GLOBAL_QUOTE':
          endpoint = 'stock-quote';
          data = { ...data, symbol };
          break;
        case 'REALTIME_BULK_QUOTES':
          endpoint = 'bulk-quotes';
          data = { ...data, symbol };
          break;
        case 'SYMBOL_SEARCH':
          endpoint = 'symbol-search';
          data = { ...data, keywords: searchKeywords };
          break;
        case 'MARKET_STATUS':
          endpoint = 'market-status';
          break;

        // Alpha Intelligence
        case 'NEWS_SENTIMENT':
          endpoint = 'news-sentiment';
          data = { ...data, tickers: newsTickers || undefined, topics: newsTopics || undefined };
          break;
        case 'TOP_GAINERS_LOSERS':
          endpoint = 'top-gainers-losers';
          break;
        case 'INSIDER_TRANSACTIONS':
          endpoint = 'insider-transactions';
          data = { ...data, symbol };
          break;
        case 'ANALYTICS_FIXED_WINDOW':
          endpoint = 'analytics-fixed-window';
          data = {
            ...data,
            symbol: analyticsSymbol,
            RANGE: analyticsRange,
            INTERVAL: analyticsInterval,
            OHLC: analyticsOhlc,
            CALCULATIONS: analyticsCalculations
          };
          break;
        case 'ANALYTICS_SLIDING_WINDOW':
          endpoint = 'analytics-sliding-window';
          data = {
            ...data,
            symbol: analyticsSymbol,
            RANGE: analyticsRange,
            INTERVAL: analyticsInterval,
            OHLC: analyticsOhlc,
            WINDOW_SIZE: analyticsWindowSize,
            CALCULATIONS: analyticsCalculations
          };
          break;
        case 'EARNINGS_CALL_TRANSCRIPT':
          endpoint = 'earnings-call-transcript';
          data = { ...data, symbol: earningsSymbol, year: earningsYear, quarter: earningsQuarter };
          break;
        case 'LISTING_STATUS':
          endpoint = 'listing-status';
          break;

        // Fundamental Data
        case 'OVERVIEW':
          endpoint = 'company-overview';
          data = { ...data, symbol };
          break;
        case 'ETF_PROFILE':
          endpoint = 'etf-profile';
          data = { ...data, symbol };
          break;
        case 'DIVIDENDS':
          endpoint = 'dividends';
          data = { ...data, symbol };
          break;
        case 'SPLITS':
          endpoint = 'splits';
          data = { ...data, symbol };
          break;
        case 'INCOME_STATEMENT':
          endpoint = 'income-statement';
          data = { ...data, symbol };
          break;
        case 'BALANCE_SHEET':
          endpoint = 'balance-sheet';
          data = { ...data, symbol };
          break;
        case 'CASH_FLOW':
          endpoint = 'cash-flow';
          data = { ...data, symbol };
          break;
        case 'SHARES_OUTSTANDING':
          endpoint = 'shares-outstanding';
          data = { ...data, symbol };
          break;
        case 'EARNINGS':
          endpoint = 'earnings';
          data = { ...data, symbol };
          break;
        case 'EARNINGS_ESTIMATES':
          endpoint = 'earnings-estimates';
          data = { ...data, symbol };
          break;
        case 'EARNINGS_CALENDAR':
          endpoint = 'earnings-calendar';
          data = { ...data, symbol: symbol || undefined };
          break;
        case 'IPO_CALENDAR':
          endpoint = 'ipo-calendar';
          break;

        // Options Data
        case 'REALTIME_OPTIONS':
          endpoint = 'options-realtime';
          data = { ...data, symbol: optionsSymbol };
          break;
        case 'HISTORICAL_OPTIONS':
          endpoint = 'options-historical';
          data = { ...data, symbol: optionsSymbol, date: optionsDate };
          break;

        // Forex
        case 'FX_INTRADAY':
          endpoint = 'forex-intraday';
          data = { ...data, from_currency: fromCurrency, to_currency: toCurrency, interval };
          break;
        case 'FX_DAILY':
          endpoint = 'forex';
          data = { ...data, from_currency: fromCurrency, to_currency: toCurrency, interval: 'daily' };
          break;
        case 'FX_WEEKLY':
          endpoint = 'forex';
          data = { ...data, from_currency: fromCurrency, to_currency: toCurrency, interval: 'weekly' };
          break;
        case 'FX_MONTHLY':
          endpoint = 'forex';
          data = { ...data, from_currency: fromCurrency, to_currency: toCurrency, interval: 'monthly' };
          break;
        case 'CURRENCY_EXCHANGE_RATE':
          endpoint = 'currency-exchange-rate';
          data = { ...data, from_currency: fromCurrency, to_currency: toCurrency };
          break;

        // Digital & Crypto Currencies
        case 'CRYPTO_INTRADAY':
          endpoint = 'crypto-intraday';
          data = { ...data, symbol: cryptoSymbol, market: cryptoMarket, interval };
          break;
        case 'DIGITAL_CURRENCY_DAILY':
          endpoint = 'crypto';
          data = { ...data, symbol: cryptoSymbol, market: cryptoMarket, interval: 'daily' };
          break;
        case 'DIGITAL_CURRENCY_WEEKLY':
          endpoint = 'crypto';
          data = { ...data, symbol: cryptoSymbol, market: cryptoMarket, interval: 'weekly' };
          break;
        case 'DIGITAL_CURRENCY_MONTHLY':
          endpoint = 'crypto';
          data = { ...data, symbol: cryptoSymbol, market: cryptoMarket, interval: 'monthly' };
          break;

        // Commodities
        case 'WTI':
        case 'BRENT':
        case 'NATURAL_GAS':
        case 'COPPER':
        case 'ALUMINUM':
        case 'WHEAT':
        case 'CORN':
        case 'COTTON':
        case 'SUGAR':
        case 'COFFEE':
        case 'ALL_COMMODITIES':
          endpoint = 'commodity';
          data = { ...data, commodity: commodityType, interval };
          break;

        // Economic Indicators
        case 'REAL_GDP':
        case 'REAL_GDP_PER_CAPITA':
        case 'TREASURY_YIELD':
        case 'FEDERAL_FUNDS_RATE':
        case 'CPI':
        case 'INFLATION':
        case 'RETAIL_SALES':
        case 'DURABLES':
        case 'UNEMPLOYMENT':
        case 'NONFARM_PAYROLL':
          endpoint = 'economic-indicator';
          data = { ...data, indicator: economicIndicator };
          break;

        // Technical Indicators (all 53)
        case 'SMA':
        case 'EMA':
        case 'WMA':
        case 'DEMA':
        case 'TEMA':
        case 'TRIMA':
        case 'KAMA':
        case 'MAMA':
        case 'VWAP':
        case 'T3':
        case 'MACD':
        case 'MACDEXT':
        case 'STOCH':
        case 'STOCHF':
        case 'RSI':
        case 'STOCHRSI':
        case 'WILLR':
        case 'ADX':
        case 'ADXR':
        case 'APO':
        case 'PPO':
        case 'MOM':
        case 'BOP':
        case 'CCI':
        case 'CMO':
        case 'ROC':
        case 'ROCR':
        case 'AROON':
        case 'AROONOSC':
        case 'MFI':
        case 'TRIX':
        case 'ULTOSC':
        case 'DX':
        case 'MINUS_DI':
        case 'PLUS_DI':
        case 'MINUS_DM':
        case 'PLUS_DM':
        case 'BBANDS':
        case 'MIDPOINT':
        case 'MIDPRICE':
        case 'SAR':
        case 'TRANGE':
        case 'ATR':
        case 'NATR':
        case 'AD':
        case 'ADOSC':
        case 'OBV':
        case 'HT_TRENDLINE':
        case 'HT_SINE':
        case 'HT_TRENDMODE':
        case 'HT_DCPERIOD':
        case 'HT_DCPHASE':
        case 'HT_PHASOR':
          endpoint = 'technical-indicator';
          data = {
            ...data,
            symbol,
            indicator: technicalIndicator,
            interval,
            time_period: timePeriod,
            series_type: seriesType
          };
          break;

        default:
          setError('Unknown data type selected');
          setLoading(false);
          return;
      }

      const response = await axios.post(`/api/alphavantage/${endpoint}`, data);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (results) {
      exportToJSON(results.data, `alphavantage_${dataType}_${Date.now()}.json`);
    }
  };

  const handleExportCSV = () => {
    if (results && results.data) {
      const dataArray = [];
      if (results.data['Global Quote']) {
        dataArray.push(results.data['Global Quote']);
      } else if (results.data.bestMatches) {
        dataArray.push(...results.data.bestMatches);
      }
      if (dataArray.length > 0) {
        exportToCSV(dataArray, `alphavantage_${dataType}_${Date.now()}.csv`);
      }
    }
  };

  // Render conditional form fields based on selected data type
  const renderConditionalFields = () => {
    // Core Stock APIs requiring symbol
    if (['TIME_SERIES_INTRADAY', 'TIME_SERIES_DAILY', 'TIME_SERIES_DAILY_ADJUSTED',
         'TIME_SERIES_WEEKLY', 'TIME_SERIES_WEEKLY_ADJUSTED', 'TIME_SERIES_MONTHLY',
         'TIME_SERIES_MONTHLY_ADJUSTED', 'GLOBAL_QUOTE', 'REALTIME_BULK_QUOTES'].includes(dataType)) {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM, AAPL"
            />
          </div>
          {dataType === 'TIME_SERIES_INTRADAY' && (
            <div className="form-group">
              <label>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                <option value="1min">1 min</option>
                <option value="5min">5 min</option>
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="60min">60 min</option>
              </select>
            </div>
          )}
        </>
      );
    }

    // Symbol search
    if (dataType === 'SYMBOL_SEARCH') {
      return (
        <div className="form-group">
          <label>Search Keywords</label>
          <input
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="e.g., Microsoft, AAPL"
          />
        </div>
      );
    }

    // Market status - no parameters needed
    if (dataType === 'MARKET_STATUS') {
      return <p style={{ color: '#718096' }}>View current market status for global trading venues</p>;
    }

    // Alpha Intelligence
    if (dataType === 'NEWS_SENTIMENT') {
      return (
        <>
          <div className="form-group">
            <label>Tickers (Optional, comma-separated)</label>
            <input
              type="text"
              value={newsTickers}
              onChange={(e) => setNewsTickers(e.target.value)}
              placeholder="e.g., AAPL,TSLA"
            />
          </div>
          <div className="form-group">
            <label>Topics (Optional)</label>
            <input
              type="text"
              value={newsTopics}
              onChange={(e) => setNewsTopics(e.target.value)}
              placeholder="e.g., technology,finance"
            />
          </div>
        </>
      );
    }

    if (dataType === 'TOP_GAINERS_LOSERS') {
      return <p style={{ color: '#718096' }}>Most actively traded stocks with top gainers and losers</p>;
    }

    if (dataType === 'INSIDER_TRANSACTIONS') {
      return (
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      );
    }

    if (dataType === 'ANALYTICS_FIXED_WINDOW') {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={analyticsSymbol}
              onChange={(e) => setAnalyticsSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM"
            />
          </div>
          <div className="form-group">
            <label>Range</label>
            <select value={analyticsRange} onChange={(e) => setAnalyticsRange(e.target.value)}>
              <option value="1month">1 Month</option>
              <option value="3month">3 Months</option>
              <option value="6month">6 Months</option>
              <option value="1year">1 Year</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interval</label>
            <select value={analyticsInterval} onChange={(e) => setAnalyticsInterval(e.target.value)}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>OHLC</label>
            <select value={analyticsOhlc} onChange={(e) => setAnalyticsOhlc(e.target.value)}>
              <option value="close">Close</option>
              <option value="open">Open</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Calculations</label>
            <input
              type="text"
              value={analyticsCalculations}
              onChange={(e) => setAnalyticsCalculations(e.target.value)}
              placeholder="e.g., MEAN,STDDEV,MIN,MAX"
            />
          </div>
        </>
      );
    }

    if (dataType === 'ANALYTICS_SLIDING_WINDOW') {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={analyticsSymbol}
              onChange={(e) => setAnalyticsSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM"
            />
          </div>
          <div className="form-group">
            <label>Range</label>
            <select value={analyticsRange} onChange={(e) => setAnalyticsRange(e.target.value)}>
              <option value="1month">1 Month</option>
              <option value="3month">3 Months</option>
              <option value="6month">6 Months</option>
              <option value="1year">1 Year</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interval</label>
            <select value={analyticsInterval} onChange={(e) => setAnalyticsInterval(e.target.value)}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>OHLC</label>
            <select value={analyticsOhlc} onChange={(e) => setAnalyticsOhlc(e.target.value)}>
              <option value="close">Close</option>
              <option value="open">Open</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Window Size</label>
            <input
              type="number"
              value={analyticsWindowSize}
              onChange={(e) => setAnalyticsWindowSize(e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
          <div className="form-group">
            <label>Calculations</label>
            <input
              type="text"
              value={analyticsCalculations}
              onChange={(e) => setAnalyticsCalculations(e.target.value)}
              placeholder="e.g., MEAN,STDDEV,MIN,MAX"
            />
          </div>
        </>
      );
    }

    if (dataType === 'EARNINGS_CALL_TRANSCRIPT') {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={earningsSymbol}
              onChange={(e) => setEarningsSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM"
            />
          </div>
          <div className="form-group">
            <label>Year (Optional)</label>
            <input
              type="text"
              value={earningsYear}
              onChange={(e) => setEarningsYear(e.target.value)}
              placeholder="e.g., 2024"
            />
          </div>
          <div className="form-group">
            <label>Quarter (Optional)</label>
            <select value={earningsQuarter} onChange={(e) => setEarningsQuarter(e.target.value)}>
              <option value="">Select Quarter</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
        </>
      );
    }

    if (dataType === 'LISTING_STATUS') {
      return <p style={{ color: '#718096' }}>List of active and delisted US stocks and ETFs</p>;
    }

    // Fundamental Data
    if (['OVERVIEW', 'ETF_PROFILE', 'DIVIDENDS', 'SPLITS', 'INCOME_STATEMENT',
         'BALANCE_SHEET', 'CASH_FLOW', 'SHARES_OUTSTANDING', 'EARNINGS',
         'EARNINGS_ESTIMATES'].includes(dataType)) {
      return (
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      );
    }

    if (dataType === 'EARNINGS_CALENDAR') {
      return (
        <div className="form-group">
          <label>Stock Symbol (Optional)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Leave empty for all"
          />
        </div>
      );
    }

    if (dataType === 'IPO_CALENDAR') {
      return <p style={{ color: '#718096' }}>Upcoming and recent IPOs</p>;
    }

    // Options Data
    if (dataType === 'REALTIME_OPTIONS') {
      return (
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            type="text"
            value={optionsSymbol}
            onChange={(e) => setOptionsSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., IBM"
          />
        </div>
      );
    }

    if (dataType === 'HISTORICAL_OPTIONS') {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={optionsSymbol}
              onChange={(e) => setOptionsSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM"
            />
          </div>
          <div className="form-group">
            <label>Date (YYYY-MM-DD)</label>
            <input
              type="date"
              value={optionsDate}
              onChange={(e) => setOptionsDate(e.target.value)}
            />
          </div>
        </>
      );
    }

    // Forex
    if (['FX_INTRADAY', 'FX_DAILY', 'FX_WEEKLY', 'FX_MONTHLY', 'CURRENCY_EXCHANGE_RATE'].includes(dataType)) {
      return (
        <>
          <div className="form-group">
            <label>From Currency</label>
            <input
              type="text"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
              placeholder="e.g., USD"
              maxLength="3"
            />
          </div>
          <div className="form-group">
            <label>To Currency</label>
            <input
              type="text"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
              placeholder="e.g., EUR"
              maxLength="3"
            />
          </div>
          {dataType === 'FX_INTRADAY' && (
            <div className="form-group">
              <label>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                <option value="1min">1 min</option>
                <option value="5min">5 min</option>
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="60min">60 min</option>
              </select>
            </div>
          )}
        </>
      );
    }

    // Digital & Crypto Currencies
    if (['CRYPTO_INTRADAY', 'DIGITAL_CURRENCY_DAILY', 'DIGITAL_CURRENCY_WEEKLY',
         'DIGITAL_CURRENCY_MONTHLY'].includes(dataType)) {
      return (
        <>
          <div className="form-group">
            <label>Crypto Symbol</label>
            <input
              type="text"
              value={cryptoSymbol}
              onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., BTC, ETH"
            />
          </div>
          <div className="form-group">
            <label>Market</label>
            <input
              type="text"
              value={cryptoMarket}
              onChange={(e) => setCryptoMarket(e.target.value.toUpperCase())}
              placeholder="e.g., USD"
            />
          </div>
          {dataType === 'CRYPTO_INTRADAY' && (
            <div className="form-group">
              <label>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                <option value="1min">1 min</option>
                <option value="5min">5 min</option>
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="60min">60 min</option>
              </select>
            </div>
          )}
        </>
      );
    }

    // Commodities
    if (['WTI', 'BRENT', 'NATURAL_GAS', 'COPPER', 'ALUMINUM', 'WHEAT', 'CORN',
         'COTTON', 'SUGAR', 'COFFEE', 'ALL_COMMODITIES'].includes(dataType)) {
      return (
        <>
          <div className="form-group">
            <label>Commodity</label>
            <select value={commodityType} onChange={(e) => setCommodityType(e.target.value)}>
              <option value="WTI">Crude Oil (WTI)</option>
              <option value="BRENT">Crude Oil (Brent)</option>
              <option value="NATURAL_GAS">Natural Gas</option>
              <option value="COPPER">Copper</option>
              <option value="ALUMINUM">Aluminum</option>
              <option value="WHEAT">Wheat</option>
              <option value="CORN">Corn</option>
              <option value="COTTON">Cotton</option>
              <option value="SUGAR">Sugar</option>
              <option value="COFFEE">Coffee</option>
              <option value="ALL_COMMODITIES">Global Commodities Index</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interval</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </>
      );
    }

    // Economic Indicators
    if (['REAL_GDP', 'REAL_GDP_PER_CAPITA', 'TREASURY_YIELD', 'FEDERAL_FUNDS_RATE',
         'CPI', 'INFLATION', 'RETAIL_SALES', 'DURABLES', 'UNEMPLOYMENT',
         'NONFARM_PAYROLL'].includes(dataType)) {
      return (
        <div className="form-group">
          <label>Economic Indicator</label>
          <select value={economicIndicator} onChange={(e) => setEconomicIndicator(e.target.value)}>
            <option value="REAL_GDP">Real GDP</option>
            <option value="REAL_GDP_PER_CAPITA">Real GDP Per Capita</option>
            <option value="TREASURY_YIELD">Treasury Yield</option>
            <option value="FEDERAL_FUNDS_RATE">Federal Funds Rate</option>
            <option value="CPI">Consumer Price Index (CPI)</option>
            <option value="INFLATION">Inflation Rate</option>
            <option value="RETAIL_SALES">Retail Sales</option>
            <option value="DURABLES">Durable Goods Orders</option>
            <option value="UNEMPLOYMENT">Unemployment Rate</option>
            <option value="NONFARM_PAYROLL">Nonfarm Payroll</option>
          </select>
        </div>
      );
    }

    // Technical Indicators (all 53)
    if (['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'VWAP', 'T3',
         'MACD', 'MACDEXT', 'STOCH', 'STOCHF', 'RSI', 'STOCHRSI', 'WILLR', 'ADX',
         'ADXR', 'APO', 'PPO', 'MOM', 'BOP', 'CCI', 'CMO', 'ROC', 'ROCR', 'AROON',
         'AROONOSC', 'MFI', 'TRIX', 'ULTOSC', 'DX', 'MINUS_DI', 'PLUS_DI', 'MINUS_DM',
         'PLUS_DM', 'BBANDS', 'MIDPOINT', 'MIDPRICE', 'SAR', 'TRANGE', 'ATR', 'NATR',
         'AD', 'ADOSC', 'OBV', 'HT_TRENDLINE', 'HT_SINE', 'HT_TRENDMODE', 'HT_DCPERIOD',
         'HT_DCPHASE', 'HT_PHASOR'].includes(dataType)) {
      return (
        <>
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., IBM"
            />
          </div>
          <div className="form-group">
            <label>Technical Indicator</label>
            <select value={technicalIndicator} onChange={(e) => setTechnicalIndicator(e.target.value)}>
              <optgroup label="Moving Averages">
                <option value="SMA">SMA - Simple Moving Average</option>
                <option value="EMA">EMA - Exponential Moving Average</option>
                <option value="WMA">WMA - Weighted Moving Average</option>
                <option value="DEMA">DEMA - Double Exponential MA</option>
                <option value="TEMA">TEMA - Triple Exponential MA</option>
                <option value="TRIMA">TRIMA - Triangular MA</option>
                <option value="KAMA">KAMA - Kaufman Adaptive MA</option>
                <option value="MAMA">MAMA - MESA Adaptive MA</option>
                <option value="VWAP">VWAP - Volume Weighted Average Price</option>
                <option value="T3">T3 - Triple Exponential MA</option>
              </optgroup>
              <optgroup label="Momentum Indicators">
                <option value="MACD">MACD</option>
                <option value="MACDEXT">MACDEXT - MACD with Controllable MA</option>
                <option value="STOCH">Stochastic Oscillator</option>
                <option value="STOCHF">STOCHF - Stochastic Fast</option>
                <option value="RSI">RSI - Relative Strength Index</option>
                <option value="STOCHRSI">STOCHRSI - Stochastic RSI</option>
                <option value="WILLR">Williams %R</option>
                <option value="ADX">ADX - Average Directional Index</option>
                <option value="ADXR">ADXR - Average Directional Rating</option>
                <option value="APO">APO - Absolute Price Oscillator</option>
                <option value="PPO">PPO - Percentage Price Oscillator</option>
                <option value="MOM">Momentum</option>
                <option value="BOP">BOP - Balance of Power</option>
                <option value="CCI">CCI - Commodity Channel Index</option>
                <option value="CMO">CMO - Chande Momentum Oscillator</option>
                <option value="ROC">ROC - Rate of Change</option>
                <option value="ROCR">ROCR - Rate of Change Ratio</option>
                <option value="AROON">AROON</option>
                <option value="AROONOSC">AROON Oscillator</option>
                <option value="MFI">MFI - Money Flow Index</option>
                <option value="TRIX">TRIX</option>
                <option value="ULTOSC">Ultimate Oscillator</option>
                <option value="DX">DX - Directional Movement Index</option>
                <option value="MINUS_DI">Minus Directional Indicator</option>
                <option value="PLUS_DI">Plus Directional Indicator</option>
                <option value="MINUS_DM">Minus Directional Movement</option>
                <option value="PLUS_DM">Plus Directional Movement</option>
              </optgroup>
              <optgroup label="Volume Indicators">
                <option value="AD">AD - Chaikin A/D Line</option>
                <option value="ADOSC">ADOSC - Chaikin A/D Oscillator</option>
                <option value="OBV">OBV - On Balance Volume</option>
              </optgroup>
              <optgroup label="Volatility Indicators">
                <option value="BBANDS">Bollinger Bands</option>
                <option value="MIDPOINT">Midpoint</option>
                <option value="MIDPRICE">Midprice</option>
                <option value="SAR">SAR - Parabolic SAR</option>
                <option value="TRANGE">True Range</option>
                <option value="ATR">ATR - Average True Range</option>
                <option value="NATR">NATR - Normalized ATR</option>
              </optgroup>
              <optgroup label="Cycle Indicators">
                <option value="HT_TRENDLINE">Hilbert Transform - Trendline</option>
                <option value="HT_SINE">Hilbert Transform - Sine Wave</option>
                <option value="HT_TRENDMODE">Hilbert Transform - Trend Mode</option>
                <option value="HT_DCPERIOD">Hilbert Transform - Dominant Cycle Period</option>
                <option value="HT_DCPHASE">Hilbert Transform - Dominant Cycle Phase</option>
                <option value="HT_PHASOR">Hilbert Transform - Phasor Components</option>
              </optgroup>
            </select>
          </div>
          <div className="form-group">
            <label>Interval</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="1min">1 min</option>
              <option value="5min">5 min</option>
              <option value="15min">15 min</option>
              <option value="30min">30 min</option>
              <option value="60min">60 min</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Period</label>
            <input
              type="number"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
          <div className="form-group">
            <label>Series Type</label>
            <select value={seriesType} onChange={(e) => setSeriesType(e.target.value)}>
              <option value="close">Close</option>
              <option value="open">Open</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (!results || !results.data) return null;

    return (
      <div className="results-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Results</h3>
          <div className="button-group">
            <button onClick={handleExportJSON} className="export-button">
              Export JSON
            </button>
            <button onClick={handleExportCSV} className="export-button">
              Export CSV
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1rem',
          borderRadius: '8px',
          maxHeight: '500px',
          overflow: 'auto'
        }}>
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: '0.85rem'
          }}>
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Alpha Vantage API - All 115 Functions</h2>
        <p>Comprehensive stock market, fundamental, forex, crypto, commodities, and economic data</p>
      </div>

      {/* API Key Input */}
      <div className="demo-section">
        <h3>API Configuration</h3>
        <div className="form-group">
          <label>Alpha Vantage API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Alpha Vantage API key"
          />
          <small style={{ color: '#718096', fontSize: '0.85rem' }}>
            Get your free API key at{' '}
            <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer">
              alphavantage.co/support/#api-key
            </a>
          </small>
        </div>
      </div>

      {/* Data Type Selector */}
      <div className="demo-section">
        <h3>Select API Function</h3>
        <div className="form-group">
          <label>Data Type</label>
          <select
            value={dataType}
            onChange={(e) => {
              setDataType(e.target.value);
              setResults(null);
              setError(null);
            }}
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem' }}
          >
            <optgroup label="Core Stock APIs (11)">
              <option value="TIME_SERIES_INTRADAY">TIME_SERIES_INTRADAY</option>
              <option value="TIME_SERIES_DAILY">TIME_SERIES_DAILY</option>
              <option value="TIME_SERIES_DAILY_ADJUSTED">TIME_SERIES_DAILY_ADJUSTED</option>
              <option value="TIME_SERIES_WEEKLY">TIME_SERIES_WEEKLY</option>
              <option value="TIME_SERIES_WEEKLY_ADJUSTED">TIME_SERIES_WEEKLY_ADJUSTED</option>
              <option value="TIME_SERIES_MONTHLY">TIME_SERIES_MONTHLY</option>
              <option value="TIME_SERIES_MONTHLY_ADJUSTED">TIME_SERIES_MONTHLY_ADJUSTED</option>
              <option value="GLOBAL_QUOTE">GLOBAL_QUOTE</option>
              <option value="REALTIME_BULK_QUOTES">REALTIME_BULK_QUOTES</option>
              <option value="SYMBOL_SEARCH">SYMBOL_SEARCH</option>
              <option value="MARKET_STATUS">MARKET_STATUS</option>
            </optgroup>

            <optgroup label="Alpha Intelligence (7)">
              <option value="NEWS_SENTIMENT">NEWS_SENTIMENT</option>
              <option value="TOP_GAINERS_LOSERS">TOP_GAINERS_LOSERS</option>
              <option value="INSIDER_TRANSACTIONS">INSIDER_TRANSACTIONS</option>
              <option value="ANALYTICS_FIXED_WINDOW">ANALYTICS_FIXED_WINDOW</option>
              <option value="ANALYTICS_SLIDING_WINDOW">ANALYTICS_SLIDING_WINDOW</option>
              <option value="EARNINGS_CALL_TRANSCRIPT">EARNINGS_CALL_TRANSCRIPT</option>
              <option value="LISTING_STATUS">LISTING_STATUS</option>
            </optgroup>

            <optgroup label="Fundamental Data (12)">
              <option value="OVERVIEW">OVERVIEW</option>
              <option value="ETF_PROFILE">ETF_PROFILE</option>
              <option value="DIVIDENDS">DIVIDENDS</option>
              <option value="SPLITS">SPLITS</option>
              <option value="INCOME_STATEMENT">INCOME_STATEMENT</option>
              <option value="BALANCE_SHEET">BALANCE_SHEET</option>
              <option value="CASH_FLOW">CASH_FLOW</option>
              <option value="SHARES_OUTSTANDING">SHARES_OUTSTANDING</option>
              <option value="EARNINGS">EARNINGS</option>
              <option value="EARNINGS_ESTIMATES">EARNINGS_ESTIMATES</option>
              <option value="EARNINGS_CALENDAR">EARNINGS_CALENDAR</option>
              <option value="IPO_CALENDAR">IPO_CALENDAR</option>
            </optgroup>

            <optgroup label="Options Data (2)">
              <option value="REALTIME_OPTIONS">REALTIME_OPTIONS</option>
              <option value="HISTORICAL_OPTIONS">HISTORICAL_OPTIONS</option>
            </optgroup>

            <optgroup label="Forex (5)">
              <option value="FX_INTRADAY">FX_INTRADAY</option>
              <option value="FX_DAILY">FX_DAILY</option>
              <option value="FX_WEEKLY">FX_WEEKLY</option>
              <option value="FX_MONTHLY">FX_MONTHLY</option>
              <option value="CURRENCY_EXCHANGE_RATE">CURRENCY_EXCHANGE_RATE</option>
            </optgroup>

            <optgroup label="Digital & Crypto Currencies (4)">
              <option value="CRYPTO_INTRADAY">CRYPTO_INTRADAY</option>
              <option value="DIGITAL_CURRENCY_DAILY">DIGITAL_CURRENCY_DAILY</option>
              <option value="DIGITAL_CURRENCY_WEEKLY">DIGITAL_CURRENCY_WEEKLY</option>
              <option value="DIGITAL_CURRENCY_MONTHLY">DIGITAL_CURRENCY_MONTHLY</option>
            </optgroup>

            <optgroup label="Commodities (11)">
              <option value="WTI">WTI</option>
              <option value="BRENT">BRENT</option>
              <option value="NATURAL_GAS">NATURAL_GAS</option>
              <option value="COPPER">COPPER</option>
              <option value="ALUMINUM">ALUMINUM</option>
              <option value="WHEAT">WHEAT</option>
              <option value="CORN">CORN</option>
              <option value="COTTON">COTTON</option>
              <option value="SUGAR">SUGAR</option>
              <option value="COFFEE">COFFEE</option>
              <option value="ALL_COMMODITIES">ALL_COMMODITIES</option>
            </optgroup>

            <optgroup label="Economic Indicators (10)">
              <option value="REAL_GDP">REAL_GDP</option>
              <option value="REAL_GDP_PER_CAPITA">REAL_GDP_PER_CAPITA</option>
              <option value="TREASURY_YIELD">TREASURY_YIELD</option>
              <option value="FEDERAL_FUNDS_RATE">FEDERAL_FUNDS_RATE</option>
              <option value="CPI">CPI</option>
              <option value="INFLATION">INFLATION</option>
              <option value="RETAIL_SALES">RETAIL_SALES</option>
              <option value="DURABLES">DURABLES</option>
              <option value="UNEMPLOYMENT">UNEMPLOYMENT</option>
              <option value="NONFARM_PAYROLL">NONFARM_PAYROLL</option>
            </optgroup>

            <optgroup label="Technical Indicators (53)">
              <option value="SMA">SMA</option>
              <option value="EMA">EMA</option>
              <option value="WMA">WMA</option>
              <option value="DEMA">DEMA</option>
              <option value="TEMA">TEMA</option>
              <option value="TRIMA">TRIMA</option>
              <option value="KAMA">KAMA</option>
              <option value="MAMA">MAMA</option>
              <option value="VWAP">VWAP</option>
              <option value="T3">T3</option>
              <option value="MACD">MACD</option>
              <option value="MACDEXT">MACDEXT</option>
              <option value="STOCH">STOCH</option>
              <option value="STOCHF">STOCHF</option>
              <option value="RSI">RSI</option>
              <option value="STOCHRSI">STOCHRSI</option>
              <option value="WILLR">WILLR</option>
              <option value="ADX">ADX</option>
              <option value="ADXR">ADXR</option>
              <option value="APO">APO</option>
              <option value="PPO">PPO</option>
              <option value="MOM">MOM</option>
              <option value="BOP">BOP</option>
              <option value="CCI">CCI</option>
              <option value="CMO">CMO</option>
              <option value="ROC">ROC</option>
              <option value="ROCR">ROCR</option>
              <option value="AROON">AROON</option>
              <option value="AROONOSC">AROONOSC</option>
              <option value="MFI">MFI</option>
              <option value="TRIX">TRIX</option>
              <option value="ULTOSC">ULTOSC</option>
              <option value="DX">DX</option>
              <option value="MINUS_DI">MINUS_DI</option>
              <option value="PLUS_DI">PLUS_DI</option>
              <option value="MINUS_DM">MINUS_DM</option>
              <option value="PLUS_DM">PLUS_DM</option>
              <option value="BBANDS">BBANDS</option>
              <option value="MIDPOINT">MIDPOINT</option>
              <option value="MIDPRICE">MIDPRICE</option>
              <option value="SAR">SAR</option>
              <option value="TRANGE">TRANGE</option>
              <option value="ATR">ATR</option>
              <option value="NATR">NATR</option>
              <option value="AD">AD</option>
              <option value="ADOSC">ADOSC</option>
              <option value="OBV">OBV</option>
              <option value="HT_TRENDLINE">HT_TRENDLINE</option>
              <option value="HT_SINE">HT_SINE</option>
              <option value="HT_TRENDMODE">HT_TRENDMODE</option>
              <option value="HT_DCPERIOD">HT_DCPERIOD</option>
              <option value="HT_DCPHASE">HT_DCPHASE</option>
              <option value="HT_PHASOR">HT_PHASOR</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <div className="demo-section">
        <h3>Parameters for {dataType}</h3>
        <div className="form-row">
          {renderConditionalFields()}
        </div>
        <div className="button-group">
          <button onClick={fetchData} disabled={loading || !apiKey}>
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="loading">Fetching data from Alpha Vantage...</div>}

      {/* Results */}
      {renderResults()}

      {/* Documentation */}
      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h3>About Alpha Vantage API</h3>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          This interface provides access to all 115 Alpha Vantage API functions organized into 8 categories:
        </p>
        <ul style={{ color: '#718096', lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li><strong>Core Stock APIs (11):</strong> Time series data, quotes, search, and market status</li>
          <li><strong>Alpha Intelligence (7):</strong> News sentiment, gainers/losers, insider trades, analytics, earnings transcripts</li>
          <li><strong>Fundamental Data (12):</strong> Company overview, financials, earnings, dividends, splits, ETF profiles</li>
          <li><strong>Options Data (2):</strong> Real-time and historical options chains</li>
          <li><strong>Forex (5):</strong> Currency exchange rates and time series</li>
          <li><strong>Digital & Crypto Currencies (4):</strong> Cryptocurrency intraday and historical data</li>
          <li><strong>Commodities (11):</strong> Oil, gas, metals, and agricultural commodity prices</li>
          <li><strong>Economic Indicators (10):</strong> GDP, inflation, unemployment, interest rates, and more</li>
          <li><strong>Technical Indicators (53):</strong> Moving averages, momentum, volume, volatility, and cycle indicators</li>
        </ul>
        <p style={{ color: '#718096', lineHeight: '1.6', marginTop: '1rem' }}>
          <strong>Free Tier:</strong> 25 requests per day. For higher limits, visit{' '}
          <a href="https://www.alphavantage.co/premium/" target="_blank" rel="noopener noreferrer">
            alphavantage.co/premium
          </a>
        </p>
      </div>
    </div>
  );
}

export default AlphaVantageTab;
