import IORedis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: IORedis };
function makeRedis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is required');
  return new IORedis(url, { maxRetriesPerRequest: null, enableReadyCheck: true });
}
export const redis = globalForRedis.redis ?? makeRedis();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
