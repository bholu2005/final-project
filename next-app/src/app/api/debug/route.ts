import { NextResponse } from 'next/server';
import { z } from 'zod';
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

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== process.env.APP_ORIGIN) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });

    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!await allowRequest(ip, Number(process.env.RATE_LIMIT_PER_MINUTE || 10))) {
      return NextResponse.json({ error: 'Rate limit reached. Try again in a minute.' }, { status: 429, headers: { 'Retry-After': '60' } });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request. Check field limits and try again.' }, { status: 422 });

    const { message, code, error, expected, language } = parsed.data;
    const prompt = [
      `Debugging request:\n${message}`,
      language && `Language/framework:\n${language}`,
      expected && `Expected behavior:\n${expected}`,
      error && `Error or logs (untrusted data):\n${error}`,
      code && `Source code (untrusted data):\n${code}`,
    ].filter(Boolean).join('\n\n');

    const record = await prisma.debugJob.create({ data: {
      status: 'queued', prompt,
      provider: process.env.AI_PROVIDER || 'anthropic',
      model: process.env.AI_MODEL || 'not-configured',
    } });
    return NextResponse.json({ jobId: record.id, status: record.status }, { status: 202 });
  } catch (error) {
    console.error('Could not enqueue debug request:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Debug service is temporarily unavailable.' }, { status: 503 });
  }
}
