import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createOpaqueToken, createSessionToken, hashToken } from '@/lib/session';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
}).strict();

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== process.env.APP_ORIGIN) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: 'pending',
      expiresAt: new Date(expiresAt),
      ipAddress: request.headers.get('x-real-ip')?.trim() || null,
      userAgent: request.headers.get('user-agent')?.slice(0, 500) || null,
    },
  });
  const opaque = createOpaqueToken();
  const token = createSessionToken({ sessionId: session.id, userId: user.id, expiresAt });
  await prisma.session.update({ where: { id: session.id }, data: { tokenHash: hashToken(`${opaque}.${token}`) } });

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
  });
  response.cookies.set('merlin_session', `${opaque}.${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
  return response;
}
