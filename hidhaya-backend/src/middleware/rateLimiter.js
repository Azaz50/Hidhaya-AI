const { client: redis } = require("../config/redis");

const rateLimiter = async (req, res, next) => {
  // Skip if Redis is not available
  if (!redis || !redis.isOpen) {
    console.warn("Redis not available, bypassing rate limiter");
    return next();
  }

  try {
    let key, limit, userType;

    // Create a key based on the day to naturally expire
    const today = new Date().toISOString().slice(0, 10);

    if (req.user) {
      if (req.user.isGuest) {
        key = `rate_limit:guest:${req.user._id}:${today}`;
        limit = 10; // 10 per day for guests
        userType = 'guest';
      } else {
        // Check if premium
        const isPremium = req.user.isPremium;
        key = `rate_limit:user:${req.user._id}:${today}`;
        limit = isPremium ? Infinity : 20; // Unlimited for premium, 20 for free
        userType = isPremium ? 'premium' : 'free';
      }
    } else {
      // IP-based for unauthenticated users
      const ip = req.headers["x-forwarded-for"]?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
      key = `rate_limit:ip:${ip}:${today}`;
      limit = 10; // 10 per day for IP
      userType = 'ip';
    }

    // For premium users, don't check rate limit
    if (limit === Infinity) {
      return next();
    }

    const currentCount = await redis.get(key);

    if (currentCount && parseInt(currentCount) >= limit) {
      const remaining = 0;
      const resetTime = new Date(today + 'T23:59:59.999Z');

      return res.status(429).json({
        message: `Daily question limit exceeded. You have used all ${limit} questions for today.`,
        limit,
        remaining,
        resetAt: resetTime,
        userType,
        upgradeUrl: "/premium"
      });
    }

    // Increment count
    const newCount = await redis.incr(key);
    const remaining = Math.max(0, limit - newCount);

    // Set expiry to end of day if not already set
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      const secondsUntilMidnight = Math.ceil((new Date(today + 'T23:59:59.999Z') - new Date()) / 1000);
      await redis.expire(key, Math.max(1, secondsUntilMidnight));
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': new Date(today + 'T23:59:59.999Z').toISOString()
    });

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Continue on error - don't block requests due to rate limiter failure
    next();
  }
};

// Check limit without incrementing
const checkLimit = async (req) => {
  if (!redis || !redis.isOpen) {
    return { allowed: true, remaining: Infinity };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    let key, limit;

    if (req.user) {
      if (req.user.isGuest) {
        key = `rate_limit:guest:${req.user._id}:${today}`;
        limit = 10;
      } else {
        key = `rate_limit:user:${req.user._id}:${today}`;
        limit = req.user.isPremium ? Infinity : 20;
      }
    } else {
      const ip = req.headers["x-forwarded-for"]?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
      key = `rate_limit:ip:${ip}:${today}`;
      limit = 10;
    }

    if (limit === Infinity) {
      return { allowed: true, remaining: Infinity };
    }

    const currentCount = await redis.get(key);
    const remaining = Math.max(0, limit - (parseInt(currentCount) || 0));

    return {
      allowed: remaining > 0,
      remaining,
      limit
    };
  } catch (error) {
    return { allowed: true, remaining: Infinity };
  }
};

module.exports = { rateLimiter, checkLimit };