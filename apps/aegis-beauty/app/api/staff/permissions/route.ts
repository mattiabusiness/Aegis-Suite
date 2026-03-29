// ============================================================================
// AEGIS BEAUTY - STAFF PERMISSIONS API
// File: apps/aegis-beauty/app/api/staff/permissions/route.ts
// Aggiorna i permessi staff per un business. Solo owner/admin.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    // Verifica che l'utente sia owner/admin
    const { data: member } = await supabase
      .from('business_members')
      .select('business_id, role, can_see_business_calendar, can_see_business_stats, can_manage_team_bookings, team_booking_staff_ids')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Leggi tutti gli staff members del business
    const { data: staffMembers } = await supabase
      .from('business_members')
      .select('user_id, can_see_business_calendar, can_see_business_stats, can_manage_team_bookings, team_booking_staff_ids')
      .eq('business_id', member.business_id)
      .eq('role', 'staff')
      .eq('is_active', true);

    // Leggi gli staff records per avere i nomi
    const { data: staffRecords } = await supabase
      .from('staff')
      .select('id, full_name, user_id, color')
      .eq('business_id', member.business_id)
      .eq('is_active', true)
      .not('user_id', 'is', null);

    // Leggi i permessi globali (dal primo staff member o dai default)
    const firstStaff = staffMembers?.[0];
    const globalPermissions = {
      can_see_business_calendar: firstStaff?.can_see_business_calendar ?? false,
      can_see_business_stats: firstStaff?.can_see_business_stats ?? false,
    };

    // Team managers: staff members con can_manage_team_bookings = true
    const teamManagerUserIds = (staffMembers || [])
      .filter(m => m.can_manage_team_bookings)
      .map(m => m.user_id);

    // Filtra staffRecords: solo quelli con user_id in business_members.role='staff'
    const staffUserIds = new Set((staffMembers || []).map(m => m.user_id));
    const filteredStaffRecords = (staffRecords || []).filter(r => staffUserIds.has(r.user_id));

    return NextResponse.json({
      globalPermissions,
      teamManagerUserIds,
      staffRecords: filteredStaffRecords,
      hasStaff: (staffMembers || []).length > 0,
    });
  } catch (e) {
    console.error('[Permissions GET] error:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    // Verifica che l'utente sia owner/admin
    const { data: member } = await supabase
      .from('business_members')
      .select('business_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await request.json() as {
      can_see_business_calendar: boolean;
      can_see_business_stats: boolean;
      team_manager_user_ids: string[];
    };

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Aggiorna can_see_business_calendar e can_see_business_stats per TUTTI gli staff
    await adminClient
      .from('business_members')
      .update({
        can_see_business_calendar: body.can_see_business_calendar,
        can_see_business_stats: body.can_see_business_stats,
      })
      .eq('business_id', member.business_id)
      .eq('role', 'staff');

    // Aggiorna can_manage_team_bookings per ogni staff member individualmente
    if (body.team_manager_user_ids.length > 0) {
      // Abilita per i selezionati
      await adminClient
        .from('business_members')
        .update({ can_manage_team_bookings: true })
        .eq('business_id', member.business_id)
        .eq('role', 'staff')
        .in('user_id', body.team_manager_user_ids);

      // Disabilita per gli altri
      await adminClient
        .from('business_members')
        .update({ can_manage_team_bookings: false })
        .eq('business_id', member.business_id)
        .eq('role', 'staff')
        .not('user_id', 'in', `(${body.team_manager_user_ids.map(id => `'${id}'`).join(',')})`);
    } else {
      // Disabilita per tutti
      await adminClient
        .from('business_members')
        .update({ can_manage_team_bookings: false })
        .eq('business_id', member.business_id)
        .eq('role', 'staff');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Permissions POST] error:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
