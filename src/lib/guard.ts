import { NextResponse } from 'next/server';
import { getSession, SessionPayload } from './auth';
import { UserRole } from './types';
import { getAdminClient } from './supabase/admin';

export type GuardResult =
  | { authorized: true; session: SessionPayload }
  | { authorized: false; response: NextResponse };

/**
 * Enforce authentication and optional role-based authorization at the top of API routes.
 * Denies access by default.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<GuardResult> {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized. Authentication session required.' },
          { status: 401 }
        ),
      };
    }

    if (session.status === 'suspended' || session.status === 'inactive') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Your account has been suspended or deactivated.' },
          { status: 403 }
        ),
      };
    }

    if (allowedRoles && allowedRoles.length > 0) {
      // super_admin always passes admin-level checks
      const effectiveRoles = allowedRoles.includes('admin') && !allowedRoles.includes('super_admin')
        ? [...allowedRoles, 'super_admin' as UserRole]
        : allowedRoles;

      if (!effectiveRoles.includes(session.role)) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: `Forbidden. Requires one of [${allowedRoles.join(', ')}] role privileges.` },
            { status: 403 }
          ),
        };
      }
    }

    return { authorized: true, session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication verification failed';
    return {
      authorized: false,
      response: NextResponse.json({ error: message }, { status: 500 }),
    };
  }
}

/**
 * Super Administrator guard (Governing Board)
 */
export async function requireSuperAdmin(): Promise<GuardResult> {
  const result = await requireAuth(['super_admin']);
  if (!result.authorized) return result;

  // Double-check with live DB to verify this account is genuinely super_admin and session is fresh
  try {
    const supabase = getAdminClient();
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, status, session_version')
      .eq('id', result.session.userId)
      .single();

    if (!dbUser || dbUser.role !== 'super_admin' || dbUser.status !== 'active') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Super Administrator privileges required.' },
          { status: 403 }
        ),
      };
    }

    const currentVersion = dbUser.session_version ?? 0;
    const tokenVersion = result.session.sessionVersion ?? 0;
    if (currentVersion !== tokenVersion) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Session invalidated due to password or credential update.' },
          { status: 401 }
        ),
      };
    }
  } catch (e) {
    // If DB check fails, rely on signed token if it specifies super_admin
    if (result.session.role !== 'super_admin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Super Administrator privileges required.' },
          { status: 403 }
        ),
      };
    }
  }

  return result;
}

/**
 * Validate that a mutation request originates from the application's domain (CSRF prevention)
 */
export function validateOrigin(request: Request): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true; // Allow dev/localhost requests
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin) {
    // If no Origin header (e.g., direct GET, or standard server-to-server), check Referer
    const referer = request.headers.get('referer');
    if (!referer) return true;
    try {
      const refererHost = new URL(referer).host;
      return refererHost === host;
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Insert an immutable audit record of a sensitive operation.
 */
export async function logAudit(params: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = getAdminClient();
    await supabase.from('audit_logs').insert({
      actor_id: params.actorId || null,
      actor_role: params.actorRole || 'system',
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId || null,
      details: params.details || {},
    });
  } catch (e) {
    console.warn('Audit log write error:', e);
  }
}
