const Redis = require('ioredis');

// Initialize Redis client
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  };

  // For AWS ElastiCache
  if (process.env.ELASTICACHE_ENDPOINT) {
    redisConfig.host = process.env.ELASTICACHE_ENDPOINT;
    redisConfig.tls = {}; // ElastiCache requires TLS
  }

  redisClient = new Redis(redisConfig);

  redisClient.on('connect', () => {
    isConnected = true;
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    isConnected = false;
    console.error('❌ Redis error:', err.message);
  });

  redisClient.on('close', () => {
    isConnected = false;
    console.log('⚠️  Redis connection closed');
  });

  return redisClient;
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Store user session
 * @param {string} userId - User ID
 * @param {object} sessionData - Session data
 * @param {number} ttl - Time to live in seconds (default: 7 days)
 * @returns {Promise<void>}
 */
async function setSession(userId, sessionData, ttl = 604800) {
  if (!isConnected) return;
  
  try {
    const key = `session:${userId}`;
    await redisClient.setex(key, ttl, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Redis setSession error:', error);
  }
}

/**
 * Get user session
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Session data
 */
async function getSession(userId) {
  if (!isConnected) return null;
  
  try {
    const key = `session:${userId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getSession error:', error);
    return null;
  }
}

/**
 * Delete user session
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function deleteSession(userId) {
  if (!isConnected) return;
  
  try {
    const key = `session:${userId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis deleteSession error:', error);
  }
}

// ==================== CACHING ====================

/**
 * Cache data with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<void>}
 */
async function setCache(key, value, ttl = 3600) {
  if (!isConnected) return;
  
  try {
    const cacheKey = `cache:${key}`;
    await redisClient.setex(cacheKey, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value
 */
async function getCache(key) {
  if (!isConnected) return null;
  
  try {
    const cacheKey = `cache:${key}`;
    const data = await redisClient.get(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * Delete cached data
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
async function deleteCache(key) {
  if (!isConnected) return;
  
  try {
    const cacheKey = `cache:${key}`;
    await redisClient.del(cacheKey);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
}

/**
 * Clear all cache with pattern
 * @param {string} pattern - Key pattern (e.g., "user:*")
 * @returns {Promise<void>}
 */
async function clearCachePattern(pattern) {
  if (!isConnected) return;
  
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Redis clearCachePattern error:', error);
  }
}

// ==================== LEADERBOARD ====================

/**
 * Update user score in leaderboard
 * @param {string} leaderboardName - Leaderboard name (e.g., "global", "weekly")
 * @param {string} userId - User ID
 * @param {number} score - User score (XP)
 * @returns {Promise<void>}
 */
async function updateLeaderboard(leaderboardName, userId, score) {
  if (!isConnected) return;
  
  try {
    const key = `leaderboard:${leaderboardName}`;
    await redisClient.zadd(key, score, userId);
  } catch (error) {
    console.error('Redis updateLeaderboard error:', error);
  }
}

/**
 * Get top users from leaderboard
 * @param {string} leaderboardName - Leaderboard name
 * @param {number} limit - Number of users to return (default: 10)
 * @returns {Promise<array>} - Array of {userId, score}
 */
async function getLeaderboard(leaderboardName, limit = 10) {
  if (!isConnected) return [];
  
  try {
    const key = `leaderboard:${leaderboardName}`;
    const results = await redisClient.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    
    // Convert flat array to objects
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i],
        score: parseInt(results[i + 1])
      });
    }
    
    return leaderboard;
  } catch (error) {
    console.error('Redis getLeaderboard error:', error);
    return [];
  }
}

/**
 * Get user rank in leaderboard
 * @param {string} leaderboardName - Leaderboard name
 * @param {string} userId - User ID
 * @returns {Promise<number|null>} - User rank (1-based)
 */
async function getUserRank(leaderboardName, userId) {
  if (!isConnected) return null;
  
  try {
    const key = `leaderboard:${leaderboardName}`;
    const rank = await redisClient.zrevrank(key, userId);
    return rank !== null ? rank + 1 : null; // Convert to 1-based
  } catch (error) {
    console.error('Redis getUserRank error:', error);
    return null;
  }
}

/**
 * Get user score from leaderboard
 * @param {string} leaderboardName - Leaderboard name
 * @param {string} userId - User ID
 * @returns {Promise<number|null>} - User score
 */
async function getUserScore(leaderboardName, userId) {
  if (!isConnected) return null;
  
  try {
    const key = `leaderboard:${leaderboardName}`;
    const score = await redisClient.zscore(key, userId);
    return score ? parseInt(score) : null;
  } catch (error) {
    console.error('Redis getUserScore error:', error);
    return null;
  }
}

// ==================== REAL-TIME COLLABORATION ====================

/**
 * Store collaboration session
 * @param {string} sessionId - Session ID
 * @param {object} sessionData - Session data
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<void>}
 */
async function setCollaborationSession(sessionId, sessionData, ttl = 3600) {
  if (!isConnected) return;
  
  try {
    const key = `collab:${sessionId}`;
    await redisClient.setex(key, ttl, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Redis setCollaborationSession error:', error);
  }
}

/**
 * Get collaboration session
 * @param {string} sessionId - Session ID
 * @returns {Promise<object|null>} - Session data
 */
async function getCollaborationSession(sessionId) {
  if (!isConnected) return null;
  
  try {
    const key = `collab:${sessionId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getCollaborationSession error:', error);
    return null;
  }
}

/**
 * Add user to collaboration session
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function addUserToSession(sessionId, userId) {
  if (!isConnected) return;
  
  try {
    const key = `collab:users:${sessionId}`;
    await redisClient.sadd(key, userId);
    await redisClient.expire(key, 3600); // 1 hour TTL
  } catch (error) {
    console.error('Redis addUserToSession error:', error);
  }
}

/**
 * Get users in collaboration session
 * @param {string} sessionId - Session ID
 * @returns {Promise<array>} - Array of user IDs
 */
async function getSessionUsers(sessionId) {
  if (!isConnected) return [];
  
  try {
    const key = `collab:users:${sessionId}`;
    return await redisClient.smembers(key);
  } catch (error) {
    console.error('Redis getSessionUsers error:', error);
    return [];
  }
}

// ==================== RATE LIMITING ====================

/**
 * Check and increment rate limit
 * @param {string} key - Rate limit key (e.g., "api:userId")
 * @param {number} limit - Max requests
 * @param {number} window - Time window in seconds
 * @returns {Promise<object>} - {allowed: boolean, remaining: number}
 */
async function checkRateLimit(key, limit, window) {
  if (!isConnected) return { allowed: true, remaining: limit };
  
  try {
    const rateLimitKey = `ratelimit:${key}`;
    const current = await redisClient.incr(rateLimitKey);
    
    if (current === 1) {
      await redisClient.expire(rateLimitKey, window);
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: await redisClient.ttl(rateLimitKey)
    };
  } catch (error) {
    console.error('Redis checkRateLimit error:', error);
    return { allowed: true, remaining: limit };
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if Redis is configured and connected
 * @returns {boolean}
 */
function isRedisConfigured() {
  return isConnected;
}

/**
 * Get Redis client
 * @returns {Redis|null}
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
}

/**
 * Ping Redis to check connection
 * @returns {Promise<boolean>}
 */
async function pingRedis() {
  if (!redisClient) return false;
  
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
}

module.exports = {
  // Initialization
  initializeRedis,
  isRedisConfigured,
  getRedisClient,
  closeRedis,
  pingRedis,
  
  // Session management
  setSession,
  getSession,
  deleteSession,
  
  // Caching
  setCache,
  getCache,
  deleteCache,
  clearCachePattern,
  
  // Leaderboard
  updateLeaderboard,
  getLeaderboard,
  getUserRank,
  getUserScore,
  
  // Collaboration
  setCollaborationSession,
  getCollaborationSession,
  addUserToSession,
  getSessionUsers,
  
  // Rate limiting
  checkRateLimit
};
