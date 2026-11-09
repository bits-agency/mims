-- ====================================================================
-- MIMS (Muslim Integrated Model School)
-- Migration: 0003_security_and_bursary_hardening.sql
-- Description: Security hardening, atomic sequences, and transactional payment procedures
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. USERS & SESSION REVOCATION
-- --------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wing VARCHAR(20) NOT NULL DEFAULT 'all';

DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('super_admin', 'admin', 'teacher', 'student', 'bursar'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_wing_check;
  ALTER TABLE users ADD CONSTRAINT users_wing_check
    CHECK (wing IN ('primary', 'secondary', 'all'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Update governance board super_admin role if currently configured as admin
UPDATE users
   SET role = 'super_admin'
 WHERE lower(email) = 'bamiebot@gmail.com'
   AND role = 'admin';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));

-- --------------------------------------------------------------------
-- 2. LOGIN SECURITY & AUDIT TRAIL TABLES
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

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- --------------------------------------------------------------------
-- 3. BURSARY TARIFF & SETTLEMENT TABLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session VARCHAR(20) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_fee_schedules_lookup ON fee_schedules(session, term, level_id);

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

-- Seed default bank accounts if empty
INSERT INTO bank_accounts (section, section_name, applicable_wings, bank_name, account_name, account_number)
VALUES
  ('primary', 'MIMS Nursery & Primary School Desk', ARRAY['Early Years', 'Primary'], 'Jaiz Bank PLC', 'Muslim Integrated Model School (Primary)', '0005432109'),
  ('secondary', 'MIMS College & Secondary Wing Desk', ARRAY['Junior Secondary', 'Senior Secondary'], 'Lotus Bank', 'Muslim Integrated Model School (College)', '1009876543')
ON CONFLICT (section) DO NOTHING;

-- --------------------------------------------------------------------
-- 4. PAYMENTS & LEDGER HARDENING
-- --------------------------------------------------------------------
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE student_fee_clearance ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency
  ON payments (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_reference
  ON payments (upper(btrim(channel_reference)))
  WHERE channel_reference IS NOT NULL AND method <> 'cash';

CREATE INDEX IF NOT EXISTS idx_payments_lookup ON payments(student_id, session, term);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_no ON payments(receipt_no);
CREATE INDEX IF NOT EXISTS idx_clearance_lookup ON student_fee_clearance(student_id, session, term, is_cleared);

-- --------------------------------------------------------------------
-- 5. ATOMIC SEQUENCES & SEQUENTIAL CODE GENERATION
-- --------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS receipt_no_seq;
CREATE SEQUENCE IF NOT EXISTS admission_no_seq;
CREATE SEQUENCE IF NOT EXISTS application_ref_seq;
CREATE SEQUENCE IF NOT EXISTS staff_no_seq;

-- Synchronize sequences with current tables
SELECT setval('receipt_no_seq', COALESCE((SELECT COUNT(*) FROM payments), 0) + 1, false);
SELECT setval('admission_no_seq', COALESCE((SELECT COUNT(*) FROM students WHERE admission_no NOT LIKE 'APP/%'), 0) + 1, false);
SELECT setval('application_ref_seq', COALESCE((SELECT COUNT(*) FROM students WHERE admission_no LIKE 'APP/%'), 0) + 1, false);
SELECT setval('staff_no_seq', COALESCE((SELECT COUNT(*) FROM teachers), 0) + 1, false);

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
-- 6. ATOMIC PAYMENT RECORDING STORED PROCEDURE
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

COMMIT;
