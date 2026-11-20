import { prisma } from './prisma';
import { createHash } from 'node:crypto';

/** PostgreSQL-backed fixed-window limiter; survives app restarts and works across replicas. */
export async function allowRequest(identity: string, limit = 10): Promise<boolean> {
  const key = createHash('sha256').update(identity).digest('hex');
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "windowStart", "count", "updatedAt")
    VALUES (${key}, NOW(), 1, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" <= NOW() - INTERVAL '1 minute' THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" <= NOW() - INTERVAL '1 minute' THEN NOW()
        ELSE "RateLimitBucket"."windowStart"
      END,
      "updatedAt" = NOW()
    RETURNING "count"
  `;
  return (rows[0]?.count ?? limit + 1) <= limit;
}
