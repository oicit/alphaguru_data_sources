const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Hacker News + GitHub API Routes
 * Provides endpoints for tech trends, developer sentiment, and repository metrics
 *
 * Hacker News API: https://github.com/HackerNews/API
 * - No authentication required
 * - No rate limits (reasonable use)
 * - Firebase REST API
 *
 * GitHub API: https://docs.github.com/en/rest
 * - Rate Limits: 60/hour (unauthenticated), 5,000/hour (authenticated)
 * - Authentication: Personal Access Token (optional but recommended)
 */

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const HN_ALGOLIA_URL = 'https://hn.algolia.com/api/v1';
const GITHUB_BASE_URL = 'https://api.github.com';

// ====================================
// HACKER NEWS ENDPOINTS
// ====================================

// Get top stories from Hacker News
router.post('/hn-top-stories', async (req, res) => {
  try {
    const { limit = 30, includeDetails = true } = req.body;

    // Get top story IDs
    const response = await axios.get(`${HN_BASE_URL}/topstories.json`, {
      timeout: 10000
    });

    const storyIds = response.data.slice(0, limit);

    if (!includeDetails) {
      return res.json({
        success: true,
        count: storyIds.length,
        storyIds: storyIds
      });
    }

    // Fetch details for each story
    const storyPromises = storyIds.map(id =>
      axios.get(`${HN_BASE_URL}/item/${id}.json`, { timeout: 10000 })
        .then(res => res.data)
        .catch(err => null)
    );

    const stories = (await Promise.all(storyPromises))
      .filter(story => story !== null)
      .map(story => ({
        id: story.id,
        title: story.title,
        url: story.url,
        score: story.score,
        by: story.by,
        time: new Date(story.time * 1000).toISOString(),
        descendants: story.descendants || 0, // comment count
        type: story.type
      }));

    res.json({
      success: true,
      count: stories.length,
      stories: stories
    });

  } catch (error) {
    console.error('HN Top Stories Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Hacker News top stories',
      message: error.message
    });
  }
});

// Search Hacker News for company/tech mentions (using Algolia)
router.post('/hn-search', async (req, res) => {
  try {
    const { query, tags = 'story', numericFilters, hitsPerPage = 30 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const params = {
      query: query,
      tags: tags,
      hitsPerPage: hitsPerPage
    };

    if (numericFilters) {
      params.numericFilters = numericFilters;
    }

    const response = await axios.get(`${HN_ALGOLIA_URL}/search`, {
      params: params,
      timeout: 10000
    });

    const hits = response.data.hits.map(hit => ({
      objectID: hit.objectID,
      title: hit.title,
      url: hit.url,
      author: hit.author,
      points: hit.points,
      numComments: hit.num_comments,
      createdAt: hit.created_at,
      storyText: hit.story_text,
      commentText: hit.comment_text
    }));

    res.json({
      success: true,
      query: query,
      count: hits.length,
      totalHits: response.data.nbHits,
      hits: hits
    });

  } catch (error) {
    console.error('HN Search Error:', error.message);
    res.status(500).json({
      error: 'Failed to search Hacker News',
      message: error.message
    });
  }
});

// Identify trending technologies on Hacker News
router.post('/hn-tech-trends', async (req, res) => {
  try {
    const { keywords = ['AI', 'blockchain', 'crypto', 'cloud', 'kubernetes'], daysAgo = 7, hitsPerPage = 100 } = req.body;

    // Calculate timestamp for N days ago
    const timestamp = Math.floor(Date.now() / 1000) - (daysAgo * 24 * 60 * 60);

    const trendData = [];

    // Search for each keyword
    for (const keyword of keywords) {
      try {
        const response = await axios.get(`${HN_ALGOLIA_URL}/search`, {
          params: {
            query: keyword,
            tags: 'story',
            numericFilters: `created_at_i>${timestamp}`,
            hitsPerPage: hitsPerPage
          },
          timeout: 10000
        });

        const hits = response.data.hits;
        const totalPoints = hits.reduce((sum, hit) => sum + (hit.points || 0), 0);
        const totalComments = hits.reduce((sum, hit) => sum + (hit.num_comments || 0), 0);
        const avgPoints = hits.length > 0 ? totalPoints / hits.length : 0;

        trendData.push({
          keyword: keyword,
          mentions: hits.length,
          totalPoints: totalPoints,
          avgPoints: Math.round(avgPoints),
          totalComments: totalComments,
          topStories: hits.slice(0, 5).map(hit => ({
            title: hit.title,
            points: hit.points,
            url: hit.url
          }))
        });
      } catch (err) {
        console.error(`Error fetching trend for ${keyword}:`, err.message);
      }
    }

    // Sort by mentions
    trendData.sort((a, b) => b.mentions - a.mentions);

    res.json({
      success: true,
      daysAgo: daysAgo,
      keywords: keywords,
      trends: trendData
    });

  } catch (error) {
    console.error('HN Tech Trends Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch tech trends',
      message: error.message
    });
  }
});

