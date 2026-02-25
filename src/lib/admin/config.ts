import { getRedisClient } from "@/lib/kv/client";

/**
 * Generic config getter — reads a JSON value from Redis.
 * Returns `fallback` if the key doesn't exist or Redis fails.
 */
export async function getConfig<T>(key: string, fallback: T): Promise<T> {
  try {
    const redis = getRedisClient();
    const value = await redis.get<T>(key);
    return value ?? fallback;
  } catch (error) {
    console.error(`[Config] Failed to read "${key}":`, error);
    return fallback;
  }
}

/**
 * Generic config setter — writes a JSON value to Redis.
 */
export async function setConfig<T>(key: string, value: T): Promise<void> {
  const redis = getRedisClient();
  await redis.set(key, value);
}

/**
 * Delete a config key from Redis.
 */
export async function deleteConfig(key: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(key);
}
