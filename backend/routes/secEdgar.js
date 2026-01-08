const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * SEC EDGAR Routes
 * Provides endpoints for fetching SEC filings
 */

// Get company filings list
router.post('/filings', async (req, res) => {
  try {
    const { ticker, filingType, limit = 10 } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    // First, get the CIK for the ticker
    const cikResponse = await axios.get(
      `https://www.sec.gov/cgi-bin/browse-edgar`, {
        params: {
          action: 'getcompany',
          ticker: ticker,
          type: filingType || '',
          dateb: '',
          owner: 'exclude',
          count: limit,
          output: 'atom'
        },
        headers: {
          'User-Agent': process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com'
        }
      }
    );

    // Parse the response and extract filing information
    const filings = parseSecEdgarAtomFeed(cikResponse.data);

    res.json({
      success: true,
      ticker: ticker,
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

// Get specific filing document
router.post('/filing-document', async (req, res) => {
  try {
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ error: 'Document URL is required' });
    }

    const response = await axios.get(documentUrl, {
      headers: {
        'User-Agent': process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com'
      }
    });

    res.json({
      success: true,
      content: response.data
    });

  } catch (error) {
    console.error('SEC Document Fetch Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch SEC document',
      message: error.message
    });
  }
});

// Get company information by CIK or ticker
router.get('/company/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    const response = await axios.get(
      `https://www.sec.gov/cgi-bin/browse-edgar`, {
        params: {
          action: 'getcompany',
          CIK: identifier,
          type: '',
          dateb: '',
          owner: 'exclude',
          count: 1,
          output: 'atom'
        },
        headers: {
          'User-Agent': process.env.SEC_USER_AGENT || 'DataSourcesDashboard contact@example.com'
        }
      }
    );

    const companyInfo = parseCompanyInfo(response.data);

    res.json({
      success: true,
      company: companyInfo
    });

  } catch (error) {
    console.error('SEC Company Info Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company information',
      message: error.message
    });
  }
});

// Helper function to parse SEC EDGAR ATOM feed
function parseSecEdgarAtomFeed(atomData) {
  // Simple parsing - in production, use a proper XML parser like 'xml2js'
  const filings = [];

  // Extract entry tags
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(atomData)) !== null) {
    const entry = match[1];

    const filing = {
      title: extractTag(entry, 'title'),
      link: extractAttribute(entry, 'link', 'href'),
      updated: extractTag(entry, 'updated'),
      summary: extractTag(entry, 'summary'),
      filingType: extractTag(entry, 'filing-type'),
      filingDate: extractTag(entry, 'filing-date'),
      accessionNumber: extractTag(entry, 'accession-number')
    };

    filings.push(filing);
  }

  return filings;
}

function parseCompanyInfo(atomData) {
  return {
    name: extractTag(atomData, 'company-name'),
    cik: extractTag(atomData, 'cik'),
    sic: extractTag(atomData, 'assigned-sic'),
    fiscalYearEnd: extractTag(atomData, 'fiscal-year-end')
  };
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function extractAttribute(xml, tagName, attribute) {
  const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

module.exports = router;
