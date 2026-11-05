import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

import {
  FeeLevy,
  LevelFeeStructure,
  BankAccountConfig,
  DEFAULT_BANK_ACCOUNTS,
  DEFAULT_FEE_STRUCTURES,
} from '@/lib/bursary';

export type { FeeLevy, LevelFeeStructure, BankAccountConfig };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = (searchParams.get('term') as 'first' | 'second' | 'third') || 'first';
    const session = searchParams.get('session') || '2025/2026';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // 1. Fetch fee schedules from database
        const { data: dbSchedules, error: schedError } = await supabase
          .from('fee_schedules')
          .select('*')
          .eq('session', session)
          .eq('term', term)
          .order('sort_order', { ascending: true });

        // 2. Fetch bank accounts from database
        const { data: dbBank, error: bankError } = await supabase
          .from('bank_accounts')
          .select('*');

        const bankAccounts = { ...DEFAULT_BANK_ACCOUNTS };
        if (!bankError && dbBank && dbBank.length > 0) {
          dbBank.forEach((b: any) => {
            bankAccounts[b.section] = {
              sectionName: b.section_name,
              applicableWings: b.applicable_wings || [],
              bankName: b.bank_name || 'Official Commercial Bank',
              accountName: b.account_name,
              accountNumber: b.account_number || '',
              sortCode: b.sort_code || '',
            };
          });
        }

        let structures: LevelFeeStructure[] = DEFAULT_FEE_STRUCTURES;
        if (!schedError && dbSchedules && dbSchedules.length > 0) {
          structures = dbSchedules.map((s: any) => {
            const levies: FeeLevy[] = s.levies || [];
            const total = levies.reduce((acc, l) => acc + Number(l.amount || 0), 0);
            return {
              levelId: s.level_id,
              levelName: s.level_name,
              wing: s.wing,
              levies,
              totalFee: total,
              description: s.description || '',
            };
          });
        }

        return NextResponse.json({
          success: true,
          bankAccounts,
          structures,
          activeTerm: term,
          session,
          source: 'database',
        });
      } catch (dbErr) {
        console.warn('DB fee-structures query error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      bankAccounts: DEFAULT_BANK_ACCOUNTS,
      structures: DEFAULT_FEE_STRUCTURES,
      activeTerm: term,
      session,
      source: 'database_defaults',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const targetTerm = (body.term as 'first' | 'second' | 'third') || 'first';
    const targetSession = body.session || '2025/2026';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    // 1. Update bank accounts in database if provided
    if (body.bankAccounts) {
      for (const [section, config] of Object.entries(body.bankAccounts) as [string, any][]) {
        await supabase.from('bank_accounts').upsert(
          {
            section,
            section_name: config.sectionName || `${section} Account`,
            applicable_wings: config.applicableWings || [],
            bank_name: config.bankName || null,
            account_name: config.accountName || null,
            account_number: config.accountNumber || null,
            sort_code: config.sortCode || null,
            updated_by: auth.session.userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'section' }
        );
      }
    }

    // 2. Update fee schedules in database if provided
    if (body.structures && Array.isArray(body.structures)) {
      for (let i = 0; i < body.structures.length; i++) {
        const s = body.structures[i];
        const levies = s.levies || [];
        await supabase.from('fee_schedules').upsert(
          {
            session: targetSession,
            term: targetTerm,
            level_id: s.levelId,
            level_name: s.levelName,
            wing: s.wing,
            description: s.description || '',
            levies: levies,
            sort_order: i + 1,
            updated_by: auth.session.userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'session,term,level_id' }
        );
      }
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'fee_structures.updated',
      entity: 'fee_schedule',
      entityId: `${targetSession}:${targetTerm}`,
      details: { term: targetTerm, session: targetSession },
    });

    return NextResponse.json({
      success: true,
      message: `Fee structure tariffs for ${targetTerm === 'first' ? 'First' : targetTerm === 'second' ? 'Second' : 'Third'} Term (${targetSession}) updated successfully in database.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
