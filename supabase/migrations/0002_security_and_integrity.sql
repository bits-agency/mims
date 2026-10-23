-- ====================================================================
-- 0002 — Security hardening & data-integrity upgrade
--
-- Safe to run on the existing live database:
--   * only ADDS tables / columns / functions / constraints
--   * every statement is idempotent (can be re-run)
--   * new CHECK / FK constraints are NOT VALID, so existing rows are
--     never rejected; they are enforced for every new write
--
-- Run in: Supabase Dashboard -> SQL Editor -> paste whole file -> Run
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. USERS: real roles, bursar wing, session revocation
-- --------------------------------------------------------------------
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'admin', 'teacher', 'student', 'bursar'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS wing VARCHAR(20) NOT NULL DEFAULT 'all';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_wing_check;
ALTER TABLE users ADD CONSTRAINT users_wing_check CHECK (wing IN ('primary', 'secondary', 'all'));

-- Bumped whenever password / role / status changes -> all old sessions die.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;

-- The governing-board account becomes a real role instead of a hardcoded email.
UPDATE users SET role = 'super_admin'
 WHERE lower(email) = 'bamiebot@gmail.com' AND role = 'admin';

-- One-time migration of the old "wing guessed from name/email" heuristic.
-- From now on the wing is edited explicitly on the Administrators page.
UPDATE users SET wing = 'primary'
 WHERE role = 'bursar' AND wing = 'all'
   AND lower(coalesce(email,'') || ' ' || coalesce(username,'') || ' ' || coalesce(full_name,'')) LIKE '%primary%';
UPDATE users SET wing = 'secondary'
 WHERE role = 'bursar' AND wing = 'all'
   AND lower(coalesce(email,'') || ' ' || coalesce(username,'') || ' ' || coalesce(full_name,'')) LIKE '%secondary%';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));

-- --------------------------------------------------------------------
-- 2. LOGIN RATE LIMITING (works on serverless — state lives in DB)
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
-- 3. AUDIT LOG — who did what, when
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

-- --------------------------------------------------------------------
-- 4. ACADEMIC PERIODS — session/term values must reference real sessions
--    (ON UPDATE CASCADE: renaming a session updates every linked record)
-- --------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['results', 'payments', 'student_fee_clearance', 'fee_structures'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_session_fk') THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (session) REFERENCES academic_sessions(session_name) ON UPDATE CASCADE NOT VALID',
        t, t || '_session_fk');
    END IF;
  END LOOP;
END $$;

-- At most one current session, and one current term per session.
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_session ON academic_sessions ((is_current)) WHERE is_current;
DO $$
BEGIN
  -- Clean up any duplicate "current" flags before enforcing uniqueness.
  UPDATE academic_terms t SET is_current = FALSE
   WHERE is_current AND EXISTS (
     SELECT 1 FROM academic_terms t2
      WHERE t2.session_id = t.session_id AND t2.is_current AND t2.term_number < t.term_number);
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_term ON academic_terms (session_id) WHERE is_current;

-- --------------------------------------------------------------------
-- 5. CLASSES — explicit fee level (no more guessing from the class name)
-- --------------------------------------------------------------------
ALTER TABLE classes ADD COLUMN IF NOT EXISTS fee_level_id VARCHAR(50);
UPDATE classes SET fee_level_id = CASE
    WHEN lower(class_name) ~ '(sss|ss)\s*3'                      THEN 'sss-3-candidate'
    WHEN lower(class_name) ~ '(sss|ss)\s*[12]' OR wing = 'Senior Secondary' THEN 'senior-sec'
    WHEN lower(class_name) ~ '(jss|js)\s*3'                      THEN 'jss-3-candidate'
    WHEN lower(class_name) ~ '(jss|js)\s*[12]' OR wing = 'Junior Secondary' THEN 'junior-sec'
    WHEN lower(class_name) ~ '(primary|basic|pri)\s*5'           THEN 'primary-5-exit'
    WHEN lower(class_name) ~ '(primary|basic|pri)' OR wing = 'Primary' THEN 'primary'
    ELSE 'early-years'
  END
 WHERE fee_level_id IS NULL;

-- --------------------------------------------------------------------
-- 6. FEE SCHEDULES & BANK ACCOUNTS (replaces data/fee_structures.json)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session VARCHAR(20) NOT NULL REFERENCES academic_sessions(session_name) ON UPDATE CASCADE,
  term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
  level_id VARCHAR(50) NOT NULL,
  level_name VARCHAR(255) NOT NULL,
  wing VARCHAR(30) NOT NULL CHECK (wing IN ('Early Years', 'Primary', 'Junior Secondary', 'Senior Secondary')),
  description TEXT NOT NULL DEFAULT '',
  levies JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{id,name,amount,priority,category}]
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

