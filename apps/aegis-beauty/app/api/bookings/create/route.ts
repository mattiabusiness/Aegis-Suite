// ============================================================================
// AEGIS BEAUTY - BOOKING CREATE API (Customer self-booking)
// File: apps/aegis-beauty/app/api/bookings/create/route.ts
//
// POST /api/bookings/create
// Requires: authenticated customer session
// Creates appointment for the logged-in customer.
//
// Validation: validateAppointment() re-checks hours/closures/staff/capacity
// (same rules the slot list uses), then create_appointment_safe() inserts
// atomically so two simultaneous requests can never double-book.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerSupabaseClient,
  getCurrentUser,
  createAdminSupabaseClient,
  validateAppointment,
} from '@aegis/core';
import { notify } from '@/lib/notify';
import type { PushPayload } from '@aegis/core';

interface CreateBookingBody {
  businessId:      string;
  serviceId:       string;
  staffId:         string | null;
  date:            string;
  time:            string;
  customerNotes?:  string;
  includeShampoo?: boolean;
  /** When rescheduling: id of the appointment being moved (will be cancelled). */
  rescheduleId?:   string | null;
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
    const { businessId, serviceId, staffId, date, time, customerNotes: rawNotes, includeShampoo, rescheduleId } = body;
    const customerNotes = rawNotes ? String(rawNotes).slice(0, 1000) : undefined;

    if (!businessId || !serviceId || !date || !time) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    // Use admin client for all DB ops — bypasses RLS for customer reads/writes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;

    // ========================================================================
    // STEP 1: Validate availability (business/service/staff/hours/capacity).
    // This mirrors exactly what the slot list offered, so a valid slot passes.
    // ========================================================================

    const validation = await validateAppointment(admin, {
      businessId,
      serviceId,
      staffId: staffId || null,
      date,
      time,
      onlineOnly: true,
      excludeAppointmentId: rescheduleId || null,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: validation.status });
    }

    const { resolvedStaffId, service, startTime, endTime } = validation;

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
    // STEP 3: Reschedule — verify the appointment being moved belongs to this
    //         customer before allowing the RPC to cancel it.
    // ========================================================================

    if (rescheduleId) {
      const { data: oldAppt } = await admin
        .from('appointments')
        .select('id')
        .eq('id', rescheduleId)
        .eq('business_id', businessId)
        .eq('customer_id', customerId)
        .neq('status', 'cancelled')
        .maybeSingle();

      if (!oldAppt) {
        return NextResponse.json({ error: 'Appuntamento da spostare non trovato' }, { status: 404 });
      }
    }

    // ========================================================================
    // STEP 4: Create the appointment atomically (overlap + capacity guaranteed).
    // ========================================================================

    const { data: newApptId, error: rpcError } = await admin.rpc('create_appointment_safe', {
      p_business_id:     businessId,
      p_staff_id:        resolvedStaffId,
      p_customer_id:     customerId,
      p_start:           startTime.toISOString(),
      p_end:             endTime.toISOString(),
      p_service_id:      service.id,
      p_service_name:    service.name,
      p_duration:        service.duration_minutes,
      p_price:           service.price,
      p_status:          'confirmed',
      p_source:          'online',
      p_booked_online:   true,
      p_notes:           customerNotes || null,
      p_include_shampoo: includeShampoo === true,
      p_exclude_id:      rescheduleId || null,
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('STAFF_BUSY') || rpcError.code === '23P01' || msg.includes('appointments_no_staff_overlap')) {
        return NextResponse.json({ error: 'Questo orario è appena stato preso. Scegli un altro slot.' }, { status: 409 });
      }
      if (msg.includes('NO_WORKSTATION')) {
        return NextResponse.json({ error: 'Tutte le postazioni sono occupate in questo orario.' }, { status: 409 });
      }
      console.error('[bookings/create] rpc error:', rpcError);
      return NextResponse.json({ error: 'Errore nella creazione dell\'appuntamento' }, { status: 500 });
    }

    const appointmentId = newApptId as string;

    // ========================================================================
    // STEP 5: Notify gestore of new booking (fire-and-forget)
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
          body: `${service.name} — ${dateLabel} alle ${startLabel}`,
          url: '/dashboard/calendario',
          actions: [{ action: 'view', title: 'Vedi calendario' }],
          tag: `new-booking-${appointmentId}`,
        };

        await notify(ownerRow.user_id, payload, admin);

        // Save in-app notification for the dashboard bell
        await admin.from('notifications').insert({
          business_id: businessId,
          user_id: ownerRow.user_id,
          type: 'info',
          title: payload.title,
          message: payload.body,
          data: { url: '/dashboard/calendario' },
        });
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