// Get comments for a Hacker News story
router.post('/hn-story-comments', async (req, res) => {
  try {
    const { storyId, maxDepth = 2 } = req.body;

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    // Get story details
    const storyResponse = await axios.get(`${HN_BASE_URL}/item/${storyId}.json`, {
      timeout: 10000
    });

    const story = storyResponse.data;

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Recursively fetch comments
    const fetchComments = async (commentIds, depth = 0) => {
      if (!commentIds || commentIds.length === 0 || depth >= maxDepth) {
        return [];
      }

      const commentPromises = commentIds.map(id =>
        axios.get(`${HN_BASE_URL}/item/${id}.json`, { timeout: 10000 })
          .then(res => res.data)
          .catch(err => null)
      );

      const comments = (await Promise.all(commentPromises))
        .filter(comment => comment !== null && !comment.deleted && !comment.dead);

      const result = [];
      for (const comment of comments) {
        result.push({
          id: comment.id,
          by: comment.by,
          text: comment.text,
          time: new Date(comment.time * 1000).toISOString(),
          depth: depth
        });

        // Recursively fetch child comments
        if (comment.kids && depth < maxDepth - 1) {
          const childComments = await fetchComments(comment.kids, depth + 1);
          result.push(...childComments);
        }
      }

      return result;
    };

    const comments = await fetchComments(story.kids || []);

    res.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        url: story.url,
        score: story.score,
        by: story.by
      },
      commentCount: comments.length,
      comments: comments
    });

  } catch (error) {
    console.error('HN Story Comments Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch story comments',
      message: error.message
    });
  }
});

// ====================================
// GITHUB ENDPOINTS
// ====================================

/**
 * Helper function to build GitHub API headers
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Object} Headers object
 */
function getGitHubHeaders(token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AlphaGuru/1.0'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return headers;
}

