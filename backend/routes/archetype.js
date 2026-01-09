const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Alphaguru Business Archetype API
 *
 * Proprietary AI-powered system that synthesizes fundamental data
 * and generates unique business archetype labels using embeddings
 *
 * Archetype Dimensions:
 * 1. Business Model Archetype
 * 2. Growth Stage
 * 3. Competitive Moat Type
 * 4. Innovation Velocity
 * 5. Capital Efficiency
 * 6. Market Position
 * 7. Unit Economics Health
 * 8. Scalability Potential
 *
 * Requires: OpenAI API key or Anthropic API key for AI analysis
 */

const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v7/finance';

/**
 * Alphaguru Archetype Ontology
 */
const ARCHETYPE_ONTOLOGY = {
  businessModel: [
    { label: 'Platform', description: 'Multi-sided marketplace connecting users', examples: ['UBER', 'ABNB'] },
    { label: 'SaaS', description: 'Software-as-a-Service recurring revenue', examples: ['CRM', 'SNOW'] },
    { label: 'Marketplace', description: 'Transaction-based intermediary', examples: ['ETSY', 'EBAY'] },
    { label: 'Hardware', description: 'Physical product manufacturing', examples: ['AAPL', 'TSLA'] },
    { label: 'Consumer Subscription', description: 'Recurring consumer services', examples: ['NFLX', 'SPOT'] },
    { label: 'Enterprise', description: 'B2B solutions and services', examples: ['ORCL', 'IBM'] },
    { label: 'E-commerce', description: 'Direct online retail', examples: ['AMZN', 'SHOP'] },
    { label: 'Advertising', description: 'Monetization via ads', examples: ['GOOGL', 'META'] },
    { label: 'Fintech', description: 'Financial technology services', examples: ['SQ', 'PYPL'] },
    { label: 'Biotech', description: 'Drug development and therapeutics', examples: ['MRNA', 'REGN'] }
  ],
  growthStage: [
    { label: 'Hyper-Growth', description: 'Revenue growth >50% YoY', threshold: { revenueGrowth: 50 } },
    { label: 'High-Growth', description: 'Revenue growth 30-50% YoY', threshold: { revenueGrowth: 30 } },
    { label: 'Scaling', description: 'Revenue growth 15-30% YoY', threshold: { revenueGrowth: 15 } },
    { label: 'Mature', description: 'Revenue growth 5-15% YoY', threshold: { revenueGrowth: 5 } },
    { label: 'Slow-Growth', description: 'Revenue growth 0-5% YoY', threshold: { revenueGrowth: 0 } },
    { label: 'Declining', description: 'Negative revenue growth', threshold: { revenueGrowth: -100 } }
  ],
  moatType: [
    { label: 'Network Effects', description: 'Value increases with users', indicators: ['platform', 'marketplace'] },
    { label: 'Switching Costs', description: 'High cost to change providers', indicators: ['enterprise', 'saas'] },
    { label: 'Brand Power', description: 'Strong brand recognition', indicators: ['consumer', 'luxury'] },
    { label: 'Intellectual Property', description: 'Patents and proprietary tech', indicators: ['biotech', 'pharma'] },
    { label: 'Scale Advantages', description: 'Cost advantages from size', indicators: ['manufacturing', 'logistics'] },
    { label: 'Data Moat', description: 'Proprietary data accumulation', indicators: ['ai', 'analytics'] },
    { label: 'Regulatory Moat', description: 'Protected by regulations', indicators: ['utilities', 'telecom'] },
    { label: 'Weak Moat', description: 'Limited competitive advantages', indicators: ['commodity'] }
  ],
  innovationVelocity: [
    { label: 'Disruptor', description: 'Creating new markets', characteristics: ['high R&D', 'negative earnings', 'high growth'] },
    { label: 'Fast Innovator', description: 'Rapid product cycles', characteristics: ['tech', 'consumer electronics'] },
    { label: 'Steady Innovator', description: 'Consistent improvements', characteristics: ['enterprise', 'industrial'] },
    { label: 'Slow Innovator', description: 'Infrequent major changes', characteristics: ['mature', 'regulated'] },
    { label: 'Laggard', description: 'Playing catch-up', characteristics: ['declining', 'legacy'] }
  ],
  capitalEfficiency: [
    { label: 'Capital Light', description: 'Low capex requirements', threshold: { capexToRevenue: 5 } },
    { label: 'Balanced', description: 'Moderate capital needs', threshold: { capexToRevenue: 15 } },
    { label: 'Capital Intensive', description: 'High capex requirements', threshold: { capexToRevenue: 100 } }
  ],
  marketPosition: [
    { label: 'Dominant Leader', description: '>50% market share', threshold: { marketShare: 50 } },
    { label: 'Strong Contender', description: '20-50% market share', threshold: { marketShare: 20 } },
    { label: 'Competitive Player', description: '10-20% market share', threshold: { marketShare: 10 } },
    { label: 'Niche Player', description: '5-10% market share', threshold: { marketShare: 5 } },
    { label: 'Small Player', description: '<5% market share', threshold: { marketShare: 0 } }
  ],
  unitEconomics: [
    { label: 'Strong', description: 'High margins, positive CAC/LTV', threshold: { grossMargin: 60, netMargin: 15 } },
    { label: 'Improving', description: 'Expanding margins', threshold: { grossMargin: 40, netMargin: 0 } },
    { label: 'Weak', description: 'Low margins', threshold: { grossMargin: 20, netMargin: -10 } },
    { label: 'Broken', description: 'Unsustainable economics', threshold: { grossMargin: 0, netMargin: -100 } }
  ],
  scalability: [
    { label: 'Highly Scalable', description: 'Software-like economics', characteristics: ['saas', 'platform', 'digital'] },
    { label: 'Moderately Scalable', description: 'Some variable costs', characteristics: ['marketplace', 'services'] },
    { label: 'Limited Scalability', description: 'Linear cost structure', characteristics: ['hardware', 'manufacturing'] }
  ]
};

