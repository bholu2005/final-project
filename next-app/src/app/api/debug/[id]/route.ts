import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^[a-zA-Z0-9_-]{10,40}$/.test(id)) return NextResponse.json({ error: 'Invalid job id.' }, { status: 400 });
    const token = request.headers.get('x-job-token') || '';
    if (token.length < 32 || token.length > 128) return NextResponse.json({ error: 'Job access token is required.' }, { status: 401 });

    const job = await prisma.debugJob.findUnique({ where: { id }, select: { id: true, status: true, result: true, errorCode: true, pollTokenHash: true, createdAt: true, completedAt: true } });
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    const received = createHash('sha256').update(token).digest();
    const expected = Buffer.from(job.pollTokenHash, 'hex');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

    const { pollTokenHash: _secret, ...publicJob } = job;
    return NextResponse.json(publicJob, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load job status.' }, { status: 503 });
  }
}
