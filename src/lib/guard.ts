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

  // Double-check with live DB to verify this account is genuinely super_admin
  try {
    const supabase = getAdminClient();
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, status')
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
