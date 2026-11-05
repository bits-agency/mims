import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginSchema,
  changePasswordSchema,
  paymentRecordSchema,
  gradeRowSchema,
  gradesSubmissionSchema,
  studentRegistrationSchema,
  mediaGallerySchema,
  achievementSchema,
  admissionsApplicationSchema,
  contactMessageSchema,
} from '../src/lib/validation.ts';

describe('Zod Input Validation Layer', () => {
  describe('Authentication Schemas', () => {
    it('validates correct login credentials', () => {
      const res = loginSchema.safeParse({
        identifier: 'bursar.akure',
        password: 'Password123!',
      });
      assert.equal(res.success, true);
    });

    it('rejects empty identifier or password', () => {
      const emptyUser = loginSchema.safeParse({ identifier: '', password: 'pwd' });
      assert.equal(emptyUser.success, false);

      const emptyPwd = loginSchema.safeParse({ identifier: 'user', password: '' });
      assert.equal(emptyPwd.success, false);
    });

    it('enforces minimum length on new passwords', () => {
      const short = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: '123',
      });
      assert.equal(short.success, false);

      const valid = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'valid-new-password-2026',
      });
      assert.equal(valid.success, true);
    });
  });

  describe('Financial and Payment Schemas', () => {
    const validPayment = {
      studentId: '11111111-2222-4333-8444-555555555555',
      amountPaid: 45000,
      paymentMethod: 'bank_transfer',
      channelRef: 'REF-TX-987654',
      bankName: 'Jaiz Bank PLC',
      term: 'second',
      session: '2025/2026',
    };

    it('accepts valid payment records and coerces string numbers', () => {
      const res = paymentRecordSchema.safeParse({
        ...validPayment,
        amountPaid: '45000',
      });
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.data.amountPaid, 45000);
      }
    });

    it('rejects non-positive payment amounts', () => {
      const zero = paymentRecordSchema.safeParse({ ...validPayment, amountPaid: 0 });
      assert.equal(zero.success, false);

      const negative = paymentRecordSchema.safeParse({ ...validPayment, amountPaid: -5000 });
      assert.equal(negative.success, false);
    });

    it('rejects invalid payment methods', () => {
      const invalid = paymentRecordSchema.safeParse({
        ...validPayment,
        paymentMethod: 'bitcoin',
      });
      assert.equal(invalid.success, false);
    });

    it('rejects non-UUID studentId', () => {
      const invalid = paymentRecordSchema.safeParse({
        ...validPayment,
        studentId: 'not-a-uuid',
      });
      assert.equal(invalid.success, false);
    });
  });

  describe('Academic Assessment & Grade Boundaries', () => {
    it('validates compliant 15/15/70 grading components', () => {
      const res = gradeRowSchema.safeParse({
        studentId: '11111111-2222-4333-8444-555555555555',
        ca1: 14,
        ca2: 12,
        exam: 65,
        remark: 'Commendable effort',
      });
      assert.equal(res.success, true);
    });

    it('rejects CA1 exceeding 15 marks', () => {
      const res = gradeRowSchema.safeParse({
        studentId: '11111111-2222-4333-8444-555555555555',
        ca1: 18,
        ca2: 10,
        exam: 50,
      });
      assert.equal(res.success, false);
    });

    it('rejects CA2 exceeding 15 marks', () => {
      const res = gradeRowSchema.safeParse({
        studentId: '11111111-2222-4333-8444-555555555555',
        ca1: 10,
        ca2: 20,
        exam: 50,
      });
      assert.equal(res.success, false);
    });

    it('rejects Exam exceeding 70 marks', () => {
      const res = gradeRowSchema.safeParse({
        studentId: '11111111-2222-4333-8444-555555555555',
        ca1: 10,
        ca2: 10,
        exam: 75,
      });
      assert.equal(res.success, false);
    });

    it('validates batch grades submission payload', () => {
      const res = gradesSubmissionSchema.safeParse({
        subjectId: '11111111-2222-4333-8444-555555555555',
        classId: '22222222-3333-4444-8555-666666666666',
        sessionName: '2025/2026',
        term: 'first',
        grades: [
          {
            studentId: '33333333-4444-4555-8666-777777777777',
            ca1: 12,
            ca2: 13,
            exam: 58,
          },
        ],
      });
      assert.equal(res.success, true);
    });
  });

  describe('Registration & CMS Allowlist Schemas', () => {
    it('validates student registration payload with defaults', () => {
      const res = studentRegistrationSchema.safeParse({
        firstname: 'Amina',
        lastname: 'Bello',
        gender: 'female',
        category: 'Day',
        guardian_email: 'guardian@gmail.com',
      });
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.data.firstname, 'Amina');
        assert.equal(res.data.category, 'Day');
      }
    });

    it('rejects student registration with invalid email', () => {
      const res = studentRegistrationSchema.safeParse({
        firstname: 'Amina',
        lastname: 'Bello',
        gender: 'female',
        guardian_email: 'invalid-email-address',
      });
      assert.equal(res.success, false);
    });

    it('validates media gallery upload metadata', () => {
      const res = mediaGallerySchema.safeParse({
        title: 'Annual Science & Tahfeez Exhibition',
        category: 'Academic Life',
        image_url: 'https://res.cloudinary.com/mims/image/upload/v12345/science_fair.jpg',
        is_featured: true,
      });
      assert.equal(res.success, true);
    });

    it('rejects unsupported media categories', () => {
      const res = mediaGallerySchema.safeParse({
        title: 'Unknown Event',
        category: 'Random Category',
        image_url: 'https://example.com/img.jpg',
      });
      assert.equal(res.success, false);
    });

    it('validates admissions application with mandatory fields', () => {
      const res = admissionsApplicationSchema.safeParse({
        firstname: 'Zainab',
        lastname: 'Uthman',
        email: 'zainab.admissions@gmail.com',
        password: 'SecurePassword2026',
        gender: 'female',
        target_class: 'JSS 1',
        boarding_type: 'Day',
      });
      assert.equal(res.success, true);
    });

    it('validates contact us inquiry message', () => {
      const res = contactMessageSchema.safeParse({
        parentName: 'Alhaji Abdulrasheed',
        phone: '+2348030001122',
        message: 'Inquiring about enrolment procedures for SSS 1 boarding facility.',
      });
      assert.equal(res.success, true);
    });
  });
});
