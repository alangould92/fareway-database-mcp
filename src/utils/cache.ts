/**
 * Cache Utility
 * 
 * Optional Redis caching for performance optimization
 */

import { Redis } from 'ioredis';
import { env } from '../config/environment.js';
import { logger } from './logger.js';

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis | null {
  if (!env.ENABLE_CACHE || !env.REDIS_URL) {
    return null;
  }
  
  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis max retries reached, disabling cache');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });
      
      redisClient.on('error', (err) => {
        logger.error('Redis error', { error: err });
      });
      
      redisClient.on('connect', () => {
        logger.info('Redis connected');
      });
      
    } catch (error) {
      logger.error('Failed to initialize Redis', { error });
      return null;
    }
  }
  
  return redisClient;
}

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  
  try {
    const value = await redis.get(key);
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    logger.warn('Cache get failed', { key, error });
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCached(
  key: string,
  value: any,
  ttlSeconds: number = env.CACHE_TTL_SECONDS
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn('Cache set failed', { key, error });
  }
}

/**
 * Clear cache by pattern
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('Cache cleared', { pattern, count: keys.length });
    }
  } catch (error) {
    logger.warn('Cache clear failed', { pattern, error });
  }
}

/**
 * Close Redis connection
 */
export async function closeCache(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

