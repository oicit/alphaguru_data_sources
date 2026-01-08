const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * SEC EDGAR Routes
 * Uses SEC's official JSON API at data.sec.gov to fetch and download actual filing documents
 */

// Cache for ticker to CIK mapping
let tickerToCikCache = null;

// Get ticker to CIK mapping
async function getTickerToCikMapping(userAgent) {
  if (tickerToCikCache) {
    return tickerToCikCache;
  }

  try {
    const response = await axios.get(
      'https://www.sec.gov/files/company_tickers_exchange.json',
      {
        headers: {
          'User-Agent': userAgent,
          'Accept-Encoding': 'gzip, deflate',
          'Host': 'www.sec.gov'
        }
      }
    );

    // Convert to map: ticker -> CIK
    const mapping = {};
    const data = response.data;

    if (data.fields && data.data) {
      const cikIdx = data.fields.indexOf('cik');
      const tickerIdx = data.fields.indexOf('ticker');

      data.data.forEach(row => {
        const ticker = row[tickerIdx];
        const cik = String(row[cikIdx]).padStart(10, '0');
        mapping[ticker.toUpperCase()] = cik;
      });
    }

    tickerToCikCache = mapping;
    return mapping;
  } catch (error) {
    console.error('Error fetching ticker to CIK mapping:', error.message);
    return {};
  }
}

// Get company filings list using SEC's JSON API
router.post('/filings', async (req, res) => {
  try {
    const { ticker, filingType, limit = 10 } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    const userAgent = process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com';

    // Get CIK for ticker
    const tickerMap = await getTickerToCikMapping(userAgent);
    const cik = tickerMap[ticker.toUpperCase()];

    if (!cik) {
      return res.status(404).json({
        error: 'Ticker not found',
        message: `Could not find CIK for ticker ${ticker}`
      });
    }

    // Fetch submissions data from SEC's JSON API
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const response = await axios.get(submissionsUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept-Encoding': 'gzip, deflate',
        'Host': 'data.sec.gov'
      }
    });

    const submissionsData = response.data;
    const recentFilings = submissionsData.filings.recent;

    // Extract filing information
    const filings = [];
    const accessionNumbers = recentFilings.accessionNumber;
    const forms = recentFilings.form;
    const filingDates = recentFilings.filingDate;
    const primaryDocuments = recentFilings.primaryDocument;
    const reportDates = recentFilings.reportDate || [];

    for (let i = 0; i < accessionNumbers.length && filings.length < limit; i++) {
      const form = forms[i];

      // Filter by filing type if specified
      if (filingType && form !== filingType) {
        continue;
      }

      const accNum = accessionNumbers[i];
      const accNumNoDash = accNum.replace(/-/g, '');
      const cikNoLeadingZeros = cik.replace(/^0+/, '');
      const primaryDoc = primaryDocuments[i];

      // Build URLs for downloading documents
      const fullSubmissionUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accNumNoDash}/${accNum}.txt`;
      const primaryDocUrl = primaryDoc ?
        `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accNumNoDash}/${primaryDoc}` :
        null;

      filings.push({
        title: `${submissionsData.name} - ${form}`,
        filingType: form,
        filingDate: filingDates[i],
        reportDate: reportDates[i] || filingDates[i],
        accessionNumber: accNum,
        companyName: submissionsData.name,
        cik: cik,
        // URLs for downloading
        fullSubmissionUrl: fullSubmissionUrl,
        primaryDocUrl: primaryDocUrl,
        // Legacy field for compatibility
        link: primaryDocUrl || fullSubmissionUrl
      });
    }

    res.json({
      success: true,
      ticker: ticker,
      cik: cik,
      companyName: submissionsData.name,
      filingType: filingType || 'all',
      count: filings.length,
      filings: filings
    });

  } catch (error) {
    console.error('SEC EDGAR API Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch SEC filings',
      message: error.message
    });
  }
});

// Download multiple filing documents (actual document content)
router.post('/download-filings', async (req, res) => {
  try {
    const { filings } = req.body;

    if (!filings || !Array.isArray(filings) || filings.length === 0) {
      return res.status(400).json({ error: 'Filings array is required' });
    }

    const downloadedFilings = [];
    const userAgent = process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com';

    // SEC EDGAR rate limit: 10 requests per second
    // We'll add a small delay between requests
    for (let i = 0; i < filings.length; i++) {
      const filing = filings[i];

      try {
        // Add delay to respect rate limits (150ms = ~6-7 requests/second to be safe)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Download the primary document (HTML) if available, otherwise full submission
        const downloadUrl = filing.primaryDocUrl || filing.fullSubmissionUrl;

        if (!downloadUrl) {
          downloadedFilings.push({
            title: filing.title,
            filingType: filing.filingType,
            accessionNumber: filing.accessionNumber,
            error: 'No download URL available',
            success: false
          });
          continue;
        }

        const response = await axios.get(downloadUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'www.sec.gov'
          },
          responseType: 'text',
          timeout: 15000
        });

        // Determine file extension
        const isPrimaryDoc = downloadUrl === filing.primaryDocUrl;
        const fileExt = isPrimaryDoc ?
          (filing.primaryDocUrl.endsWith('.htm') || filing.primaryDocUrl.endsWith('.html') ? '.html' : '.txt') :
          '.txt';

        downloadedFilings.push({
          title: filing.title,
          filingType: filing.filingType,
          filingDate: filing.filingDate,
          accessionNumber: filing.accessionNumber,
          companyName: filing.companyName,
          content: response.data,
          filename: `${filing.companyName.replace(/[^a-z0-9]/gi, '_')}_${filing.accessionNumber.replace(/\//g, '_')}_${filing.filingType.replace(/\s+/g, '_')}${fileExt}`,
          fileType: fileExt === '.html' ? 'text/html' : 'text/plain',
          success: true
        });

      } catch (error) {
        console.error(`Failed to download filing ${filing.accessionNumber}:`, error.message);
        downloadedFilings.push({
          title: filing.title,
          filingType: filing.filingType,
          accessionNumber: filing.accessionNumber,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      downloaded: downloadedFilings.filter(f => f.success).length,
      failed: downloadedFilings.filter(f => !f.success).length,
      filings: downloadedFilings
    });

  } catch (error) {
    console.error('SEC Bulk Download Error:', error.message);
    res.status(500).json({
      error: 'Failed to download SEC filings',
      message: error.message
    });
  }
});

