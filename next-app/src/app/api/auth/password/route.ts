import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomInt, createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export const runtime = 'nodejs';

const requestSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).strict();
const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(12).max(128),
}).strict();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = new URL(request.url).pathname.endsWith('/request') ? 'request' : 'reset';

  if (action === 'request') {
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email.' }, { status: 422 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const otp = String(randomInt(100000, 1000000));
      await prisma.user.update({ where: { id: user.id }, data: {
        otpHash: createHash('sha256').update(otp).digest('hex'),
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      } });
      console.warn('Password reset OTP was created but no mail provider is configured.', { userId: user.id });
    }
    return NextResponse.json({ success: true, message: 'If the account exists, password recovery is available.' });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid reset data.' }, { status: 422 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.otpHash || !user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired reset code.' }, { status: 400 });
  }
  const suppliedHash = createHash('sha256').update(parsed.data.otp).digest('hex');
  const expected = Buffer.from(user.otpHash, 'hex');
  const supplied = Buffer.from(suppliedHash, 'hex');
  if (expected.length !== supplied.length) return NextResponse.json({ error: 'Invalid or expired reset code.' }, { status: 400 });
  // timingSafeEqual is intentionally used for OTP verification.
  const { timingSafeEqual } = await import('node:crypto');
  if (!timingSafeEqual(expected, supplied)) return NextResponse.json({ error: 'Invalid or expired reset code.' }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(parsed.data.password), otpHash: null, otpExpiry: null } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ success: true, message: 'Password updated.' });
}
