import React, { useState } from 'react';
import axios from 'axios';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

function FmpTab({ apiKey, onApiKeyChange }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [dataType, setDataType] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Additional parameters
  const [period, setPeriod] = useState('annual');
  const [limit, setLimit] = useState(5);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [filingType, setFilingType] = useState('');

  const dataCategories = [
    {
      label: 'Company Information',
      options: [
        { value: 'profile', label: 'Company Profile' },
        { value: 'quote', label: 'Stock Quote' },
        { value: 'market-cap', label: 'Market Capitalization' },
      ]
    },
    {
      label: 'Financial Statements',
      options: [
        { value: 'income-statement', label: 'Income Statement' },
        { value: 'balance-sheet', label: 'Balance Sheet' },
        { value: 'cash-flow', label: 'Cash Flow Statement' },
        { value: 'ratios', label: 'Financial Ratios' },
        { value: 'key-metrics', label: 'Key Metrics' },
      ]
    },
    {
      label: 'Historical Data',
      options: [
        { value: 'historical-price', label: 'Historical Prices' },
      ]
    },
    {
      label: 'News & Analysis',
      options: [
        { value: 'news', label: 'Company News' },
        { value: 'analyst-estimates', label: 'Analyst Estimates' },
        { value: 'price-target', label: 'Price Targets' },
        { value: 'upgrades-downgrades', label: 'Upgrades & Downgrades' },
        { value: 'earning-surprises', label: 'Earnings Surprises' },
      ]
    },
    {
      label: 'Calendars',
      options: [
        { value: 'earnings-calendar', label: 'Earnings Calendar' },
        { value: 'ipo-calendar', label: 'IPO Calendar' },
        { value: 'dividend-calendar', label: 'Dividend Calendar' },
        { value: 'stock-split-calendar', label: 'Stock Split Calendar' },
        { value: 'economic-calendar', label: 'Economic Calendar' },
      ]
    },
    {
      label: 'Insider & Institutional',
      options: [
        { value: 'insider-trading', label: 'Insider Trading' },
        { value: 'senate-trading', label: 'Senate Trading' },
        { value: 'institutional-holder', label: 'Institutional Holders' },
        { value: 'etf-holder', label: 'ETF Holders' },
      ]
    },
    {
      label: 'SEC Filings',
      options: [
        { value: 'sec-filings', label: 'SEC Filings (8-K, 10-K, 10-Q)' },
      ]
    },
    {
      label: 'Market Data',
      options: [
        { value: 'gainers', label: 'Top Gainers' },
        { value: 'losers', label: 'Top Losers' },
        { value: 'most-active', label: 'Most Active' },
        { value: 'sector-performance', label: 'Sector Performance' },
      ]
    },
    {
      label: 'Valuation',
      options: [
        { value: 'dcf', label: 'DCF Valuation' },
      ]
    }
  ];

  const needsSymbol = () => {
    const noSymbolTypes = ['earnings-calendar', 'ipo-calendar', 'dividend-calendar',
                           'stock-split-calendar', 'economic-calendar', 'gainers',
                           'losers', 'most-active', 'sector-performance'];
    return !noSymbolTypes.includes(dataType);
  };

  const needsPeriod = () => {
    return ['income-statement', 'balance-sheet', 'cash-flow', 'ratios',
            'key-metrics', 'analyst-estimates'].includes(dataType);
  };

  const needsDateRange = () => {
    return ['earnings-calendar', 'ipo-calendar', 'dividend-calendar',
            'stock-split-calendar', 'economic-calendar', 'historical-price'].includes(dataType);
  };

  const needsFilingType = () => {
    return dataType === 'sec-filings';
  };

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your FMP API key');
      return;
    }

    if (needsSymbol() && !symbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const endpoint = `/api/fmp/${dataType}`;
      let requestData = { apiKey };

      if (needsSymbol()) {
        requestData.symbol = symbol;
      }

      if (needsPeriod()) {
        requestData.period = period;
        requestData.limit = limit;
      }

      if (needsDateRange()) {
        requestData.from = fromDate;
        requestData.to = toDate;
      }

      if (needsFilingType() && filingType) {
        requestData.type = filingType;
        requestData.limit = limit;
      }

      if (dataType === 'insider-trading') {
        requestData.limit = 100;
      }

      if (dataType === 'news') {
        requestData.limit = 10;
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
      exportToJSON(data, `fmp_${dataType}_${symbol || 'data'}.json`);
    }
  };

  const handleExportCSV = () => {
    if (data && data.data) {
      exportToCSV(data.data, `fmp_${dataType}_${symbol || 'data'}.csv`);
    }
  };

  const renderData = () => {
    if (!data || !data.data) return null;

    const result = data.data;

    switch (dataType) {
      case 'profile':
        if (!result[0]) return <p>No profile data found</p>;
        const profile = result[0];
        return (
          <div className="result-card">
            <h4>{profile.companyName}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Symbol:</strong></td><td>{profile.symbol}</td></tr>
                <tr><td><strong>Price:</strong></td><td>${profile.price?.toFixed(2)}</td></tr>
                <tr><td><strong>Market Cap:</strong></td><td>${(profile.mktCap / 1000000000).toFixed(2)}B</td></tr>
                <tr><td><strong>Industry:</strong></td><td>{profile.industry}</td></tr>
                <tr><td><strong>Sector:</strong></td><td>{profile.sector}</td></tr>
                <tr><td><strong>CEO:</strong></td><td>{profile.ceo}</td></tr>
                <tr><td><strong>Website:</strong></td><td><a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a></td></tr>
                <tr><td><strong>Description:</strong></td><td>{profile.description}</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'quote':
        if (!result[0]) return <p>No quote data found</p>;
        const quote = result[0];
        return (
          <div className="result-card">
            <h4>{quote.symbol} - Real-Time Quote</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Price:</strong></td><td>${quote.price?.toFixed(2)}</td></tr>
                <tr><td><strong>Change:</strong></td><td style={{color: quote.change >= 0 ? 'green' : 'red'}}>{quote.change?.toFixed(2)}</td></tr>
                <tr><td><strong>Change %:</strong></td><td style={{color: quote.changesPercentage >= 0 ? 'green' : 'red'}}>{quote.changesPercentage?.toFixed(2)}%</td></tr>
                <tr><td><strong>Day High:</strong></td><td>${quote.dayHigh?.toFixed(2)}</td></tr>
                <tr><td><strong>Day Low:</strong></td><td>${quote.dayLow?.toFixed(2)}</td></tr>
                <tr><td><strong>Open:</strong></td><td>${quote.open?.toFixed(2)}</td></tr>
                <tr><td><strong>Previous Close:</strong></td><td>${quote.previousClose?.toFixed(2)}</td></tr>
                <tr><td><strong>Volume:</strong></td><td>{quote.volume?.toLocaleString()}</td></tr>
                <tr><td><strong>Avg Volume:</strong></td><td>{quote.avgVolume?.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'income-statement':
        if (!Array.isArray(result) || result.length === 0) return <p>No income statement data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Gross Profit</th>
                <th>Operating Income</th>
                <th>Net Income</th>
                <th>EPS</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${(item.revenue / 1000000000).toFixed(2)}B</td>
                  <td>${(item.grossProfit / 1000000000).toFixed(2)}B</td>
                  <td>${(item.operatingIncome / 1000000000).toFixed(2)}B</td>
                  <td>${(item.netIncome / 1000000000).toFixed(2)}B</td>
                  <td>${item.eps?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'balance-sheet':
        if (!Array.isArray(result) || result.length === 0) return <p>No balance sheet data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Total Assets</th>
                <th>Total Liabilities</th>
                <th>Total Equity</th>
                <th>Cash</th>
                <th>Debt</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${(item.totalAssets / 1000000000).toFixed(2)}B</td>
                  <td>${(item.totalLiabilities / 1000000000).toFixed(2)}B</td>
                  <td>${(item.totalStockholdersEquity / 1000000000).toFixed(2)}B</td>
                  <td>${(item.cashAndCashEquivalents / 1000000000).toFixed(2)}B</td>
                  <td>${(item.totalDebt / 1000000000).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'cash-flow':
        if (!Array.isArray(result) || result.length === 0) return <p>No cash flow data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Operating CF</th>
                <th>Investing CF</th>
                <th>Financing CF</th>
                <th>Free Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${(item.operatingCashFlow / 1000000000).toFixed(2)}B</td>
                  <td>${(item.netCashUsedForInvestingActivites / 1000000000).toFixed(2)}B</td>
                  <td>${(item.netCashUsedProvidedByFinancingActivities / 1000000000).toFixed(2)}B</td>
                  <td>${(item.freeCashFlow / 1000000000).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'ratios':
        if (!Array.isArray(result) || result.length === 0) return <p>No ratios data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>P/E Ratio</th>
                <th>P/B Ratio</th>
                <th>ROE</th>
                <th>ROA</th>
                <th>Debt to Equity</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.priceEarningsRatio?.toFixed(2)}</td>
                  <td>{item.priceToBookRatio?.toFixed(2)}</td>
                  <td>{(item.returnOnEquity * 100)?.toFixed(2)}%</td>
                  <td>{(item.returnOnAssets * 100)?.toFixed(2)}%</td>
                  <td>{item.debtEquityRatio?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'key-metrics':
        if (!Array.isArray(result) || result.length === 0) return <p>No key metrics data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Market Cap</th>
                <th>P/E Ratio</th>
                <th>EV/EBITDA</th>
                <th>Dividend Yield</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${(item.marketCap / 1000000000).toFixed(2)}B</td>
                  <td>{item.peRatio?.toFixed(2)}</td>
                  <td>{item.enterpriseValueOverEBITDA?.toFixed(2)}</td>
                  <td>{(item.dividendYield * 100)?.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'historical-price':
        if (!result.historical || result.historical.length === 0) return <p>No historical price data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {result.historical.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${item.open?.toFixed(2)}</td>
                  <td>${item.high?.toFixed(2)}</td>
                  <td>${item.low?.toFixed(2)}</td>
                  <td>${item.close?.toFixed(2)}</td>
                  <td>{item.volume?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'news':
        if (!Array.isArray(result) || result.length === 0) return <p>No news found</p>;
        return result.map((article, index) => (
          <div key={index} className="result-card">
            <h4>{article.title}</h4>
            <p style={{color: '#718096', fontSize: '0.9rem'}}>
              {new Date(article.publishedDate).toLocaleDateString()} | {article.site}
            </p>
            <p>{article.text}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">Read more →</a>
          </div>
        ));

      case 'analyst-estimates':
        if (!Array.isArray(result) || result.length === 0) return <p>No analyst estimates found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Estimated Revenue</th>
                <th>Estimated EPS</th>
                <th>Estimated EBITDA</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, limit).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${(item.estimatedRevenueAvg / 1000000000).toFixed(2)}B</td>
                  <td>${item.estimatedEpsAvg?.toFixed(2)}</td>
                  <td>${(item.estimatedEbitdaAvg / 1000000000).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'price-target':
        if (!Array.isArray(result) || result.length === 0) return <p>No price targets found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Analyst</th>
                <th>Price Target</th>
                <th>Adj. Price Target</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.publishedDate).toLocaleDateString()}</td>
                  <td>{item.analystCompany}</td>
                  <td>${item.priceTarget?.toFixed(2)}</td>
                  <td>${item.adjPriceTarget?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'upgrades-downgrades':
        if (!Array.isArray(result) || result.length === 0) return <p>No upgrades/downgrades found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>Action</th>
                <th>From Grade</th>
                <th>To Grade</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.publishedDate).toLocaleDateString()}</td>
                  <td>{item.gradingCompany}</td>
                  <td style={{color: item.action === 'up' ? 'green' : item.action === 'down' ? 'red' : 'inherit'}}>
                    {item.action}
                  </td>
                  <td>{item.previousGrade}</td>
                  <td>{item.newGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'earning-surprises':
        if (!Array.isArray(result) || result.length === 0) return <p>No earnings surprises found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Actual EPS</th>
                <th>Estimated EPS</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>${item.actualEarningResult?.toFixed(2)}</td>
                  <td>${item.estimatedEarning?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'earnings-calendar':
        if (!Array.isArray(result) || result.length === 0) return <p>No earnings calendar data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>EPS</th>
                <th>EPS Estimated</th>
                <th>Revenue</th>
                <th>Revenue Estimated</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 50).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td><strong>{item.symbol}</strong></td>
                  <td>${item.eps?.toFixed(2)}</td>
                  <td>${item.epsEstimated?.toFixed(2)}</td>
                  <td>${(item.revenue / 1000000000).toFixed(2)}B</td>
                  <td>${(item.revenueEstimated / 1000000000).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'ipo-calendar':
        if (!Array.isArray(result) || result.length === 0) return <p>No IPO calendar data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>Symbol</th>
                <th>Exchange</th>
                <th>Price Range</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.company}</td>
                  <td><strong>{item.symbol}</strong></td>
                  <td>{item.exchange}</td>
                  <td>${item.priceRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'dividend-calendar':
        if (!Array.isArray(result) || result.length === 0) return <p>No dividend calendar data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Dividend</th>
                <th>Adj. Dividend</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 50).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td><strong>{item.symbol}</strong></td>
                  <td>${item.dividend?.toFixed(4)}</td>
                  <td>${item.adjDividend?.toFixed(4)}</td>
                  <td>{item.paymentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'stock-split-calendar':
        if (!Array.isArray(result) || result.length === 0) return <p>No stock split data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Split Ratio</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td><strong>{item.symbol}</strong></td>
                  <td>{item.numerator}:{item.denominator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'economic-calendar':
        if (!Array.isArray(result) || result.length === 0) return <p>No economic calendar data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Country</th>
                <th>Actual</th>
                <th>Estimate</th>
                <th>Previous</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 30).map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.event}</td>
                  <td>{item.country}</td>
                  <td>{item.actual}</td>
                  <td>{item.estimate}</td>
                  <td>{item.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'insider-trading':
        if (!Array.isArray(result) || result.length === 0) return <p>No insider trading data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Transaction</th>
                <th>Shares</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.filingDate}</td>
                  <td>{item.reportingName}</td>
                  <td style={{color: item.transactionType?.includes('P-Purchase') ? 'green' : 'red'}}>
                    {item.transactionType}
                  </td>
                  <td>{item.securitiesTransacted?.toLocaleString()}</td>
                  <td>${item.price?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'senate-trading':
        if (!Array.isArray(result) || result.length === 0) return <p>No senate trading data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Senator</th>
                <th>Symbol</th>
                <th>Transaction</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.disclosureDate}</td>
                  <td>{item.firstName} {item.lastName}</td>
                  <td><strong>{item.assetName}</strong></td>
                  <td>{item.type}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'institutional-holder':
        if (!Array.isArray(result) || result.length === 0) return <p>No institutional holder data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Holder</th>
                <th>Shares</th>
                <th>Date</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.holder}</td>
                  <td>{item.shares?.toLocaleString()}</td>
                  <td>{item.dateReported}</td>
                  <td>{item.change?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'etf-holder':
        if (!Array.isArray(result) || result.length === 0) return <p>No ETF holder data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>ETF Name</th>
                <th>ETF Symbol</th>
                <th>Shares</th>
                <th>Weight %</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.etfName}</td>
                  <td><strong>{item.etfSymbol}</strong></td>
                  <td>{item.sharesNumber?.toLocaleString()}</td>
                  <td>{item.weightPercentage?.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'sec-filings':
        if (!Array.isArray(result) || result.length === 0) return <p>No SEC filings found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Title</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.fillingDate}</td>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.symbol}</td>
                  <td><a href={item.finalLink} target="_blank" rel="noopener noreferrer">View Filing →</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'gainers':
      case 'losers':
      case 'most-active':
        if (!Array.isArray(result) || result.length === 0) return <p>No data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change</th>
                <th>Change %</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.symbol}</strong></td>
                  <td>{item.name}</td>
                  <td>${item.price?.toFixed(2)}</td>
                  <td style={{color: item.change >= 0 ? 'green' : 'red'}}>{item.change?.toFixed(2)}</td>
                  <td style={{color: item.changesPercentage >= 0 ? 'green' : 'red'}}>{item.changesPercentage?.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'sector-performance':
        if (!Array.isArray(result) || result.length === 0) return <p>No sector performance data found</p>;
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Change %</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.sector}</strong></td>
                  <td style={{color: parseFloat(item.changesPercentage) >= 0 ? 'green' : 'red'}}>
                    {item.changesPercentage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'dcf':
        if (!Array.isArray(result) || result.length === 0) return <p>No DCF valuation found</p>;
        const dcf = result[0];
        return (
          <div className="result-card">
            <h4>DCF Valuation for {symbol}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Stock Price:</strong></td><td>${dcf['Stock Price']?.toFixed(2) || dcf.price?.toFixed(2) || 'N/A'}</td></tr>
                <tr><td><strong>DCF Value:</strong></td><td>${dcf.dcf?.toFixed(2) || 'N/A'}</td></tr>
                <tr><td><strong>Date:</strong></td><td>{dcf.date || 'N/A'}</td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'market-cap':
        if (!Array.isArray(result) || result.length === 0) return <p>No market cap data found</p>;
        const marketCap = result[0];
        return (
          <div className="result-card">
            <h4>Market Capitalization for {symbol}</h4>
            <table className="data-table">
              <tbody>
                <tr><td><strong>Symbol:</strong></td><td>{marketCap.symbol}</td></tr>
                <tr><td><strong>Market Cap:</strong></td><td>${(marketCap.marketCap / 1000000000).toFixed(2)}B</td></tr>
                <tr><td><strong>Date:</strong></td><td>{marketCap.date}</td></tr>
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
        <h2>💼 Financial Modeling Prep (FMP)</h2>
        <p>Comprehensive financial data, statements, and market analytics</p>
      </div>

      <div className="api-key-note">
        <strong>API Key Required:</strong> Get your free API key at{' '}
        <a href="https://site.financialmodelingprep.com/developer/docs" target="_blank" rel="noopener noreferrer">
          financialmodelingprep.com
        </a>
      </div>

      <div className="error-message" style={{ marginTop: '1rem' }}>
        <strong>⚠️ Important FMP API Changes (2025):</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>Most endpoints are now marked as "Legacy" and require paid subscriptions</li>
          <li>Free tier is limited to 87 sample symbols (AAPL, TSLA, AMZN, etc.)</li>
          <li>Many features shown here require FMP Starter plan ($22/month) or higher</li>
          <li>Consider using Alpha Vantage, Finnhub, or Yahoo Finance tabs for free data</li>
        </ul>
      </div>

      <div className="demo-section">
        <h3>Configure API Access</h3>
        <div className="form-group">
          <label>FMP API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your FMP API key"
          />
        </div>
      </div>

      <div className="demo-section">
        <h3>Select Data Type</h3>

        <div className="form-group">
          <label>Data Category</label>
          <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            {dataCategories.map((category, idx) => (
              <optgroup key={idx} label={category.label}>
                {category.options.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {needsSymbol() && (
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
            />
          </div>
        )}

        {needsPeriod() && (
          <div className="form-row">
            <div className="form-group">
              <label>Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="annual">Annual</option>
                <option value="quarter">Quarterly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Limit</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
          </div>
        )}

        {needsDateRange() && (
          <div className="form-row">
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {needsFilingType() && (
          <div className="form-group">
            <label>Filing Type (Optional)</label>
            <select value={filingType} onChange={(e) => setFilingType(e.target.value)}>
              <option value="">All Types</option>
              <option value="8-K">8-K</option>
              <option value="10-K">10-K</option>
              <option value="10-Q">10-Q</option>
              <option value="DEF 14A">DEF 14A</option>
            </select>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={fetchData}
            disabled={loading || (needsSymbol() && !symbol) || !apiKey}
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading">Fetching data from FMP...</div>}

      {data && (
        <div className="results-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Results</h3>
            <div>
              <button onClick={handleExportJSON} className="export-button" style={{ marginRight: '0.5rem' }}>
                Export JSON
              </button>
              {Array.isArray(data.data) && (
                <button onClick={handleExportCSV} className="export-button">
                  Export CSV
                </button>
              )}
            </div>
          </div>
          {renderData()}
        </div>
      )}
    </div>
  );
}

export default FmpTab;
