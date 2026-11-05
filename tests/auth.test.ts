import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from '../src/lib/token.ts';

describe('HMAC-SHA256 Session Token Protocol', () => {
  const sampleUser: Omit<SessionPayload, 'exp'> = {
    userId: '11111111-2222-3333-4444-555555555555',
    email: 'test@mimsakure.com',
    role: 'teacher',
    fullName: 'Test Tutor',
    username: 'testtutor',
    status: 'active',
    wing: 'secondary',
    sessionVersion: 2,
  };

  it('generates a valid signed token that can be verified', async () => {
    const token = await createSessionToken(sampleUser, 3600);
    assert.ok(token);
    assert.equal(token.split('.').length, 2, 'Token must be composed of payload.signature');

    const decoded = await verifySessionToken(token);
    assert.ok(decoded);
    assert.equal(decoded.userId, sampleUser.userId);
    assert.equal(decoded.email, sampleUser.email);
    assert.equal(decoded.role, sampleUser.role);
    assert.equal(decoded.sessionVersion, 2);
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
  });

  it('rejects tampered payload data', async () => {
    const token = await createSessionToken(sampleUser, 3600);
    const [payloadB64, sig] = token.split('.');

    // Tamper payload to elevate role to super_admin
    const tamperedPayload = Buffer.from(payloadB64, 'base64url').toString('utf8').replace('"teacher"', '"super_admin"');
    const tamperedB64 = Buffer.from(tamperedPayload).toString('base64url');
    const forgedToken = `${tamperedB64}.${sig}`;

    const verified = await verifySessionToken(forgedToken);
    assert.equal(verified, null, 'Forged payload must be rejected by signature verification');
  });

  it('rejects an invalid or truncated signature', async () => {
    const token = await createSessionToken(sampleUser, 3600);
    const [payloadB64] = token.split('.');
    const invalidSignatureToken = `${payloadB64}.invalid_signature_bytes`;

    const verified = await verifySessionToken(invalidSignatureToken);
    assert.equal(verified, null, 'Invalid signature must return null');
  });

  it('rejects expired session tokens', async () => {
    // Expire 10 seconds in the past
    const token = await createSessionToken(sampleUser, -10);
    const verified = await verifySessionToken(token);
    assert.equal(verified, null, 'Expired session must return null');
  });
});
