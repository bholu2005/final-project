import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { allowRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';
const schema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  securityQuestion: z.string().trim().min(3).max(255).optional(),
  securityAnswer: z.string().trim().min(12).max(128).optional(),
}).strict();

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== process.env.APP_ORIGIN) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const ip = request.headers.get('x-real-ip')?.trim() || 'local';
  if (!await allowRequest(`register:${ip}`, 5)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid registration data.' }, { status: 422 });

  try {
    const user = await prisma.user.create({ data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      securityQuestion: parsed.data.securityQuestion,
      securityAnswerHash: parsed.data.securityAnswer ? hashPassword(parsed.data.securityAnswer.toLowerCase().trim()) : null,
    }, select: { id: true, name: true, email: true, role: true, plan: true } });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    console.error('Registration failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not create account.' }, { status: 503 });
  }
}
