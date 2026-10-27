import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin');
  const isTeacherPath = pathname.startsWith('/teachers');
  const isBursarPath = pathname.startsWith('/bursar');
  const isStudentPath = pathname.startsWith('/students');

  const isProtected = isAdminPath || isTeacherPath || isBursarPath || isStudentPath;

  if (isProtected) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cryptographically verify HMAC-SHA256 signature
    const session = await verifySessionToken(sessionCookie);

    if (!session) {
      // Forged, malformed, or expired token: kick to login and delete invalid cookie
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    // Check account status
    if (session.status === 'suspended' || session.status === 'inactive') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'deactivated');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    // Role-based authorization
    if (isAdminPath) {
      if (session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isTeacherPath) {
      if (session.role !== 'teacher' && session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isBursarPath) {
      if (session.role !== 'bursar' && session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isStudentPath) {
      if (session.status === 'pending') {
        return NextResponse.redirect(new URL('/admissions/status', request.url));
      }
      if (session.role !== 'student' && session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
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
  ],
};
