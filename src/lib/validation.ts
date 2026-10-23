import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username, email or admission number is required').max(100),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required to authorize this change.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters in length.').max(100),
});

export const paymentRecordSchema = z.object({
  studentId: z.string().uuid('Valid student ID is required'),
  amountPaid: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'pos', 'direct_deposit'], {
    errorMap: () => ({ message: 'Method must be one of: cash, bank_transfer, pos, direct_deposit' }),
  }),
  channelRef: z.string().max(100).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  paymentDate: z.string().optional().nullable(),
  term: z.enum(['first', 'second', 'third']),
  session: z.string().min(4).max(20),
  notes: z.string().max(500).optional().nullable(),
  idempotencyKey: z.string().uuid().optional().nullable(),
});

export const gradeRowSchema = z.object({
  studentId: z.string().uuid('Valid student ID is required'),
  ca1: z.coerce.number().min(0).max(15, 'CA1 score cannot exceed 15 marks').default(0),
  ca2: z.coerce.number().min(0).max(15, 'CA2 score cannot exceed 15 marks').default(0),
  exam: z.coerce.number().min(0).max(70, 'Examination score cannot exceed 70 marks').default(0),
  remark: z.string().max(100).optional(),
});

export const gradesSubmissionSchema = z.object({
  grades: z.array(gradeRowSchema).min(1, 'At least one student grade record must be provided'),
  subjectId: z.string().uuid('Valid subject ID is required'),
  classId: z.string().uuid('Valid class ID is required'),
  sessionName: z.string().min(4).max(20),
  term: z.enum(['first', 'second', 'third']),
  status: z.enum(['draft', 'submitted']).default('draft'),
});

export const admissionsActionSchema = z.object({
  action: z.enum(['schedule', 'enrol', 'reject']),
  studentId: z.string().uuid('Valid student ID is required'),
  examDate: z.string().optional().nullable(),
  examTime: z.string().optional().nullable(),
  examVenue: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  classArm: z.string().optional().nullable(),
  newAdmissionNo: z.string().optional().nullable(),
});

export const contactMessageSchema = z.object({
  parentName: z.string().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().min(7, 'Please provide a valid phone number').max(30),
  campus: z.string().max(150).optional(),
  level: z.string().max(100).optional(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
});
