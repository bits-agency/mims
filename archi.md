# MIMS Akure — Correct System Architecture

> This document defines the target architecture for the MIMS (Muslim Integrated Model School) school management system.
> It covers folder structure, authentication, API design, data layer, component patterns, and cross-cutting concerns.
> Every decision is grounded in fixing the specific vulnerabilities and design flaws found in the current codebase.

---

## 1. System Overview

MIMS is a multi-portal school management system with five distinct user roles:

| Role | Portal | Responsibilities |
|---|---|---|
| `admin` | `/admin/*` | School operations, staff, students, sessions, CMS |
| `bursar` | `/bursar/*` | Fee structures, payments, defaulters, financial stats |
| `teacher` | `/teachers/*` | Attendance, grading, roster, messaging |
| `student` | `/students/*` | Results, fees, attendance, profile |
| `public` | `/`, `/admissions/*`, `/about`, `/contact` | Public website, application submission |

---

## 2. Correct Folder Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── (public)/                     # Route group — no auth required
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── admissions/
│   │       ├── page.tsx              # Admissions info page
│   │       ├── apply/page.tsx        # Application form
│   │       └── status/page.tsx       # Status checker
│   │
│   ├── (auth)/                       # Route group — auth pages
│   │   └── login/page.tsx
│   │
│   ├── admin/                        # Admin portal
│   │   ├── layout.tsx                # Shared admin shell (reads session)
│   │   ├── dashboard/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── sessions/page.tsx
│   │   ├── admissions/page.tsx
│   │   ├── students/page.tsx
│   │   └── cms/
│   │       ├── settings/page.tsx
│   │       ├── admissions-gate/page.tsx
│   │       ├── achievements/page.tsx
│   │       └── media/page.tsx
│   │
│   ├── bursar/                       # Bursar portal
│   │   ├── layout.tsx                # Shared bursar shell (reads session)
│   │   ├── dashboard/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── defaulters/page.tsx
│   │   ├── fee-structures/page.tsx
│   │   └── students/page.tsx
│   │
│   ├── teachers/                     # Teacher portal
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── grading/page.tsx
│   │   ├── roster/page.tsx
│   │   └── messages/page.tsx
│   │
│   ├── students/                     # Student portal
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── results/page.tsx
│   │   ├── fees/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── profile/page.tsx
│   │   └── messages/page.tsx
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── admin/
│   │   │   ├── students/route.ts     # protected: admin
│   │   │   ├── staff/route.ts        # protected: admin
│   │   │   ├── classes/route.ts      # protected: admin
│   │   │   ├── sessions/route.ts     # protected: admin
│   │   │   ├── metrics/route.ts      # protected: admin
│   │   │   └── admissions/
│   │   │       ├── applicants/route.ts  # protected: admin
│   │   │       ├── schedule/route.ts    # protected: admin
│   │   │       └── enroll/route.ts      # protected: admin
│   │   ├── bursar/
│   │   │   ├── payments/route.ts     # protected: bursar, admin
│   │   │   ├── defaulters/route.ts   # protected: bursar, admin
│   │   │   ├── stats/route.ts        # protected: bursar, admin
│   │   │   └── fee-structures/route.ts  # protected: bursar, admin
│   │   ├── teacher/
│   │   │   ├── attendance/route.ts   # protected: teacher, admin
│   │   │   └── results/route.ts      # protected: teacher, admin
│   │   ├── students/
│   │   │   └── results/route.ts      # protected: student (own data only)
│   │   ├── cms/
│   │   │   ├── settings/route.ts     # protected: admin
│   │   │   ├── admissions-gate/route.ts  # protected: admin
│   │   │   ├── achievements/route.ts    # protected: admin
│   │   │   └── media/route.ts           # protected: admin
│   │   ├── admissions/
│   │   │   └── apply/route.ts        # public (rate-limited)
│   │   └── upload/route.ts           # protected: admin, teacher, bursar
│   │
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   └── favicon.ico
│
├── components/                       # Shared UI components
│   ├── layout/
│   │   ├── PortalShell.tsx           # Shared sidebar+header shell for all portals
│   │   ├── Sidebar.tsx               # Role-aware sidebar nav
│   │   ├── Header.tsx                # Portal top header (reads real session user)
│   │   └── MobileDrawer.tsx          # Mobile sidebar drawer
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx              # Loading skeleton for tables/cards
│   │   ├── Toast.tsx
│   │   └── EmptyState.tsx
│   ├── Navbar.tsx                    # Public website navbar
│   └── Footer.tsx                    # Public website footer
│
├── lib/                              # Server-side utilities and shared logic
│   ├── auth.ts                       # Session creation, verification, cookies
│   ├── middleware/
│   │   ├── withAuth.ts               # API route auth wrapper
│   │   └── withRoles.ts              # Role-based access guard
│   ├── supabase/
│   │   ├── admin.ts                  # Service role client (no RLS bypass fallback)
│   │   ├── server.ts                 # SSR cookie-aware client (for user-scoped queries)
│   │   └── client.ts                 # Browser client (public/anon queries only)
│   ├── validations/
│   │   ├── admissions.ts             # Zod schema for application form
│   │   ├── payments.ts               # Zod schema for payment recording
│   │   └── staff.ts                  # Zod schema for staff creation
│   ├── db/
│   │   ├── students.ts               # Typed DB query functions for students
│   │   ├── staff.ts                  # Typed DB query functions for teachers
│   │   ├── payments.ts               # Typed DB query functions for payments
│   │   ├── results.ts                # Typed DB query functions for results
│   │   └── sessions.ts               # Typed DB query functions for academic sessions
│   ├── types.ts                      # Shared TypeScript interfaces
│   ├── utils.ts                      # Shared pure utilities
│   └── cloudinary.ts                 # Cloudinary upload helper
│
├── middleware.ts                     # Edge middleware (page-level auth + role routing)
└── .env.local                        # Environment variables (never committed)
```

---

## 3. Authentication Architecture

### 3.1 Session Token

Keep the current HMAC-SHA256 custom token approach. Fix the two flaws:

```
Token format: base64url(JSON payload) . base64url(HMAC signature)

