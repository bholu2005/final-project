import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{10,40}$/.test(id)) return NextResponse.json({ error: 'Invalid job id.' }, { status: 400 });
  const job = await prisma.debugJob.findUnique({ where: { id }, select: { id: true, status: true, result: true, errorCode: true, createdAt: true, completedAt: true } });
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  return NextResponse.json(job, { headers: { 'Cache-Control': 'no-store' } });
}
