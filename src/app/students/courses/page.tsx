import { redirect } from 'next/navigation';

export default function StudentCoursesRedirect() {
  redirect('/students/dashboard');
}
