import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates standardized WAEC / National curriculum grade and remark based on total score (0 - 100)
 */
export function calculateGrade(total: number): {
  grade: 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
  remark: string;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
} {
  const score = Math.round(Math.min(100, Math.max(0, total)));
  if (score >= 75) return { grade: 'A1', remark: 'Excellent', letterGrade: 'A' };
  if (score >= 70) return { grade: 'B2', remark: 'Very Good', letterGrade: 'A' };
  if (score >= 65) return { grade: 'B3', remark: 'Good', letterGrade: 'B' };
  if (score >= 60) return { grade: 'C4', remark: 'Credit', letterGrade: 'B' };
  if (score >= 55) return { grade: 'C5', remark: 'Credit', letterGrade: 'C' };
  if (score >= 50) return { grade: 'C6', remark: 'Credit', letterGrade: 'C' };
  if (score >= 45) return { grade: 'D7', remark: 'Pass', letterGrade: 'D' };
  if (score >= 40) return { grade: 'E8', remark: 'Fair Pass', letterGrade: 'E' };
  return { grade: 'F9', remark: 'Fail', letterGrade: 'F' };
}

/**
 * Generates an applicant temporary reference code (e.g. APP/2026/0014)
 */
export function generateApplicationRef(sequenceNumber: number | string): string {
  const currentYear = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(4, '0');
  return `APP/${currentYear}/${padded}`;
}

/**
 * Generates a matriculation / admission number (e.g. MIMS/2026/0042)
 */
export function generateAdmissionNumber(sequenceNumber: number | string): string {
  const currentYear = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(4, '0');
  return `MIMS/${currentYear}/${padded}`;
}

/**
 * Generates a teacher staff number (e.g. TCH/2026/007)
 */
export function generateStaffNumber(sequenceNumber: number | string): string {
  const currentYear = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(3, '0');
  return `TCH/${currentYear}/${padded}`;
}

/**
 * Generates a payment receipt number (e.g. REC/20261001/4592)
 */
export function generateReceiptNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC/${dateStr}/${rand}`;
}

/**
 * Formats currency in Nigerian Naira (NGN)
 */
export function formatCurrency(amount: number | string): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(numeric || 0);
}

/**
 * Returns formatted date (e.g. 1st Oct, 2026)
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
