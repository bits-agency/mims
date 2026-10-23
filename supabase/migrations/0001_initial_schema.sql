-- ====================================================================
-- MSSN Islamic Model Schools (MIMS) Akure, Ondo State
-- Comprehensive Production Database Blueprint & Supabase Schema
-- ====================================================================

-- 1. Enable Core PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. USERS & ACCESS CONTROL (Multi-Portal Roles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'bursar')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email_username ON users(email, username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ====================================================================
-- 3. ACADEMIC SESSIONS & 3-TERM LIFECYCLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name VARCHAR(20) UNIQUE NOT NULL, -- e.g., 2025/2026
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  term_number SMALLINT NOT NULL CHECK (term_number IN (1, 2, 3)),
  term_name VARCHAR(50) NOT NULL, -- First Term, Second Term, Third Term
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  results_released BOOLEAN DEFAULT FALSE, -- Admin moderation master switch
  status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Active', 'Completed', 'Upcoming')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, term_number)
);

CREATE INDEX IF NOT EXISTS idx_terms_lookup ON academic_terms(session_id, term_number, is_current);

-- ====================================================================
-- 4. CLASSES & ACADEMIC ARMS
-- ====================================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_name VARCHAR(50) NOT NULL, -- Nursery 1, Basic 5, JSS 1, SSS 2
  section VARCHAR(50) NOT NULL,    -- Gold, Diamond, Science, Arts
  wing VARCHAR(30) DEFAULT 'Senior Secondary' CHECK (wing IN ('Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_name, section)
);

-- ====================================================================
-- 5. STUDENTS (Biodata & Matriculation Dossier)
-- ====================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_no VARCHAR(50) UNIQUE NOT NULL, -- e.g., MIMS/2025/0048
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'Male', 'Female')),
  dob DATE,
  category VARCHAR(20) DEFAULT 'Day' CHECK (category IN ('Day', 'Boarding')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(50),
  guardian_email VARCHAR(255),
  address TEXT,
  photo TEXT,
  exam_date DATE,
  exam_time VARCHAR(50),
  exam_venue VARCHAR(255) DEFAULT 'MSSN Campus Complex Main Examination Hall',
  exam_status VARCHAR(20) DEFAULT 'passed' CHECK (exam_status IN ('pending', 'scheduled', 'passed', 'failed')),
  exam_notes TEXT DEFAULT 'Verified admissions candidate dossier.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);

-- ====================================================================
-- 6. FACULTY & TEACHERS
-- ====================================================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_no VARCHAR(50) UNIQUE NOT NULL, -- e.g., MIMS/STF/2021/004
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'Male', 'Female')),
  phone VARCHAR(50),
  email VARCHAR(255),
  qualification VARCHAR(255),
  department VARCHAR(100) DEFAULT 'Sciences',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- ====================================================================
-- 7. SUBJECTS & TEACHER ALLOCATIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_name VARCHAR(150) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_name, class_id)
);

CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);

-- ====================================================================
-- 8. ATTENDANCE (Roll Call Register)
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remark VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, subject_id)
);

-- ====================================================================
-- 9. RESULTS & WAEC SCORE ENTRY (CA1 + CA2 + Exam = 100)
-- ====================================================================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL, -- e.g., 2025/2026
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  ca1 INTEGER NOT NULL DEFAULT 0 CHECK (ca1 >= 0 AND ca1 <= 20),
  ca2 INTEGER NOT NULL DEFAULT 0 CHECK (ca2 >= 0 AND ca2 <= 20),
  exam INTEGER NOT NULL DEFAULT 0 CHECK (exam >= 0 AND exam <= 70),
  total INTEGER NOT NULL CHECK (total >= 0 AND total <= 100),
  grade VARCHAR(5) NOT NULL,
  remark VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'submitted', 'moderated', 'approved')),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, session, term)
);

CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id, session, term);

-- ====================================================================
-- 10. BURSARY: FEE STRUCTURES, PAYMENTS & CLEARANCE STATUS
-- ====================================================================
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  wing VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'Day' CHECK (category IN ('Day', 'Boarding')),
  tuition_amount NUMERIC(10,2) NOT NULL,
  development_levy NUMERIC(10,2) NOT NULL DEFAULT 0,
  boarding_levy NUMERIC(10,2) NOT NULL DEFAULT 0,
  books_stationery NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session, term, wing, category)
);

-- Master Student Fee Clearance Register (Controls Result Unlock)
CREATE TABLE IF NOT EXISTS student_fee_clearance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  total_billed NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  last_payment_date DATE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session, term)
);

CREATE INDEX IF NOT EXISTS idx_fee_clearance_student ON student_fee_clearance(student_id, session, term);

