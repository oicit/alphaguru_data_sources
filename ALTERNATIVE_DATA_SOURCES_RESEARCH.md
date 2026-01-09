# Alternative Data Sources for Financial/Investment Insights
## Comprehensive API & Extraction Methods Research

**Document Date:** January 2026
**Purpose:** Evaluate data extraction methods for building an investment intelligence dashboard

---

## 1. X.com (Twitter)

### 1.1 API Method: Twitter API v2

**Official API Details:**
- **Endpoint:** https://api.twitter.com/2/
- **Authentication:** OAuth 2.0, Bearer Token
- **Documentation:** https://developer.twitter.com/en/docs/twitter-api

**Tier Structure (2026):**

| Tier | Cost | Rate Limits | Key Features |
|------|------|-------------|--------------|
| Free | $0/month | 1,500 tweets/month (read)<br>50 tweets/month (write)<br>500,000 tweets/month (App-only) | Basic tweet access, user lookup |
| Basic | $100/month | 10,000 tweets/month<br>3,000 posts/month | Enhanced search, user timeline |
| Pro | $5,000/month | 1M tweets/month<br>Search archive access | Full historical search, filtered stream |
| Enterprise | Custom | Custom limits | Volume streams, full archive, premium support |

**Key Endpoints for Financial Data:**
- `GET /2/tweets/search/recent` - Search tweets (last 7 days)
- `GET /2/tweets/search/all` - Full archive search (Pro+ only)
- `GET /2/tweets` - Tweet lookup with cashtags
- `GET /2/users/:id/tweets` - User timeline (track influencers)
- `GET /2/tweets/counts/recent` - Tweet volume metrics
- Filtered Stream API - Real-time tweet monitoring

**Rate Limits (Free Tier):**
- 15 requests per 15-minute window (most endpoints)
- Very restrictive for financial monitoring

### 1.2 Alternative Methods

**A. Third-Party APIs:**

1. **Apify Twitter Scraper**
   - Cost: Pay-per-use ($49+ for meaningful data)
   - No authentication required
   - Can extract: tweets, user profiles, trending topics
   - Rate: ~1,000 tweets for $5
   - Legal: Gray area, violates Twitter ToS

2. **ScraperAPI + Selenium**
   - Cost: $49-$249/month
   - Proxy rotation to avoid blocks
   - Can scrape without API
   - Legal risk: Violates Twitter ToS

3. **RapidAPI Twitter Alternatives**
   - Services like "Twitter V2" on RapidAPI
   - Cost: $0-$500/month
   - Essentially proxy to official API or scraping
   - Variable reliability

4. **Nitter Instances**
   - Free, open-source Twitter frontend
   - No authentication required
   - Can parse RSS feeds
   - Unreliable (instances frequently shut down)

**B. Scraping Tools:**

1. **Tweepy (Python)**
   - Official Twitter API wrapper
   - Free, but limited by API tier
   - Best for Free/Basic tier automation

2. **snscrape (Python)**
   - No API key required
   - Scrapes Twitter directly
   - Violates ToS, risk of IP ban
   - Unreliable due to frequent Twitter changes

3. **Twint (Discontinued)**
   - Previously popular scraper
   - No longer functional as of 2023

### 1.3 Key Data Points Extractable

