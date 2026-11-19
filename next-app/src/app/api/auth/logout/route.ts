import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashToken, verifySessionToken } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('merlin_session')?.value;
  if (token) {
    const payload = verifySessionToken(token);
    if (payload) await prisma.session.deleteMany({ where: { id: payload.sessionId, tokenHash: hashToken(token) } });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set('merlin_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0), path: '/' });
  return response;
}
