import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates grade and remark based on total score (0 - 100)
 */
export function calculateGrade(total: number): { grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; remark: string } {
  if (total >= 70) return { grade: 'A', remark: 'Excellent' };
  if (total >= 60) return { grade: 'B', remark: 'Very Good' };
  if (total >= 50) return { grade: 'C', remark: 'Good' };
  if (total >= 45) return { grade: 'D', remark: 'Pass' };
  if (total >= 40) return { grade: 'E', remark: 'Fair Pass' };
  return { grade: 'F', remark: 'Fail' };
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