**Financial-Relevant Data:**
- Tweet text with cashtags ($AAPL, $TSLA)
- User metrics: followers, verified status
- Engagement: likes, retweets, replies, views
- Timestamp (for time-series analysis)
- User bio/location (institutional vs retail)
- Quoted tweets and threads
- Media attachments (charts, screenshots)
- Hashtag trends (#earnings, #IPO)

**Advanced Metrics (with processing):**
- Sentiment scores per ticker
- Influencer sentiment (weighted by followers)
- Viral tweet detection (unusual engagement)
- Breaking news speed (first tweets on topics)
- Retail vs institutional account patterns

### 1.4 Investment Insights

**Primary Use Cases:**

1. **Sentiment Analysis**
   - Track sentiment shifts before/after earnings
   - Detect negative sentiment spikes (potential shorts)
   - Measure retail investor enthusiasm

2. **Trend Detection**
   - Identify trending tickers before mainstream coverage
   - Track meme stock activity
   - Monitor regulatory/policy discussions

3. **Influencer Tracking**
   - Follow financial Twitter accounts (@elonmusk, @carl_icahn)
   - Track institutional investor commentary
   - Analyst sentiment shifts

4. **Breaking News**
   - First reports of company issues
   - M&A rumors
   - Regulatory actions
   - Executive departures

5. **Volume Metrics**
   - Unusual spike in ticker mentions
   - Growing discussion velocity
   - Compare volume to price action

**Signal Quality:**
- Short-term price movements: High correlation
- Long-term trends: Low correlation
- Event detection: Very high value
- Noise: Very high (requires filtering)

### 1.5 Implementation Recommendation

**Recommended Approach:**

**Option A: Free Tier Starter (Best for MVP)**
- Use Twitter API v2 Free tier
- Focus on specific high-value accounts (50-100 influencers)
- Poll timelines every 15 minutes
- Track 10-20 specific cashtags via search
- Cost: $0/month
- Limitation: Very limited coverage, 7-day history only

**Option B: Basic Tier ($100/month)**
- 10,000 tweets/month = ~333 tweets/day
- Sufficient for:
  - 50 influencer accounts (timelines)
  - Search 5-10 tickers daily
  - Basic sentiment tracking
- Best value for small-scale monitoring

**Option C: Strategic Hybrid**
- Use Free tier for influencer tracking
- Supplement with Reddit for broader sentiment
- Use news APIs for breaking news
- Cost: $0-100/month
- Recommended for starting out

**Legal & Compliance:**
- Stay within API ToS
- Avoid scraping (risk of account suspension)
- Don't redistribute raw tweets (violates ToS)
- Attribution required for displayed content

**Technical Stack:**
- Python + Tweepy library
- PostgreSQL for tweet storage
- Sentiment analysis: VADER, FinBERT, or GPT-4 API
- Real-time: WebSocket streaming (Pro tier) or polling (Free tier)

---

## 2. Reddit

### 2.1 API Method: Reddit API

**Official API Details:**
- **Endpoint:** https://oauth.reddit.com/
- **Authentication:** OAuth 2.0
- **Documentation:** https://www.reddit.com/dev/api/

**API Tier Structure:**

| Access Type | Cost | Rate Limits | Features |
|-------------|------|-------------|----------|
| Free API | $0 | 60 requests/minute<br>100 requests/minute (OAuth) | Full read access, basic write |
| Reddit Data API | Contact sales | Higher limits | Bulk historical access |

**Rate Limits (Free Tier):**
- 100 requests per minute with OAuth
- 60 requests per minute without OAuth
- 1,000 requests per hour (unofficial soft limit)
- Very generous compared to Twitter

**Key Endpoints:**
- `GET /r/{subreddit}/new` - New posts
- `GET /r/{subreddit}/hot` - Trending posts
- `GET /r/{subreddit}/top` - Top posts by timeframe
- `GET /r/{subreddit}/comments/{article}` - Comment threads
- `GET /r/{subreddit}/search` - Search within subreddit
- `GET /user/{username}/submitted` - User post history

### 2.2 Alternative Methods

**A. PRAW (Python Reddit API Wrapper)**
- Official Python wrapper for Reddit API
- Free, well-maintained
- Handles OAuth automatically
- Respects rate limits
- **Best choice for Reddit access**

```python
import praw

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="YOUR_USER_AGENT"
)

# Example: Get WSB hot posts
for submission in reddit.subreddit("wallstreetbets").hot(limit=100):
    print(submission.title, submission.score)
```

**B. Pushshift API (Historical Data)**
- **Status:** Significantly degraded since 2023
- Previously offered full Reddit historical archive
- Now requires Reddit Data API partnership
- Free tier: Very limited
- Alternative: Reddit's own search (less powerful)

**C. Third-Party Services:**

1. **Pullpush.io (Pushshift Alternative)**
   - Community-run Pushshift replacement
   - Free, but unreliable
   - Limited historical data

2. **SocialGrep**
   - Reddit search and analytics
   - Cost: $9-$99/month
   - Historical data access
   - API for programmatic access

3. **Reddit Insight / Subreddit Stats**
   - Aggregated metrics
   - Limited free tier
   - Not suitable for real-time trading

**D. Scraping:**
- Generally unnecessary (API is generous)
- Use PRAW instead
- Direct scraping violates ToS

### 2.3 Key Data Points Extractable

**Post-Level Data:**
- Title and body text
- Author and flair
- Upvote ratio and score
- Number of comments
- Awards received
- Timestamp
- URL/link (for DD posts)
- Flair tags (DD, Discussion, YOLO, Gain, Loss)

**Comment-Level Data:**
- Comment text and replies
- Comment score
- Author karma
- Depth in thread
- Timestamp
- Awards

**Subreddit-Level Data:**
- Subscriber count
- Active users
- Moderator list
- Subreddit rules

**Financial-Specific Extraction:**
- Ticker mentions (regex: $AAPL or AAPL)
- Position sizes (calls, puts, shares)
- Strike prices and expiration dates
- Gain/loss amounts
- Sentiment from text

### 2.4 Investment Insights

**Primary Use Cases:**

1. **WallStreetBets Sentiment**
   - Track trending tickers on r/wallstreetbets
   - Identify potential "meme stock" candidates
   - Monitor options activity discussion
   - Gauge retail sentiment extremes
   - **Signal:** Strong short-term price impact (1-7 days)

2. **Quality Due Diligence**
   - r/stocks, r/investing for thoughtful analysis
   - r/SecurityAnalysis for fundamental research
   - r/options for derivatives strategies
   - **Signal:** Medium-term insights (weeks to months)

3. **Sentiment Analysis**
   - Track upvote/downvote patterns
   - Measure comment sentiment
   - Identify controversy (upvote ratio)
   - **Signal:** Leading indicator for price movement

4. **Contrarian Indicators**
   - Extreme bullishness (top signal)
   - Extreme bearishness (bottom signal)
   - Loss porn volume (capitulation)
   - **Signal:** Sentiment extremes often precede reversals

5. **Specific Event Tracking**
   - Earnings reactions
   - FDA approvals (biotech)
   - Product launches
   - Regulatory news

**Key Subreddits for Financial Data:**
- r/wallstreetbets (3.5M+ members) - High-risk retail sentiment
- r/stocks (6M+ members) - General stock discussion
- r/investing (2.5M+ members) - Long-term investing
- r/options (800K+ members) - Options trading
- r/SecurityAnalysis (150K+ members) - Fundamental analysis
- r/SPACs, r/pennystocks - Niche opportunities
- Company-specific subreddits (r/teslamotors, r/apple)

**Signal Quality:**
- Short-term trading: High (especially WSB)
- Contrarian signals: Medium-High
- Fundamental insights: Medium (varies by subreddit)
- Noise level: High on WSB, Low on SecurityAnalysis

### 2.5 Implementation Recommendation

**Recommended Approach: PRAW + PostgreSQL**

**Architecture:**
```
PRAW Client → Reddit API → Data Processing → PostgreSQL → Dashboard
                              ├─ Ticker Extraction
                              ├─ Sentiment Analysis
                              └─ Metrics Calculation
```

**Implementation Strategy:**

1. **Polling Schedule:**
   - Hot posts: Every 10 minutes
   - New posts: Every 5 minutes
   - Top posts: Every hour
   - Comments on trending posts: Every 15 minutes

2. **Subreddits to Monitor:**
   - Start with 5-10 key subreddits
   - Scale up as needed (rate limits are generous)

3. **Data Processing:**
   - Extract tickers using regex
   - Calculate sentiment (VADER, TextBlob, or FinBERT)
   - Track metrics: mentions, upvote velocity, comment volume
   - Identify unusual spikes

4. **Storage:**
   - Store full posts and comments
   - Indexed by ticker, subreddit, timestamp
   - Enable time-series analysis

**Sample Code Structure:**

```python
import praw
import re
from datetime import datetime

def extract_tickers(text):
    # Find $TICKER or common ticker patterns
    cashtags = re.findall(r'\$([A-Z]{1,5})', text)
    # Add more sophisticated ticker extraction
    return set(cashtags)

def monitor_subreddit(subreddit_name, limit=100):
    subreddit = reddit.subreddit(subreddit_name)

    for submission in subreddit.hot(limit=limit):
        tickers = extract_tickers(submission.title + ' ' + submission.selftext)

        data = {
            'post_id': submission.id,
            'title': submission.title,
            'author': str(submission.author),
            'score': submission.score,
            'upvote_ratio': submission.upvote_ratio,
            'num_comments': submission.num_comments,
            'created_utc': datetime.fromtimestamp(submission.created_utc),
            'tickers': list(tickers),
            'url': submission.url,
            'flair': submission.link_flair_text
        }

        # Store in database
        save_to_db(data)

        # Get comments for high-engagement posts
        if submission.score > 100:
            submission.comments.replace_more(limit=0)
            for comment in submission.comments.list()[:50]:
                # Process comments
                pass

# Run continuously
while True:
    monitor_subreddit('wallstreetbets')
    monitor_subreddit('stocks')
    time.sleep(300)  # 5 minutes
```

**Cost Analysis:**
- API: $0/month (free)
- Compute: Minimal (can run on free tier)
- Storage: ~$5-20/month (depending on volume)
- Total: $5-20/month

**Legal & Compliance:**
- Use official API (PRAW)
- Respect rate limits
- Follow Reddit ToS
- Don't spam or vote manipulate
- Anonymize user data if storing
- Check subreddit rules for bot usage

**Advantages:**
- Generous free tier
- High-quality discussion (compared to Twitter)
- Strong signal for retail sentiment
- Well-documented API
- Active community

**Limitations:**
- Delayed compared to real-time markets
- Primarily retail investor focus
- Can be echo chamber
- Requires NLP for insight extraction

---

## 3. Podcast/YouTube Video

### 3.1 API Method: YouTube Data API v3

**Official API Details:**
- **Endpoint:** https://www.googleapis.com/youtube/v3/
- **Authentication:** API Key (simple) or OAuth 2.0
- **Documentation:** https://developers.google.com/youtube/v3

**Quota System:**
- Default quota: 10,000 units/day (free)
- Each operation costs different units:
  - Search: 100 units
  - Video details: 1 unit
  - Comment threads: 1 unit
  - Channel details: 1 unit

**Daily Capacity (Free Tier):**
- ~100 searches/day OR
- ~10,000 video detail requests OR
- Mix of operations

**Quota Increase:**
- Request increase via Google Cloud Console
- Approval required (not guaranteed)
- May require business justification

**Pricing (if exceeding quota):**
- Not directly purchasable
- Must apply for higher quota
- Enterprise: Contact Google sales

**Key Endpoints:**
- `GET /search` - Search videos (100 units)
- `GET /videos` - Video details (1 unit)
- `GET /channels` - Channel info (1 unit)
- `GET /commentThreads` - Video comments (1 unit)
- `GET /captions` - List captions (50 units)

**Captions/Transcript Access:**
- Caption track listing: 50 units
- **Cannot download transcripts via API directly**
- Must use YouTube's caption download feature
- Alternative: Third-party tools required

### 3.2 YouTube Alternative Methods

**A. YouTube Transcript API (Python Library)**

```python
from youtube_transcript_api import YouTubeTranscriptApi

# Get transcript without using quota
transcript = YouTubeTranscriptApi.get_transcript('video_id')
```

- **Free, unofficial library**
- Extracts auto-generated or manual captions
- No API key required
- Doesn't use YouTube API quota
- Works by parsing YouTube's internal API
- **Best method for transcript extraction**

**B. Third-Party Services:**

1. **AssemblyAI**
   - Audio transcription service
   - Cost: $0.00025/second (~$15/hour of audio)
   - High accuracy, speaker detection
   - Download audio → Transcribe

2. **Rev.ai**
   - Cost: $0.02-0.05/minute
   - Human + AI transcription
   - Good for earnings calls

3. **Whisper (OpenAI)**
   - Free, open-source
   - Run locally or use API
   - API: $0.006/minute
   - Very high accuracy

**C. Audio Download + Transcription:**

```python
import yt_dlp
from openai import OpenAI

# Download audio
ydl_opts = {'format': 'bestaudio'}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['video_url'])

# Transcribe with Whisper
client = OpenAI()
audio_file = open("audio.mp3", "rb")
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file
)
```

**D. Channel Monitoring:**
- Use RSS feeds (free, no quota):
  - `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`
- Monitor new uploads without API

### 3.3 Podcast API Methods

**A. Apple Podcasts API**
- Limited public API
- Search available via iTunes Search API
- No transcript access
- RSS feed access (free)

**B. Spotify Podcast API**
- Spotify for Developers API
- Free tier: 10,000 requests/day
- Episode metadata only
- No transcript access
- Must use Spotify OAuth

**C. Podcast RSS Feeds (Best Method)**
- Most podcasts publish RSS feeds
- Free, no authentication
- Contains episode metadata
- Links to audio files
- Parse with feedparser (Python)

```python
import feedparser

feed = feedparser.parse('podcast_rss_url')
for entry in feed.entries:
    print(entry.title, entry.published, entry.enclosures[0].href)
```

**D. Podcast APIs/Aggregators:**

1. **Listen Notes API**
   - Podcast search and database
   - Free tier: 100 requests/month
   - Paid: $49-$499/month
   - Comprehensive podcast metadata
   - No transcripts

2. **Podcast Index**
   - Open podcast database
   - Free API
   - RSS feed aggregation
   - Good for discovery

3. **Podchaser API**
   - Podcast database
   - Free tier limited
   - Good for host/guest tracking

**E. Transcript Services:**
- Most podcasts don't provide transcripts
- Must transcribe audio yourself
- Use Whisper or AssemblyAI
- Cost: $5-20 per hour of audio

### 3.4 Key Data Points Extractable

**YouTube Video Metadata:**
- Title, description, tags
- View count, like/dislike ratio
- Comment count and comments
- Upload date
- Channel name and subscriber count
- Video duration
- Category

**Podcast Metadata:**
- Episode title and description
- Publication date
- Duration
- Show notes
- Host/guest information (if structured)

**Transcript Data:**
- Full text content
- Timestamps (sentence-level)
- Speaker labels (if available)

**Financial Content Extraction:**
- Company/ticker mentions
- Earnings figures quoted
- Executive quotes
- Analyst price targets
- Market predictions
- Sentiment (bullish/bearish)
- Topics discussed (macro, sector, specific stocks)

### 3.5 Investment Insights

**Primary Use Cases:**

1. **Earnings Call Analysis**
   - CEO/CFO tone and sentiment
   - Forward guidance extraction
   - Question themes from analysts
   - Compare language quarter-over-quarter
   - Detect hedging language ("maybe", "could", "might")
   - **Source:** Seeking Alpha, company investor relations

2. **Expert Interviews**
   - Track prominent investor interviews
   - Extract thesis and conviction level
   - Monitor position changes
   - Channels: Bloomberg, CNBC, All-In Podcast
   - **Signal:** Medium-term directional bias

3. **Financial Education Content**
   - Identify trending investment themes
   - Track popular strategies
   - Gauge retail investor education level
   - Channels: Graham Stephan, Meet Kevin, Andrei Jikh

4. **Market Commentary**
   - Daily/weekly market analysis
   - Sentiment on macro conditions
   - Sector rotation insights
   - Channels: Yahoo Finance, Real Vision

5. **Tech/Startup Podcasts**
   - Early trend detection
   - Startup ecosystem health
   - Technology adoption signals
   - Podcasts: All-In, Acquired, a16z Podcast

**High-Value Channels/Podcasts:**
- **Earnings calls:** Company investor relations pages
- **Investor interviews:** Bloomberg Technology, Odd Lots
- **Market analysis:** The Compound, Animal Spirits
- **Tech trends:** All-In Podcast, Acquired
- **Macro:** MacroVoices, Grant Williams Podcast

**Signal Quality:**
- Earnings call sentiment: High (institutional use)
- Expert predictions: Medium (entertainment factor)
- Retail education trends: Medium (contrarian indicator)
- Tech podcast trends: Medium-High (6-12 month lead time)

### 3.6 Implementation Recommendation

**Recommended Approach: Hybrid YouTube + Podcast RSS**

**Architecture:**
```
YouTube RSS Feed → New Video Detection
    ↓
YouTube Transcript API → Extract Transcript
    ↓
NLP Processing → Ticker Extraction, Sentiment, Key Quotes
    ↓
PostgreSQL Storage → Dashboard

Podcast RSS Feed → New Episode Detection
    ↓
Download Audio → Whisper API → Transcript
    ↓
NLP Processing → Insights
    ↓
Storage
```

**Implementation Strategy:**

**Phase 1: YouTube (Easier)**
1. Identify 20-50 high-value channels
2. Monitor via RSS feeds (no quota)
3. When new video detected:
   - Use youtube_transcript_api to get transcript
   - Process for tickers and sentiment
4. Focus on: earnings call channels, financial news, specific investors

**Phase 2: Podcasts (More Complex)**
1. Curate 10-20 financial podcasts
2. Monitor RSS feeds
3. When new episode:
   - Download audio (yt-dlp for YouTube podcasts)
   - Transcribe with Whisper API
   - Extract insights
4. Focus on: macro podcasts, investor interviews

**Sample Implementation:**

```python
import feedparser
from youtube_transcript_api import YouTubeTranscriptApi
import re

# YouTube channel RSS
CHANNELS = [
    'UCXuqSBlHAE6Xw-yeJA0Tunw',  # Linus Tech Tips (example)
    # Add financial channels
]

def monitor_youtube_channel(channel_id):
    rss_url = f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}'
    feed = feedparser.parse(rss_url)

    for entry in feed.entries[:5]:  # Latest 5 videos
        video_id = entry.yt_videoid

        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            full_text = ' '.join([t['text'] for t in transcript])

            # Extract tickers
            tickers = extract_tickers(full_text)

            # Analyze sentiment
            sentiment = analyze_sentiment(full_text)

            # Store
            save_video_analysis({
                'video_id': video_id,
                'title': entry.title,
                'published': entry.published,
                'channel': channel_id,
                'transcript': full_text,
                'tickers': tickers,
                'sentiment': sentiment
            })

        except Exception as e:
            print(f"Could not get transcript for {video_id}: {e}")

def transcribe_podcast_episode(audio_url):
    # Download audio
    import yt_dlp
    ydl_opts = {
        'format': 'bestaudio',
        'outtmpl': 'temp_audio.%(ext)s',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([audio_url])

    # Transcribe with Whisper
    from openai import OpenAI
    client = OpenAI()

    with open("temp_audio.m4a", "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text"
        )

    return transcript
```

**Cost Analysis:**

**YouTube-Only Approach:**
- YouTube Transcript API: $0 (free library)
- Processing: Minimal compute
- Storage: $5-10/month
- **Total: $5-10/month**

**YouTube + Podcast Approach:**
- Transcription: ~$0.006/min with Whisper
- 10 podcasts × 4 episodes/month × 60 min = 2,400 minutes
- 2,400 min × $0.006 = $14.40/month
- Storage: $10-20/month
- **Total: $25-35/month**

**Optimization:**
- Only transcribe episodes with financial keywords in title
- Use auto-generated captions when available
- Focus on highest-signal content
- **Optimized cost: $10-20/month**

**Legal & Compliance:**
- YouTube ToS: Transcript extraction is gray area
- Fair use: Analyze for research (non-redistribution)
- Respect copyright: Don't republish content
- Podcast RSS: Typically allowed for aggregation
- Attribution: Cite sources in output

**Advantages:**
- High-quality, long-form content
- Expert opinions and analysis
- Earnings call access
- Low competition (less crowded than Twitter/Reddit)

**Limitations:**
- Delayed (not real-time)
- Transcription costs can scale
- Requires NLP for insight extraction
- Manual curation needed for quality

**Recommended Focus:**
1. Start with YouTube earnings call channels
2. Monitor 5-10 top investor YouTube channels
3. Add 3-5 macro/market podcasts
4. Scale based on signal quality

---

## 4. Hacker News & GitHub

### 4.1 Hacker News API

**Official API Details:**
- **Endpoint:** https://hacker-news.firebaseio.com/v0/
- **Type:** Firebase REST API
- **Authentication:** None required
- **Documentation:** https://github.com/HackerNews/API

**API Structure:**
- Completely free
- No rate limits (reasonable use expected)
- Real-time updates via Firebase
- Simple JSON responses

**Key Endpoints:**
```
GET /v0/topstories.json          - Top story IDs (up to 500)
GET /v0/newstories.json          - New story IDs (up to 500)
GET /v0/beststories.json         - Best story IDs (up to 500)
GET /v0/askstories.json          - Ask HN stories
GET /v0/showstories.json         - Show HN stories
GET /v0/jobstories.json          - Job postings
GET /v0/item/{id}.json           - Item details (story/comment)
GET /v0/user/{username}.json     - User profile
GET /v0/updates.json             - Recently changed items
GET /v0/maxitem.json             - Largest item ID
```

**Data Available:**
- Story/comment ID
- Author (username)
- Title and URL
- Text content (for text posts/comments)
- Score (upvotes - downvotes)
- Number of comments
- Timestamp (Unix)
- Type (story, comment, job, poll)
- Parent/child relationships

**Rate Limits:**
- None officially documented
- Respect reasonable use
- Implement caching
- Firebase charges if you use their hosting (you won't)

### 4.2 Hacker News Alternative Methods

**A. Official API (Best Method)**
- Use the Firebase API directly
- Completely free
- No authentication needed
- Very reliable

**B. Algolia HN Search API**
- URL: https://hn.algolia.com/api
- Free, no authentication
- Better for historical search
- Rate limit: 10,000 requests/hour
- Can search by date, points, comments

```python
import requests

# Search for AI-related posts
response = requests.get(
    'https://hn.algolia.com/api/v1/search',
    params={'query': 'artificial intelligence', 'tags': 'story'}
)
data = response.json()
```

**C. Unofficial Aggregators:**
1. **HN RSS Feeds**
   - https://news.ycombinator.com/rss
   - Simple, no API needed

2. **HNTrends**
   - https://hntrends.com
   - Tracks keyword trends over time
   - No API, but can scrape

**D. Python Libraries:**
- `python-hn` - Wrapper for HN API
- `hackernews-api` - Another wrapper
- Direct requests usually sufficient

### 4.3 GitHub API

**Official API Details:**
- **Endpoints:**
  - REST: https://api.github.com
  - GraphQL: https://api.github.com/graphql
- **Authentication:** Personal Access Token (PAT), OAuth, GitHub App
- **Documentation:** https://docs.github.com/en/rest

**Rate Limits:**

| Auth Type | Requests/Hour | GraphQL Points/Hour |
|-----------|---------------|---------------------|
| Unauthenticated | 60 | N/A |
| Authenticated (PAT) | 5,000 | 5,000 points |
| GitHub App | 15,000 | 15,000 points |
| Enterprise | Custom | Custom |

**GraphQL Points:**
- Each field costs points
- More efficient than REST for complex queries
- Example: Get repo with stars = ~1 point

**Key REST Endpoints:**
```
GET /repos/{owner}/{repo}                    - Repository details
GET /repos/{owner}/{repo}/stargazers         - Star history
GET /repos/{owner}/{repo}/forks              - Fork data
GET /repos/{owner}/{repo}/issues             - Issues/PRs
GET /repos/{owner}/{repo}/commits            - Commit history
GET /repos/{owner}/{repo}/contributors       - Contributors
GET /repos/{owner}/{repo}/traffic/views      - Traffic (owner only)
GET /search/repositories                     - Search repos
GET /trending                                - Trending (unofficial)
GET /users/{username}/repos                  - User repositories
```

**GraphQL Advantages:**
- Fetch exactly what you need
- Reduce API calls
- Better for complex queries

**Example GraphQL Query:**
```graphql
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
    forkCount
    issues(states: OPEN) {
      totalCount
    }
    pullRequests(states: OPEN) {
      totalCount
    }
    releases(last: 1) {
      nodes {
        createdAt
        tagName
      }
    }
  }
}
```

### 4.4 GitHub Alternative Methods

**A. GitHub Archive**
- URL: https://www.gharchive.org/
- Free, comprehensive event archive
- All public GitHub activity
- Download via HTTP (GZ files)
- Process with BigQuery (Google Cloud)
- Good for historical analysis

**B. GH Archive on BigQuery**
- Google BigQuery public dataset
- SQL queries on GitHub data
- Free tier: 1TB queries/month
- Pay-as-you-go: $5/TB after that
- Best for large-scale analysis

```sql
SELECT
  repo.name,
  COUNT(*) as stars
FROM
  `githubarchive.day.20240101`
WHERE
  type = 'WatchEvent'
GROUP BY
  repo.name
ORDER BY
  stars DESC
LIMIT 100
```

**C. Third-Party Services:**

1. **GitHunt**
   - Trending repos dashboard
   - No API, but can scrape
   - Free

2. **Libraries.io**
   - Open source package tracking
   - Free API
   - Tracks dependencies across ecosystems

3. **StarTrack**
   - Star history graphs
   - Free, no API

**D. Unofficial Trending API:**
- GitHub doesn't offer official trending API
- Use: https://github-trending-api.now.sh/
- Free, community-maintained
- Scrapes GitHub trending page

### 4.5 Key Data Points Extractable

**Hacker News Data:**
- Story title and URL
- Domain (news source)
- Score (points)
- Number of comments
- Comment text and tree structure
- Author karma and history
- Time to front page
- Ranking position over time

**GitHub Repository Data:**
- Star count and star velocity
- Fork count
- Open/closed issues
- Pull request activity
- Commit frequency
- Contributor count and diversity
- Release frequency
- Language composition
- Dependencies (via package files)
- Traffic (if repo owner)

**GitHub User Data:**
- Public repos
- Contributions over time
- Organizations
- Followers
- Popular repositories

**Derived Metrics:**
- Star growth rate
- Issue resolution time
- Community health score
- Contributor churn
- Dependency risk

### 4.6 Investment Insights

**Hacker News Investment Use Cases:**

1. **Tech Trend Detection**
   - Identify emerging technologies before mainstream
   - Track discussion volume on AI, blockchain, etc.
   - Sentiment on new product launches
   - **Lead time:** 6-24 months for public companies
   - **Example:** Early GPT/LLM discussion → NVDA investment thesis

2. **Startup Monitoring**
   - Track "Show HN" launches
   - Measure community reception
   - Identify potential unicorns early
   - **Signal:** High HN score = strong developer interest

3. **Developer Sentiment**
   - Track opinions on tech companies
   - Identify product/service issues
   - Measure developer tool adoption
   - **Example:** Negative Azure sentiment → Cloud market share impact

4. **Competitive Intelligence**
   - Monitor competitor product launches
   - Track industry news first on HN
   - Developer preference signals
   - **Example:** Vercel vs Netlify sentiment

5. **Macro Tech Trends**
   - Layoff discussions (leading indicator)
   - Hiring freezes
   - IPO sentiment
   - VC funding environment

**GitHub Investment Use Cases:**

1. **Technology Adoption Metrics**
   - Star growth = developer interest
   - Track framework/library popularity
   - Predict which technologies will dominate
   - **Example:** React vs Vue vs Angular star growth
   - **Investment thesis:** NVDA benefits from AI framework growth

2. **Public Company Activity**
   - Monitor repos from MSFT, GOOGL, META, etc.
   - Open source project health
   - Developer relations effectiveness
   - Release cadence
   - **Example:** Meta's Llama star growth = AI leadership

3. **Startup Health Indicators**
   - Pre-IPO companies' open source activity
   - Commit frequency (development velocity)
   - Contributor growth (hiring/momentum)
   - Issue volume (product problems)
   - **Example:** Pre-IPO company slowing commits = red flag

4. **Supply Chain Risk**
   - Critical dependency vulnerabilities
   - Abandoned projects in supply chain
   - Maintainer burnout
   - **Example:** Log4j vulnerability impact

5. **Developer Tool Market Share**
   - Database stars: PostgreSQL vs MySQL vs MongoDB
   - Cloud tool adoption: AWS SDK vs Azure SDK vs GCP SDK
   - Framework competition
   - **Investment thesis:** MongoDB growth via star velocity

6. **Talent Flow**
   - Track where top developers contribute
   - Employee GitHub activity at companies
   - Brain drain indicators
   - **Example:** Top developers leaving = company issues

**Combined HN + GitHub Signals:**

1. **Launch Success Prediction**
   - HN "Show HN" score + GitHub star velocity
   - Strong correlation = product-market fit
   - Example: Successful Show HN → watch the company

2. **Developer Ecosystem Strength**
   - HN discussion + GitHub activity
   - Strong both = healthy ecosystem
   - Example: AI tools trending on both platforms

3. **Technology Lifecycle**
   - Emergence: HN discussion, early GitHub stars
   - Growth: Accelerating stars, HN front page regularly
   - Maturity: Stable stars, less HN discussion
   - Decline: Negative HN sentiment, star growth stops

**Signal Quality:**
- Tech trend prediction: Very High (12-24 month lead)
- Startup early detection: High (for tech startups)
- Public company sentiment: Medium (developer-focused)
- Direct trading signals: Low (too early-stage)
- Long-term thematic investing: Very High

**Best for:**
- Thematic/trend investing (AI, cloud, crypto)
- Pre-IPO research
- Tech stock competitive analysis
- Identifying disruptive technologies
- Long-term positioning (not day trading)

### 4.7 Implementation Recommendation

**Recommended Approach: Dual API Integration**

**Architecture:**
```
Hacker News API → Poll every 5 minutes → Extract stories
    ↓
Process for tech keywords & companies
    ↓
PostgreSQL Storage

GitHub API (REST + GraphQL) → Daily/Weekly batch
    ↓
Track star growth, issues, releases
    ↓
PostgreSQL Storage

Combined Analysis → Trend Detection → Dashboard
```

**Hacker News Implementation:**

```python
import requests
import time
from datetime import datetime

HN_API_BASE = 'https://hacker-news.firebaseio.com/v0/'

def get_top_stories(limit=100):
    """Get top story IDs"""
    response = requests.get(f'{HN_API_BASE}topstories.json')
    return response.json()[:limit]

def get_item(item_id):
    """Get item details"""
    response = requests.get(f'{HN_API_BASE}item/{item_id}.json')
    return response.json()

def extract_company_mentions(title, url, text):
    """Extract company/ticker mentions"""
    companies = {
        'OpenAI': 'private',
        'Microsoft': 'MSFT',
        'Google': 'GOOGL',
        'Meta': 'META',
        'Amazon': 'AMZN',
        # Add more mappings
    }

    mentioned = []
    content = f'{title} {text}'.lower()

    for company, ticker in companies.items():
        if company.lower() in content:
            mentioned.append({'company': company, 'ticker': ticker})

    return mentioned

def monitor_hackernews():
    """Continuous HN monitoring"""
    seen_ids = set()

    while True:
        try:
            story_ids = get_top_stories(100)

            for story_id in story_ids:
                if story_id in seen_ids:
                    continue

                story = get_item(story_id)
                if not story:
                    continue

                companies = extract_company_mentions(
                    story.get('title', ''),
                    story.get('url', ''),
                    story.get('text', '')
                )

                if companies or story.get('score', 0) > 100:
                    save_hn_story({
                        'id': story_id,
                        'title': story.get('title'),
                        'url': story.get('url'),
                        'score': story.get('score'),
                        'by': story.get('by'),
                        'time': datetime.fromtimestamp(story.get('time', 0)),
                        'descendants': story.get('descendants', 0),
                        'companies': companies
                    })

                seen_ids.add(story_id)

            time.sleep(300)  # 5 minutes

        except Exception as e:
            print(f"Error monitoring HN: {e}")
            time.sleep(60)

# For comment analysis
def get_story_comments(story_id):
    """Recursively get all comments for a story"""
    story = get_item(story_id)
    comments = []

    def get_comment_tree(comment_ids):
        for cid in comment_ids:
            comment = get_item(cid)
            if comment and comment.get('text'):
                comments.append(comment)
                if comment.get('kids'):
                    get_comment_tree(comment['kids'])

    if story.get('kids'):
        get_comment_tree(story['kids'])

    return comments
```

**GitHub Implementation:**

```python
import requests
from datetime import datetime, timedelta

GITHUB_TOKEN = 'your_token_here'
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

def track_repository(owner, repo):
    """Get repository metrics"""
    url = f'https://api.github.com/repos/{owner}/{repo}'
    response = requests.get(url, headers=HEADERS)
    data = response.json()

    return {
        'full_name': data['full_name'],
        'stars': data['stargazers_count'],
        'forks': data['forks_count'],
        'open_issues': data['open_issues_count'],
        'watchers': data['watchers_count'],
        'created_at': data['created_at'],
        'updated_at': data['updated_at'],
        'language': data['language'],
        'description': data['description']
    }

def get_star_history(owner, repo, days=30):
    """Track star growth over time"""
    # Note: This requires multiple API calls or use GitHub Archive
    url = f'https://api.github.com/repos/{owner}/{repo}/stargazers'
    headers = {
        **HEADERS,
        'Accept': 'application/vnd.github.v3.star+json'  # Includes starred_at
    }

    stars = []
    page = 1

    while True:
        response = requests.get(
            url,
            headers=headers,
            params={'page': page, 'per_page': 100}
        )

        if not response.json():
            break

        stars.extend(response.json())
        page += 1

        if page > 10:  # Limit to 1000 stars for efficiency
            break

    return stars

def track_tech_company_repos():
    """Monitor key tech company repos"""
    repos = [
        ('facebook', 'react'),
        ('microsoft', 'vscode'),
        ('openai', 'whisper'),
        ('meta-llama', 'llama'),
        ('google', 'jax'),
        # Add more repos
    ]

    metrics = []
    for owner, repo in repos:
        try:
            data = track_repository(owner, repo)
            metrics.append(data)
            time.sleep(1)  # Rate limit courtesy
        except Exception as e:
            print(f"Error tracking {owner}/{repo}: {e}")

    return metrics

def search_trending_repos(topic='artificial-intelligence'):
    """Find trending repos by topic"""
    url = 'https://api.github.com/search/repositories'

    # Get repos created in last 30 days, sorted by stars
    since_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

    params = {
        'q': f'topic:{topic} created:>{since_date}',
        'sort': 'stars',
        'order': 'desc',
        'per_page': 50
    }

    response = requests.get(url, headers=HEADERS, params=params)
    return response.json()['items']

# GraphQL for efficient data fetching
def github_graphql_query(query):
    """Execute GraphQL query"""
    url = 'https://api.github.com/graphql'
    response = requests.post(
        url,
        json={'query': query},
        headers=HEADERS
    )
    return response.json()

def track_multiple_repos_graphql(repos):
    """Efficiently track multiple repos with GraphQL"""
    # repos = [('facebook', 'react'), ('microsoft', 'vscode'), ...]

    query_parts = []
    for i, (owner, repo) in enumerate(repos):
        query_parts.append(f'''
        repo{i}: repository(owner: "{owner}", name: "{repo}") {{
            name
            owner {{ login }}
            stargazerCount
            forkCount
            issues(states: OPEN) {{ totalCount }}
            pullRequests(states: OPEN) {{ totalCount }}
            releases(last: 1) {{
                nodes {{
                    createdAt
                    tagName
                }}
            }}
        }}
        ''')

    query = f'''
    query {{
        {' '.join(query_parts)}
    }}
    '''

    return github_graphql_query(query)
```

**Algolia HN Search (Historical Analysis):**

```python
def search_hn_historical(query, start_date, end_date):
    """Search HN historically using Algolia"""
    url = 'https://hn.algolia.com/api/v1/search'

    params = {
        'query': query,
        'tags': 'story',
        'numericFilters': f'created_at_i>{int(start_date.timestamp())},created_at_i<{int(end_date.timestamp())}'
    }

    response = requests.get(url, params=params)
    return response.json()['hits']

# Example: Track AI mentions on HN over time
def track_hn_trend(keyword, months=12):
    """Track keyword mentions over time"""
    monthly_counts = []

    for i in range(months):
        start = datetime.now() - timedelta(days=30*(i+1))
        end = datetime.now() - timedelta(days=30*i)

        results = search_hn_historical(keyword, start, end)

        monthly_counts.append({
            'month': end.strftime('%Y-%m'),
            'count': len(results),
            'avg_score': sum(r['points'] for r in results) / len(results) if results else 0
        })

    return monthly_counts
```

**Cost Analysis:**

**Hacker News:**
- API: $0 (completely free)
- Compute: Minimal
- Storage: $5-10/month
- **Total: $5-10/month**

**GitHub:**
- API: $0 (5,000 requests/hour free with token)
- Compute: Minimal
- Storage: $10-20/month (if tracking many repos)
- **Total: $10-20/month**

**Combined System:**
- **Total: $15-30/month**

**Scaling Considerations:**
- GitHub Archive on BigQuery: $0-50/month for large-scale analysis
- Can track 1000s of repos within free tier
- HN can poll continuously without cost

**Legal & Compliance:**
- Both APIs are official and free to use
- Follow rate limit best practices
- Don't resell raw data
- Attribution if displaying content
- GitHub: Don't use for training ML models (ToS)

**Advantages:**
- Completely free APIs
- High-quality developer signals
- Long lead time for trends
- Underutilized by financial industry
- Strong historical data availability

**Limitations:**
- Focused on tech sector
- Long signal delay (not for day trading)
- Requires domain expertise to interpret
- Limited direct company mentions
- Better for thematic/trend investing

**Recommended Monitoring Strategy:**

1. **Hacker News:**
   - Poll top 100 stories every 5 minutes
   - Extract company mentions
   - Track AI, cloud, crypto keywords
   - Analyze comments on high-score posts
   - Identify sentiment shifts

2. **GitHub:**
   - Daily batch: Update star counts for 100-500 key repos
   - Weekly: Analyze issue/PR activity
   - Monthly: Trend analysis and reporting
   - Focus on:
     - Public company repos (MSFT, GOOGL, META)
     - Key AI/ML frameworks (pytorch, tensorflow)
     - Developer tools (vscode, kubernetes)
     - Pre-IPO company repos

3. **Integration:**
   - Correlate HN discussion with GitHub activity
   - Build trend dashboard
   - Alert on unusual spikes
   - Track technology lifecycle stages

**Sample Dashboard Metrics:**
- Top 10 trending repos (30-day star growth)
- HN front page companies (daily)
- AI/ML framework popularity trends
- Developer sentiment index
- Technology adoption curve positions

---

## 5. Cross-Platform Strategy & Recommendations

### 5.1 Comparative Analysis

| Platform | Cost (Monthly) | Signal Type | Timeframe | Ease of Use | Data Quality |
|----------|---------------|-------------|-----------|-------------|--------------|
| **Twitter/X** | $0-100 | Short-term sentiment | Minutes-Days | Medium | Medium (noisy) |
| **Reddit** | $0 | Retail sentiment | Hours-Weeks | Easy | Medium-High |
| **YouTube/Podcasts** | $10-35 | Expert analysis | Days-Months | Medium | High |
| **HN/GitHub** | $15-30 | Tech trends | Months-Years | Easy | High |

### 5.2 Recommended Starter Stack

**Budget: $0-50/month (MVP)**

1. **Reddit (Priority 1)** - $0
   - Use PRAW with free API
   - Monitor WSB, stocks, investing
   - Best ROI for retail sentiment

2. **Hacker News** - $0
   - Use official API
   - Track tech trends
   - Minimal setup required

3. **GitHub** - $0
   - Free tier sufficient
   - Track 100-200 repos
   - Weekly batch updates

4. **YouTube Transcripts** - $0
   - Use youtube_transcript_api
   - Monitor key financial channels
   - Process transcripts for ticker mentions

5. **Twitter (Limited)** - $0
   - Free tier for 50 influencer accounts
   - Focus on high-value accounts only
   - Supplement with Reddit

**Total: $0/month** (free tier only)

### 5.3 Recommended Growth Stack

**Budget: $100-200/month (Production)**

1. **Reddit** - $0
   - Scale to 20+ subreddits
   - Real-time monitoring

2. **Twitter Basic** - $100
   - 10,000 tweets/month
   - 5-10 ticker searches
   - Influencer tracking

3. **YouTube + Podcasts** - $20
   - Selective podcast transcription
   - Focus on earnings calls

4. **Hacker News + GitHub** - $15
   - Enhanced storage
   - More comprehensive tracking

5. **NLP/Sentiment** - $50
   - OpenAI API for sentiment
   - Or use local models (free)

**Total: $185/month**

### 5.4 Technical Architecture

**Recommended Stack:**

```
Data Collection Layer:
├─ Twitter: Tweepy (Python)
├─ Reddit: PRAW (Python)
├─ YouTube: youtube_transcript_api + yt_dlp
├─ Podcasts: feedparser + Whisper
├─ HN: requests (Python)
└─ GitHub: PyGithub / requests

Processing Layer:
├─ Ticker Extraction: Regex + NER
├─ Sentiment Analysis: FinBERT / VADER / GPT-4
├─ Trend Detection: Time-series analysis
└─ Anomaly Detection: Statistical methods

Storage Layer:
├─ PostgreSQL (structured data)
├─ TimescaleDB (time-series)
└─ Redis (caching)

API Layer:
├─ FastAPI (Python)
└─ REST endpoints for dashboard

Dashboard:
├─ React / Next.js
├─ Charts: Recharts / D3.js
└─ Real-time: WebSockets
```

### 5.5 Key Metrics to Track

**Cross-Platform Metrics:**

1. **Sentiment Score**
   - Platform-specific sentiment
   - Weighted average by platform credibility
   - Trend over time

2. **Mention Volume**
   - Ticker mentions across platforms
   - Unusual spike detection
   - Volume velocity (rate of change)

3. **Engagement Metrics**
   - Reddit: Upvotes, comments
   - Twitter: Likes, retweets
   - HN: Points, comments
   - GitHub: Stars, forks

4. **Influencer Impact**
   - Track specific accounts
   - Weight by follower count
   - Sentiment shift correlation

5. **Trend Lifecycle**
   - Emerging (HN, GitHub)
   - Growing (Reddit, YouTube)
   - Peak (Twitter mainstream)
   - Declining

### 5.6 Compliance & Legal Summary

**General Rules:**
- Use official APIs when available
- Respect rate limits
- Don't redistribute raw content
- Provide attribution
- Check platform ToS regularly
- Avoid scraping if API exists
- Don't manipulate platform metrics
- Secure API keys properly

**Platform-Specific:**
- **Twitter:** Most restrictive, enforce ToS aggressively
- **Reddit:** Generous API, but don't spam
- **YouTube:** Transcript extraction is gray area
- **GitHub:** Don't use for ML training
- **Hacker News:** Very permissive

### 5.7 Final Recommendations

**For MVP (Fastest Time to Value):**
1. Start with Reddit (easiest, free, high signal)
2. Add Hacker News (free, easy setup)
3. Add GitHub trending repos (free)
4. **Total cost: $0, Setup time: 1-2 days**

**For Production (Best Coverage):**
1. Reddit (retail sentiment)
2. Twitter Basic tier (real-time sentiment)
3. YouTube transcripts (expert analysis)
4. HN + GitHub (tech trends)
5. **Total cost: $100-150/month**

**For Maximum Alpha (Comprehensive):**
1. All platforms above
2. Twitter Pro tier (historical search)
3. Full podcast transcription
4. GitHub Archive BigQuery analysis
5. Enhanced NLP (GPT-4 API)
6. **Total cost: $300-500/month**

**Recommended Phased Approach:**

**Phase 1 (Month 1-2): Free Tier MVP**
- Implement Reddit monitoring
- Implement HN API
- Implement GitHub star tracking
- Basic sentiment analysis (VADER)
- Simple dashboard

**Phase 2 (Month 3-4): Enhanced Coverage**
- Add Twitter Free tier
- Add YouTube transcripts
- Improve NLP (FinBERT)
- Enhanced dashboard with trends

**Phase 3 (Month 5-6): Scale & Refine**
- Upgrade Twitter to Basic ($100)
- Add selective podcast transcription
- Implement anomaly detection
- Backtesting and validation

**Phase 4 (Ongoing): Optimize**
- Add platforms based on performance
- Optimize costs
- Improve signal quality
- Advanced analytics

---

## 6. Appendix: Code Examples & Resources

### 6.1 Complete Reddit Monitor

```python
import praw
import psycopg2
from datetime import datetime
import re

# Initialize Reddit
reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="AlphaGuru Investment Monitor 1.0"
)

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="alphaguru",
    user="user",
    password="password"
)

def extract_tickers(text):
    """Extract stock tickers from text"""
    # Match $TICKER or common patterns
    cashtags = re.findall(r'\$([A-Z]{1,5})\b', text)
    # Match standalone tickers (careful with false positives)
    words = re.findall(r'\b([A-Z]{2,5})\b', text)

    # Filter out common words
    stopwords = {'I', 'A', 'CEO', 'IPO', 'ATH', 'DD', 'YOLO', 'FD', 'WSB', 'IMO', 'FOMO'}
    tickers = set(cashtags) | (set(words) - stopwords)

    return list(tickers)

def save_post(post_data):
    """Save post to database"""
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reddit_posts
        (post_id, subreddit, title, author, score, num_comments, created_utc, url, tickers)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (post_id) DO UPDATE SET
            score = EXCLUDED.score,
            num_comments = EXCLUDED.num_comments
    """, (
        post_data['id'],
        post_data['subreddit'],
        post_data['title'],
        post_data['author'],
        post_data['score'],
        post_data['num_comments'],
        post_data['created_utc'],
        post_data['url'],
        post_data['tickers']
    ))
    conn.commit()

def monitor_subreddit(subreddit_name, limit=100):
    """Monitor a subreddit for new posts"""
    subreddit = reddit.subreddit(subreddit_name)

    for submission in subreddit.hot(limit=limit):
        tickers = extract_tickers(submission.title + ' ' + submission.selftext)

        post_data = {
            'id': submission.id,
            'subreddit': subreddit_name,
            'title': submission.title,
            'author': str(submission.author),
            'score': submission.score,
            'num_comments': submission.num_comments,
            'created_utc': datetime.fromtimestamp(submission.created_utc),
            'url': submission.url,
            'tickers': tickers
        }

        save_post(post_data)

# Main loop
import time

while True:
    try:
        monitor_subreddit('wallstreetbets', 100)
        monitor_subreddit('stocks', 50)
        monitor_subreddit('investing', 50)
        time.sleep(300)  # 5 minutes
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(60)
```

### 6.2 Resources & Links

**Official Documentation:**
- Twitter API: https://developer.twitter.com/en/docs/twitter-api
- Reddit API: https://www.reddit.com/dev/api/
- YouTube API: https://developers.google.com/youtube/v3
- GitHub API: https://docs.github.com/en/rest
- Hacker News API: https://github.com/HackerNews/API

**Python Libraries:**
- Tweepy: https://www.tweepy.org/
- PRAW: https://praw.readthedocs.io/
- youtube_transcript_api: https://pypi.org/project/youtube-transcript-api/
- PyGithub: https://pygithub.readthedocs.io/

**Sentiment Analysis:**
- FinBERT: https://github.com/ProsusAI/finBERT
- VADER: https://github.com/cjhutto/vaderSentiment
- TextBlob: https://textblob.readthedocs.io/

**Additional Tools:**
- Whisper API: https://platform.openai.com/docs/guides/speech-to-text
- Algolia HN Search: https://hn.algolia.com/api
- GitHub Archive: https://www.gharchive.org/

---

**End of Research Document**

*Last Updated: January 2026*
*Version: 1.0*
