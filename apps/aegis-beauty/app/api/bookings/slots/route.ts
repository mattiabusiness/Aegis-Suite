// ============================================================================
// AEGIS BEAUTY - BOOKING SLOTS API (Customer-facing)
// File: apps/aegis-beauty/app/api/bookings/slots/route.ts
//
// GET /api/bookings/slots?date=YYYY-MM-DD&serviceId=xxx&staffId=xxx&businessId=xxx
//
// Requires: authenticated customer session
// Returns: AvailableSlot[] via the shared loader getBookableSlots() — the SAME
// engine + data the booking validator uses, so "slots shown" === "slots bookable".
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser, getBookableSlots, parseAsRomeTime } from '@aegis/core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date       = searchParams.get('date');
    const serviceId  = searchParams.get('serviceId');
    const staffId    = searchParams.get('staffId');
    const businessId = searchParams.get('businessId');

    if (!date || !serviceId || !businessId) {
      return NextResponse.json(
        { error: 'Parametri mancanti: date, serviceId, businessId obbligatori' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Formato data non valido. Usa YYYY-MM-DD' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase    = createServerSupabaseClient(cookieStore);
    const user        = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const result = await getBookableSlots(supabase, {
      businessId,
      serviceId,
      staffId: staffId || null,
      date,
      onlineOnly: true,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Hide slots already in the past (relevant only when date === today, Rome time).
    const now = Date.now();
    const slots = result.slots.filter(s => parseAsRomeTime(date, s.time).getTime() > now);

    return NextResponse.json({ slots }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('[bookings/slots] error:', error);
    return NextResponse.json({ error: 'Errore nel calcolo disponibilità' }, { status: 500 });
  }
}
