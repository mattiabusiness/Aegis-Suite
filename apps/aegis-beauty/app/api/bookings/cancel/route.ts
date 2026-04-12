// ============================================================================
// AEGIS BEAUTY - BOOKING CANCEL API (Customer self-cancellation)
// File: apps/aegis-beauty/app/api/bookings/cancel/route.ts
//
// POST /api/bookings/cancel
// Requires: authenticated customer session
// Uses admin client to bypass RLS — ownership verified before update.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser, createAdminSupabaseClient } from '@aegis/core';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerSupabaseClient(cookieStore) as any;
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { appointmentId } = await request.json() as { appointmentId: string };

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId mancante' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;

    // Verify ownership + fetch what's needed for policy check
    const { data: appointment, error: lookupError } = await admin
      .from('appointments')
      .select('id, status, start_time, business_id, customers!inner(user_id)')
      .eq('id', appointmentId)
      .single();

    if (lookupError || !appointment) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    const ownerUserId = (appointment as { customers: { user_id: string } }).customers.user_id;
    if (ownerUserId !== user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    if ((appointment as { status: string }).status === 'cancelled') {
      return NextResponse.json({ error: 'Appuntamento già cancellato' }, { status: 409 });
    }

    // Enforce cancellation policy — check business hours limit
    const { data: business } = await admin
      .from('businesses')
      .select('cancellation_policy_hours')
      .eq('id', (appointment as { business_id: string }).business_id)
      .single();

    const policyHours: number = (business as { cancellation_policy_hours?: number } | null)?.cancellation_policy_hours ?? 0;
    if (policyHours > 0) {
      const startTime = new Date((appointment as { start_time: string }).start_time).getTime();
      const hoursUntil = (startTime - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil < policyHours) {
        return NextResponse.json(
          { error: `Non è possibile cancellare con meno di ${policyHours} ore di anticipo.` },
          { status: 422 }
        );
      }
    }

    const { error: updateError } = await admin
      .from('appointments')
      .update({
        status:       'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('[bookings/cancel] update error:', updateError);
      return NextResponse.json({ error: 'Errore durante la cancellazione' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[bookings/cancel] unexpected error:', error);
    return NextResponse.json(
      { error: `Errore interno: ${error instanceof Error ? error.message : 'sconosciuto'}` },
      { status: 500 }
    );
  }
}