-- Bursar Official Payments & Teller Receipts
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_no VARCHAR(100) UNIQUE NOT NULL,
  method VARCHAR(20) NOT NULL DEFAULT 'bank_transfer' CHECK (method IN ('cash', 'bank_transfer', 'pos', 'online', 'direct_deposit')),
  channel_reference VARCHAR(150),
  bank_name VARCHAR(100) DEFAULT 'Jaiz Bank Plc',
  status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'flagged')),
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments(receipt_no);

-- ====================================================================
-- 11. DYNAMIC WEBSITE CMS: CONTACT DETAILS, ADMISSIONS GATE, HONORS
-- ====================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name VARCHAR(255) NOT NULL DEFAULT 'MSSN Islamic Model Schools, Akure',
  motto VARCHAR(255) NOT NULL DEFAULT 'Knowledge, Faith and Excellent Morals • Al-Birr',
  accreditation VARCHAR(255) NOT NULL DEFAULT 'WAEC / NECO / Ondo State Ministry of Education Accredited',
  bursary_phone VARCHAR(50) NOT NULL DEFAULT '+234 802 987 6543',
  admissions_phone VARCHAR(50) NOT NULL DEFAULT '+234 803 234 5678',
  principal_phone VARCHAR(50) NOT NULL DEFAULT '+234 805 112 3344',
  whatsapp_inquiry VARCHAR(50) NOT NULL DEFAULT '+234 814 556 7788',
  general_email VARCHAR(255) NOT NULL DEFAULT 'info@mimsakure.com',
  admissions_email VARCHAR(255) NOT NULL DEFAULT 'admissions@mimsakure.com',
  bursar_email VARCHAR(255) NOT NULL DEFAULT 'bursar@mimsakure.com',
  principal_email VARCHAR(255) NOT NULL DEFAULT 'principal@mimsakure.com',
  senior_campus_address TEXT NOT NULL DEFAULT 'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
  nursery_primary_address TEXT NOT NULL DEFAULT 'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
  bank_name VARCHAR(100) NOT NULL DEFAULT 'Jaiz Bank Plc',
  account_name VARCHAR(255) NOT NULL DEFAULT 'MSSN Islamic Model Schools Akure - Operations',
  account_number VARCHAR(50) NOT NULL DEFAULT '0012345678',
  sort_code VARCHAR(50) NOT NULL DEFAULT '301001',
  school_hours VARCHAR(100) NOT NULL DEFAULT 'Monday - Thursday: 7:30 AM – 3:30 PM',
  friday_hours VARCHAR(100) NOT NULL DEFAULT 'Friday: 7:30 AM – 1:00 PM (Jumu''ah Break)',
  admin_office_hours VARCHAR(100) NOT NULL DEFAULT 'Monday - Friday: 8:00 AM – 4:30 PM',
  visiting_day_schedule VARCHAR(100) NOT NULL DEFAULT '1st Sunday of Every Month: 10:00 AM – 5:00 PM',
  facebook_url TEXT DEFAULT 'https://facebook.com/mimsakure',
  youtube_url TEXT DEFAULT 'https://youtube.com/@mimsakure',
  whatsapp_channel_url TEXT DEFAULT 'https://whatsapp.com/channel/mimsakure',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions Gate Controller
CREATE TABLE IF NOT EXISTS admissions_gate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  target_session VARCHAR(50) NOT NULL DEFAULT '2026/2027 Academic Session',
  application_deadline DATE NOT NULL DEFAULT '2026-07-15',
  entrance_exam_date DATE NOT NULL DEFAULT '2026-07-18',
  entrance_exam_time VARCHAR(50) NOT NULL DEFAULT '09:00 AM Prompt',
  exam_venue VARCHAR(255) NOT NULL DEFAULT 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
  day_form_fee NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
  boarding_form_fee NUMERIC(10,2) NOT NULL DEFAULT 10000.00,
  announcement_notice TEXT NOT NULL DEFAULT 'Admissions for the 2026/2027 Academic Session are now formally OPEN! Qualified candidates are invited to apply.',
  closed_notice TEXT NOT NULL DEFAULT 'Online admissions for the current cycle are currently CLOSED. Entrance examinations and interview schedules have concluded.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements & Honors
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Academic', 'Quran & Tahfeez', 'STEM & Olympiads', 'Sports & Debate')),
  year VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  badge_text VARCHAR(50) NOT NULL DEFAULT 'Distinction',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media & Campus Gallery
CREATE TABLE IF NOT EXISTS media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Campus Facilities', 'Academic Life', 'Spiritual & Tahfeez', 'Sports & Events')),
  image_url TEXT NOT NULL,
  caption TEXT,
  date_added VARCHAR(50) DEFAULT 'Oct 2026',
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  file_size VARCHAR(20) DEFAULT '1.5 MB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

