import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('merlin_session')?.value;
  if (!token || token.length < 32 || token.length > 128) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, plan: true, mfaEnabled: true, githubUsername: true, githubAvatar: true },
  });
}
