import { getRedisClient } from '../config/redis.js';

/**
 * Rate Limiting Configuration for AI Analysis
 * - Prevents abuse of Groq API
 * - Limits per user and per survey
 */
const AI_RATE_LIMIT_CONFIG = {
  // User limits
  MAX_ANALYSES_PER_USER_PER_HOUR: 10,      // 10 análisis por hora por usuario
  MAX_ANALYSES_PER_USER_PER_DAY: 50,       // 50 análisis por día por usuario
  
  // Survey limits (prevent spam on same survey)
  MAX_ANALYSES_PER_SURVEY_PER_USER: 5,     // 5 análisis de la misma encuesta por usuario
  SURVEY_COOLDOWN_MINUTES: 5,               // 5 minutos entre análisis de la misma encuesta
  
  // Time windows
  HOUR_IN_SECONDS: 3600,
  DAY_IN_SECONDS: 86400,
  COOLDOWN_IN_SECONDS: 300
};

/**
 * Middleware: Rate limit AI analysis requests
 * Implements multi-level rate limiting:
 * 1. Per user per hour
 * 2. Per user per day
 * 3. Per survey per user (with cooldown)
 */
export const rateLimitAI = async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    
    // If Redis is not available, allow request but log warning
    if (!redisClient) {
      console.warn('⚠️  Redis unavailable - Rate limiting disabled');
      return next();
    }

    const userId = req.user.id;
    const surveyId = req.params.surveyId;
    const currentTime = Date.now();

    // Keys for Redis
    const userHourKey = `ai:ratelimit:user:${userId}:hour`;
    const userDayKey = `ai:ratelimit:user:${userId}:day`;
    const surveyUserKey = `ai:ratelimit:survey:${surveyId}:user:${userId}`;
    const surveyCooldownKey = `ai:cooldown:survey:${surveyId}:user:${userId}`;

    // 1. CHECK COOLDOWN (most restrictive first)
    
    const cooldownRemaining = await redisClient.ttl(surveyCooldownKey);
    if (cooldownRemaining > 0) {
      const minutesRemaining = Math.ceil(cooldownRemaining / 60);
      return res.status(429).json({
        success: false,
        message: `Por favor espera ${minutesRemaining} minuto(s) antes de analizar esta encuesta nuevamente`,
        error: 'COOLDOWN_ACTIVE',
        retryAfter: cooldownRemaining,
        limit: {
          type: 'survey_cooldown',
          resetIn: cooldownRemaining
        }
      });
    }

    // 2. CHECK HOURLY LIMIT
    const hourlyCount = await redisClient.get(userHourKey);
    const hourlyUsage = parseInt(hourlyCount || '0');

    if (hourlyUsage >= AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR) {
      const ttl = await redisClient.ttl(userHourKey);
      const minutesRemaining = Math.ceil(ttl / 60);
      
      return res.status(429).json({
        success: false,
        message: `Has alcanzado el límite de ${AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR} análisis por hora. Intenta en ${minutesRemaining} minuto(s)`,
        error: 'HOURLY_LIMIT_EXCEEDED',
        retryAfter: ttl,
        limit: {
          type: 'hourly',
          max: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR,
          current: hourlyUsage,
          resetIn: ttl
        }
      });
    }

    // 3. CHECK DAILY LIMIT
    const dailyCount = await redisClient.get(userDayKey);
    const dailyUsage = parseInt(dailyCount || '0');

    if (dailyUsage >= AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY) {
      const ttl = await redisClient.ttl(userDayKey);
      const hoursRemaining = Math.ceil(ttl / 3600);
      
      return res.status(429).json({
        success: false,
        message: `Has alcanzado el límite diario de ${AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY} análisis. Intenta en ${hoursRemaining} hora(s)`,
        error: 'DAILY_LIMIT_EXCEEDED',
        retryAfter: ttl,
        limit: {
          type: 'daily',
          max: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY,
          current: dailyUsage,
          resetIn: ttl
        }
      });
    }

    // 4. CHECK PER-SURVEY LIMIT
    const surveyCount = await redisClient.get(surveyUserKey);
    const surveyUsage = parseInt(surveyCount || '0');

    if (surveyUsage >= AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_SURVEY_PER_USER) {
      return res.status(429).json({
        success: false,
        message: `Has alcanzado el límite de ${AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_SURVEY_PER_USER} análisis para esta encuesta`,
        error: 'SURVEY_LIMIT_EXCEEDED',
        limit: {
          type: 'per_survey',
          max: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_SURVEY_PER_USER,
          current: surveyUsage
        }
      });
    }

    // 5. INCREMENT COUNTERS
    
    // Increment hourly counter
    const newHourlyCount = await redisClient.incr(userHourKey);
    if (newHourlyCount === 1) {
      // Set expiration only on first increment
      await redisClient.expire(userHourKey, AI_RATE_LIMIT_CONFIG.HOUR_IN_SECONDS);
    }

    // Increment daily counter
    const newDailyCount = await redisClient.incr(userDayKey);
    if (newDailyCount === 1) {
      await redisClient.expire(userDayKey, AI_RATE_LIMIT_CONFIG.DAY_IN_SECONDS);
    }

    // Increment survey counter (never expires, permanent per survey-user)
    await redisClient.incr(surveyUserKey);

    // Set cooldown for this survey-user combination
    await redisClient.setEx(
      surveyCooldownKey,
      AI_RATE_LIMIT_CONFIG.COOLDOWN_IN_SECONDS,
      currentTime.toString()
    );

    
    // 6. ATTACH RATE LIMIT INFO TO REQUEST
    
    req.rateLimitInfo = {
      hourly: {
        used: newHourlyCount,
        remaining: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR - newHourlyCount,
        limit: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR
      },
      daily: {
        used: newDailyCount,
        remaining: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY - newDailyCount,
        limit: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY
      },
      survey: {
        used: surveyUsage + 1,
        remaining: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_SURVEY_PER_USER - (surveyUsage + 1),
        limit: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_SURVEY_PER_USER
      }
    };

    console.log(`AI Rate Limit - User ${userId} - Hourly: ${newHourlyCount}/${AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR}, Daily: ${newDailyCount}/${AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY}`);

    next();

  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
};

