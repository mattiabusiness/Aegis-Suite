// ============================================================================
// AEGIS BEAUTY - BOOKING CREATE API (Customer self-booking)
// File: apps/aegis-beauty/app/api/bookings/create/route.ts
//
// POST /api/bookings/create
// Requires: authenticated customer session
// Creates appointment for the logged-in customer.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  createServerSupabaseClient,
  getCurrentUser,
} from '@aegis/core';
import { notify } from '@/lib/notify';
import type { PushPayload } from '@aegis/core';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface CreateBookingBody {
  businessId:     string;
  serviceId:      string;
  staffId:        string | null;
  date:           string;
  time:           string;
  customerNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerSupabaseClient(cookieStore) as any;
    const user     = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body: CreateBookingBody = await request.json();
    const { businessId, serviceId, staffId, date, time, customerNotes } = body;

    if (!businessId || !serviceId || !date || !time) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    // Use admin client for all DB ops — bypasses RLS for customer reads/writes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    // ========================================================================
    // STEP 1: Service details
    // ========================================================================

    const { data: service, error: serviceError } = await admin
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', serviceId)
      .eq('business_id', businessId)
      .single();

    if (serviceError || !service) {
      console.error('[bookings/create] service lookup failed:', serviceError);
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    // ========================================================================
    // STEP 2: Find or create customer record
    // NOTE: Look up WITHOUT is_active filter — an inactive record must be
    //       reactivated rather than causing a UNIQUE constraint violation on INSERT.
    // ========================================================================

    const { data: existingCustomer } = await admin
      .from('customers')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      customerId = (existingCustomer as { id: string }).id;

      // Reactivate if the record was deactivated
      if (!(existingCustomer as { is_active: boolean }).is_active) {
        await admin.from('customers').update({ is_active: true }).eq('id', customerId);
      }
    } else {
      // Fetch user profile for name/email/phone
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .maybeSingle();

      const { data: newCustomer, error: createError } = await admin
        .from('customers')
        .insert({
          business_id: businessId,
          user_id:     user.id,
          full_name:   (profile as { full_name?: string } | null)?.full_name || 'Cliente',
          email:       (profile as { email?: string } | null)?.email || user.email || '',
          phone:       (profile as { phone?: string } | null)?.phone || null,
          source:      'online',
          is_active:   true,
        })
        .select('id')
        .single();

      if (createError || !newCustomer) {
        console.error('[bookings/create] customer create error:', createError);
        return NextResponse.json(
          { error: `Errore creazione cliente: ${createError?.message ?? 'sconosciuto'}` },
          { status: 500 }
        );
      }

      customerId = (newCustomer as { id: string }).id;
    }

    // ========================================================================
    // STEP 3: Calculate times
    // ========================================================================

    const startTime = new Date(`${date}T${time}:00`);
    const endTime   = new Date(startTime.getTime() + (service as { duration_minutes: number }).duration_minutes * 60000);

    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: 'Data o orario non valido' }, { status: 400 });
    }

    // ========================================================================
    // STEP 4: Resolve staff — use provided staffId, or auto-assign
    // ========================================================================

    let finalStaffId: string | null = staffId || null;

    if (!finalStaffId) {
      const [{ data: activeStaff }, { data: serviceLinks }] = await Promise.all([
        admin
          .from('staff')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true) as Promise<{ data: Array<{ id: string }> | null }>,
        admin
          .from('staff_services')
          .select('staff_id')
          .eq('service_id', serviceId) as Promise<{ data: Array<{ staff_id: string }> | null }>,
      ]);

      const eligibleStaff = activeStaff ?? [];

      if (eligibleStaff.length === 0) {
        return NextResponse.json({ error: 'Nessuno staff disponibile' }, { status: 409 });
      }

      const canDoService = new Set((serviceLinks ?? []).map(r => r.staff_id));
      // Mirror availability engine: empty map = all staff can do this service
      const candidates = canDoService.size === 0
        ? eligibleStaff
        : eligibleStaff.filter((s: { id: string }) => canDoService.has(s.id));

      if (candidates.length === 0) {
        return NextResponse.json({ error: 'Nessuno staff può eseguire questo servizio' }, { status: 409 });
      }

      const { data: conflicts } = await admin
        .from('appointments')
        .select('staff_id')
        .eq('business_id', businessId)
        .in('staff_id', candidates.map((s: { id: string }) => s.id))
        .neq('status', 'cancelled')
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString()) as { data: Array<{ staff_id: string }> | null };

      const busyIds = new Set((conflicts ?? []).map(c => c.staff_id));
      const picked  = candidates.find((s: { id: string }) => !busyIds.has(s.id));

      // Fallback: if all busy (rare race condition), pick first candidate anyway
      finalStaffId = ((picked ?? candidates[0]) as { id: string }).id;
    }

    // ========================================================================
    // STEP 5: Create appointment
    // ========================================================================

    const { data: newAppt, error: insertError } = await admin
      .from('appointments')
      .insert({
        business_id:    businessId,
        staff_id:       finalStaffId,
        customer_id:    customerId,
        start_time:     startTime.toISOString(),
        end_time:       endTime.toISOString(),
        status:         'confirmed',
        notes:          customerNotes || null,
        source:         'online',
        booked_online:  true,
      })
      .select('id')
      .single();

    if (insertError || !newAppt) {
      console.error('[bookings/create] appointment insert error:', insertError);
      return NextResponse.json(
        { error: `Errore creazione appuntamento: ${insertError?.message ?? 'sconosciuto'} (code: ${insertError?.code ?? '?'})` },
        { status: 500 }
      );
    }

    const appointmentId = (newAppt as { id: string }).id;

    // ========================================================================
    // STEP 6: Link service to appointment
    // ========================================================================

    const { error: serviceInsertError } = await admin.from('appointment_services').insert({
      appointment_id:   appointmentId,
      service_id:       serviceId,
      service_name:     (service as { name: string }).name,
      duration_minutes: (service as { duration_minutes: number }).duration_minutes,
      price:            (service as { price: number }).price,
      display_order:    0,
    });

    if (serviceInsertError) {
      // Non-critical: appointment is already created, just log the error
      console.error('[bookings/create] appointment_services insert error:', serviceInsertError);
    }

    // ========================================================================
    // STEP 7: Notify gestore of new booking (fire-and-forget)
    // ========================================================================

    try {
      const { data: ownerRow } = await admin
        .from('business_members')
        .select('user_id')
        .eq('business_id', businessId)
        .eq('role', 'owner')
        .eq('is_active', true)
        .single();

      const { data: businessRow } = await admin
        .from('businesses')
        .select('name, slug')
        .eq('id', businessId)
        .single();

      if (ownerRow?.user_id && businessRow) {
        const startLabel = startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const dateLabel  = startTime.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

        const payload: PushPayload = {
          title: 'Nuova prenotazione',
          body: `${(service as { name: string }).name} — ${dateLabel} alle ${startLabel}`,
          url: `/${(businessRow as { slug: string }).slug}/dashboard/calendario`,
          actions: [{ action: 'view', title: 'Vedi calendario' }],
          tag: `new-booking-${appointmentId}`,
        };

        await notify(ownerRow.user_id, payload, admin);
      }
    } catch (notifyErr) {
      // Non-critical — booking is confirmed regardless
      console.error('[bookings/create] notify gestore failed:', notifyErr);
    }

    return NextResponse.json({ success: true, appointmentId });

  } catch (error) {
    console.error('[bookings/create] unexpected error:', error);
    return NextResponse.json(
      { error: `Errore interno: ${error instanceof Error ? error.message : 'sconosciuto'}` },
      { status: 500 }
    );
  }
}
