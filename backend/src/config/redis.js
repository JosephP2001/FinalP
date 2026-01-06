import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    redisClient.on('error', (err) => {
      console.error(':,v Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log(':) Redis Connected');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error(':,v Redis connection failed:', error.message);
    // DO NOT STOP THE APP IF REDIS FAIL
    return null;
  }
};

export const getRedisClient = () => {
  return redisClient;
};

// Cache helpers
export const cacheGet = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key, value, expirationInSeconds = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

export const cacheDel = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};