import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLeviesForStudentClass,
  allocatePaymentToLevies,
  getBankAccountForWing,
  OFFICIAL_BANK_ACCOUNTS,
} from '../src/lib/bursary';

describe('Bursary Tariff Resolver', () => {
  it('resolves SSS 3 Candidate Class with WAEC and NECO levies', () => {
    const levies = getLeviesForStudentClass('SSS 3 Science (Gold)');
    assert.ok(levies.length > 0);
    const waecLevy = levies.find((l) => l.id === 'waec');
    const necoLevy = levies.find((l) => l.id === 'neco');
    assert.ok(waecLevy, 'Expected WAEC levy in SSS 3');
    assert.ok(necoLevy, 'Expected NECO levy in SSS 3');
    assert.equal(waecLevy.amount, 35000);
    assert.equal(necoLevy.amount, 32000);
  });

  it('resolves continuing Senior Secondary without external council dues', () => {
    const levies = getLeviesForStudentClass('SSS 2 Arts (Silver)');
    assert.ok(levies.length > 0);
    const waecLevy = levies.find((l) => l.id === 'waec');
    assert.equal(waecLevy, undefined);
    const examLevy = levies.find((l) => l.id === 'exam');
    assert.ok(examLevy, 'Expected terminal exam levy in continuing SSS');
  });

  it('resolves JSS 3 Candidate Class with BECE dues', () => {
    const levies = getLeviesForStudentClass('JSS 3 Gold');
    const beceLevy = levies.find((l) => l.id === 'bece');
    assert.ok(beceLevy, 'Expected BECE levy in JSS 3');
    assert.equal(beceLevy.amount, 20000);
  });

  it('resolves Primary 5 Exit Class with Common Entrance dues', () => {
    const levies = getLeviesForStudentClass('Basic 5 Rose');
    const commonEntrance = levies.find((l) => l.id === 'common-entrance');
    assert.ok(commonEntrance, 'Expected Common Entrance levy in Basic 5');
    assert.equal(commonEntrance.amount, 9500);
  });
});

describe('Levy Waterfall Allocation & Clearance Engine', () => {
  it('clears all levies in full when total paid equals total billed', () => {
    const levies = [
      { id: 'medical', name: 'Medical', amount: 3000, priority: 1, category: 'essential' as const },
      { id: 'tuition', name: 'Tuition', amount: 35000, priority: 2, category: 'tuition' as const },
    ];
    const result = allocatePaymentToLevies(levies, 38000);
    assert.equal(result.totalPaid, 38000);
    assert.equal(result.balance, 0);
    assert.equal(result.allocated[0].status, 'CLEARED');
    assert.equal(result.allocated[1].status, 'CLEARED');
  });

  it('prioritizes lower priority numbers first on partial payments', () => {
    const levies = [
      { id: 'essential', name: 'Health & Medical', amount: 3000, priority: 1, category: 'essential' as const },
      { id: 'exam', name: 'Exam Materials', amount: 4500, priority: 2, category: 'academic' as const },
      { id: 'tuition', name: 'Tuition Fee', amount: 35000, priority: 3, category: 'tuition' as const },
    ];
    // Pay 5000: covers priority 1 (3000) and 2000 of priority 2 (4500)
    const result = allocatePaymentToLevies(levies, 5000);
    assert.equal(result.totalBilled, 42500);
    assert.equal(result.totalPaid, 5000);
    assert.equal(result.balance, 37500);

    assert.equal(result.allocated[0].status, 'CLEARED');
    assert.equal(result.allocated[0].amountPaid, 3000);

    assert.equal(result.allocated[1].status, 'PARTIAL');
    assert.equal(result.allocated[1].amountPaid, 2000);
    assert.equal(result.allocated[1].balance, 2500);

    assert.equal(result.allocated[2].status, 'PENDING');
    assert.equal(result.allocated[2].amountPaid, 0);
    assert.equal(result.allocated[2].balance, 35000);
  });
});

describe('Bank Account Desk Router', () => {
  it('routes primary and nursery students to Primary bank account', () => {
    const primaryAccount = getBankAccountForWing('Primary');
    const nurseryAccount = getBankAccountForWing('Nursery 2 Tulip');
    assert.equal(primaryAccount.sortCode, OFFICIAL_BANK_ACCOUNTS.primary.sortCode);
    assert.equal(nurseryAccount.sortCode, OFFICIAL_BANK_ACCOUNTS.primary.sortCode);
  });

  it('routes secondary students to Secondary College bank account', () => {
    const jssAccount = getBankAccountForWing('Junior Secondary (JSS 1)');
    const sssAccount = getBankAccountForWing('SSS 2 Science (Gold)');
    assert.equal(jssAccount.sortCode, OFFICIAL_BANK_ACCOUNTS.secondary.sortCode);
    assert.equal(sssAccount.sortCode, OFFICIAL_BANK_ACCOUNTS.secondary.sortCode);
  });
});
