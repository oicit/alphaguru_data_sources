const express = require('express');
const router = express.Router();

// Comprehensive Deep Research AI Agent data based on latest research (2026)
const DEEP_RESEARCH_AGENTS = {
  western: [
    {
      id: 'gemini-deep-research',
      provider: 'Google',
      name: 'Gemini Deep Research',
      model: 'Gemini 3 Pro',
      launched: 'December 2024',
      status: 'Production',
      availability: 'Gemini Advanced subscribers',

      capabilities: {
        researchTime: '60 minutes max (typically 20 min)',
        searchQueries: '80-160 queries per task',
        tokens: '250k-900k input, 60k-80k output',
        multimodal: true,
        visualReports: true,
        fileUpload: true,
        interactiveCharts: true,
        toolUse: true
      },

      benchmarks: {
        humanityLastExam: 46.4,
        deepSearchQA: 66.1,
        browseComp: 59.2
      },

      features: [
        'Autonomous planning and execution',
        'Interactive visual reports with charts & simulations',
        'File and image upload support',
        'Real-time chart generation',
        'Canvas integration for quizzes',
        'Scan emails, spreadsheets, chats',
        'API access via Interactions API'
      ],

      useCases: [
        'Financial due diligence',
        'Biotech research',
        'Market research',
        'Competitive analysis',
        'Academic research'
      ],

      pricing: {
        tier: 'Gemini Advanced',
        monthlyQueries: 'Unlimited within usage limits',
        apiAccess: true
      },

      strengths: [
        'Highest HLE benchmark score (46.4%)',
        'Longest research time (60 min)',
        'Advanced visual report generation',
        'Strong file processing capabilities'
      ],

      limitations: [
        'Requires Gemini Advanced subscription',
        'Can be slow for simple queries',
        'Higher token consumption'
      ]
    },

    {
      id: 'chatgpt-agent',
      provider: 'OpenAI',
      name: 'ChatGPT Agent (Deep Research)',
      model: 'o3 (Pro), o4-mini (Free)',
      launched: 'February 2025 (Deep Research), July 2025 (ChatGPT Agent)',
      status: 'Production',
      availability: 'Free (5/mo), Plus (25/mo), Pro (250/mo)',

      capabilities: {
        researchTime: '5-30 minutes',
        searchQueries: 'Variable',
        tokens: 'N/A',
        multimodal: true,
        visualBrowser: true,
        autonomousNavigation: true,
        codeExecution: true,
        toolUse: true
      },

      benchmarks: {
        humanityLastExam: 44.4,
        browseComp: 68.9
      },

      features: [
        'Visual browser for web interaction',
        'Unified agentic system (Operator + Deep Research)',
        'Code execution capabilities',
        'Autonomous website navigation',
        'Text, image, PDF analysis',
        'Task automation (meetings, spreadsheets)',
        'Agent mode integration'
      ],

      useCases: [
        'Academic research',
        'Market analysis',
        'Competitive intelligence',
        'Data synthesis',
        'Web automation'
      ],

      pricing: {
        free: '5 queries/month (o4-mini)',
        plus: '25 queries/month',
        pro: '250 queries/month (o3)',
        agentMode: '40/mo (Plus), 400/mo (Pro)'
      },

      strengths: [
        'Best BrowseComp score (68.9%)',
        'Unified agent capabilities',
        'Free tier available',
        'Visual browser interaction',
        'Code execution'
      ],

      limitations: [
        'Occasional hallucinations',
        'May not convey uncertainty accurately',
        'Limited free tier usage',
        'Can reference unverified rumors'
      ]
    },

    {
      id: 'claude-research',
      provider: 'Anthropic',
      name: 'Claude Research + Extended Thinking',
      model: 'Sonnet 4.5, Haiku 4.5, Opus 4.5',
      launched: 'Extended Thinking: Q4 2024, Research: 2025',
      status: 'Production',
      availability: 'Claude Pro, API, AWS Bedrock',

      capabilities: {
        researchTime: '1-3 minutes (5+ tool calls)',
        thinkingBudget: 'Min 1,024 tokens, configurable',
        multimodal: true,
        toolUse: true,
        webSearch: true,
        serialReasoning: true,
        hybridMode: true
      },

      benchmarks: {
        // Specific benchmarks not disclosed for Research mode
        extendedThinking: 'State-of-the-art on complex reasoning'
      },

      features: [
        'Serial test-time compute',
        'Extended thinking with transparency',
        'Tool use during reasoning',
        'Web search integration',
        'Hybrid instant/extended modes',
        'Compare business competitors',
        'Update internal docs with web info',
        'Calendar and email synthesis'
      ],

      useCases: [
        'Complex reasoning tasks',
        'Mathematical problems',
        'Code debugging',
        'Philosophical analysis',
        'Business intelligence',
        'Competitive analysis'
      ],

      pricing: {
        tier: 'Claude Pro or API',
        thinkingTokens: 'Additional cost for extended thinking',
        apiAccess: true
      },

      strengths: [
        'Best for complex reasoning',
        'Transparent thinking process',
        'Configurable thinking budget',
        'Strong coding capabilities',
        'Research + Extended Thinking synergy'
      ],

      limitations: [
        'Shorter research time vs competitors',
        'Thinking tokens add cost',
        'Less visual report generation',
        'Better for reasoning than broad research'
      ]
    }
  ],

  chinese: [
    {
      id: 'deepseek-r1',
      provider: 'DeepSeek',
      name: 'DeepSeek R1',
      model: 'R1 (R2 expected Spring 2026)',
      launched: 'January 2025',
      status: 'Production + Research',
      availability: 'Open-source',

      capabilities: {
        trainingCost: '$6 million',
        parameters: 'N/A',
        multimodal: false,
        reasoning: true,
        openSource: true,
        autonomousAgent: 'Late 2025 launch planned'
      },

      benchmarks: {
        humanityLastExam: 9.4,
        costEfficiency: '6x-17x cheaper than GPT-4'
      },

      features: [
        'Ultra cost-efficient training',
        'Open-source reasoning model',
        'Matches OpenAI o1 on key benchmarks',
        'Novel mHC training method (2026)',
        'Autonomous agent planned',
        'Works with capped Chinese GPUs'
      ],

      useCases: [
        'Cost-efficient research',
        'Open-source AI development',
        'Reasoning tasks',
        'Developing nation AI adoption'
      ],

      pricing: {
        tier: 'Open-source',
        cost: 'Free for download',
        commercial: 'Permitted'
      },

      strengths: [
        'Extremely cost-efficient ($6M training)',
        'Open-source availability',
        'Strong reasoning capabilities',
        'Works with US-restricted chips',
        'Global adoption in developing nations'
      ],

      limitations: [
        'Lower HLE score than Western models',
        'Autonomous agent not yet launched',
        'Less mature ecosystem',
        'Limited multimodal support'
      ]
    },

    {
      id: 'baidu-ernie-5',
      provider: 'Baidu',
      name: 'ERNIE 5.0 + Xinxiang Agent',
      model: 'ERNIE 5.0 (2.4T parameters)',
      launched: 'October 2025',
      status: 'Production',
      availability: 'Baidu Cloud, API via Qianfan',

      capabilities: {
        parameters: '2.4 trillion',
        multimodal: 'Native omni-modal (text, image, audio, video)',
        agentPlatform: 'Xinxiang (super agent)',
        maas: 'Qianfan platform',
        chips: 'Kunlunxin M100 (2026), M300 (2027)'
      },

      benchmarks: {
        // Specific benchmarks not disclosed
        multimodal: 'State-of-the-art for Chinese models'
      },

      features: [
        'Native omni-modal understanding',
        'Xinxiang general super agent platform',
        'Multiple AI agents working together',
        'Qianfan MaaS platform',
        'GenFlow general AI agent',
        'Self-evolving agent Famou',
        'Digital human technology',
        'No-code app builder Miaoda',
        'Custom AI chips (M100, M300)'
      ],

      useCases: [
        'Enterprise AI agent deployment',
        'Multimodal content analysis',
        'Digital employees',
        'Complex workflow automation',
        'Chinese market applications'
      ],

      pricing: {
        tier: 'Enterprise/API',
        platform: 'Qianfan MaaS',
        openSource: 'June 2025 planned'
      },

      strengths: [
        'Largest parameter count (2.4T)',
        'Native omni-modal capabilities',
        'Comprehensive agent platform',
        'Custom AI chip development',
        'Strong enterprise integration'
      ],

      limitations: [
        'Primarily Chinese market focus',
        'Limited English documentation',
        'Less global adoption',
        'Closed ecosystem (until June 2025)'
      ]
    },

    {
      id: 'alibaba-qwen',
      provider: 'Alibaba',
      name: 'Qwen 2.5 / Qwen3-Coder',
      model: 'Qwen 2.5 (0.5B-72B), Qwen3-Coder',
      launched: '2024-2025',
      status: 'Production',
      availability: 'Open-source',

      capabilities: {
        parameters: '0.5B - 72B',
        multimodal: true,
        openSource: true,
        coding: 'Specialized Qwen3-Coder',
        reasoning: true
      },

      benchmarks: {
        // Competitive with similar-sized Western models
        coding: 'Strong performance on coding benchmarks'
      },

      features: [
        'Multiple model sizes (0.5B-72B)',
        'Open-source availability',
        'Specialized coding models',
        'Multimodal support',
        'Regular updates and improvements',
        'Large developer community'
      ],

      useCases: [
        'General-purpose AI tasks',
        'Code generation and debugging',
        'Research and analysis',
        'Edge deployment (smaller models)',
        'Custom fine-tuning'
      ],

      pricing: {
        tier: 'Open-source',
        cost: 'Free',
        commercial: 'Permitted'
      },

      strengths: [
        'Full open-source availability',
        'Multiple model sizes for flexibility',
        'Strong coding capabilities',
        'Active development',
        'Growing global community'
      ],

      limitations: [
        'Not specifically designed for deep research',
        'Less specialized than dedicated research agents',
        'Smaller models limited capabilities'
      ]
    },

    {
      id: 'tencent-hunyuan',
      provider: 'Tencent',
      name: 'Hunyuan',
      model: 'Hunyuan (proprietary)',
      launched: '2024',
      status: 'Production',
      availability: 'Closed, Tencent Cloud',

      capabilities: {
        parameters: 'Undisclosed',
        multimodal: true,
        research: 'NLP, Computer Vision, Speech',
        investment: '$15B (2023-2026)',
        researchers: '500+ AI Lab researchers'
      },

      benchmarks: {
        // Not publicly disclosed
        internal: 'Competitive with top Chinese models'
      },

      features: [
        'Massive AI investment ($15B)',
        'Large research team (500+)',
        'Strong NLP capabilities',
        'Computer vision integration',
        'Speech recognition',
        'Tencent Cloud integration',
        'Enterprise focus'
      ],

      useCases: [
        'Enterprise AI solutions',
        'Tencent ecosystem integration',
        'Social media analysis',
        'Gaming AI',
        'Cloud services'
      ],

      pricing: {
        tier: 'Enterprise',
        platform: 'Tencent Cloud',
        openSource: 'Closed (as of 2026)'
      },

      strengths: [
        'Massive investment and resources',
        'Large research team',
        'Deep Tencent ecosystem integration',
        'Strong multimodal capabilities'
      ],

      limitations: [
        'Closed model',
        'Limited public information',
        'Tencent ecosystem lock-in',
        'Not optimized for deep research'
      ]
    }
  ]
};

