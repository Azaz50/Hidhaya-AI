/**
 * Redis Caching Service for Islamic Search Engine
 */

const { client: redis } = require('../config/redis');
const crypto = require('crypto');

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 3600, // 1 hour
  searchCacheTTL: 7200, // 2 hours for search results
  statsCacheTTL: 86400, // 24 hours for statistics
  maxCacheSize: 10000 // Maximum number of cached items
};

/**
 * Generate cache key from query
 */
const generateCacheKey = (prefix, data) => {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
};

/**
 * Get cached search results
 */
const getCachedSearch = async (query, language) => {
  if (!redis?.isOpen) return null;

  try {
    const key = generateCacheKey(`search:${language}`, { query: query.toLowerCase() });
    const cached = await redis.get(key);

    if (cached) {
      // Track cache hit
      await redis.hIncrBy('cache_stats', 'hits', 1);
      return JSON.parse(cached);
    }

    await redis.hIncrBy('cache_stats', 'misses', 1);
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

/**
 * Cache search results
 */
const cacheSearchResults = async (query, language, results) => {
  if (!redis?.isOpen) return;

  try {
    const key = generateCacheKey(`search:${language}`, { query: query.toLowerCase() });

    await redis.setEx(key, CACHE_CONFIG.searchCacheTTL, JSON.stringify(results));

    // Track cache size
    const size = await redis.dbSize();
    if (size > CACHE_CONFIG.maxCacheSize) {
      // Simple cleanup - remove oldest keys
      await cleanupOldCache();
    }
  } catch (error) {
    console.error("Cache set error:", error);
  }
};

/**
 * Get cached user session
 */
const getCachedUserSession = async (userId) => {
  if (!redis?.isOpen) return null;

  try {
    const cached = await redis.get(`session:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Session cache error:", error);
    return null;
  }
};

/**
 * Cache user session
 */
const cacheUserSession = async (userId, sessionData) => {
  if (!redis?.isOpen) return;

  try {
    await redis.setEx(`session:${userId}`, 86400, JSON.stringify(sessionData));
  } catch (error) {
    console.error("Session cache error:", error);
  }
};

/**
 * Get search statistics from cache
 */
const getCachedStats = async () => {
  if (!redis?.isOpen) return null;

  try {
    const cached = await redis.get('search:stats');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Stats cache error:", error);
    return null;
  }
};

/**
 * Cache search statistics
 */
const cacheStats = async (stats) => {
  if (!redis?.isOpen) return;

  try {
    await redis.setEx('search:stats', CACHE_CONFIG.statsCacheTTL, JSON.stringify(stats));
  } catch (error) {
    console.error("Stats cache error:", error);
  }
};

/**
 * Increment daily question counter
 */
const incrementDailyQuestions = async (userId) => {
  if (!redis?.isOpen) return null;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `daily_questions:${userId}:${today}`;

    const count = await redis.incr(key);
    await redis.expire(key, 86400);

    return count;
  } catch (error) {
    console.error("Daily questions increment error:", error);
    return null;
  }
};

/**
 * Get daily question count
 */
const getDailyQuestionCount = async (userId) => {
  if (!redis?.isOpen) return 0;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `daily_questions:${userId}:${today}`;

    const count = await redis.get(key);
    return parseInt(count) || 0;
  } catch (error) {
    console.error("Daily questions get error:", error);
    return 0;
  }
};

/**
 * Track popular queries
 */
const trackPopularQuery = async (query) => {
  if (!redis?.isOpen) return;

  try {
    const normalizedQuery = query.toLowerCase().trim();
    await redis.zIncrBy('popular_queries', 1, normalizedQuery);
  } catch (error) {
    console.error("Track query error:", error);
  }
};

/**
 * Get popular queries
 */
const getPopularQueries = async (limit = 10) => {
  if (!redis?.isOpen) return [];

  try {
    const queries = await redis.zRangeWithScores('popular_queries', 0, limit - 1, { REV: true });
    return queries.map(item => ({
      query: item.value,
      count: item.score
    }));
  } catch (error) {
    console.error("Get popular queries error:", error);
    return [];
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  if (!redis?.isOpen) {
    return { status: 'disconnected' };
  }

  try {
    const hits = await redis.hGet('cache_stats', 'hits');
    const misses = await redis.hGet('cache_stats', 'misses');

    return {
      status: 'connected',
      hits: parseInt(hits) || 0,
      misses: parseInt(misses) || 0,
      hitRate: hits && misses ?
        (parseInt(hits) / (parseInt(hits) + parseInt(misses)) * 100).toFixed(2) + '%' : 'N/A'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Cleanup old cache entries
 */
const cleanupOldCache = async () => {
  if (!redis?.isOpen) return;

  try {
    // Get all search keys
    const keys = await redis.keys('search:*');

    if (keys.length > CACHE_CONFIG.maxCacheSize) {
      // Delete oldest 10%
      const toDelete = Math.floor(keys.length * 0.1);
      for (let i = 0; i < toDelete; i++) {
        await redis.del(keys[i]);
      }
      console.log(`Cache cleanup: Deleted ${toDelete} old entries`);
    }
  } catch (error) {
    console.error("Cache cleanup error:", error);
  }
};

/**
 * Clear all cache
 */
const clearAllCache = async () => {
  if (!redis?.isOpen) return;

  try {
    const keys = await redis.keys('search:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del('search:stats');
    await redis.del('cache_stats');
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error("Clear cache error:", error);
  }
};

/**
 * Invalidate user-specific cache
 */
const invalidateUserCache = async (userId) => {
  if (!redis?.isOpen) return;

  try {
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Invalidate user cache error:", error);
  }
};

module.exports = {
  getCachedSearch,
  cacheSearchResults,
  getCachedUserSession,
  cacheUserSession,
  getCachedStats,
  cacheStats,
  incrementDailyQuestions,
  getDailyQuestionCount,
  trackPopularQuery,
  getPopularQueries,
  getCacheStats,
  cleanupOldCache,
  clearAllCache,
  invalidateUserCache,
  generateCacheKey,
  CACHE_CONFIG
};