import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables. " +
        "Set up an Upstash Redis store in Vercel Marketplace and link it to this project."
      );
    }

    redis = new Redis({ url, token });
  }

  return redis;
}
