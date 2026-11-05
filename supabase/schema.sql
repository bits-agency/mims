-- ====================================================================
-- MSSN Islamic Model Schools (MIMS) Akure, Ondo State
-- Comprehensive Production Database Blueprint & Supabase Schema
-- Consolidated Canonical Blueprint (Migrations 0001 + 0002)
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
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'teacher', 'student', 'bursar')),
  wing VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (wing IN ('primary', 'secondary', 'all')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  session_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email_username ON users(email, username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- --------------------------------------------------------------------
-- 2.1 LOGIN RATE LIMITING (Works on serverless; state in DB)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  ip VARCHAR(64),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ident ON login_attempts (identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip, created_at DESC);

-- --------------------------------------------------------------------
-- 2.2 AUDIT LOG — Action Traceability
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),
  action VARCHAR(80) NOT NULL,          -- e.g. payment.recorded, results.released
  entity VARCHAR(50) NOT NULL,          -- e.g. payment, result, term
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity, entity_id);

-- ====================================================================
-- 3. ACADEMIC SESSIONS & 3-TERM LIFECYCLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name VARCHAR(20) UNIQUE NOT NULL, -- e.g., 2025/2026
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_session ON academic_sessions ((is_current)) WHERE is_current;

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
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_term ON academic_terms (session_id) WHERE is_current;

-- ====================================================================
-- 4. CLASSES & ACADEMIC ARMS
-- ====================================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_name VARCHAR(50) NOT NULL, -- Nursery 1, Basic 5, JSS 1, SSS 2
  section VARCHAR(50) NOT NULL,    -- Gold, Diamond, Science, Arts
  wing VARCHAR(30) DEFAULT 'Senior Secondary' CHECK (wing IN ('Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary', 'Early Years')),
  fee_level_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_name, section)
);

-- ====================================================================
-- 5. STUDENTS (Biodata & Matriculation Dossier)
-- ====================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_no VARCHAR(50) UNIQUE NOT NULL, -- e.g., MIMS/2025/0048 or APP/2026/0001
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
  exam_status VARCHAR(20) DEFAULT 'pending' CHECK (exam_status IN ('pending', 'scheduled', 'passed', 'failed')),
  exam_notes TEXT,
  application_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  staff_no VARCHAR(50) UNIQUE NOT NULL, -- e.g., MIMS/STF/2025/001
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'Male', 'Female')),
  phone VARCHAR(50),
  email VARCHAR(255),
  qualification VARCHAR(255),
  department VARCHAR(100),
  address TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_staff_no ON teachers(staff_no);

-- ====================================================================
-- 7. SUBJECTS & CURRICULUM ALLOCATION
-- ====================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_name VARCHAR(100) NOT NULL, -- Mathematics, English Language, Physics
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_name, class_id)
);

CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);

-- ====================================================================
-- 8. ATTENDANCE (Roll Call Ledger)
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remark VARCHAR(255),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT attendance_unique_entry UNIQUE NULLS NOT DISTINCT (student_id, date, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);

-- ====================================================================
-- 9. ACADEMIC RESULTS (Continuous Assessment & Terminal Exams)
-- ====================================================================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  ca1 NUMERIC(5,2) DEFAULT 0 CHECK (ca1 BETWEEN 0 AND 15),
  ca2 NUMERIC(5,2) DEFAULT 0 CHECK (ca2 BETWEEN 0 AND 15),
  exam NUMERIC(5,2) DEFAULT 0 CHECK (exam BETWEEN 0 AND 70),
  total NUMERIC(5,2) GENERATED ALWAYS AS (ca1 + ca2 + exam) STORED,
  grade VARCHAR(5),
  remark VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, session, term)
);

CREATE INDEX IF NOT EXISTS idx_results_lookup ON results(student_id, session, term);
CREATE INDEX IF NOT EXISTS idx_results_class_subject ON results(class_id, subject_id, session, term);

