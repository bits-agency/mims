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

export const studentRegistrationSchema = z.object({
  firstname: z.string().min(1, 'First name is required').max(100),
  lastname: z.string().min(1, 'Last name is required').max(100),
  gender: z.enum(['male', 'female', 'Male', 'Female']),
  dob: z.string().optional().nullable(),
  category: z.enum(['Day', 'Boarding']).default('Day'),
  class_id: z.string().uuid('Valid class arm ID is required').optional().nullable(),
  guardian_name: z.string().max(255).optional().nullable(),
  guardian_phone: z.string().max(50).optional().nullable(),
  guardian_email: z.string().email('Valid guardian email required').optional().or(z.literal('')).nullable(),
  address: z.string().max(500).optional().nullable(),
  photo: z.string().optional().nullable(),
});

export const mediaGallerySchema = z.object({
  title: z.string().min(2, 'Title is required').max(255),
  category: z.enum(['Campus Facilities', 'Academic Life', 'Spiritual & Tahfeez', 'Sports & Events']),
  image_url: z.string().min(5, 'Valid image URL is required'),
  caption: z.string().max(500).optional().nullable(),
  date_added: z.string().max(50).optional().nullable(),
  is_featured: z.boolean().default(true),
  file_size: z.string().max(20).optional().nullable(),
});

export const achievementSchema = z.object({
  title: z.string().min(2, 'Achievement title is required').max(255),
  category: z.enum(['Academic', 'Quranic & Tahfeez', 'STEM & Science', 'Sports & Morals']),
  year: z.string().min(4).max(20),
  recipient: z.string().min(2, 'Recipient name is required').max(255),
  description: z.string().min(5, 'Description is required').max(1000),
  is_featured: z.boolean().default(true),
  badge_text: z.string().max(50).default('Distinction'),
});

export const admissionsApplicationSchema = z.object({
  firstname: z.string().min(1, 'First name is required').max(100),
  middlename: z.string().max(100).optional().nullable(),
  lastname: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid applicant/guardian email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters in length'),
  gender: z.enum(['male', 'female', 'Male', 'Female']),
  dob: z.string().optional().nullable(),
  target_class: z.string().max(100).optional().nullable(),
  campus_preference: z.string().max(150).optional().nullable(),
  boarding_type: z.enum(['Day', 'Boarding']).default('Day'),
  guardian_name: z.string().max(255).optional().nullable(),
  guardian_phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  prev_school_name: z.string().max(255).optional().nullable(),
  prev_grade_completed: z.string().max(100).optional().nullable(),
  medical_history: z.string().max(1000).optional().nullable(),
  special_needs: z.string().max(1000).optional().nullable(),
  photo: z.string().optional().nullable(),
  report_file_url: z.string().optional().nullable(),
});
