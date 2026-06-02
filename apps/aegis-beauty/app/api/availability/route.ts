// ============================================================================
// AEGIS BEAUTY - AVAILABILITY API (Dashboard)
// File: apps/aegis-beauty/app/api/availability/route.ts
//
// GET  /api/availability?date=YYYY-MM-DD&serviceId=xxx&staffId=xxx&businessId=xxx
//      → available slots (gestore view: any active staff, onlineOnly = false).
// POST /api/availability  → validate a specific slot before booking.
//
// Both delegate to the shared engine in @aegis/core so the dashboard and the
// customer flow stay perfectly in sync.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerSupabaseClient,
  getCurrentUser,
  getBookableSlots,
  validateAppointment,
} from '@aegis/core';

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
      return NextResponse.json(
        { error: 'Formato data non valido. Usa YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const result = await getBookableSlots(supabase, {
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

    const validation = await validateAppointment(supabase, {
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
