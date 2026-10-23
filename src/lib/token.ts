import { UserRole } from './types';

export const SESSION_COOKIE_NAME = 'mims_session';

export function getSessionSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ALERT: JWT_SECRET environment variable is missing in production.');
    }
    return 'mims-akure-dev-secret-change-in-production-2026';
  }
  return secret;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  username: string;
  status: string;
  wing?: 'primary' | 'secondary' | 'all';
  sessionVersion?: number;
  exp: number;
}

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

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64url');
  }
  // Fallback for universal Web environment
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(b64url: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64url, 'base64url').toString('utf-8');
  }
  let base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function base64UrlToUint8Array(b64url: string): Uint8Array {
  let base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Create a signed session token using Web Crypto
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: SessionPayload = { ...payload, exp };

  const payloadStr = JSON.stringify(fullPayload);
  const payloadB64 = base64UrlEncode(payloadStr);

  const key = await getCryptoKey(getSessionSecret());
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64)
  );

  let sigB64: string;
  if (typeof Buffer !== 'undefined') {
    sigB64 = Buffer.from(signature).toString('base64url');
  } else {
    const bytes = new Uint8Array(signature);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    sigB64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return `${payloadB64}.${sigB64}`;
}

/**
 * Verify HMAC signature and decode session token (Safe in Edge and Node)
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, sigB64] = parts;
    const key = await getCryptoKey(getSessionSecret());

    const sigBytes = base64UrlToUint8Array(sigB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as ArrayBuffer,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiry
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
