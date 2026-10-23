-- ====================================================================
-- DEVELOPMENT / DEMO SEED DATA ONLY - never run against production.
-- Seed accounts share the password 'Admin@12345'. Change or delete them.
-- Run AFTER all files in supabase/migrations/.
-- ====================================================================
-- ====================================================================
-- 12. SEED DATA (AUTHENTIC PRODUCTION RECORDS FOR MIMS AKURE)
-- ====================================================================

-- 1. User Accounts (Password for all seed users is 'Admin@12345')
-- Hash: $2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC
INSERT INTO users (id, full_name, username, email, password, role, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'MIMS Super Administrator', 'bamiebot', 'bamiebot@gmail.com', '$2b$10$nwGZFr2xzt7D9UpmJr7qb.ILg5XQiGss8zXDzYg.mjjYueSJovugS', 'admin', 'active'),
  ('11111111-1111-1111-1111-111111111112', 'Alhaji Yusuf Adeyemi (FCA)', 'bursar', 'bursar@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'bursar', 'active'),
  ('11111111-1111-1111-1111-111111111113', 'Ustadh Luqman Abdullahi', 'teacher', 'teacher@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'teacher', 'active'),
  ('11111111-1111-1111-1111-111111111114', 'Mrs. Zainab Yusuf', 'zainab', 'zainab@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'teacher', 'active'),
  ('11111111-1111-1111-1111-111111111115', 'Mr. Kehinde Adeleke', 'adeleke', 'adeleke@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'teacher', 'active'),
  ('11111111-1111-1111-1111-111111111116', 'Zaid Al-Hassan', 'student', 'student@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active'),
  ('11111111-1111-1111-1111-111111111117', 'Aisha Adebayo', 'aisha', 'aisha@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active'),
  ('11111111-1111-1111-1111-111111111118', 'Bashir Ibrahim', 'bashir', 'bashir@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active'),
  ('11111111-1111-1111-1111-111111111119', 'Faruk Usman', 'faruk', 'faruk@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active'),
  ('11111111-1111-1111-1111-111111111120', 'Khadijah Mustapha', 'khadijah', 'khadijah@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active'),
  ('11111111-1111-1111-1111-111111111121', 'Sulaiman Oladipo', 'sulaiman', 'sulaiman@mimsakure.com', '$2b$10$JkvCAUuxGuYv/h0Mdx3XHeIVuLgeTUCZUolkcbB/oLM.Gs.KhY5TC', 'student', 'active')
ON CONFLICT (username) DO NOTHING;

-- 2. Academic Sessions & Terms
INSERT INTO academic_sessions (id, session_name, is_current) VALUES
  ('33333333-3333-3333-3333-333333333301', '2025/2026', TRUE),
  ('33333333-3333-3333-3333-333333333302', '2024/2025', FALSE)
ON CONFLICT (session_name) DO NOTHING;

INSERT INTO academic_terms (id, session_id, term_number, term_name, start_date, end_date, is_current, results_released, status) VALUES
  ('33333333-3333-3333-3333-333333333311', '33333333-3333-3333-3333-333333333301', 1, 'First Term', '2025-09-15', '2025-12-18', TRUE, TRUE, 'Active'),
  ('33333333-3333-3333-3333-333333333312', '33333333-3333-3333-3333-333333333301', 2, 'Second Term', '2026-01-12', '2026-04-03', FALSE, FALSE, 'Upcoming'),
  ('33333333-3333-3333-3333-333333333313', '33333333-3333-3333-3333-333333333301', 3, 'Third Term (Promotional)', '2026-04-27', '2026-07-24', FALSE, FALSE, 'Upcoming')
ON CONFLICT (session_id, term_number) DO NOTHING;

-- 3. Core Academic Classes
INSERT INTO classes (id, class_name, section, wing) VALUES
  ('22222222-2222-2222-2222-222222222201', 'JSS 1', 'Gold', 'Junior Secondary'),
  ('22222222-2222-2222-2222-222222222202', 'JSS 2', 'Silver', 'Junior Secondary'),
  ('22222222-2222-2222-2222-222222222203', 'JSS 3', 'Gold', 'Junior Secondary'),
  ('22222222-2222-2222-2222-222222222204', 'SSS 1', 'Science (Gold)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222205', 'SSS 1', 'Arts (Silver)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222206', 'SSS 2', 'Science (Gold)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222207', 'SSS 2', 'Arts (Silver)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222208', 'SSS 3', 'Science (Diamond)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222209', 'SSS 3', 'Arts (Gold)', 'Senior Secondary'),
  ('22222222-2222-2222-2222-222222222210', 'Basic 5', 'Rose', 'Primary'),
  ('22222222-2222-2222-2222-222222222211', 'Nursery 2', 'Tulip', 'Nursery')
ON CONFLICT (class_name, section) DO NOTHING;

-- 4. Faculty & Teachers
INSERT INTO teachers (id, user_id, staff_no, firstname, lastname, gender, phone, email, qualification, department) VALUES
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111113', 'MIMS/STF/2019/002', 'Luqman', 'Abdullahi', 'Male', '+234 803 112 2334', 'teacher@mimsakure.com', 'B.A. Ed. Islamic Studies (UNILORIN)', 'Islamic & Arabic Studies'),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111114', 'MIMS/STF/2021/008', 'Zainab', 'Yusuf', 'Female', '+234 802 334 4556', 'zainab@mimsakure.com', 'M.Sc. Physics (FUTA)', 'Sciences'),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111115', 'MIMS/STF/2020/005', 'Kehinde', 'Adeleke', 'Male', '+234 814 556 7890', 'adeleke@mimsakure.com', 'B.Sc. Mathematics (OAU)', 'Mathematics')
ON CONFLICT (staff_no) DO NOTHING;

-- 5. Subjects
INSERT INTO subjects (id, subject_name, class_id, teacher_id) VALUES
  ('55555555-5555-5555-5555-555555555501', 'Mathematics', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444403'),
  ('55555555-5555-5555-5555-555555555502', 'English Language', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444401'),
  ('55555555-5555-5555-5555-555555555503', 'Physics', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444402'),
  ('55555555-5555-5555-5555-555555555504', 'Chemistry', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444402'),
  ('55555555-5555-5555-5555-555555555505', 'Biology', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444402'),
  ('55555555-5555-5555-5555-555555555506', 'Islamic Religious Studies (IRS)', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444401'),
  ('55555555-5555-5555-5555-555555555507', 'Arabic Language', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444401'),
  ('55555555-5555-5555-5555-555555555508', 'Further Mathematics', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444403'),
  ('55555555-5555-5555-5555-555555555509', 'Civic Education', '22222222-2222-2222-2222-222222222206', '44444444-4444-4444-4444-444444444401')
ON CONFLICT (subject_name, class_id) DO NOTHING;

-- 6. Students
INSERT INTO students (id, user_id, admission_no, firstname, lastname, gender, dob, category, class_id, guardian_name, guardian_phone, guardian_email, address) VALUES
  ('66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111116', 'MIMS/2025/0048', 'Zaid', 'Al-Hassan', 'Male', '2009-04-14', 'Day', '22222222-2222-2222-2222-222222222206', 'Alhaji Dr. Musa Al-Hassan', '+234 803 456 7890', 'musa.alhassan@gmail.com', 'Plot 12, Alagbaka GRA, Akure, Ondo State'),
  ('66666666-6666-6666-6666-666666666602', '11111111-1111-1111-1111-111111111117', 'MIMS/2025/0012', 'Aisha', 'Adebayo', 'Female', '2009-08-22', 'Day', '22222222-2222-2222-2222-222222222206', 'Barrister T. Adebayo', '+234 802 345 6789', 't.adebayo@yahoo.com', '14 Oba-Adesida Road, Akure'),
  ('66666666-6666-6666-6666-666666666603', '11111111-1111-1111-1111-111111111118', 'MIMS/2025/0019', 'Bashir', 'Ibrahim', 'Male', '2009-01-18', 'Boarding', '22222222-2222-2222-2222-222222222206', 'Alhaji S. Ibrahim', '+234 814 678 9012', 's.ibrahim@outlook.com', 'Km 5, Ondo Road, Akure'),
  ('66666666-6666-6666-6666-666666666604', '11111111-1111-1111-1111-111111111119', 'MIMS/2025/0025', 'Faruk', 'Usman', 'Male', '2008-11-05', 'Day', '22222222-2222-2222-2222-222222222206', 'Engr. K. Usman', '+234 805 789 0123', 'k.usman@gmail.com', 'Ijapo Estate, Akure'),
  ('66666666-6666-6666-6666-666666666605', '11111111-1111-1111-1111-111111111120', 'MIMS/2025/0042', 'Khadijah', 'Mustapha', 'Female', '2009-06-30', 'Day', '22222222-2222-2222-2222-222222222206', 'Dr. Mrs. H. Mustapha', '+234 803 890 1234', 'h.mustapha@health.gov.ng', 'Oba-Ile Housing Estate, Akure'),
  ('66666666-6666-6666-6666-666666666606', '11111111-1111-1111-1111-111111111121', 'MIMS/2025/0055', 'Sulaiman', 'Oladipo', 'Male', '2009-03-12', 'Day', '22222222-2222-2222-2222-222222222206', 'Mr. A. Oladipo', '+234 812 901 2345', 'a.oladipo@cbn.gov.ng', 'Federal Secretariat Road, Akure')
ON CONFLICT (admission_no) DO NOTHING;

-- 7. Fee Structures
INSERT INTO fee_structures (id, session, term, wing, category, tuition_amount, development_levy, boarding_levy, books_stationery, total_amount) VALUES
  ('77777777-7777-7777-7777-777777777701', '2025/2026', 'first', 'Senior Secondary', 'Day', 50000.00, 5000.00, 0.00, 0.00, 55000.00),
  ('77777777-7777-7777-7777-777777777702', '2025/2026', 'first', 'Senior Secondary', 'Boarding', 50000.00, 5000.00, 70000.00, 0.00, 125000.00),
  ('77777777-7777-7777-7777-777777777703', '2025/2026', 'first', 'Junior Secondary', 'Day', 43000.00, 5000.00, 0.00, 0.00, 48000.00),
  ('77777777-7777-7777-7777-777777777704', '2025/2026', 'first', 'Primary', 'Day', 38000.00, 4000.00, 0.00, 0.00, 42000.00),
  ('77777777-7777-7777-7777-777777777705', '2025/2026', 'first', 'Nursery', 'Day', 35000.00, 3500.00, 0.00, 0.00, 38500.00)
ON CONFLICT (session, term, wing, category) DO NOTHING;

-- 8. Student Fee Clearance Dossiers
INSERT INTO student_fee_clearance (id, student_id, session, term, total_billed, total_paid, balance, is_cleared, last_payment_date) VALUES
  ('88888888-8888-8888-8888-888888888801', '66666666-6666-6666-6666-666666666601', '2025/2026', 'first', 55000.00, 55000.00, 0.00, TRUE, '2025-09-18'),
  ('88888888-8888-8888-8888-888888888802', '66666666-6666-6666-6666-666666666602', '2025/2026', 'first', 55000.00, 55000.00, 0.00, TRUE, '2025-09-20'),
  ('88888888-8888-8888-8888-888888888803', '66666666-6666-6666-6666-666666666603', '2025/2026', 'first', 125000.00, 95000.00, 30000.00, FALSE, '2025-09-22'),
  ('88888888-8888-8888-8888-888888888804', '66666666-6666-6666-6666-666666666604', '2025/2026', 'first', 55000.00, 40000.00, 15000.00, FALSE, '2025-09-25'),
  ('88888888-8888-8888-8888-888888888805', '66666666-6666-6666-6666-666666666605', '2025/2026', 'first', 55000.00, 55000.00, 0.00, TRUE, '2025-09-16'),
  ('88888888-8888-8888-8888-888888888806', '66666666-6666-6666-6666-666666666606', '2025/2026', 'first', 55000.00, 55000.00, 0.00, TRUE, '2025-09-19')
ON CONFLICT (student_id, session, term) DO NOTHING;

-- 9. Bursar Official Verified Payments
INSERT INTO payments (id, student_id, session, term, amount_paid, payment_date, receipt_no, method, channel_reference, bank_name, status) VALUES
  ('99999999-9999-9999-9999-999999999901', '66666666-6666-6666-6666-666666666601', '2025/2026', 'first', 55000.00, '2025-09-18', 'MIMS/REC/2025/0014', 'bank_transfer', 'JAIZ-NIP-89210432', 'Jaiz Bank Plc', 'verified'),
  ('99999999-9999-9999-9999-999999999902', '66666666-6666-6666-6666-666666666602', '2025/2026', 'first', 55000.00, '2025-09-20', 'MIMS/REC/2025/0019', 'bank_transfer', 'JAIZ-NIP-90123847', 'Jaiz Bank Plc', 'verified'),
  ('99999999-9999-9999-9999-999999999903', '66666666-6666-6666-6666-666666666603', '2025/2026', 'first', 95000.00, '2025-09-22', 'MIMS/REC/2025/0024', 'direct_deposit', 'TELLER-094821', 'Jaiz Bank Plc', 'verified'),
  ('99999999-9999-9999-9999-999999999904', '66666666-6666-6666-6666-666666666604', '2025/2026', 'first', 40000.00, '2025-09-25', 'MIMS/REC/2025/0031', 'bank_transfer', 'JAIZ-NIP-77123984', 'Jaiz Bank Plc', 'verified'),
  ('99999999-9999-9999-9999-999999999905', '66666666-6666-6666-6666-666666666605', '2025/2026', 'first', 55000.00, '2025-09-16', 'MIMS/REC/2025/0009', 'bank_transfer', 'JAIZ-NIP-81204891', 'Jaiz Bank Plc', 'verified'),
  ('99999999-9999-9999-9999-999999999906', '66666666-6666-6666-6666-666666666606', '2025/2026', 'first', 55000.00, '2025-09-19', 'MIMS/REC/2025/0017', 'bank_transfer', 'JAIZ-NIP-92847120', 'Jaiz Bank Plc', 'verified')
ON CONFLICT (receipt_no) DO NOTHING;

-- 10. Official First Term Broadsheet Examination Scores (Zaid Al-Hassan - SSS 2 Science Gold)
INSERT INTO results (student_id, subject_id, class_id, session, term, ca1, ca2, exam, total, grade, remark, status) VALUES
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 14, 14, 64, 92, 'A1', 'Distinction - Outstanding analytical problem solving', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 13, 12, 58, 83, 'A1', 'Excellent essay articulation and grammatical precision', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 14, 12, 58, 84, 'A1', 'Distinction - Thorough understanding of mechanics and optics', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 13, 13, 55, 81, 'A1', 'Excellent laboratory experiment and stoichiometry work', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555505', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 13, 12, 52, 77, 'B2', 'Very Good grasp of cell biology and ecology practicals', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555506', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 15, 14, 67, 96, 'A1', 'Distinction - Exemplary knowledge of Hadith and Fiqh', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555507', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 14, 13, 62, 89, 'A1', 'Distinction - Fluent Arabic reading, grammar and translation', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555508', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 11, 11, 50, 72, 'B2', 'Very Good - Shows high aptitude for advanced calculus', 'approved'),
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555509', '22222222-2222-2222-2222-222222222206', '2025/2026', 'first', 14, 13, 60, 87, 'A1', 'Excellent understanding of democratic institutions and civic duty', 'approved')
ON CONFLICT (student_id, subject_id, session, term) DO NOTHING;

-- 11. Live Site Settings Singleton
INSERT INTO site_settings (
  id,
  school_name,
  motto,
  accreditation,
  bursary_phone,
  admissions_phone,
  principal_phone,
  whatsapp_inquiry,
  general_email,
  admissions_email,
  bursar_email,
  principal_email,
  senior_campus_address,
  nursery_primary_address,
  bank_name,
  account_name,
  account_number,
  sort_code,
  school_hours,
  friday_hours,
  admin_office_hours,
  visiting_day_schedule,
  facebook_url,
  youtube_url,
  whatsapp_channel_url
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'MSSN Islamic Model Schools, Akure',
  'Knowledge, Faith and Excellent Morals • Al-Birr',
  'WAEC / NECO / Ondo State Ministry of Education Accredited',
  '+234 802 987 6543',
  '+234 803 234 5678',
  '+234 805 112 3344',
  '+234 814 556 7788',
  'info@mimsakure.com',
  'admissions@mimsakure.com',
  'bursar@mimsakure.com',
  'principal@mimsakure.com',
  'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
  'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
  'Jaiz Bank Plc',
  'MSSN Islamic Model Schools Akure - Operations',
  '0012345678',
  '301001',
  'Monday - Thursday: 7:30 AM – 3:30 PM',
  'Friday: 7:30 AM – 1:00 PM (Jumu''ah Break)',
  'Monday - Friday: 8:00 AM – 4:30 PM',
  '1st Sunday of Every Month: 10:00 AM – 5:00 PM',
  'https://facebook.com/mimsakure',
  'https://youtube.com/@mimsakure',
  'https://whatsapp.com/channel/mimsakure'
) ON CONFLICT (id) DO NOTHING;

-- 12. Admissions Gate Singleton
INSERT INTO admissions_gate (
  id,
  is_open,
  target_session,
  application_deadline,
  entrance_exam_date,
  entrance_exam_time,
  exam_venue,
  day_form_fee,
  boarding_form_fee,
  announcement_notice,
  closed_notice
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  TRUE,
  '2026/2027 Academic Session',
  '2026-07-15',
  '2026-07-18',
  '09:00 AM Prompt',
  'MSSN Campus Complex Main Examination Hall, Km 4 Oba-Ile Road, Akure',
  5000.00,
  10000.00,
  'Admissions for the 2026/2027 Academic Session are now formally OPEN! Qualified candidates seeking admission into Creche, Nursery, Primary, and JSS 1 - SSS 2 are invited to apply.',
  'Online admissions for the current academic cycle are currently closed. All entrance screening tests have concluded.'
) ON CONFLICT (id) DO NOTHING;

-- 13. Institutional Achievements & Honors
INSERT INTO achievements (title, category, year, recipient, description, is_featured, badge_text) VALUES
  ('100% 5-Credit Distinction Rate in WASSCE 2025', 'Academic', '2024/2025', 'Class of 2025 (Graduating Set)', 'All 48 candidates presented for the West African Senior School Certificate Examination recorded distinctions in Mathematics, English, Biology, and Chemistry.', TRUE, 'National WAEC Record'),
  ('1st Position – Ondo State Inter-Schools Quran Recitation (Hifz 15 Juz)', 'Quran & Tahfeez', '2025', 'Abdullah Yusuf (SSS 2)', 'Master Abdullah emerged champion out of 34 participating schools across the South-West with flawless Tajweed and memorization accuracy.', TRUE, 'State Champions'),
  ('Gold Medalists – National Olympiad Mathematics Competition', 'STEM & Olympiads', '2025/2026', 'Fatima Zahra Adeyemi & Zainab Aminu', 'Secured top honours at the National Mathematical Centre zonal playoffs, advancing to the continental finals representing Nigeria.', TRUE, 'Gold Medalists'),
  ('7 Students Graduated Complete 30-Juz Quran Memorization (Huffaz)', 'Quran & Tahfeez', '2025', 'Tahfeez Boarding Circle (7 Huffaz)', 'Honoured at the 6th Annual Quranic Graduation (Walimatul Quran) after completing rigorous verification under Ustadh Zayd Al-Hassan.', TRUE, 'Huffaz Graduates')
ON CONFLICT DO NOTHING;

-- 14. Visual Media Gallery
INSERT INTO media_gallery (title, category, image_url, caption, date_added, is_featured, file_size) VALUES
  ('Ultra-Modern ICT & Computer Lab', 'Campus Facilities', '/images/hero-bg.jpg', 'State-of-the-art 60-seat networked computer laboratory for CBT practice and coding.', 'Sept 2025', TRUE, '1.2 MB'),
  ('Advanced Science Laboratory Complex', 'Campus Facilities', '/images/hero-bg.jpg', 'Fully equipped Physics, Chemistry, and Biology laboratories accredited by WAEC/NECO.', 'Oct 2025', TRUE, '2.1 MB'),
  ('Central Campus Mosque & Tahfeez Hall', 'Spiritual & Tahfeez', '/images/hero-bg.jpg', 'Daily congregation prayers, Jumu''ah services, and specialized Quran memorization circles.', 'Aug 2025', TRUE, '3.4 MB'),
  ('Academic Library & Research Resource Room', 'Campus Facilities', '/images/hero-bg.jpg', 'Curated collection of over 8,000 academic titles, Islamic references, and past papers.', 'Nov 2025', TRUE, '1.5 MB')
ON CONFLICT DO NOTHING;