// Get company information by CIK or ticker
router.get('/company/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const userAgent = process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com';

    // Check if identifier is a ticker or CIK
    let cik = identifier;
    if (!/^\d+$/.test(identifier)) {
      // It's a ticker, convert to CIK
      const tickerMap = await getTickerToCikMapping(userAgent);
      cik = tickerMap[identifier.toUpperCase()];

      if (!cik) {
        return res.status(404).json({
          error: 'Ticker not found',
          message: `Could not find CIK for ticker ${identifier}`
        });
      }
    } else {
      // Pad CIK to 10 digits
      cik = cik.padStart(10, '0');
    }

    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const response = await axios.get(submissionsUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept-Encoding': 'gzip, deflate',
        'Host': 'data.sec.gov'
      }
    });

    const data = response.data;

    res.json({
      success: true,
      company: {
        cik: cik,
        name: data.name,
        tickers: data.tickers || [],
        exchanges: data.exchanges || [],
        sic: data.sic,
        sicDescription: data.sicDescription,
        ein: data.ein,
        stateOfIncorporation: data.stateOfIncorporation,
        fiscalYearEnd: data.fiscalYearEnd,
        category: data.category,
        website: data.website
      }
    });

  } catch (error) {
    console.error('SEC Company Info Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company information',
      message: error.message
    });
  }
});

module.exports = router;
