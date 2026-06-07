// ============================================================================
// AEGIS BEAUTY - AVAILABILITY API (Dashboard / gestore)
// File: apps/aegis-beauty/app/api/availability/route.ts
//
// GET  /api/availability?date=YYYY-MM-DD&serviceId=xxx&staffId=xxx&businessId=xxx
//      → available slots (gestore view: any active staff, onlineOnly = false).
// POST /api/availability  → validate a specific slot before booking.
//
// Gestore-only: the caller MUST be an active member of the business. After that
// check, reads use the admin client so availability is complete and correct.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerSupabaseClient,
  getCurrentUser,
  createAdminSupabaseClient,
  getBookableSlots,
  validateAppointment,
} from '@aegis/core';

/** Returns true if `userId` is an active member of `businessId`. */
async function isActiveMember(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  businessId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('business_members')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  return !!data;
}

// ============================================================================
// GET - Fetch available slots
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const staffId = searchParams.get('staffId');
    const businessId = searchParams.get('businessId');

    if (!date || !serviceId || !businessId) {
      return NextResponse.json(
        { error: 'Parametri mancanti: date, serviceId, businessId sono obbligatori' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Formato data non valido. Usa YYYY-MM-DD' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }
    if (!(await isActiveMember(supabase, user.id, businessId))) {
      return NextResponse.json({ error: 'Non hai accesso a questo business' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;

    const result = await getBookableSlots(admin, {
      businessId,
      serviceId,
      staffId: staffId || null,
      date,
      onlineOnly: false,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      date,
      service: {
        id: result.loaded.service.id,
        name: result.loaded.service.name,
        duration: result.loaded.service.duration_minutes,
      },
      staffId: staffId || null,
      workstations: result.loaded.business.workstations,
      totalSlots: result.slots.length,
      slots: result.slots,
    });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo della disponibilità' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Validate a specific slot before booking
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, serviceId, staffId, businessId } = body;

    if (!date || !time || !serviceId || !businessId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }
    if (!(await isActiveMember(supabase, user.id, businessId))) {
      return NextResponse.json({ error: 'Non hai accesso a questo business' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;

    const validation = await validateAppointment(admin, {
      businessId,
      serviceId,
      staffId: staffId || null,
      date,
      time,
      onlineOnly: false,
    });

    return NextResponse.json({
      available: validation.ok,
      reason: validation.ok ? undefined : validation.reason,
      resolvedStaffId: validation.ok ? validation.resolvedStaffId : null,
    });
  } catch (error) {
    console.error('Slot validation error:', error);
    return NextResponse.json(
      { error: 'Errore nella validazione' },
      { status: 500 }
    );
  }
}