-- ====================================================================
-- 10. BURSARY & FINANCIAL ARCHITECTURE
-- ====================================================================
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  wing VARCHAR(30) NOT NULL CHECK (wing IN ('Early Years', 'Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('Day', 'Boarding')),
  tuition_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  development_levy NUMERIC(12,2) NOT NULL DEFAULT 0,
  boarding_levy NUMERIC(12,2) NOT NULL DEFAULT 0,
  books_stationery NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session, term, wing, category)
);

CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  level_id VARCHAR(50) NOT NULL,
  level_name VARCHAR(255) NOT NULL,
  wing VARCHAR(30) NOT NULL CHECK (wing IN ('Early Years', 'Primary', 'Junior Secondary', 'Senior Secondary')),
  description TEXT NOT NULL DEFAULT '',
  levies JSONB NOT NULL DEFAULT '[]'::jsonb,
  boarding_levy NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (boarding_levy >= 0),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session, term, level_id)
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  section VARCHAR(20) PRIMARY KEY CHECK (section IN ('primary', 'secondary')),
  section_name VARCHAR(255) NOT NULL,
  applicable_wings TEXT[] NOT NULL,
  bank_name VARCHAR(150),
  account_name VARCHAR(255),
  account_number VARCHAR(20),
  sort_code VARCHAR(20),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_fee_clearance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  total_billed NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  last_payment_date DATE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session, term)
);

