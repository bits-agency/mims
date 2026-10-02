import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserRole } from './types';

const SESSION_COOKIE_NAME = 'mims_session';
const SESSION_SECRET = process.env.JWT_SECRET || 'mims-akure-super-secret-key-change-in-production-2026';

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  username: string;
  status: string;
  exp: number;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Simple, tamper-proof HMAC signing using Web Crypto API
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Create a signed session token
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: SessionPayload = { ...payload, exp };
  
  const payloadStr = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  
  const key = await getCryptoKey(SESSION_SECRET);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64)
  );
  
  const sigB64 = Buffer.from(signature).toString('base64url');
  return `${payloadB64}.${sigB64}`;
}

/**
 * Verify and decode a session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [payloadB64, sigB64] = parts;
    const key = await getCryptoKey(SESSION_SECRET);
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(sigB64, 'base64url'),
      new TextEncoder().encode(payloadB64)
    );
    
    if (!isValid) return null;
    
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadJson);
    
    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Store session cookie in Next.js response headers
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Read current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