// Get repository statistics
router.post('/gh-repo-stats', async (req, res) => {
  try {
    const { owner, repo, token } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }

    const response = await axios.get(`${GITHUB_BASE_URL}/repos/${owner}/${repo}`, {
      headers: getGitHubHeaders(token),
      timeout: 10000
    });

    const repoData = response.data;

    res.json({
      success: true,
      repository: {
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.watchers_count,
        language: repoData.language,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        size: repoData.size,
        defaultBranch: repoData.default_branch,
        hasWiki: repoData.has_wiki,
        hasPages: repoData.has_pages,
        topics: repoData.topics || []
      }
    });

  } catch (error) {
    console.error('GitHub Repo Stats Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch repository statistics',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get trending repositories
router.post('/gh-trending-repos', async (req, res) => {
  try {
    const { language, since = 'daily', token } = req.body;

    // Calculate date range based on 'since' parameter
    const dateRanges = {
      'daily': 1,
      'weekly': 7,
      'monthly': 30
    };
    const days = dateRanges[since] || 7;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build search query
    let query = `created:>${sinceDate}`;
    if (language) {
      query += ` language:${language}`;
    }

    const response = await axios.get(`${GITHUB_BASE_URL}/search/repositories`, {
      headers: getGitHubHeaders(token),
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 30
      },
      timeout: 10000
    });

    const repos = response.data.items.map(repo => ({
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      createdAt: repo.created_at,
      topics: repo.topics || []
    }));

    res.json({
      success: true,
      since: since,
      language: language || 'all',
      count: repos.length,
      totalCount: response.data.total_count,
      repositories: repos
    });

  } catch (error) {
    console.error('GitHub Trending Repos Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trending repositories',
      message: error.response?.data?.message || error.message
    });
  }
});

// Track GitHub activity for tech companies
router.post('/gh-company-activity', async (req, res) => {
  try {
    const { organization, token, perPage = 10 } = req.body;

    if (!organization) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Get organization details
    const orgResponse = await axios.get(`${GITHUB_BASE_URL}/orgs/${organization}`, {
      headers: getGitHubHeaders(token),
      timeout: 10000
    });

    const org = orgResponse.data;

    // Get organization repositories
    const reposResponse = await axios.get(`${GITHUB_BASE_URL}/orgs/${organization}/repos`, {
      headers: getGitHubHeaders(token),
      params: {
        sort: 'updated',
        per_page: perPage
      },
      timeout: 10000
    });

    const repos = reposResponse.data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      language: repo.language,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at
    }));

    // Calculate total stars across all repos
    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

    res.json({
      success: true,
      organization: {
        login: org.login,
        name: org.name,
        description: org.description,
        url: org.html_url,
        publicRepos: org.public_repos,
        followers: org.followers,
        following: org.following,
        createdAt: org.created_at,
        updatedAt: org.updated_at
      },
      totalStars: totalStars,
      recentRepositories: repos
    });

  } catch (error) {
    console.error('GitHub Company Activity Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch company activity',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get repository commit activity
router.post('/gh-repo-commits', async (req, res) => {
  try {
    const { owner, repo, token, since, perPage = 30 } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }

    const params = {
      per_page: perPage
    };

    if (since) {
      params.since = since;
    }

    const response = await axios.get(`${GITHUB_BASE_URL}/repos/${owner}/${repo}/commits`, {
      headers: getGitHubHeaders(token),
      params: params,
      timeout: 10000
    });

    const commits = response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        date: commit.commit.committer.date
      },
      url: commit.html_url
    }));

    res.json({
      success: true,
      repository: `${owner}/${repo}`,
      count: commits.length,
      commits: commits
    });

  } catch (error) {
    console.error('GitHub Repo Commits Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch repository commits',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get repository contributors
router.post('/gh-repo-contributors', async (req, res) => {
  try {
    const { owner, repo, token, perPage = 30 } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }

    const response = await axios.get(`${GITHUB_BASE_URL}/repos/${owner}/${repo}/contributors`, {
      headers: getGitHubHeaders(token),
      params: {
        per_page: perPage
      },
      timeout: 10000
    });

    const contributors = response.data.map(contributor => ({
      login: contributor.login,
      id: contributor.id,
      avatarUrl: contributor.avatar_url,
      url: contributor.html_url,
      contributions: contributor.contributions,
      type: contributor.type
    }));

    const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);

    res.json({
      success: true,
      repository: `${owner}/${repo}`,
      count: contributors.length,
      totalContributions: totalContributions,
      contributors: contributors
    });

  } catch (error) {
    console.error('GitHub Repo Contributors Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch repository contributors',
      message: error.response?.data?.message || error.message
    });
  }
});

// Search GitHub repositories by topic
router.post('/gh-search-by-topic', async (req, res) => {
  try {
    const { topic, token, sort = 'stars', perPage = 30 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const response = await axios.get(`${GITHUB_BASE_URL}/search/repositories`, {
      headers: getGitHubHeaders(token),
      params: {
        q: `topic:${topic}`,
        sort: sort,
        order: 'desc',
        per_page: perPage
      },
      timeout: 10000
    });

    const repos = response.data.items.map(repo => ({
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updatedAt: repo.updated_at,
      topics: repo.topics || []
    }));

    res.json({
      success: true,
      topic: topic,
      count: repos.length,
      totalCount: response.data.total_count,
      repositories: repos
    });

  } catch (error) {
    console.error('GitHub Search By Topic Error:', error.message);
    res.status(500).json({
      error: 'Failed to search repositories by topic',
      message: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
