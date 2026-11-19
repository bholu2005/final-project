import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { allowRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const schema = z.object({
  message: z.string().trim().min(3).max(4000),
  code: z.string().max(12000).optional(),
  error: z.string().max(6000).optional(),
  expected: z.string().max(2000).optional(),
  language: z.string().max(80).optional(),
}).strict();
const maxBodyBytes = 25000;
const maxPendingJobs = 500;

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== process.env.APP_ORIGIN) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });

    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > maxBodyBytes) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > maxBodyBytes) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

    // Configure the reverse proxy to overwrite x-real-ip. Do not trust client-supplied forwarding headers directly.
    const ip = request.headers.get('x-real-ip')?.trim() || 'local';
    if (!await allowRequest(ip, Number(process.env.RATE_LIMIT_PER_MINUTE || 10))) {
      return NextResponse.json({ error: 'Rate limit reached. Try again in a minute.' }, { status: 429, headers: { 'Retry-After': '60' } });
    }

    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Request must be valid JSON.' }, { status: 400 }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request. Check field limits and try again.' }, { status: 422 });

    const pending = await prisma.debugJob.count({ where: { status: { in: ['queued', 'processing', 'retrying'] } } });
    if (pending >= maxPendingJobs) return NextResponse.json({ error: 'The analysis queue is busy. Please retry in a few minutes.' }, { status: 503, headers: { 'Retry-After': '60' } });

    const { message, code, error, expected, language } = parsed.data;
    const prompt = [
      `Debugging request:\n${message}`,
      language && `Language/framework:\n${language}`,
      expected && `Expected behavior:\n${expected}`,
      error && `Error or logs (untrusted data):\n${error}`,
      code && `Source code (untrusted data):\n${code}`,
    ].filter(Boolean).join('\n\n');

    const pollToken = randomBytes(32).toString('base64url');
    const record = await prisma.debugJob.create({ data: {
      status: 'queued', prompt,
      provider: process.env.AI_PROVIDER || 'anthropic',
      model: process.env.AI_MODEL || 'not-configured',
      pollTokenHash: createHash('sha256').update(pollToken).digest('hex'),
    } });
    return NextResponse.json({ jobId: record.id, pollToken, status: record.status }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Could not enqueue debug request:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Debug service is temporarily unavailable.' }, { status: 503 });
  }
}