CREATE INDEX IF NOT EXISTS idx_clearance_lookup ON student_fee_clearance(student_id, session, term, is_cleared);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  amount_paid NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_no VARCHAR(50) UNIQUE NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'pos', 'direct_deposit')),
  channel_reference VARCHAR(100),
  bank_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'reversed')),
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  idempotency_key UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_lookup ON payments(student_id, session, term);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_no ON payments(receipt_no);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON payments (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_reference ON payments (upper(btrim(channel_reference))) WHERE channel_reference IS NOT NULL AND method <> 'cash';

-- ====================================================================
-- 11. COLLISION-FREE SEQUENCES & CODE GENERATOR
-- ====================================================================
CREATE SEQUENCE IF NOT EXISTS receipt_no_seq;
CREATE SEQUENCE IF NOT EXISTS admission_no_seq;
CREATE SEQUENCE IF NOT EXISTS application_ref_seq;
CREATE SEQUENCE IF NOT EXISTS staff_no_seq;

CREATE OR REPLACE FUNCTION next_code(p_kind TEXT) RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  v_year TEXT := to_char(NOW() AT TIME ZONE 'Africa/Lagos', 'YYYY');
  v_code TEXT;
  v_taken BOOLEAN;
BEGIN
  LOOP
    IF p_kind = 'receipt' THEN
      v_code := 'MIMS/REC/' || v_year || '/' || lpad(nextval('receipt_no_seq')::TEXT, 5, '0');
      SELECT EXISTS (SELECT 1 FROM payments WHERE receipt_no = v_code) INTO v_taken;
    ELSIF p_kind = 'admission' THEN
      v_code := 'MIMS/' || v_year || '/' || lpad(nextval('admission_no_seq')::TEXT, 4, '0');
      SELECT EXISTS (SELECT 1 FROM students WHERE upper(admission_no) = v_code) INTO v_taken;
    ELSIF p_kind = 'application' THEN
      v_code := 'APP/' || v_year || '/' || lpad(nextval('application_ref_seq')::TEXT, 4, '0');
      SELECT EXISTS (SELECT 1 FROM students WHERE upper(admission_no) = v_code) INTO v_taken;
    ELSIF p_kind = 'staff' THEN
      v_code := 'MIMS/STF/' || v_year || '/' || lpad(nextval('staff_no_seq')::TEXT, 3, '0');
      SELECT EXISTS (SELECT 1 FROM teachers WHERE upper(staff_no) = v_code) INTO v_taken;
    ELSE
      RAISE EXCEPTION 'Unknown code kind: %', p_kind;
    END IF;
    EXIT WHEN NOT v_taken;
  END LOOP;
  RETURN v_code;
END $$;

-- --------------------------------------------------------------------
-- 11.1 ATOMIC PAYMENT RECORDING STORED PROCEDURE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_payment(
  p_student_id UUID,
  p_session TEXT,
  p_term TEXT,
  p_amount NUMERIC,
  p_method TEXT,
  p_reference TEXT,
  p_bank_name TEXT,
  p_payment_date DATE,
  p_total_billed NUMERIC,
  p_received_by UUID,
  p_actor_role TEXT,
  p_idempotency_key UUID,
  p_notes TEXT
) RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
  v_existing payments%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_clearance student_fee_clearance%ROWTYPE;
  v_paid NUMERIC;
  v_balance NUMERIC;
  v_ref TEXT := NULLIF(btrim(p_reference), '');
BEGIN
  -- Idempotency check: if already processed, return existing receipt
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing FROM payments WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      SELECT * INTO v_clearance FROM student_fee_clearance
       WHERE student_id = v_existing.student_id AND session = v_existing.session AND term = v_existing.term;
      RETURN jsonb_build_object('payment', to_jsonb(v_existing), 'clearance', to_jsonb(v_clearance), 'replayed', TRUE);
    END IF;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: Payment amount must be greater than zero.';
  END IF;
  IF p_amount <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: Amount cannot have more than 2 decimal places.';
  END IF;
  IF p_method NOT IN ('cash', 'bank_transfer', 'pos', 'direct_deposit') THEN
    RAISE EXCEPTION 'INVALID_METHOD: Unsupported payment method %.', p_method;
  END IF;
  IF p_method <> 'cash' AND v_ref IS NULL THEN
    RAISE EXCEPTION 'REFERENCE_REQUIRED: A teller / transfer / POS reference is required for non-cash payments.';
  END IF;
  IF p_total_billed IS NULL OR p_total_billed <= 0 THEN
    RAISE EXCEPTION 'NO_FEE_SCHEDULE: No fee schedule is configured for this student''s class and term.';
  END IF;
  IF v_ref IS NOT NULL AND EXISTS (
       SELECT 1 FROM payments WHERE upper(btrim(channel_reference)) = upper(v_ref) AND method <> 'cash') THEN
    RAISE EXCEPTION 'DUPLICATE_REFERENCE: Reference % has already been recorded on another receipt.', v_ref;
  END IF;

  -- Lock (or create) this student's ledger row for the term
  INSERT INTO student_fee_clearance (student_id, session, term, total_billed, total_paid, balance, is_cleared)
  VALUES (p_student_id, p_session, p_term, p_total_billed, 0, p_total_billed, FALSE)
  ON CONFLICT (student_id, session, term) DO NOTHING;

  SELECT * INTO v_clearance FROM student_fee_clearance
   WHERE student_id = p_student_id AND session = p_session AND term = p_term
   FOR UPDATE;

  SELECT coalesce(sum(amount_paid), 0) INTO v_paid FROM payments
   WHERE student_id = p_student_id AND session = p_session AND term = p_term AND status = 'verified';

  v_balance := p_total_billed - v_paid;
  IF v_balance <= 0 THEN
    RAISE EXCEPTION 'ALREADY_CLEARED: This student has fully paid for this term.';
  END IF;
  IF p_amount > v_balance THEN
    RAISE EXCEPTION 'OVERPAYMENT: Amount exceeds the outstanding balance of %.', to_char(v_balance, 'FM999,999,999,990.00');
  END IF;

  INSERT INTO payments (student_id, session, term, amount_paid, payment_date, receipt_no, method,
                        channel_reference, bank_name, status, received_by, idempotency_key, notes)
  VALUES (p_student_id, p_session, p_term, p_amount, coalesce(p_payment_date, CURRENT_DATE), next_code('receipt'),
          p_method, v_ref, NULLIF(btrim(p_bank_name), ''), 'verified', p_received_by, p_idempotency_key, NULLIF(btrim(p_notes), ''))
  RETURNING * INTO v_payment;

  UPDATE student_fee_clearance SET
    total_billed = p_total_billed,
    total_paid = v_paid + p_amount,
    balance = p_total_billed - (v_paid + p_amount),
    is_cleared = (p_total_billed - (v_paid + p_amount)) <= 0,
    last_payment_date = v_payment.payment_date,
    verified_by = p_received_by,
    updated_at = NOW()
  WHERE id = v_clearance.id
  RETURNING * INTO v_clearance;

  INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, details)
  VALUES (p_received_by, p_actor_role, 'payment.recorded', 'payment', v_payment.id::TEXT,
          jsonb_build_object('receipt_no', v_payment.receipt_no, 'student_id', p_student_id,
                             'amount', p_amount, 'method', p_method, 'reference', v_ref,
                             'session', p_session, 'term', p_term));

  RETURN jsonb_build_object('payment', to_jsonb(v_payment), 'clearance', to_jsonb(v_clearance), 'replayed', FALSE);
