import crypto from 'node:crypto';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export const SESSION_COOKIE_NAME = 'session_token';

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function isSessionExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}