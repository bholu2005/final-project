import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

export function hashPassword(password: string): string {
  if (password.length < 12) throw new Error('Password must contain at least 12 characters');
  const salt = randomBytes(16).toString('base64url');
  const key = scryptSync(password, salt, 64);
  return `scrypt$${salt}$${key.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algorithm, salt, encoded] = stored.split('$');
    if (algorithm !== 'scrypt' || !salt || !encoded) return false;
    const expected = Buffer.from(encoded, 'base64url');
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
