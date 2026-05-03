'use server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Skill-specific search queries for better results
const SKILL_SEARCH_TEMPLATES = {
  'html': 'HTML CSS full course beginner',
  'css': 'CSS complete tutorial flexbox grid',
  'javascript': 'JavaScript full course ES6 beginner to advanced',
  'react': 'React JS complete course hooks',
  'next': 'Next.js 14 full stack tutorial',
  'nextjs': 'Next.js 14 full stack tutorial',
  'state': 'React state management Redux Zustand tutorial',
  'testing': 'JavaScript testing Jest React Testing Library',
  'sql': 'SQL complete course database queries',
  'python': 'Python for data analysis pandas numpy',
  'data': 'data analysis Python complete course',
  'visualization': 'data visualization Python matplotlib plotly',
  'statistics': 'statistics for data science Python',
  'dashboard': 'build dashboard Tableau Power BI tutorial',
};

// Build optimized search query
function buildSearchQuery(skillName) {
  const skillLower = skillName.toLowerCase();

  // Check for matching template
  for (const [key, query] of Object.entries(SKILL_SEARCH_TEMPLATES)) {
    if (skillLower.includes(key)) {
      return query;
    }
  }

  // Default enhanced query
  return `${skillName} complete course tutorial 2024`;
}

// Format ISO 8601 duration to readable format
function formatDuration(isoDuration) {
  if (!isoDuration) return '';

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Parse duration to minutes for filtering
function durationToMinutes(isoDuration) {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  return hours * 60 + minutes;
}

// Format view count to readable format
function formatCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Calculate engagement score (weighted combination of metrics)
function calculateEngagementScore(video) {
  const views = video.viewCount || 0;
  const likes = video.likeCount || 0;
  const duration = video.durationMinutes || 0;

  if (views === 0) return 0;

  // Like ratio (likes per 1000 views) - higher is better
  const likeRatio = (likes / views) * 1000;

  // View score (log scale to not over-favor viral videos)
  const viewScore = Math.log10(Math.max(views, 1));

  // Duration bonus (prefer longer, more comprehensive content)
  const durationBonus = duration >= 60 ? 1.5 : duration >= 30 ? 1.2 : 1;

  // Combined score
  return (likeRatio * 2 + viewScore * 1.5) * durationBonus;
}

export async function searchYouTubeCourses(skillName, maxResults = 8) {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return { data: [], error: 'YouTube API not configured' };
  }

  try {
    const searchQuery = buildSearchQuery(skillName);

    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: '15', // Fetch more to filter and sort
      order: 'relevance',
      videoDuration: 'long', // 20+ minutes
      videoDefinition: 'high', // HD quality
      relevanceLanguage: 'en',
      key: YOUTUBE_API_KEY,
    });

    const response = await fetch(`${YOUTUBE_API_URL}/search?${searchParams}`, {
      headers: {
        'Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube API error:', error);
      return { data: [], error: error.error?.message || 'Failed to fetch videos' };
    }

    const data = await response.json();

    if (!data.items?.length) {
      return { data: [] };
    }

    // Get video statistics and content details
    const videoIds = data.items.map(item => item.id.videoId).join(',');
    const statsParams = new URLSearchParams({
      part: 'statistics,contentDetails',
      id: videoIds,
      key: YOUTUBE_API_KEY,
    });

    const statsResponse = await fetch(`${YOUTUBE_API_URL}/videos?${statsParams}`, {
      headers: {
        'Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    });
    const statsData = await statsResponse.json();

    // Create a map for quick lookup
    const statsMap = {};
    statsData.items?.forEach(item => {
      statsMap[item.id] = {
        statistics: item.statistics,
        contentDetails: item.contentDetails,
      };
    });

    // Process and enrich video data
    let videos = data.items.map((item) => {
      const videoId = item.id.videoId;
      const stats = statsMap[videoId]?.statistics || {};
      const contentDetails = statsMap[videoId]?.contentDetails || {};

      const viewCount = parseInt(stats.viewCount || 0);
      const likeCount = parseInt(stats.likeCount || 0);
      const durationMinutes = durationToMinutes(contentDetails.duration);

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount,
        likeCount,
        durationMinutes,
        duration: formatDuration(contentDetails.duration),
        viewCountFormatted: formatCount(viewCount),
        likeCountFormatted: formatCount(likeCount),
        likeRatio: viewCount > 0 ? ((likeCount / viewCount) * 100).toFixed(1) : '0',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        engagementScore: 0, // Will be calculated
      };
    });

    // Filter out low-quality content
    videos = videos.filter(video => {
      // Must have at least 10k views
      if (video.viewCount < 10000) return false;
      // Must have decent like ratio (> 2%)
      if (parseFloat(video.likeRatio) < 2) return false;
      // Must be at least 10 minutes
      if (video.durationMinutes < 10) return false;
      // Filter out obviously bad titles
      const badPatterns = /shorts|#shorts|tiktok|meme|funny|prank/i;
      if (badPatterns.test(video.title)) return false;

      return true;
    });

    // Calculate engagement scores and sort
    videos = videos.map(video => ({
      ...video,
      engagementScore: calculateEngagementScore(video),
    }));

    // Sort by view count (most viewed first)
    videos.sort((a, b) => b.viewCount - a.viewCount);

    // Return top results
    return { data: videos.slice(0, maxResults) };
  } catch (error) {
    console.error('Error fetching YouTube courses:', error);
    return { data: [], error: error.message };
  }
}