END $$;

-- ====================================================================
-- 12. CMS, PUBLIC COMMUNICATIONS & SITE SETTINGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name VARCHAR(255) NOT NULL,
  motto VARCHAR(255),
  accreditation VARCHAR(255),
  bursary_phone VARCHAR(50),
  admissions_phone VARCHAR(50),
  principal_phone VARCHAR(50),
  whatsapp_inquiry VARCHAR(50),
  general_email VARCHAR(255),
  admissions_email VARCHAR(255),
  bursar_email VARCHAR(255),
  principal_email VARCHAR(255),
  senior_campus_address TEXT,
  nursery_primary_address TEXT,
  campus_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  bank_name VARCHAR(100),
  account_name VARCHAR(255),
  account_number VARCHAR(50),
  sort_code VARCHAR(20),
  school_hours VARCHAR(100),
  friday_hours VARCHAR(100),
  admin_office_hours VARCHAR(100),
  visiting_day_schedule VARCHAR(255),
  facebook_url VARCHAR(255),
  youtube_url VARCHAR(255),
  whatsapp_channel_url VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admissions_gate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  target_session VARCHAR(50) NOT NULL DEFAULT '2026/2027 Academic Session',
  application_deadline DATE,
  entrance_exam_date DATE,
  entrance_exam_time VARCHAR(50) DEFAULT '09:00 AM Prompt',
  exam_venue VARCHAR(255) DEFAULT 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
  day_form_fee NUMERIC(10,2) DEFAULT 5000,
  boarding_form_fee NUMERIC(10,2) DEFAULT 10000,
  announcement_notice TEXT,
  closed_notice TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Academic', 'Quranic & Tahfeez', 'STEM & Science', 'Sports & Morals')),
  year VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  badge_text VARCHAR(50) NOT NULL DEFAULT 'Distinction',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Campus Facilities', 'Academic Life', 'Spiritual & Tahfeez', 'Sports & Events')),
  image_url TEXT NOT NULL,
  caption TEXT,
  date_added VARCHAR(50),
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  file_size VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Academic',
  audience VARCHAR(20) NOT NULL DEFAULT 'students' CHECK (audience IN ('all', 'students', 'teachers')),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  sender VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements (audience, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ip VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

-- ====================================================================
-- 13. ROW LEVEL SECURITY (Defense-in-depth: Deny anon/public access)
-- ====================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'academic_sessions', 'academic_terms', 'classes', 'students', 'teachers', 'subjects',
    'attendance', 'results', 'fee_structures', 'student_fee_clearance', 'payments', 'site_settings',
    'admissions_gate', 'achievements', 'media_gallery', 'login_attempts', 'audit_logs',
    'fee_schedules', 'bank_accounts', 'announcements', 'contact_messages'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION record_payment(UUID, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, DATE, NUMERIC, UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION next_code(TEXT) FROM PUBLIC, anon, authenticated;
