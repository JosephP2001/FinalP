import { cacheGet, cacheSet } from '../config/redis.js';

export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await cacheGet(key);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${key}`);

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(key, body, duration);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};