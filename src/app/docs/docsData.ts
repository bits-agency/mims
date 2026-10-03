export interface DocSection {
  id: string;
  category: string;
  title: string;
  iconName: string;
  badge?: string;
  targetAudience: 'All' | 'Visitors' | 'Students' | 'Teachers' | 'Bursary' | 'Management' | 'Developers';
  summary: string;
  content: string; // Markdown or rich HTML-compatible content
  subsections?: { title: string; anchor: string }[];
}

export const DOC_CATEGORIES = [
  { id: 'overview', name: 'Getting Started & Architecture' },
  { id: 'visitors', name: 'Visitors & Prospective Parents' },
  { id: 'students', name: 'Students & Parents Portal' },
  { id: 'teachers', name: 'Staff & Academic Teachers' },
  { id: 'bursary', name: 'Bursary & Financial Operations' },
  { id: 'management', name: 'Management & Super Admin' },
  { id: 'technical', name: 'System Technical Reference' },
];

export const DOC_SECTIONS: DocSection[] = [
  // -------------------------------------------------------------
  // 1. OVERVIEW & ARCHITECTURE
  // -------------------------------------------------------------
  {
    id: 'system-overview',
    category: 'overview',
    title: 'System Overview & Purpose',
    iconName: 'BookOpen',
    badge: 'Core Architecture',
    targetAudience: 'All',
    summary: 'High-level introduction to the MSSN Islamic Model Schools (MIMS) unified school management ecosystem.',
    subsections: [
      { title: 'Institutional Profile', anchor: 'institutional-profile' },
      { title: 'Core Objectives', anchor: 'core-objectives' },
      { title: 'Platform Modularity', anchor: 'platform-modularity' },
    ],
    content: `
### Institutional Profile
**MSSN Islamic Model Schools, Akure** (formerly *Al-Birr Islamic Model College*) is a premier K-12 integrated institution in Ondo State, Nigeria. Founded under the auspices of the Muslim Students' Society of Nigeria (MSSN) Akure Area Council, the school blends rigorous Western educational curricula with comprehensive Islamic theology and complete *Hifzul Qur'an* memorization.

### Core Objectives
The MIMS digital management system replaces legacy fragmented paper systems with a secure, centralized cloud infrastructure designed for:
1. **Zero Financial Leakage**: All school fees, candidate exam levies, and application fees are tracked with deterministic clearance ledgers and un-forgeable receipts.
2. **Academic Integrity**: Real-time terminal continuous assessment (CA1, CA2, Examination) calculation with automated broadsheets, grade points, and report cards.
3. **Institutional Transparency**: Public admissions portal with live gate toggling, automated computer-based examination (CBT) schedules, and instant slip generation.
4. **Verifiable Identity**: Automated generation of secure White PVC Student Identity Cards with official cryptographic QR codes and Principal endorsement.

### Platform Modularity
The platform is organized into 5 purpose-built portals sharing a centralized PostgreSQL relational data backbone:
- **Public & Admissions Portal** (\`/\`, \`/admissions\`, \`/about\`, \`/contact\`)
- **Student & Parent Portal** (\`/students/*\`)
- **Academic Staff Portal** (\`/teachers/*\`)
- **Bursary & Financial Office** (\`/bursar/*\`)
- **Management & Super Admin Console** (\`/admin/*\`)
`
  },
  {
    id: 'security-rbac',
    category: 'overview',
    title: 'Security, Authentication & RBAC',
    iconName: 'ShieldCheck',
    badge: 'Security',
    targetAudience: 'Management',
    summary: 'Deep dive into role-based access control (RBAC), password hashing, and data isolation.',
    subsections: [
      { title: 'User Roles & Privilege Matrix', anchor: 'privilege-matrix' },
      { title: 'Authentication Mechanism', anchor: 'auth-mechanism' },
      { title: 'Student No-Email Authentication', anchor: 'student-auth' },
    ],
    content: `
### User Roles & Privilege Matrix
The application implements strict Role-Based Access Control (RBAC). A user session is verified via cryptographically signed JWT cookies and checked against \`public.users\` on every route request.

| Role | Route Guard | Capabilities | Data Isolation |
|---|---|---|---|
| **superadmin** | \`/admin/*\` | Full administrative authority, user provisioning, session & term control, admissions gate, audit logs. | Unrestricted cross-campus access |
| **admin / principal** | \`/admin/*\` | Academic oversight, teacher & student management, broadsheet approvals, admissions review. | School-wide access |
| **bursar** | \`/bursar/*\` | Fee structure execution, offline receipt recording, clearance calculation, defaulter recovery. | Financial ledger only; cannot modify grades |
| **teacher** | \`/teachers/*\` | Attendance submission, CA1/CA2/Exam grade submission, class roster inspection. | Assigned classes and subjects only |
| **student** | \`/students/*\` | Terminal results, fee balance, timetable, attendance history, PVC ID card. | Own student profile only; read-only |

### Authentication Mechanism
1. **Password Encryption**: All passwords stored in \`public.users\` are hashed using **bcrypt** with standard salt rounds. Raw plaintext passwords are never logged or stored.
2. **Session Cookies**: Upon successful authentication at \`/api/auth/login\`, an \`httpOnly\`, \`sameSite: 'lax'\`, \`secure\` session token is set.
3. **Route Middlewares**: Sub-paths under \`/admin\`, \`/bursar\`, \`/teachers\`, and \`/students\` execute server-side session checks before rendering any DOM.

### Student No-Email Authentication
Because primary and junior secondary students do not own institutional email addresses:
- **Username / Identifier**: The student's official **Admission Number** (e.g. \`MIMS/2026/001\`).
- **Default Password**: Assigned during enrollment and updateable via the student profile.
`
  },

  // -------------------------------------------------------------
  // 2. VISITORS & PROSPECTIVE PARENTS
  // -------------------------------------------------------------
  {
    id: 'visitor-guide',
    category: 'visitors',
    title: 'Public Portal & Prospective Students',
    iconName: 'Users',
    badge: 'Public Portal',
    targetAudience: 'Visitors',
    summary: 'Navigating the public website, exploring campuses, academic programs, and applying for admission.',
    subsections: [
      { title: 'School Website Exploration', anchor: 'website-exploration' },
      { title: 'Campuses & Multi-Site Structure', anchor: 'campuses' },
      { title: 'Online Admissions Workflow', anchor: 'admissions-workflow' },
      { title: 'Printing the CBT Exam Slip', anchor: 'exam-slip' },
    ],
    content: `
### School Website Exploration
Visitors and prospective families can access all public institutional information without logging in:
- **Homepage** (\`/\`): Highlighting academic accolades (1st Position Ondo Central Senatorial District 2025, 285 JAMB top score), facilities, and news.
- **About Us** (\`/about\`): History of Al-Birr Islamic Model College, transition to MSSN Islamic Model Schools, leadership, vision, and core educational tenets.
- **Campuses & Contact** (\`/contact\`): Physical addresses, WhatsApp hotlines, interactive Google maps location, and inquiry messaging form.

### Campuses & Multi-Site Structure
MIMS Akure operates three specialized campuses across Akure city:
1. **High School & College Campus**: Dedicated junior and senior secondary science, arts, and commercial laboratories with boarding quarters.
2. **Omi Eja Campus**: Early childhood, primary, and nursery education centers.
3. **Madinah Campus**: Primary and dedicated *Tahfeez* (Hifzul Qur'an) residential academy.

### Online Admissions Workflow
When the Admissions Gate is activated by the Super Admin:
1. Parent visits \`/admissions/apply\`.
2. Completes the 4-step registration:
   - **Student Bio**: Full name, gender, date of birth, state of origin, and passport photograph upload.
   - **Academic Details**: Campus preference (Day vs Boarding) and Target Class (Creche to SSS 3).
   - **Guardian Info**: Primary parent/guardian full name, active telephone number, email, and home address.
   - **Medical & Previous Schooling**: Health notes and former school history.
3. Submits application. The backend generates a unique, permanent **Application Reference Number** (e.g. \`MIMS-2026-APP-8492\`).

### Printing the CBT Exam Slip
Immediately after submission, the system generates an official **Entrance Examination Slip**:
- Displays candidate photo, application reference, target class, and venue.
- Includes exact Computer-Based Test (CBT) examination date, reporting time, and candidate requirements.
- Can be printed or saved as PDF directly from the browser.
`
  },

  // -------------------------------------------------------------
  // 3. STUDENTS & PARENTS PORTAL
  // -------------------------------------------------------------
  {
    id: 'student-portal',
    category: 'students',
    title: 'Student & Parent Portal Guide',
    iconName: 'GraduationCap',
    badge: 'Student Portal',
    targetAudience: 'Students',
    summary: 'Comprehensive handbook for students and guardians to check results, fee clearances, and generate PVC identity cards.',
    subsections: [
      { title: 'Portal Sign In', anchor: 'student-login' },
      { title: 'Terminal Report Sheets & CGPA', anchor: 'results-sheet' },
      { title: 'Fee Clearance & Bursary Status', anchor: 'fee-clearance' },
      { title: 'White PVC Student ID Card', anchor: 'pvc-id-card' },
    ],
    content: `
### Portal Sign In
1. Navigate to \`/login\`.
2. Enter your **Admission Number** (e.g. \`MIMS/2026/001\`) in the username field.
3. Enter your confidential student password and click **Sign In**.
4. You are directed to your Student Dashboard (\`/students/dashboard\`).

### Terminal Report Sheets & CGPA
Located at \`/students/results\`:
- **Academic Term Selector**: Filter results across 1st Term, 2nd Term, and 3rd Term across academic years.
- **Breakdown**: View subject-by-subject scores:
  - **CA 1**: 20 Marks
  - **CA 2**: 20 Marks
  - **Terminal Exam**: 60 Marks
  - **Total**: 100 Marks with Automated Letter Grade (A1, B2, B3, C4, C5, C6, D7, E8, F9) and Subject Teacher Remark.
- **Cumulative Summary**: Overall percentage, class average comparison, student position, and Principal's general remark.
- **Printable Terminal Report Card**: Download or print the authentic watermarked school transcript.

### Fee Clearance & Bursary Status
Located at \`/students/fees\`:
- Displays total term bill, amount credited, and outstanding debt balance.
- **Clearance Badge**: Highlights whether the student is officially **CLEARED** or **PAYMENT PENDING**.
- **Digital Receipts**: Each payment made by the parent generates an immutable receipt with a unique transaction reference and Bursary stamp.

### White PVC Student ID Card
Located in the Student Profile and Portal tools:
- **Design Standard**: Formatted to standard CR80 credit-card dimensions (3.375" × 2.125") on a crisp white laminated PVC background with an emerald green border.
- **Security Features**:
  - Official school emblem and MSSN Akure Council authority marks.
  - High-resolution student passport photo.
  - Scannable QR code encoding the student's admission number and verification endpoint.
  - Emergency contact details, student blood group, and class.
  - Authorized signature of the School Principal.
`
  },

  // -------------------------------------------------------------
  // 4. ACADEMIC STAFF & TEACHERS
  // -------------------------------------------------------------
  {
    id: 'teacher-portal',
    category: 'teachers',
    title: 'Staff & Teacher Operations',
    iconName: 'Laptop',
    badge: 'Teacher Portal',
    targetAudience: 'Teachers',
    summary: 'Operational guide for subject and class teachers to record daily attendance, enter CA scores, and compile broadsheets.',
    subsections: [
      { title: 'Teacher Authentication & Dashboard', anchor: 'teacher-auth' },
      { title: 'Daily Attendance Marking', anchor: 'attendance-marking' },
      { title: 'Continuous Assessment & Exam Entry', anchor: 'grade-entry' },
      { title: 'Class Master Broadsheet', anchor: 'master-broadsheet' },
    ],
    content: `
### Teacher Authentication & Dashboard
Staff members log in via \`/login\` using their assigned Staff Identification Number or institutional email.
The dashboard displays:
- Assigned subject periods and classes (e.g. *Mathematics - JSS 1A*, *Physics - SSS 2 Science*).
- Number of enrolled students in assigned arms.
- Quick status of pending CA and examination submissions for the current term.

### Daily Attendance Marking
Located at \`/teachers/attendance\`:
1. Select the **Class Arm** and the active date.
2. The system loads the roster with all enrolled students.
3. Toggle status per student: **Present**, **Absent**, **Late**, or **Excused**.
4. Click **Save Attendance Register**.
5. Automated statistics update the student's profile for the terminal report card (Days School Opened vs Days Present).

### Continuous Assessment & Exam Entry
Located at \`/teachers/grading\`:
1. Select **Academic Session**, **Term**, **Class**, and **Subject**.
2. Real-time validation ensures marks adhere strictly to Nigerian educational grading standards:
   - **CA 1**: Max 20 Marks
   - **CA 2**: Max 20 Marks
   - **Examination**: Max 60 Marks
3. The total score (Max 100) and letter grade automatically calculate on the fly.
4. Input personalized qualitative remarks for each student.
5. Click **Submit Grades** to commit scores to the database.

### Class Master Broadsheet
Located at \`/teachers/roster\`:
- Formats all class subjects into an end-of-term horizontal broadsheet.
- Calculates total aggregate scores, overall percentages, and rank-orders students from 1st to last position with zero calculation errors.
`
  },

  // -------------------------------------------------------------
  // 5. BURSARY & FINANCIAL OPERATIONS
  // -------------------------------------------------------------
  {
    id: 'bursar-portal',
    category: 'bursary',
    title: 'Bursary & Financial Office Guide',
    iconName: 'Wallet',
    badge: 'Bursary Portal',
    targetAudience: 'Bursary',
    summary: 'Class-specific fee schedules, external candidate levies, recording payments, and defaulter tracking.',
    subsections: [
      { title: 'Class-Specific Fee Structures', anchor: 'fee-structures' },
      { title: 'External Candidate Examination Dues', anchor: 'candidate-dues' },
      { title: 'Recording Payments & Issuing Receipts', anchor: 'payment-recording' },
      { title: 'Defaulters Ledger & Debt Recovery', anchor: 'defaulters-ledger' },
    ],
    content: `
### Class-Specific Fee Structures
Located at \`/bursar/fee-structures\`:
The school's tuition is categorized across sections:
- **Nursery / Primary (Creche, KG, Primary 1 - 5)**: Standard tuition, learning materials, and Islamic books.
- **Junior Secondary (JSS 1 - JSS 3)**: Secondary tuition, science practical consumables, and ICT lab dues.
- **Senior Secondary (SSS 1 - SSS 3)**: Senior secondary tuition, physics/chemistry/biology reagents, and career guidance.
- **Boarding Surcharge**: Additional accommodation, feeding, and medical lodge dues for boarding students across campuses.

### External Candidate Examination Dues
Candidate classes carry mandatory external council examination fees that continuing classes do not pay:
- **Primary 5**: Common Entrance Council Examination dues.
- **JSS 3**: Basic Education Certificate Examination (**BECE**) & National Junior Arabic/Islamic Studies council fees.
- **SSS 3**: **WAEC** (West African Examinations Council), **NECO** (National Examinations Council), and **NBAIS** council fees.
The bursary module dynamically separates standard tuition from candidate examination levies, preventing under-billing or administrative confusion.

### Recording Payments & Issuing Receipts
Located at \`/bursar/payments\`:
1. Search student by **Admission Number** or **Name**.
2. Enter the amount received, payment method (**Bank Transfer**, **Cash Deposit**, or **POS / Card**), and bank channel transaction reference.
3. Select whether the payment applies to Tuition, Candidate Exam Levy, Uniform, or Boarding.
4. Click **Record & Print Receipt**.
5. The system performs an atomic database update:
   - Increments student total paid.
   - Recalculates outstanding balance.
   - Generates a cryptographically tracked receipt number (e.g. \`RCP-2026-9281\`).

### Defaulters Ledger & Debt Recovery
Located at \`/bursar/defaulters\`:
- Instantly lists all students across campuses with outstanding balances > ₦0.
- Filter by class arm (e.g. *SSS 3 Science*), debt amount, or payment status.
- Export debtor lists for school management or send payment reminder notifications to parent contact numbers.
`
  },

  // -------------------------------------------------------------
  // 6. MANAGEMENT & SUPER ADMIN
  // -------------------------------------------------------------
  {
    id: 'management-console',
    category: 'management',
    title: 'Management & Super Admin Console',
    iconName: 'Settings',
    badge: 'Super Admin',
    targetAudience: 'Management',
    summary: 'Executive administration, Admissions Gate toggling, staff provisioning, session calendar, and CMS control.',
    subsections: [
      { title: 'Super Admin Governance', anchor: 'admin-governance' },
      { title: 'Admissions Gate Control', anchor: 'admissions-gate' },
      { title: 'Academic Calendar (Sessions & Terms)', anchor: 'academic-calendar' },
      { title: 'Class & Staff Provisioning', anchor: 'staff-provisioning' },
      { title: 'CMS Media Gallery & Achievements', anchor: 'cms-control' },
    ],
    content: `
### Super Admin Governance
The Super Admin console (\`/admin/*\`) is the central control hub of MSSN Islamic Model Schools. It grants executive power to the School Board, Principal, and System Administrators to supervise all school activities.

### Admissions Gate Control
Located at \`/admin/cms/admissions-gate\`:
- **Live Status Toggle**: Instantly switch the public admissions portal between **OPEN** and **CLOSED** across all three campuses.
- **Application Deadline**: Set cutoff dates for prospective parent submissions.
- **Entrance Examination Schedule**: Configure the date, time, and campus venue for Computer-Based Tests (CBT).
- **Application Fees**: Set Day Form and Boarding Form application pricing.
- **Public Banners**: Edit the live announcement ticker displayed on the website navbar.

### Academic Calendar (Sessions & Terms)
Located at \`/admin/sessions\`:
- Configure academic years (e.g. \`2026/2027 Academic Session\`).
- Define term duration: **1st Term**, **2nd Term**, and **3rd Term**.
- **Results Publishing Lock**: Toggle whether terminal report cards are visible to students and parents, preventing students with outstanding fees from viewing unreleased transcripts until cleared.

### Class & Staff Provisioning
- **Staff Roster** (\`/admin/staff\`): Create teacher and bursar accounts, assign staff ID numbers, and set temporary passwords.
- **Class Arms** (\`/admin/classes\`): Add class arms (e.g. *JSS 1A*, *SSS 2 Commercial*), link designated Class Teachers, and assign subjects.
- **Student Enrollment** (\`/admin/students\`): Review submitted admission applications, approve prospective candidates, and formally assign official Admission Numbers.

### CMS Media Gallery & Achievements
- **Media Gallery** (\`/admin/cms/media\`): Upload school photos directly to **Cloudinary** (campus annex, science lab, sports league, Quranic graduation).
- **Achievements** (\`/admin/cms/achievements\`): Add competitive awards, top JAMB UTME scores, and regional Quranic debate trophies displayed on the landing page.
`
  },

  // -------------------------------------------------------------
  // 7. SYSTEM TECHNICAL REFERENCE
  // -------------------------------------------------------------
  {
    id: 'technical-reference',
    category: 'technical',
    title: 'Database Schema & Developer Guide',
    iconName: 'Code2',
    badge: 'Developer Docs',
    targetAudience: 'Developers',
    summary: 'Technical architecture, Supabase PostgreSQL schema, API routes directory, and environment configuration.',
    subsections: [
      { title: 'Database Relational Model', anchor: 'database-model' },
      { title: 'API Endpoints Directory', anchor: 'api-directory' },
      { title: 'Environment Variables', anchor: 'environment-variables' },
      { title: 'Production Deployment', anchor: 'production-deployment' },
    ],
    content: `
### Database Relational Model
The database is hosted on **Supabase PostgreSQL**. Key database entities include:

\`\`\`sql
-- Core User Entity
users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('superadmin', 'principal', 'admin', 'bursar', 'teacher', 'student')),
  status TEXT DEFAULT 'active'
);

-- Students Profile
students (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admission_no TEXT UNIQUE NOT NULL,
  application_ref TEXT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT,
  dob DATE,
  class_id UUID REFERENCES classes(id),
  guardian_name TEXT,
  guardian_phone TEXT,
  exam_status TEXT,
  exam_date DATE,
  exam_venue TEXT
);

-- Bursary Payments & Receipts
payments (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  session_id UUID REFERENCES academic_sessions(id),
  term_id UUID REFERENCES academic_terms(id),
  amount_paid NUMERIC(12,2) NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  method TEXT,
  channel_reference TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### API Endpoints Directory
All backend operations are served through Next.js App Router API handlers under \`/api/*\`:

| Route | Method | Access Level | Description |
|---|---|---|---|
| \`/api/auth/login\` | POST | Public | Authenticates credentials and issues signed HTTP-only session cookie |
| \`/api/auth/logout\` | POST | Authenticated | Clears user session cookie |
| \`/api/auth/me\` | GET | Authenticated | Returns current authenticated user and role profile |
| \`/api/cms/admissions-gate\` | GET/POST | GET: Public / POST: Admin | Reads or modifies admissions status, form fees, and exam dates |
| \`/api/bursar/payments\` | GET/POST | Bursar, Admin | Fetches transaction ledger or records new payment with atomic balance update |
| \`/api/teacher/results\` | GET/POST | Teacher, Admin | Retrieves student scorecards or submits CA1, CA2, and Exam grades |
| \`/api/students/results\` | GET | Student | Fetches own terminal report card (filtered strictly by student's ID) |
| \`/api/upload\` | POST | Staff | Handles secure uploads to Cloudinary storage |

### Environment Variables
Production configuration required in \`.env.local\` / Vercel:
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-secure-jwt-signing-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
\`\`\`

### Production Deployment
The application is pre-configured for instant zero-downtime deployment on **Vercel** with continuous integration linked to GitHub repository \`bits-agency/mims\`.
`
  }
];
