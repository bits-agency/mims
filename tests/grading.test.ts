import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGrade, formatDate, generateApplicationRef } from '../src/lib/utils.ts';

describe('Academic Grading Utility', () => {
  it('correctly assigns A1 for scores >= 75', () => {
    const result = calculateGrade(75);
    assert.equal(result.grade, 'A1');
    assert.equal(result.letterGrade, 'A');
    assert.equal(result.remark, 'Excellent');

    const top = calculateGrade(100);
    assert.equal(top.grade, 'A1');
  });

  it('correctly assigns B2 for scores 70 - 74', () => {
    const result = calculateGrade(72);
    assert.equal(result.grade, 'B2');
    assert.equal(result.letterGrade, 'A');
  });

  it('correctly assigns B3 for scores 65 - 69', () => {
    const result = calculateGrade(68);
    assert.equal(result.grade, 'B3');
    assert.equal(result.letterGrade, 'B');
  });

  it('correctly assigns Credit grades (C4, C5, C6) for 50 - 64', () => {
    assert.equal(calculateGrade(60).grade, 'C4');
    assert.equal(calculateGrade(55).grade, 'C5');
    assert.equal(calculateGrade(50).grade, 'C6');
  });

  it('correctly assigns Pass grades (D7, E8) for 40 - 49', () => {
    assert.equal(calculateGrade(45).grade, 'D7');
    assert.equal(calculateGrade(40).grade, 'E8');
  });

  it('correctly assigns F9 for failing scores < 40', () => {
    const result = calculateGrade(35);
    assert.equal(result.grade, 'F9');
    assert.equal(result.letterGrade, 'F');
    assert.equal(result.remark, 'Fail');
  });

  it('clamps out-of-bounds scores between 0 and 100', () => {
    assert.equal(calculateGrade(120).grade, 'A1');
    assert.equal(calculateGrade(-10).grade, 'F9');
  });
});

describe('Application Reference Generator', () => {
  it('generates padded sequential reference numbers', () => {
    const year = new Date().getFullYear();
    assert.equal(generateApplicationRef(1), `APP/${year}/0001`);
    assert.equal(generateApplicationRef(42), `APP/${year}/0042`);
    assert.equal(generateApplicationRef(1500), `APP/${year}/1500`);
  });
});

describe('Date Formatting Utility', () => {
  it('handles null and undefined dates gracefully', () => {
    assert.equal(formatDate(null), 'N/A');
    assert.equal(formatDate(undefined), 'N/A');
  });

  it('formats dates into standard British English format', () => {
    const formatted = formatDate('2026-10-01');
    assert.match(formatted, /1.*Oct.*2026/);
  });
});
