import { prisma } from './lib/prisma';
import { DEBUGGER_SYSTEM_PROMPT } from './lib/debugger-prompt';

const maxAttempts = 3;
const idleDelay = 1000;

async function claimJob() {
  const rows = await prisma.$queryRaw<Array<{ id: string; prompt: string; provider: string; model: string; attempts: number }>>`
    WITH candidate AS (
      SELECT "id" FROM "DebugJob"
      WHERE (("status" IN ('queued', 'retrying') AND "nextAttemptAt" <= NOW())
          OR ("status" = 'processing' AND "lockedAt" < NOW() - INTERVAL '5 minutes'))
        AND "attempts" < ${maxAttempts}
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE "DebugJob" AS job
    SET "status" = 'processing', "lockedAt" = NOW(), "attempts" = job."attempts" + 1, "updatedAt" = NOW()
    FROM candidate
    WHERE job."id" = candidate."id"
    RETURNING job."id", job."prompt", job."provider", job."model", job."attempts"
  `;
  return rows[0] ?? null;
}

async function callProvider(job: { prompt: string; provider: string; model: string }): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error('AI provider is not configured');
  const signal = AbortSignal.timeout(60000);
  const maxTokens = Math.max(256, Math.min(4000, Number(process.env.AI_MAX_OUTPUT_TOKENS || 1600)));

  if (job.provider === 'anthropic') {
    const base = (process.env.AI_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
    const response = await fetch(`${base}/v1/messages`, {
      method: 'POST', signal,
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: job.model, max_tokens: maxTokens, system: DEBUGGER_SYSTEM_PROMPT, messages: [{ role: 'user', content: job.prompt }] }),
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const data = await response.json() as { content?: Array<{ text?: string }> };
    const answer = data.content?.map((part) => part.text || '').join('\n').trim();
    if (!answer) throw new Error('Empty provider response');
    return answer;
  }

  if (job.provider === 'openai') {
    const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST', signal,
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: job.model, max_tokens: maxTokens, temperature: 0.2, messages: [{ role: 'system', content: DEBUGGER_SYSTEM_PROMPT }, { role: 'user', content: job.prompt }] }),
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error('Empty provider response');
    return answer;
  }
  throw new Error('Unsupported AI provider');
}

async function runWorker() {
  console.info('PostgreSQL-backed Merlin worker started.');
  let stopping = false;
  process.once('SIGTERM', () => { stopping = true; console.info('Worker draining after SIGTERM.'); });
  process.once('SIGINT', () => { stopping = true; console.info('Worker draining after SIGINT.'); });

  while (!stopping) {
    let job: Awaited<ReturnType<typeof claimJob>> = null;
    try {
      // Jobs abandoned by a process crash become failed after their final attempt.
      await prisma.debugJob.updateMany({
        where: { status: 'processing', attempts: { gte: maxAttempts }, lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
        data: { status: 'failed', errorCode: 'worker_interrupted', lockedAt: null },
      });
      job = await claimJob();
      if (!job) {
        await new Promise((resolve) => setTimeout(resolve, idleDelay));
        continue;
      }

      const result = await callProvider(job);
      await prisma.debugJob.update({ where: { id: job.id }, data: { status: 'completed', result, errorCode: null, lockedAt: null, completedAt: new Date() } });
    } catch (error) {
      if (job) {
        const terminal = job.attempts >= maxAttempts;
        const delaySeconds = Math.min(60, 2 ** job.attempts * 5);
        await prisma.debugJob.updateMany({
          where: { id: job.id, status: 'processing' },
          data: {
            status: terminal ? 'failed' : 'retrying',
            errorCode: terminal ? 'provider_unavailable' : 'retry_scheduled',
            nextAttemptAt: new Date(Date.now() + delaySeconds * 1000),
            lockedAt: null,
          },
        });
      } else {
        console.error('Queue poll failed; retrying:', error instanceof Error ? error.message : 'unknown error');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  await prisma.$disconnect();
}

void runWorker().catch((error) => {
  console.error('Worker exited unexpectedly:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