INSERT INTO bank_accounts (section, section_name, applicable_wings, account_name, sort_code) VALUES
  ('primary', 'Nursery & Primary School Account', ARRAY['Early Years', 'Nursery', 'Primary'],
   'MSSN Islamic Model Primary School - Operations', '301001'),
  ('secondary', 'Secondary School (Junior & Senior) Account', ARRAY['Junior Secondary', 'Senior Secondary'],
   'MSSN Islamic Model College - Secondary Operations', '301002')
ON CONFLICT (section) DO NOTHING;

-- Seed the default tariff (the values previously hardcoded in the app)
-- for all three terms of the current session, if none exist yet.
WITH defaults(level_id, level_name, wing, description, levies, sort_order) AS (VALUES
  ('sss-3-candidate', 'Senior Secondary 3 (SSS 3 - WAEC / NECO / NBAIS Candidate Class)', 'Senior Secondary',
   'Senior external examination council registrations (WAEC, NECO, NBAIS), mock exams, science lab consumables, and graduation valedictory service.',
   '[{"id":"medical","name":"Medical & Student Healthcare Insurance","amount":3000,"priority":1,"category":"essential"},
     {"id":"waec","name":"WAEC Examination Registration & Practical Dues","amount":35000,"priority":2,"category":"academic"},
     {"id":"neco","name":"NECO & NBAIS Examination Council Assessment","amount":32000,"priority":3,"category":"academic"},
     {"id":"lab-practical","name":"Senior Science Practicals & Consumables","amount":6000,"priority":4,"category":"academic"},
     {"id":"development","name":"Senior Campus Infrastructure Levy","amount":5000,"priority":5,"category":"facility"},
     {"id":"graduation","name":"Valedictory Service & Exit Broadsheet Levy","amount":7500,"priority":6,"category":"facility"},
     {"id":"tuition","name":"SSS 3 Senior Tuition & Instructional Delivery","amount":38000,"priority":7,"category":"tuition"}]'::jsonb, 1),
  ('senior-sec', 'Senior Secondary (SSS 1 & SSS 2 Continuing)', 'Senior Secondary',
   'Senior secondary WAEC preparatory curriculum, science lab practicals, humanities, and Islamic studies.',
   '[{"id":"medical","name":"Medical & Student Healthcare","amount":3000,"priority":1,"category":"essential"},
     {"id":"exam","name":"Terminal Examination & Mock Assessment","amount":4500,"priority":2,"category":"academic"},
     {"id":"development","name":"School Development & Campus Maintenance","amount":5000,"priority":3,"category":"facility"},
     {"id":"ict","name":"ICT & CBT Practice Lab Levy","amount":3500,"priority":4,"category":"academic"},
     {"id":"lab","name":"Science Laboratory & Practical Consumables","amount":4000,"priority":5,"category":"academic"},
     {"id":"tuition","name":"Tuition & Instructional Delivery","amount":35000,"priority":6,"category":"tuition"}]'::jsonb, 2),
  ('jss-3-candidate', 'Junior Secondary 3 (JSS 3 - BECE Candidate Class)', 'Junior Secondary',
   'Junior secondary exit class with State & National BECE examination council registration, Junior WAEC mock assessment, and transition certification.',
   '[{"id":"medical","name":"Medical & Healthcare Insurance","amount":3000,"priority":1,"category":"essential"},
     {"id":"bece","name":"State & National BECE Examination Council Registration","amount":20000,"priority":2,"category":"academic"},
     {"id":"bece-mock","name":"Junior Mock Assessment & Continuous Broadsheet","amount":5000,"priority":3,"category":"academic"},
     {"id":"ict","name":"Computer Studies & Tech Lab Access","amount":3500,"priority":4,"category":"academic"},
     {"id":"development","name":"Campus Development Levy","amount":5000,"priority":5,"category":"facility"},
     {"id":"valedictory","name":"Junior Valedictory & Transition Levy","amount":5000,"priority":6,"category":"facility"},
     {"id":"tuition","name":"JSS 3 Tuition & Academic Instruction","amount":35000,"priority":7,"category":"tuition"}]'::jsonb, 3),
  ('junior-sec', 'Junior Secondary (JSS 1 & JSS 2 Continuing)', 'Junior Secondary',
   'Foundational secondary studies, Basic Science & Tech practicals, introductory Arabic & ICT.',
   '[{"id":"medical","name":"Medical & Healthcare Levy","amount":3000,"priority":1,"category":"essential"},
     {"id":"exam","name":"Terminal Examination & Assessment Materials","amount":4000,"priority":2,"category":"academic"},
     {"id":"development","name":"Campus Development Levy","amount":5000,"priority":3,"category":"facility"},
     {"id":"ict","name":"Computer Studies & Tech Lab","amount":3000,"priority":4,"category":"academic"},
     {"id":"tuition","name":"Tuition & Academic Instruction","amount":33000,"priority":5,"category":"tuition"}]'::jsonb, 4),
  ('primary-5-exit', 'Primary 5 (Basic 5 - Common Entrance Exit Class)', 'Primary',
   'Primary school graduation class including State Common Entrance, National Common Entrance Examination (NCEE), and testimonial certification.',
   '[{"id":"medical","name":"Student Medical Care & First Aid","amount":2500,"priority":1,"category":"essential"},
     {"id":"common-entrance","name":"State Common Entrance & National Transition Exam","amount":9500,"priority":2,"category":"academic"},
     {"id":"development","name":"Primary Campus Development Levy","amount":4000,"priority":3,"category":"facility"},
     {"id":"tahfeez","name":"Quran Memorization & Arabic Assessment","amount":2500,"priority":4,"category":"academic"},
     {"id":"tuition","name":"Primary 5 Academic Tuition & Exam Preparation","amount":32000,"priority":5,"category":"tuition"}]'::jsonb, 5),
  ('primary', 'Primary Education (Basic 1 - Basic 4 Continuing)', 'Primary',
   'Literacy, numeracy, foundation Quran Tahfeez, sports, and continuous assessment.',
   '[{"id":"medical","name":"Student Medical Care & First Aid","amount":2500,"priority":1,"category":"essential"},
     {"id":"exam","name":"Continuous Assessment & Examination Slips","amount":3500,"priority":2,"category":"academic"},
     {"id":"development","name":"Primary Development Levy","amount":4000,"priority":3,"category":"facility"},
     {"id":"tahfeez","name":"Quran Memorization & Arabic Materials","amount":2000,"priority":4,"category":"academic"},
     {"id":"tuition","name":"Basic Academic Tuition","amount":30000,"priority":5,"category":"tuition"}]'::jsonb, 6),
  ('early-years', 'Nursery & Early Years (Creche, KG 1 - KG 2)', 'Early Years',
   'Early childhood sensory learning, play kits, moral foundations, and specialized care.',
   '[{"id":"medical","name":"Infant Healthcare & Safety Oversight","amount":3000,"priority":1,"category":"essential"},
     {"id":"activities","name":"Montessori Activity & Learning Packs","amount":3500,"priority":2,"category":"academic"},
     {"id":"development","name":"Early Childhood Care Facility Levy","amount":3500,"priority":3,"category":"facility"},
     {"id":"tuition","name":"Early Childhood Tuition Fee","amount":28500,"priority":4,"category":"tuition"}]'::jsonb, 7)
),
cur AS (SELECT session_name FROM academic_sessions WHERE is_current LIMIT 1),
terms(term) AS (VALUES ('first'), ('second'), ('third'))
INSERT INTO fee_schedules (session, term, level_id, level_name, wing, description, levies, sort_order)
SELECT cur.session_name, terms.term, d.level_id, d.level_name, d.wing, d.description, d.levies, d.sort_order
  FROM defaults d CROSS JOIN cur CROSS JOIN terms
