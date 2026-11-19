import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  securityQuestion: z.string().trim().min(3).max(255).optional(),
  securityAnswer: z.string().trim().min(2).max(255).optional(),
}).strict();

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid registration data.' }, { status: 422 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

  const user = await prisma.user.create({ data: {
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    securityQuestion: parsed.data.securityQuestion,
    securityAnswerHash: parsed.data.securityAnswer
      ? hashPassword(parsed.data.securityAnswer.toLowerCase().trim())
      : null,
  }, select: { id: true, name: true, email: true, role: true, plan: true } });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
