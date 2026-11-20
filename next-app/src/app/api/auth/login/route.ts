import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createOpaqueToken, hashToken } from '@/lib/session';
import { allowRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';
const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(128) }).strict();

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== process.env.APP_ORIGIN) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const ip = request.headers.get('x-real-ip')?.trim() || 'local';
  if (!await allowRequest(`login:${ip}`, 10)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': '60' } });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
  if (user.mfaEnabled) {
    return NextResponse.json({ error: 'MFA is enabled but MFA login challenge is not available yet.' }, { status: 501 });
  }

  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: {
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt,
    ipAddress: request.headers.get('x-real-ip')?.trim().slice(0, 100) || null,
    userAgent: request.headers.get('user-agent')?.slice(0, 500) || null,
  } });

  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan } });
  response.cookies.set('merlin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
  return response;
}