ON CONFLICT (session, term, level_id) DO NOTHING;

-- --------------------------------------------------------------------
-- 7. PAYMENTS — idempotency, unique teller references, bursar notes
-- --------------------------------------------------------------------
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON payments (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments (student_id, session, term);

-- A bank teller / transfer reference can only be used once. Created only if
-- the existing data has no duplicates (the record_payment function below
-- enforces the same rule for every new payment either way).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_unique_reference') THEN
    BEGIN
      CREATE UNIQUE INDEX idx_payments_unique_reference
        ON payments (upper(btrim(channel_reference)))
        WHERE channel_reference IS NOT NULL AND method <> 'cash';
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'Duplicate payment references already exist — unique index skipped. Review: SELECT upper(btrim(channel_reference)), count(*) FROM payments GROUP BY 1 HAVING count(*) > 1;';
    END;
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 8. COLLISION-FREE CODE GENERATOR (receipts, admission/staff numbers)
-- --------------------------------------------------------------------
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
-- 9. ATOMIC PAYMENT RECORDING (bursar-entered payments only)
--    One transaction: lock the student's ledger row, re-total from the
--    payments table, reject duplicates/overpayment, insert, update, audit.
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
  -- Same form submitted twice (double click / network retry): return the first result.
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

  -- Lock (or create) this student's ledger row for the term.
  INSERT INTO student_fee_clearance (student_id, session, term, total_billed, total_paid, balance, is_cleared)
  VALUES (p_student_id, p_session, p_term, p_total_billed, 0, p_total_billed, FALSE)
  ON CONFLICT (student_id, session, term) DO NOTHING;

  SELECT * INTO v_clearance FROM student_fee_clearance
   WHERE student_id = p_student_id AND session = p_session AND term = p_term
   FOR UPDATE;

  -- Payments table is the source of truth for what has been paid.
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

-- --------------------------------------------------------------------
-- 10. RESULTS — one grading scheme (CA1 15 + CA2 15 + Exam 70 = 100)
-- --------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_score_scheme') THEN
    ALTER TABLE results ADD CONSTRAINT results_score_scheme
      CHECK (ca1 BETWEEN 0 AND 15 AND ca2 BETWEEN 0 AND 15 AND exam BETWEEN 0 AND 70 AND total = ca1 + ca2 + exam)
      NOT VALID;
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 11. ATTENDANCE — whole-class roll call (subject_id NULL) was not unique
-- --------------------------------------------------------------------
DELETE FROM attendance a USING attendance b
 WHERE a.student_id = b.student_id AND a.date = b.date
   AND a.subject_id IS NOT DISTINCT FROM b.subject_id
   AND a.created_at < b.created_at;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_date_subject_id_key;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_unique_entry') THEN
    ALTER TABLE attendance ADD CONSTRAINT attendance_unique_entry
      UNIQUE NULLS NOT DISTINCT (student_id, date, subject_id);
  END IF;
END $$;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance (class_id, date);

-- --------------------------------------------------------------------
-- 12. ADMISSIONS — structured applicant dossier instead of JSON-in-text
-- --------------------------------------------------------------------
ALTER TABLE students ADD COLUMN IF NOT EXISTS application_details JSONB;
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, exam_notes FROM students
            WHERE application_details IS NULL AND exam_notes LIKE '{%' LOOP
    BEGIN
      UPDATE students SET application_details = r.exam_notes::jsonb, exam_notes = NULL WHERE id = r.id;
    EXCEPTION WHEN others THEN
      NULL; -- leave unparseable notes untouched
    END;
  END LOOP;
END $$;
ALTER TABLE students ALTER COLUMN exam_notes DROP DEFAULT;
ALTER TABLE students ALTER COLUMN exam_status SET DEFAULT 'pending';

-- --------------------------------------------------------------------
-- 13. CMS — announcements, contact messages, campus list (were JSON files)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Academic',
  audience VARCHAR(20) NOT NULL DEFAULT 'students' CHECK (audience IN ('all', 'students', 'teachers')),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,  -- NULL = whole audience
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  sender VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements (audience, created_at DESC);

-- Carry over the notices that were stored in data/announcements.json
INSERT INTO announcements (title, message, category, audience, pinned, sender, created_at)
SELECT v.title, v.message, v.category, v.audience, v.pinned, v.sender, v.created_at::timestamptz
  FROM (VALUES
    ('First Term Mid-Term Break & Assessment Notice',
     'The school will observe mid-term break starting next Friday. All students are required to complete take-home assignments.',
     'Academic', 'students', TRUE, 'Governing Board / Super Administrator', '2026-10-02'),
    ('Resumption Protocol & Term 1 Orientation',
     'All students are expected to report to their assigned class arms promptly at 7:30 AM in complete, neat school uniforms. Morning assembly and orientation will commence at 7:45 AM.',
     'Academic', 'students', TRUE, 'Office of the Principal', '2026-10-01'),
    ('Weekly Tahfeez & Holy Quran Memorization Review',
     'The weekly Quranic recitation and memorization assessment for all grades will hold on Thursday mornings before first period. Ensure daily revision of your assigned Surah.',
     'Spiritual', 'students', FALSE, 'Tahfeez & Spiritual Affairs Unit', '2026-10-02')
  ) AS v(title, message, category, audience, pinned, sender, created_at)
 WHERE NOT EXISTS (SELECT 1 FROM announcements a WHERE a.title = v.title);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ip VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS campus_locations JSONB NOT NULL DEFAULT '[
  {"id":"senior","title":"Secondary School & Boarding Hostel Campus","address":"MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State","type":"Secondary & Boarding"},
  {"id":"nursery_primary","title":"Nursery & Primary School Wing Campus","address":"Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State","type":"Nursery & Primary"},
  {"id":"madinah","title":"Madinah Quranic & Tahfeez Residential Campus","address":"Madinah Estate, Off FUTA South Gate Road, Akure, Ondo State","type":"Tahfeez Academy"}
]'::jsonb;

-- Media: stop storing invented sizes/dates
ALTER TABLE media_gallery ALTER COLUMN date_added DROP DEFAULT;
ALTER TABLE media_gallery ALTER COLUMN file_size DROP DEFAULT;

-- --------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY — deny everything to the public anon key.
--     The app only talks to the DB from the server with the service-role
--     key (which bypasses RLS), so nothing in the app changes; but a
--     leaked anon key can no longer read or write any table.
-- --------------------------------------------------------------------
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

COMMIT;
