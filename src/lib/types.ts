export type UserRole = 'admin' | 'teacher' | 'student' | 'bursar' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export type ExamStatus = 'pending' | 'scheduled' | 'passed' | 'failed';
export type ResultStatus = 'pending' | 'approved';
export type Term = 'first' | 'second' | 'third';
export type Gender = 'male' | 'female';
export type PaymentMethod = 'cash' | 'bank' | 'transfer' | 'online';
export type Audience = 'all' | 'teachers' | 'students';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface ClassItem {
  id: string;
  class_name: string;
  section: string;
  created_at?: string;
  student_count?: number;
}

export interface Student {
  id: string;
  user_id: string;
  admission_no: string | null;
  firstname: string;
  lastname: string;
  gender: Gender;
  dob: string | null;
  class_id: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  photo: string | null;
  // Admissions & Entrance Exam fields
  exam_date: string | null;
  exam_time: string | null;
  exam_venue: string | null;
  exam_status: ExamStatus;
  exam_notes: string | null;
  created_at?: string;
  // Joined fields
  users?: User;
  classes?: ClassItem;
}

export interface Teacher {
  id: string;
  user_id: string;
  staff_no: string;
  firstname: string;
  lastname: string;
  gender: Gender;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  address: string | null;
  photo: string | null;
  created_at?: string;
  users?: User;
}

export interface Subject {
  id: string;
  subject_name: string;
  class_id: string;
  teacher_id: string | null;
  created_at?: string;
  classes?: ClassItem;
  teachers?: Teacher;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  subject_id?: string | null;
  date: string;
  status: 'present' | 'absent';
  created_at?: string;
  students?: Student;
}

export interface Result {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  session: string;
  term: Term;
  ca: number;
  exam: number;
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remark: string;
  status: ResultStatus;
  created_at?: string;
  students?: Student;
  subjects?: Subject;
  classes?: ClassItem;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: Audience;
  created_by: string;
  created_at: string;
  users?: User;
}

export interface Fee {
  id: string;
  class_id: string;
  term: Term;
  session: string;
  amount: number;
  description?: string;
  created_at?: string;
  classes?: ClassItem;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_id: string;
  amount_paid: number;
  payment_date: string;
  receipt_no: string;
  method: PaymentMethod;
  created_at?: string;
  students?: Student;
  fees?: Fee;
}