Payload:
{
  userId: string
  email: string
  role: 'admin' | 'bursar' | 'teacher' | 'student'
  fullName: string
  username: string
  status: 'active' | 'pending' | 'inactive'
  exp: number  (unix timestamp)
}
```

**Fixes required:**
- `JWT_SECRET` must be required — throw an error at startup if missing, never fall back to a hardcoded string.
- Middleware must call `verifySessionToken()` to validate the HMAC before trusting the payload. It currently does not.

### 3.2 Middleware — Page Route Protection

`src/middleware.ts` guards all portal page routes. The matcher must include every protected prefix:

```
Matcher: /admin/:path*, /bursar/:path*, /teachers/:path*, /students/:path*, /admissions/status/:path*
```

The middleware must:
1. Check cookie presence → redirect `/login` if missing
2. Call `verifySessionToken()` → redirect `/login` if signature invalid or expired
3. Check role against the requested path → redirect `/` if role mismatch
4. Pass `x-user-id` and `x-user-role` as request headers to downstream pages (avoids re-parsing the token in Server Components)

### 3.3 API Route Protection — `withAuth` Wrapper

Every protected API route must be wrapped with a shared higher-order function. No route should implement its own auth check.

```
src/lib/middleware/withAuth.ts
```

Usage pattern in every protected route:

```typescript
// GET /api/admin/students
export const GET = withAuth(['admin'], async (req, session) => {
  // session.userId, session.role are verified and typed here
  // No hasSupabase check — throw hard if env is missing
});
```

The wrapper:
1. Reads the session cookie
2. Calls `verifySessionToken()` — returns 401 if invalid
3. Checks allowed roles array — returns 403 if role not permitted
4. Calls the handler with the verified `SessionPayload`

### 3.4 Role → Allowed Routes Matrix

| API Path Pattern | Allowed Roles |
|---|---|
| `/api/admin/*` | `admin` |
| `/api/bursar/*` | `bursar`, `admin` |
| `/api/teacher/*` | `teacher`, `admin` |
| `/api/students/*` | `student` (own data only — enforce `user_id = session.userId`) |
| `/api/cms/*` | `admin` |
| `/api/upload` | `admin`, `bursar`, `teacher` |
| `/api/admissions/apply` | public (unauthenticated, rate-limited) |

---

## 4. Data Layer Architecture

### 4.1 Supabase Client Usage Rules

| Client | File | When to use |
|---|---|---|
| Service Role | `lib/supabase/admin.ts` | Server-only. Admin operations that need to bypass RLS (creating users, cross-student queries). Used only inside `withAuth`-wrapped routes. |
| SSR Cookie Client | `lib/supabase/server.ts` | Server Components and student-scoped queries. RLS applies — the user can only see their own rows. |
| Browser Client | `lib/supabase/client.ts` | Public read-only queries only (CMS content, admissions gate status). Never for writes. |

**Rule:** The admin (service role) client must never be used for student-scoped queries. Use the SSR client so RLS limits data to the authenticated user.

### 4.2 Typed DB Query Layer

All database queries must live in `src/lib/db/*.ts` — not inside route handlers. Routes call query functions; they do not build queries inline.

```
lib/db/
├── students.ts    → getStudentById(), listStudents(), createStudent(), enrollStudent()
├── staff.ts       → listTeachers(), createTeacher(), resetStaffPassword()
├── payments.ts    → recordPayment(), getPaymentsByStudent(), getDefaulters()
├── results.ts     → getStudentResults(), publishResults()
└── sessions.ts    → getActiveSession(), listSessions()
```

Benefits:
- Queries are reusable across multiple routes
- TypeScript return types are enforced once, used everywhere
- Easier to unit test in isolation
- No raw Supabase builder code scattered across 15 route files

### 4.3 Input Validation with Zod

Every POST/PUT route must validate its body against a Zod schema before touching the database. No raw `body` objects passed to `.insert()`.

```
lib/validations/
├── admissions.ts   → ApplySchema (firstname, lastname, email format, gender enum, etc.)
├── payments.ts     → RecordPaymentSchema (studentId required, amount > 0, valid method enum)
└── staff.ts        → CreateStaffSchema (all required fields, phone format, email format)
```

### 4.4 Atomic Transactions for Multi-Step Operations

The two flows that currently risk orphaned records must use Supabase RPC (database functions):

**Admission Application** — single RPC call `apply_for_admission(payload)`:
```sql
-- Creates users row + students row atomically
-- Returns application_ref stored in the students table
-- Rolls back both if either insert fails
```

**Payment Recording** — single RPC call `record_payment(payload)`:
```sql
-- Inserts payment row
-- Updates student_fee_clearance balance with row-level lock
-- Prevents race condition (no read-compute-write gap)
```

### 4.5 Database Schema — Tables Required

```
users              id, full_name, username, email, password_hash, role, status
students           id, user_id(fk), admission_no, application_ref, firstname, lastname,
                   gender, dob, class_id(fk), guardian_name, guardian_phone, address,
                   photo, exam_status, exam_date, exam_time, exam_venue, exam_notes
teachers           id, user_id(fk), staff_no, firstname, lastname, gender, phone,
                   qualification, address, photo
classes            id, class_name, section, class_teacher_id(fk)
academic_sessions  id, session_name, is_current, start_date, end_date
academic_terms     id, session_id(fk), term_number, start_date, end_date, results_released
subjects           id, subject_name, class_id(fk), teacher_id(fk)
results            id, student_id(fk), subject_id(fk), class_id(fk), session_id(fk),
                   term_id(fk), ca1, ca2, exam, total, grade, remark, status
payments           id, student_id(fk), session_id(fk), term_id(fk), amount_paid,
                   receipt_no (UNIQUE), method, channel_reference, status, recorded_by(fk)
student_fee_clearance  id, student_id(fk), session_id(fk), term_id(fk), total_billed,
                       total_paid, balance, is_cleared
fee_structures     id, class_id(fk), session_id(fk), term_id(fk), amount, category
admissions_gate    id, is_open, target_session, application_deadline, entrance_exam_date,
                   entrance_exam_time, exam_venue, day_form_fee, boarding_form_fee,
                   announcement_notice, closed_notice
achievements       id, title, description, year, image_url, created_at
media_gallery      id, title, url, public_id, folder, created_at
cms_settings       id, school_name, address, phone, email, bank_name, account_name,
                   account_number, updated_at
announcements      id, title, message, audience, created_by(fk), created_at
attendance         id, student_id(fk), class_id(fk), subject_id(fk), date, status
```

**Key constraints:**
- `payments.receipt_no` → UNIQUE constraint (prevents duplicate receipts)
- `students.application_ref` → stored column, not ephemeral
- `academic_sessions.is_current` → only one row true at a time (DB trigger or application-level enforcement)
- All `session`/`term` foreign keys point to table rows — no hardcoded strings like `'2025/2026'`

---

## 5. API Design

### 5.1 Consistent Response Envelope

All API responses use one of two shapes:

**Success:**
```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ], "pagination": { "total": 120, "page": 1, "limit": 20 } }
```

**Error:**
```json
{ "success": false, "error": "Human-readable message", "code": "VALIDATION_ERROR" }
```

No more `{ students: [...] }` vs `{ data: [...] }` vs `{ success: true }` with missing fields.

### 5.2 Pagination on All List Endpoints

Every endpoint that returns a list must accept and respect:

```
?page=1&limit=20
```

Supabase `.range(from, to)` handles this efficiently without loading all rows.

Affected routes:
- `/api/admin/students` 
- `/api/admissions/applicants` (server-side search, not client-side filter)
- `/api/cms/media`
- `/api/bursar/payments`
- `/api/bursar/defaulters`

### 5.3 Admissions Status — Server-Side Search

```
GET /api/admissions/status?ref=MIMS/APP/2026/0042
```

Returns only the single matching record (by `application_ref`, `admission_no`, or email). No full dataset sent to the browser. The query runs on the server.

### 5.4 Admissions Gate Enforcement

```
POST /api/admissions/apply
```

Must read `admissions_gate.is_open` from the database at the start of every request. If `is_open = false`, return `403` with the `closed_notice` message. Currently this check does not exist.

### 5.5 Revenue Metric — Aggregate at the Database

```typescript
// Wrong: loads every payment row
const payments = await supabase.from('payments').select('amount_paid');
const total = payments.reduce((acc, p) => acc + p.amount_paid, 0);

// Correct: single aggregate query
const { data } = await supabase.rpc('get_total_revenue', { session_id: activeSessionId });
```

---

## 6. Component Architecture

### 6.1 Portal Shell — Single Source of Truth

Replace the four near-identical portal layouts with one shared component:

```
src/components/layout/PortalShell.tsx
```

Props:
```typescript
interface PortalShellProps {
  role: 'admin' | 'bursar' | 'teacher' | 'student'
  navItems: NavItem[]
  children: React.ReactNode
}
```

Each portal layout (`admin/layout.tsx`, `bursar/layout.tsx`, etc.) becomes thin — it fetches the session, builds the nav items array for that role, and renders `<PortalShell>`. The shell handles the sidebar, header, mobile drawer, and logout button.

### 6.2 Session in Layouts — Real User Name

Every portal layout must read the actual logged-in user from the session. No hardcoded names.

```typescript
// admin/layout.tsx — Server Component
import { getSession } from '@/lib/auth'

export default async function AdminLayout({ children }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <PortalShell role="admin" user={session} navItems={adminNav}>
      {children}
    </PortalShell>
  )
}
```

### 6.3 Page Components — Prefer Server Components

Admin and bursar data pages should be Server Components. They fetch data directly in the component without `useEffect` + `fetch`:

```typescript
// admin/students/page.tsx — Server Component
import { listStudents } from '@/lib/db/students'
import { getSession } from '@/lib/auth'

export default async function StudentsPage() {
  const session = await getSession()
  const { students, total } = await listStudents({ page: 1, limit: 20 })
  return <StudentsTable students={students} total={total} />
}
```

Use `'use client'` only for components that need interactivity: modals, forms, search inputs, tabs. Keep data fetching on the server.

### 6.4 Error and Loading States

Every data-fetching page must handle three states:

| State | Component |
|---|---|
| Loading | `<Skeleton />` — matches the layout of the expected content |
| Error | `<EmptyState variant="error" message="..." retry={fn} />` |
| Empty | `<EmptyState variant="empty" message="No records found" />` |

Use Next.js `loading.tsx` and `error.tsx` conventions for route-level states.

---

## 7. Security Checklist

| Area | Requirement |
|---|---|
| JWT Secret | Required env var — throw at startup if missing. No fallback string. |
| Middleware | Call `verifySessionToken()` before trusting payload. |
| API Auth | Every non-public route wrapped with `withAuth(roles)`. |
| Input Validation | Zod schema validation on every POST/PUT body before DB touch. |
| Mass Assignment | Explicit allowlisted field extraction — never `insert(body)` directly. |
| File Upload | Auth required. Server-side MIME type and size check. Allowlisted folder param. |
| PII / Status Search | Server-side query by ref — never send full applicant list to browser. |
| Rate Limiting | Login endpoint: max 5 attempts per IP per 15 minutes. Apply endpoint: max 3 per IP per hour. Use Upstash Redis or a Next.js rate-limit middleware. |
| CSRF | For sensitive mutations (payments, settings), validate `Origin` header matches app domain. |
| Passwords | Password field required in application form. Enforce minimum strength. Never fall back to shared default password. |
| Receipt Numbers | Use `crypto.randomUUID()`. Enforce `UNIQUE` constraint at DB level. |
| Supabase Keys | `SUPABASE_SERVICE_ROLE_KEY` never exposed to the browser. Never assigned to a `NEXT_PUBLIC_` variable. |
| Session Isolation | Student API routes filter by `user_id = session.userId` — never trust a client-supplied `studentId` alone. |
| RLS | Enable Row Level Security on all Supabase tables. SSR client respects RLS. Admin client bypasses it only where necessary (admin routes only). |

---

## 8. Environment Variables

```bash
# .env.local

# Required — startup will throw if missing
JWT_SECRET=<cryptographically random 64-char string>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only, never NEXT_PUBLIC_>

# Public — safe to expose to browser
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# Server-only
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Optional
RATE_LIMIT_REDIS_URL=<upstash redis url>
APP_URL=https://mims-akure.edu.ng
NODE_ENV=production
```

**Rules:**
- `SUPABASE_SERVICE_ROLE_KEY` must never have a `NEXT_PUBLIC_` prefix. If it does, it is bundled into the client JS and exposed to every user's browser.
- `JWT_SECRET` must be generated fresh per environment — never shared between dev and production.

---

## 9. Data Flow — Key Journeys

### 9.1 Admission Application Flow

```
[Public User]
     │
     ▼
POST /api/admissions/apply
     │
     ├─ 1. Rate limit check (IP-based) → 429 if exceeded
     ├─ 2. Validate body against ApplySchema (Zod) → 400 if invalid
     ├─ 3. Read admissions_gate.is_open → 403 if closed
     ├─ 4. Check email uniqueness
     ├─ 5. Call RPC: apply_for_admission(payload)
     │       ├─ INSERT users (status: pending)
     │       ├─ INSERT students (with application_ref stored)
     │       └─ COMMIT (or ROLLBACK both on any error)
     ├─ 6. Create session cookie (role: student, status: pending)
     └─ 7. Return { success: true, applicationRef, redirectUrl: '/admissions/status' }
```

### 9.2 Admissions Approval Flow (Admin)

```
[Admin]
     │
     ▼
POST /api/admin/admissions/schedule  (withAuth(['admin']))
     │
     ├─ Validate body
     ├─ UPDATE students SET exam_date, exam_time, exam_venue, exam_status='scheduled'
     └─ Return { success: true, student }

POST /api/admin/admissions/enroll  (withAuth(['admin']))
     │
     ├─ Validate body (studentId, assignedClassId)
     ├─ Generate admission_no (UUID-based, stored in DB)
     ├─ UPDATE students SET admission_no, class_id, exam_status='passed'
     ├─ UPDATE users SET status='active'
     └─ Return { success: true, admissionNo }
```

### 9.3 Payment Recording Flow (Bursar)

```
[Bursar]
     │
     ▼
POST /api/bursar/payments  (withAuth(['bursar', 'admin']))
     │
     ├─ Validate body against RecordPaymentSchema
     ├─ Generate receiptNo with crypto.randomUUID()
     ├─ Call RPC: record_payment(studentId, sessionId, termId, amount, method, receiptNo)
     │       ├─ INSERT payments (receipt_no UNIQUE enforced by DB)
     │       ├─ UPDATE student_fee_clearance (atomic balance update with row lock)
     │       └─ COMMIT
     └─ Return { success: true, data: { receipt } }
```

### 9.4 Student Results Access Flow

```
[Student]
     │
     ▼
GET /api/students/results?session=2025/2026&term=first  (withAuth(['student']))
     │
     ├─ session.userId from verified token
     ├─ Query students WHERE user_id = session.userId (RLS + explicit filter)
     ├─ Check student_fee_clearance.is_cleared for this term
     ├─ Check academic_terms.results_released for this term
     ├─ If cleared AND released → return results
     ├─ If not cleared → return { success: true, data: { isCleared: false, balance } }
     └─ If not released → return { success: true, data: { isReleased: false } }
```

---

## 10. What Does NOT Belong in This Architecture

| Pattern | Why It Must Go |
|---|---|
| `const hasSupabase = !!process.env...` in every route | Config errors must fail loudly. Silent empty-data fallbacks hide production data loss. |
| `supabase.from('table').insert(body)` raw | Mass assignment vector. Always extract specific fields. |
| Hardcoded `session || '2025/2026'` in routes | Query `academic_sessions WHERE is_current = true` instead. |
| `Math.random()` for receipt/reference numbers | Use `crypto.randomUUID()` or `crypto.randomInt()`. |
| Hardcoded user names in layout components | Read from `getSession()` in the layout Server Component. |
| Admin approval actions that only update React state | Every action (schedule, approve, reject) must call an API route and await its result. |
| `console.warn` on financial write failures | Throw the error. Return 500. Do not silently return `{ success: true }` when a payment failed to save. |
| `NEXT_PUBLIC_` prefix on service role key | This exposes it to every browser. Service role key is server-only. |
| No password in admission form | Require a password. Validate strength server-side. Never fall back to a hardcoded shared password. |
