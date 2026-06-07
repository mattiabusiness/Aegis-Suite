// ============================================================================
// AEGIS BEAUTY - API CREATE APPOINTMENT (Dashboard — gestore/staff)
// File: apps/aegis-beauty/app/api/appointments/create/route.ts
// Handles: Create appointment + Create new customer + Send invite email
//
// Validation: validateAppointment() enforces the SAME rules as the customer
// flow (hours/closures/staff/capacity) — the gestore is hard-blocked on
// conflicts (no override). create_appointment_safe() inserts atomically.
// onlineOnly = false → the gestore may book any active staff, including ones
// that don't accept online bookings.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerSupabaseClient,
  getCurrentUser,
  createAdminSupabaseClient,
  validateAppointment,
} from '@aegis/core';

// ============================================================================
// TYPES
// ============================================================================

interface CreateAppointmentRequest {
  customerId: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  isNewCustomer: boolean;
  sendInvite: boolean;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  notes: string;
  businessId: string;
  includeShampoo?: boolean;
}

// ============================================================================
// POST /api/appointments/create
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerSupabaseClient(cookieStore) as any;

    // Verify user is authenticated
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Parse request body
    const body: CreateAppointmentRequest = await request.json();
    const {
      customerId, customerFirstName, customerLastName, customerPhone, customerEmail,
      isNewCustomer, sendInvite, serviceId, staffId, date, time, notes, businessId, includeShampoo,
    } = body;

    // Validate required fields (staffId is optional — null means "first available")
    if (!serviceId || !date || !time || !businessId) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    // Verify user has access to this business
    const { data: memberCheck } = await supabase
      .from('business_members')
      .select('id, role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!memberCheck) {
      return NextResponse.json({ error: 'Non hai accesso a questo business' }, { status: 403 });
    }

    // After membership is confirmed, use admin client for all DB ops.
    // Security is guaranteed: user.id and businessId are both server-validated above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;

    // ========================================================================
    // STEP 1: Validate availability (hours/closures/staff/capacity).
    //         Gestore is blocked on conflicts exactly like the customer.
    // ========================================================================

    const validation = await validateAppointment(admin, {
      businessId,
      serviceId,
      staffId: staffId || null,
      date,
      time,
      onlineOnly: false,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: validation.status });
    }

    const { resolvedStaffId, service, startTime, endTime } = validation;

    // ========================================================================
    // STEP 2: Handle customer (existing or new)
    // ========================================================================

    // Verify provided customerId belongs to this business (prevents cross-tenant access).
    if (!isNewCustomer && customerId) {
      const { data: customerOwnership } = await admin
        .from('customers')
        .select('id')
        .eq('id', customerId)
        .eq('business_id', businessId)
        .single();
      if (!customerOwnership) {
        return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
      }
    }

    let finalCustomerId = customerId;

    if (isNewCustomer) {
      if (!customerFirstName || !customerLastName || !customerPhone || !customerEmail) {
        return NextResponse.json({ error: 'Dati cliente incompleti' }, { status: 400 });
      }
      if (customerFirstName.length > 100 || customerLastName.length > 100) {
        return NextResponse.json({ error: 'Nome o cognome troppo lungo (max 100 caratteri)' }, { status: 400 });
      }
      if (customerPhone.length > 30) {
        return NextResponse.json({ error: 'Numero di telefono non valido' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
      }

      // Check if customer with same email already exists
      const { data: existingCustomer } = await admin
        .from('customers')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', customerEmail.toLowerCase())
        .single();

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        const fullName = `${customerFirstName} ${customerLastName}`.trim();

        const { data: newCustomer, error: customerError } = await admin
          .from('customers')
          .insert({
            business_id: businessId,
            full_name: fullName,
            email: customerEmail.toLowerCase(),
            phone: customerPhone,
            source: 'manual',
            is_active: true,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          console.error('Error creating customer:', customerError);
          return NextResponse.json({ error: 'Errore nella creazione del cliente' }, { status: 500 });
        }

        finalCustomerId = newCustomer.id;

        // Send invite email if requested
        if (sendInvite) {
          try {
            const { data: business } = await admin
              .from('businesses')
              .select('name, slug')
              .eq('id', businessId)
              .single();

            const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
              customerEmail.toLowerCase(),
              {
                data: {
                  full_name: fullName,
                  phone: customerPhone,
                  invited_by_business: businessId,
                  business_name: business?.name || 'Salone',
                  business_slug: business?.slug || '',
                  customer_id: finalCustomerId,
                },
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://aegisbeauty.app'}/auth/callback?type=invite`,
              }
            );

            if (inviteError) {
              console.error('Error sending invite:', inviteError);
            } else {
              await admin
                .from('customers')
                .update({ invited_at: new Date().toISOString() })
                .eq('id', finalCustomerId);
            }
          } catch (inviteErr) {
            console.error('Invite error:', inviteErr);
          }
        }
      }
    }

    if (!finalCustomerId) {
      return NextResponse.json({ error: 'Cliente mancante' }, { status: 400 });
    }

    // ========================================================================
    // STEP 3: Create the appointment atomically (overlap + capacity guaranteed).
    // ========================================================================

    const { data: newApptId, error: rpcError } = await admin.rpc('create_appointment_safe', {
      p_business_id:     businessId,
      p_staff_id:        resolvedStaffId,
      p_customer_id:     finalCustomerId,
      p_start:           startTime.toISOString(),
      p_end:             endTime.toISOString(),
      p_service_id:      service.id,
      p_service_name:    service.name,
      p_duration:        service.duration_minutes,
      p_price:           service.price,
      p_status:          'confirmed',
      p_source:          'dashboard',
      p_booked_online:   false,
      p_notes:           notes ? String(notes).slice(0, 1000) : null,
      p_include_shampoo: includeShampoo === true,
      p_exclude_id:      null,
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      // Exclusion constraint (appointments_no_staff_overlap) → physical overlap guard
      if (msg.includes('STAFF_BUSY') || rpcError.code === '23P01' || msg.includes('appointments_no_staff_overlap')) {
        return NextResponse.json({ error: 'L\'operatore è già occupato in questo orario.' }, { status: 409 });
      }
      if (msg.includes('NO_WORKSTATION')) {
        return NextResponse.json({ error: 'Tutte le postazioni sono occupate in questo orario.' }, { status: 409 });
      }
      console.error('[appointments/create] rpc error:', rpcError);
      return NextResponse.json({ error: 'Errore nella creazione dell\'appuntamento' }, { status: 500 });
    }

    const appointmentId = newApptId as string;

    // ========================================================================
    // STEP 4: Return the created appointment (shape expected by the calendar)
    // ========================================================================

    const { data: fullAppointment } = await admin
      .from('appointments')
      .select(`
        id, start_time, end_time, status, notes,
        customer:customers(id, full_name),
        staff:staff(id, full_name, color)
      `)
      .eq('id', appointmentId)
      .single();

    return NextResponse.json({
      success: true,
      appointment: {
        id: fullAppointment?.id ?? appointmentId,
        startTime: fullAppointment?.start_time ?? startTime.toISOString(),
        endTime: fullAppointment?.end_time ?? endTime.toISOString(),
        status: fullAppointment?.status ?? 'confirmed',
        notes: fullAppointment?.notes ?? null,
        customerName: fullAppointment?.customer?.full_name,
        staffName: fullAppointment?.staff?.full_name,
        staffColor: fullAppointment?.staff?.color,
        serviceName: service.name,
      },
      customerId: finalCustomerId,
      inviteSent: isNewCustomer && sendInvite,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
