import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function getSessionSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) throw new Error('APP_SECRET must contain at least 32 characters');
  return secret;
}

export function createSessionToken(payload: { sessionId: string; userId: string; expiresAt: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string): { sessionId: string; userId: string; expiresAt: number } | null {
  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expected = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
    const supplied = Buffer.from(signature);
    const check = Buffer.from(expected);
    if (supplied.length !== check.length || !timingSafeEqual(supplied, check)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { sessionId: string; userId: string; expiresAt: number };
    if (!payload.sessionId || !payload.userId || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
