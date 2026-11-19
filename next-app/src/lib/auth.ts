import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashToken, verifySessionToken } from '@/lib/session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('merlin_session')?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });
  if (!session || session.tokenHash !== hashToken(token) || session.expiresAt.getTime() < Date.now()) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, plan: true, mfaEnabled: true, githubUsername: true, githubAvatar: true },
  });
}
