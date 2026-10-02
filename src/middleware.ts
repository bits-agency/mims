import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mims_session')?.value;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin');
  const isTeacherPath = pathname.startsWith('/teachers');
  const isBursarPath = pathname.startsWith('/bursar');
  const isStudentPath = pathname.startsWith('/students');
  const isAdmissionsStatusPath = pathname.startsWith('/admissions/status');

  const isProtected = isAdminPath || isTeacherPath || isBursarPath || isStudentPath || isAdmissionsStatusPath;

  if (isProtected) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode payload from session token (format: payloadB64.sigB64)
      const parts = sessionCookie.split('.');
      if (parts.length === 2) {
        const payloadJson = Buffer.from(parts[0], 'base64url').toString('utf-8');
        const session = JSON.parse(payloadJson);

        // Check expiry
        if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
          const loginUrl = new URL('/login', request.url);
          return NextResponse.redirect(loginUrl);
        }

        // Role verification
        if (isAdminPath && session.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isTeacherPath && session.role !== 'teacher' && session.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isBursarPath && session.role !== 'bursar' && session.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isStudentPath) {
          if (session.status === 'pending') {
            return NextResponse.redirect(new URL('/admissions/status', request.url));
          }
          if (session.role !== 'student' && session.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/bursar/:path*',
    '/teachers/:path*',
    '/students/:path*',
    '/admissions/status/:path*',
  ],
};