// GET /api/deepresearch/agents - Get all Deep Research agents
router.get('/agents', (req, res) => {
  try {
    const allAgents = {
      western: DEEP_RESEARCH_AGENTS.western,
      chinese: DEEP_RESEARCH_AGENTS.chinese,
      summary: {
        totalAgents: DEEP_RESEARCH_AGENTS.western.length + DEEP_RESEARCH_AGENTS.chinese.length,
        westernCount: DEEP_RESEARCH_AGENTS.western.length,
        chineseCount: DEEP_RESEARCH_AGENTS.chinese.length,
        lastUpdated: '2026-01-09'
      }
    };

    res.json(allAgents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/agents/:id - Get specific agent details
router.get('/agents/:id', (req, res) => {
  try {
    const { id } = req.params;

    const agent = [...DEEP_RESEARCH_AGENTS.western, ...DEEP_RESEARCH_AGENTS.chinese]
      .find(a => a.id === id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/comparison - Get side-by-side comparison
router.get('/comparison', (req, res) => {
  try {
    const comparison = {
      benchmarks: {
        humanityLastExam: [
          { agent: 'Gemini Deep Research', score: 46.4 },
          { agent: 'ChatGPT Agent', score: 44.4 },
          { agent: 'DeepSeek R1', score: 9.4 }
        ],
        browseComp: [
          { agent: 'ChatGPT Agent', score: 68.9 },
          { agent: 'Gemini Deep Research', score: 59.2 }
        ],
        deepSearchQA: [
          { agent: 'Gemini Deep Research', score: 66.1 }
        ]
      },

      researchSpeed: [
        { agent: 'Claude Research', time: '1-3 minutes', useCase: 'Quick research' },
        { agent: 'ChatGPT Agent', time: '5-30 minutes', useCase: 'Standard research' },
        { agent: 'Gemini Deep Research', time: '20-60 minutes', useCase: 'Deep research' }
      ],

      costEfficiency: [
        { agent: 'DeepSeek R1', training: '$6M', advantage: 'Ultra cost-efficient' },
        { agent: 'Claude Research', cost: 'API-based', advantage: 'Configurable thinking budget' },
        { agent: 'ChatGPT Agent', cost: 'Free tier available', advantage: '5 queries/month free' },
        { agent: 'Gemini Deep Research', cost: 'Subscription-based', advantage: 'Unlimited within limits' }
      ],

      openSource: [
        { agent: 'DeepSeek R1', status: 'Fully open-source' },
        { agent: 'Qwen 2.5', status: 'Fully open-source' },
        { agent: 'ERNIE 5.0', status: 'Planned June 2025' },
        { agent: 'Claude Research', status: 'Closed (API available)' },
        { agent: 'ChatGPT Agent', status: 'Closed (API available)' },
        { agent: 'Gemini Deep Research', status: 'Closed (API available)' }
      ],

      multimodal: {
        western: [
          { agent: 'Gemini Deep Research', support: 'Text, Image, File, Visual reports' },
          { agent: 'ChatGPT Agent', support: 'Text, Image, PDF, Code' },
          { agent: 'Claude Research', support: 'Text, limited multimodal' }
        ],
        chinese: [
          { agent: 'ERNIE 5.0', support: 'Native omni-modal (text, image, audio, video)' },
          { agent: 'Qwen 2.5', support: 'Multimodal' },
          { agent: 'Tencent Hunyuan', support: 'Multimodal' }
        ]
      },

      specializations: {
        reasoning: ['Claude Research', 'DeepSeek R1'],
        webResearch: ['Gemini Deep Research', 'ChatGPT Agent'],
        visualReports: ['Gemini Deep Research'],
        agentPlatforms: ['ERNIE 5.0 (Xinxiang)', 'ChatGPT Agent'],
        coding: ['Claude Research', 'Qwen3-Coder'],
        enterprise: ['ERNIE 5.0', 'Tencent Hunyuan']
      }
    };

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/western - Get Western agents only
router.get('/western', (req, res) => {
  try {
    res.json({
      agents: DEEP_RESEARCH_AGENTS.western,
      count: DEEP_RESEARCH_AGENTS.western.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/chinese - Get Chinese agents only
router.get('/chinese', (req, res) => {
  try {
    res.json({
      agents: DEEP_RESEARCH_AGENTS.chinese,
      count: DEEP_RESEARCH_AGENTS.chinese.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/benchmarks - Get all benchmark data
router.get('/benchmarks', (req, res) => {
  try {
    const benchmarks = {
      humanityLastExam: {
        description: "Comprehensive test of AI capabilities across various domains",
        results: [
          { rank: 1, agent: 'Gemini Deep Research', score: 46.4, provider: 'Google' },
          { rank: 2, agent: 'ChatGPT Agent', score: 44.4, provider: 'OpenAI' },
          { rank: 3, agent: 'DeepSeek R1', score: 9.4, provider: 'DeepSeek' }
        ]
      },
      browseComp: {
        description: "Web browsing and information synthesis benchmark",
        results: [
          { rank: 1, agent: 'ChatGPT Agent', score: 68.9, provider: 'OpenAI' },
          { rank: 2, agent: 'Gemini Deep Research', score: 59.2, provider: 'Google' }
        ]
      },
      deepSearchQA: {
        description: "Complex web search tasks benchmark",
        results: [
          { rank: 1, agent: 'Gemini Deep Research', score: 66.1, provider: 'Google' }
        ]
      }
    };

    res.json(benchmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deepresearch/recommendations - Get agent recommendations based on use case
router.get('/recommendations', (req, res) => {
  try {
    const { useCase } = req.query;

    const recommendations = {
      'financial-research': {
        primary: 'Gemini Deep Research',
        reason: 'Best for due diligence, highest accuracy, visual reports',
        alternatives: ['ChatGPT Agent', 'Claude Research']
      },
      'coding': {
        primary: 'Claude Research',
        reason: 'Superior coding capabilities, extended thinking for debugging',
        alternatives: ['Qwen3-Coder', 'ChatGPT Agent']
      },
      'cost-efficiency': {
        primary: 'DeepSeek R1',
        reason: 'Ultra cost-efficient, open-source, strong reasoning',
        alternatives: ['Qwen 2.5', 'ChatGPT Agent (free tier)']
      },
      'quick-research': {
        primary: 'Claude Research',
        reason: 'Fastest research time (1-3 min), efficient',
        alternatives: ['ChatGPT Agent']
      },
      'deep-research': {
        primary: 'Gemini Deep Research',
        reason: 'Longest research time, most thorough, visual reports',
        alternatives: ['ChatGPT Agent']
      },
      'enterprise': {
        primary: 'ERNIE 5.0',
        reason: 'Comprehensive agent platform, enterprise features',
        alternatives: ['Tencent Hunyuan', 'Claude Research']
      },
      'open-source': {
        primary: 'DeepSeek R1',
        reason: 'Fully open-source, strong reasoning capabilities',
        alternatives: ['Qwen 2.5']
      }
    };

    if (useCase && recommendations[useCase]) {
      res.json({
        useCase,
        recommendation: recommendations[useCase]
      });
    } else {
      res.json({
        availableUseCases: Object.keys(recommendations),
        allRecommendations: recommendations
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