/**
 * Get current rate limit status for a user
 * Useful for showing remaining quota in UI
 */
export const getRateLimitStatus = async (userId) => {
  try {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      return null;
    }

    const userHourKey = `ai:ratelimit:user:${userId}:hour`;
    const userDayKey = `ai:ratelimit:user:${userId}:day`;

    const [hourlyCount, hourlyTTL, dailyCount, dailyTTL] = await Promise.all([
      redisClient.get(userHourKey),
      redisClient.ttl(userHourKey),
      redisClient.get(userDayKey),
      redisClient.ttl(userDayKey)
    ]);

    const hourlyUsage = parseInt(hourlyCount || '0');
    const dailyUsage = parseInt(dailyCount || '0');

    return {
      hourly: {
        used: hourlyUsage,
        remaining: Math.max(0, AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR - hourlyUsage),
        limit: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_HOUR,
        resetIn: hourlyTTL > 0 ? hourlyTTL : AI_RATE_LIMIT_CONFIG.HOUR_IN_SECONDS
      },
      daily: {
        used: dailyUsage,
        remaining: Math.max(0, AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY - dailyUsage),
        limit: AI_RATE_LIMIT_CONFIG.MAX_ANALYSES_PER_USER_PER_DAY,
        resetIn: dailyTTL > 0 ? dailyTTL : AI_RATE_LIMIT_CONFIG.DAY_IN_SECONDS
      }
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
};

/**
 * Admin function: Reset rate limits for a user
 */
export const resetUserRateLimit = async (userId) => {
  try {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      return false;
    }

    const keys = await redisClient.keys(`ai:*:user:${userId}*`);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🔄 Reset rate limits for user ${userId} - ${keys.length} keys deleted`);
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
};

export default rateLimitAI;