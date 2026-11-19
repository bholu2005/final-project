import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const globalForQueue = globalThis as unknown as { debugQueue?: Queue };
function redisConnection() {
  const url = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
export const debugQueue = globalForQueue.debugQueue ?? new Queue('merlin-debug', {
  connection: redisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1500 },
    removeOnComplete: { age: 86400, count: 1000 },
    removeOnFail: { age: 604800, count: 5000 },
  },
});
if (process.env.NODE_ENV !== 'production') globalForQueue.debugQueue = debugQueue;