/**
 * Fetch comprehensive fundamental data for a stock
 */
async function fetchFundamentalData(symbol) {
  try {
    // Fetch from Yahoo Finance
    const quoteResponse = await axios.get(`${YAHOO_FINANCE_BASE}/quote`, {
      params: {
        symbols: symbol,
        fields: 'symbol,shortName,longBusinessSummary,industry,sector,marketCap,trailingPE,forwardPE,priceToBook,priceToSales,profitMargins,operatingMargins,returnOnEquity,revenueGrowth,earningsGrowth,currentRatio,debtToEquity,freeCashflow,operatingCashflow'
      },
      timeout: 10000
    });

    const quote = quoteResponse.data.quoteResponse.result[0];

    return {
      symbol: quote.symbol,
      name: quote.shortName,
      description: quote.longBusinessSummary,
      industry: quote.industry,
      sector: quote.sector,
      marketCap: quote.marketCap,
      metrics: {
        trailingPE: quote.trailingPE,
        forwardPE: quote.forwardPE,
        priceToBook: quote.priceToBook,
        priceToSales: quote.priceToSales,
        profitMargin: quote.profitMargins * 100,
        operatingMargin: quote.operatingMargins * 100,
        roe: quote.returnOnEquity * 100,
        revenueGrowth: quote.revenueGrowth * 100,
        earningsGrowth: quote.earningsGrowth * 100,
        currentRatio: quote.currentRatio,
        debtToEquity: quote.debtToEquity,
        freeCashflow: quote.freeCashflow,
        operatingCashflow: quote.operatingCashflow
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch fundamental data: ${error.message}`);
  }
}

/**
 * Generate AI-powered archetype analysis using OpenAI
 */
async function generateArchetypeWithAI(fundamentalData, apiKey, aiProvider = 'openai') {
  const prompt = `You are Alphaguru, a proprietary business analysis AI. Analyze the following company and assign business archetype labels.

Company: ${fundamentalData.name} (${fundamentalData.symbol})
Sector: ${fundamentalData.sector}
Industry: ${fundamentalData.industry}
Market Cap: $${(fundamentalData.marketCap / 1e9).toFixed(2)}B

Description: ${fundamentalData.description?.substring(0, 500)}

Financial Metrics:
- Revenue Growth: ${fundamentalData.metrics.revenueGrowth?.toFixed(1)}%
- Profit Margin: ${fundamentalData.metrics.profitMargin?.toFixed(1)}%
- Operating Margin: ${fundamentalData.metrics.operatingMargin?.toFixed(1)}%
- ROE: ${fundamentalData.metrics.roe?.toFixed(1)}%
- P/E Ratio: ${fundamentalData.metrics.trailingPE?.toFixed(1)}
- Debt/Equity: ${fundamentalData.metrics.debtToEquity?.toFixed(2)}

Based on this data, provide a JSON response with the following archetype classifications:

{
  "businessModel": "one of: Platform, SaaS, Marketplace, Hardware, Consumer Subscription, Enterprise, E-commerce, Advertising, Fintech, Biotech",
  "businessModelConfidence": 0-100,
  "businessModelReasoning": "brief explanation",

  "growthStage": "one of: Hyper-Growth, High-Growth, Scaling, Mature, Slow-Growth, Declining",
  "growthStageConfidence": 0-100,
  "growthStageReasoning": "brief explanation",

  "moatType": ["array of: Network Effects, Switching Costs, Brand Power, Intellectual Property, Scale Advantages, Data Moat, Regulatory Moat, Weak Moat"],
  "moatStrength": 0-100,
  "moatReasoning": "brief explanation",

  "innovationVelocity": "one of: Disruptor, Fast Innovator, Steady Innovator, Slow Innovator, Laggard",
  "innovationVelocityConfidence": 0-100,
  "innovationReasoning": "brief explanation",

  "capitalEfficiency": "one of: Capital Light, Balanced, Capital Intensive",
  "capitalEfficiencyConfidence": 0-100,
  "capitalReasoning": "brief explanation",

  "marketPosition": "one of: Dominant Leader, Strong Contender, Competitive Player, Niche Player, Small Player",
  "marketPositionConfidence": 0-100,
  "marketPositionReasoning": "brief explanation",

  "unitEconomics": "one of: Strong, Improving, Weak, Broken",
  "unitEconomicsConfidence": 0-100,
  "unitEconomicsReasoning": "brief explanation",

  "scalability": "one of: Highly Scalable, Moderately Scalable, Limited Scalability",
  "scalabilityConfidence": 0-100,
  "scalabilityReasoning": "brief explanation",

  "overallArchetype": "a unique 2-4 word label that captures the company's essence",
  "investmentThesis": "2-3 sentence summary of key investment considerations",
  "riskFactors": ["array of 3-5 key risks"],
  "catalysts": ["array of 3-5 potential positive catalysts"]
}

Return ONLY valid JSON, no additional text.`;

  try {
    if (aiProvider === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are Alphaguru, a business archetype analysis AI. You always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0].trim();
      }

      return JSON.parse(jsonStr);
    } else if (aiProvider === 'anthropic') {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.content[0].text;
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0].trim();
      }

      return JSON.parse(jsonStr);
    }
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Rule-based archetype analysis (fallback if no AI API key)
 */
function generateArchetypeRuleBased(fundamentalData) {
  const metrics = fundamentalData.metrics;

  // Business Model (based on sector/industry keywords)
  let businessModel = 'Enterprise';
  const desc = (fundamentalData.description || '').toLowerCase();
  if (desc.includes('platform') || desc.includes('marketplace')) businessModel = 'Platform';
  else if (desc.includes('saas') || desc.includes('software as a service')) businessModel = 'SaaS';
  else if (desc.includes('ecommerce') || desc.includes('e-commerce')) businessModel = 'E-commerce';
  else if (fundamentalData.industry?.includes('Software')) businessModel = 'SaaS';
  else if (fundamentalData.sector?.includes('Technology')) businessModel = 'Enterprise';

  // Growth Stage (based on revenue growth)
  let growthStage = 'Mature';
  const growth = metrics.revenueGrowth || 0;
  if (growth > 50) growthStage = 'Hyper-Growth';
  else if (growth > 30) growthStage = 'High-Growth';
  else if (growth > 15) growthStage = 'Scaling';
  else if (growth > 5) growthStage = 'Mature';
  else if (growth > 0) growthStage = 'Slow-Growth';
  else growthStage = 'Declining';

  // Moat Type
  const moatTypes = [];
  if (businessModel === 'Platform' || businessModel === 'Marketplace') moatTypes.push('Network Effects');
  if (businessModel === 'SaaS' || businessModel === 'Enterprise') moatTypes.push('Switching Costs');
  if (metrics.operatingMargin > 25) moatTypes.push('Scale Advantages');
  if (moatTypes.length === 0) moatTypes.push('Weak Moat');

  // Capital Efficiency
  let capitalEfficiency = 'Balanced';
  if (businessModel === 'SaaS' || businessModel === 'Platform') capitalEfficiency = 'Capital Light';
  else if (fundamentalData.sector?.includes('Industrial') || fundamentalData.sector?.includes('Energy')) {
    capitalEfficiency = 'Capital Intensive';
  }

  // Unit Economics
  let unitEconomics = 'Improving';
  if (metrics.profitMargin > 15 && metrics.operatingMargin > 20) unitEconomics = 'Strong';
  else if (metrics.profitMargin < -10) unitEconomics = 'Weak';
  else if (metrics.profitMargin < -30) unitEconomics = 'Broken';

  // Scalability
  let scalability = 'Moderately Scalable';
  if (businessModel === 'SaaS' || businessModel === 'Platform' || businessModel === 'Advertising') {
    scalability = 'Highly Scalable';
  } else if (businessModel === 'Hardware') {
    scalability = 'Limited Scalability';
  }

  return {
    businessModel: businessModel,
    businessModelConfidence: 70,
    businessModelReasoning: 'Classified based on sector and industry keywords',

    growthStage: growthStage,
    growthStageConfidence: 85,
    growthStageReasoning: `Revenue growth of ${growth.toFixed(1)}%`,

    moatType: moatTypes,
    moatStrength: moatTypes.length > 1 ? 70 : moatTypes[0] === 'Weak Moat' ? 30 : 60,
    moatReasoning: 'Based on business model characteristics',

    innovationVelocity: 'Steady Innovator',
    innovationVelocityConfidence: 60,
    innovationReasoning: 'Standard analysis - AI key recommended for deeper insight',

    capitalEfficiency: capitalEfficiency,
    capitalEfficiencyConfidence: 75,
    capitalReasoning: 'Based on business model and sector',

    marketPosition: 'Competitive Player',
    marketPositionConfidence: 50,
    marketPositionReasoning: 'Market share data not available - AI key recommended',

    unitEconomics: unitEconomics,
    unitEconomicsConfidence: 80,
    unitEconomicsReasoning: `Profit margin: ${metrics.profitMargin?.toFixed(1)}%, Operating margin: ${metrics.operatingMargin?.toFixed(1)}%`,

    scalability: scalability,
    scalabilityConfidence: 75,
    scalabilityReasoning: 'Based on business model',

    overallArchetype: `${growthStage} ${businessModel}`,
    investmentThesis: 'Rule-based analysis. For comprehensive AI-powered insights, provide an OpenAI or Anthropic API key.',
    riskFactors: ['Market volatility', 'Competition', 'Regulatory changes'],
    catalysts: ['Revenue growth', 'Margin expansion', 'Market share gains']
  };
}

// Main endpoint: Analyze stock archetype
router.post('/analyze', async (req, res) => {
  try {
    const { symbol, apiKey, aiProvider = 'openai' } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    // Fetch fundamental data
    const fundamentalData = await fetchFundamentalData(symbol.toUpperCase());

    // Generate archetype analysis
    let archetypeAnalysis;
    if (apiKey) {
      archetypeAnalysis = await generateArchetypeWithAI(fundamentalData, apiKey, aiProvider);
    } else {
      archetypeAnalysis = generateArchetypeRuleBased(fundamentalData);
    }

    // Combine results
    const result = {
      success: true,
      symbol: fundamentalData.symbol,
      companyName: fundamentalData.name,
      sector: fundamentalData.sector,
      industry: fundamentalData.industry,
      marketCap: fundamentalData.marketCap,
      fundamentals: fundamentalData.metrics,
      archetype: archetypeAnalysis,
      analysisMethod: apiKey ? `AI-powered (${aiProvider})` : 'Rule-based',
      timestamp: new Date().toISOString(),
      note: apiKey ? 'AI-powered proprietary analysis' : 'Rule-based analysis. Provide an AI API key for deeper insights.'
    };

    res.json(result);

  } catch (error) {
    console.error('Archetype Analysis Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze stock archetype',
      message: error.message
    });
  }
});

// Get archetype ontology reference
router.get('/ontology', (req, res) => {
  res.json({
    success: true,
    ontology: ARCHETYPE_ONTOLOGY,
    description: 'Alphaguru proprietary business archetype classification system',
    dimensions: [
      'Business Model Archetype',
      'Growth Stage',
      'Competitive Moat Type',
      'Innovation Velocity',
      'Capital Efficiency',
      'Market Position',
      'Unit Economics Health',
      'Scalability Potential'
    ]
  });
});

module.exports = router;
