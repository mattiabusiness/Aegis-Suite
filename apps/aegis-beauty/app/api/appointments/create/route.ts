// ============================================================================
// AEGIS BEAUTY - API CREATE APPOINTMENT
// File: apps/aegis-beauty/app/api/appointments/create/route.ts
// Handles: Create appointment + Create new customer + Send invite email
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser, createAdminSupabaseClient } from '@aegis/core';
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
}

// ============================================================================
// POST /api/appointments/create
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
      isNewCustomer, sendInvite, serviceId, staffId, date, time, notes, businessId,
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
    
    // ========================================================================
    // STEP 1: Get service details (for duration)
    // ========================================================================
    
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }
    
    // ========================================================================
    // STEP 2: Handle customer (existing or new)
    // ========================================================================
    
    let finalCustomerId = customerId;
    
    if (isNewCustomer) {
      if (!customerFirstName || !customerLastName || !customerPhone || !customerEmail) {
        return NextResponse.json({ error: 'Dati cliente incompleti' }, { status: 400 });
      }
      
      // Check if customer with same email already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', customerEmail.toLowerCase())
        .single();
      
      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        const fullName = `${customerFirstName} ${customerLastName}`.trim();
        
        const { data: newCustomer, error: customerError } = await supabase
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
            const adminClient = createAdminSupabaseClient();
            
            const { data: business } = await supabase
              .from('businesses')
              .select('name, slug')
              .eq('id', businessId)
              .single();
            
            // ================================================================
            // MODIFICATO: Aggiunto customer_id e business_slug ai metadata
            // ================================================================
            const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
              customerEmail.toLowerCase(),
              {
                data: {
                  full_name: fullName,
                  phone: customerPhone,
                  invited_by_business: businessId,
                  business_name: business?.name || 'Salone',
                  business_slug: business?.slug || '',      // AGGIUNTO
                  customer_id: finalCustomerId,              // AGGIUNTO
                },
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=invite`,
              }
            );
            
            if (inviteError) {
              console.error('Error sending invite:', inviteError);
            }
          } catch (inviteErr) {
            console.error('Invite error:', inviteErr);
          }
        }
      }
    }
    
    // ========================================================================
    // STEP 3: Calculate appointment times
    // ========================================================================
    
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
    
    // ========================================================================
    // STEP 4: Auto-assign staff if not specified ("Nessuna preferenza")
    // ========================================================================

    let finalStaffId: string | null = staffId || null;

    if (!finalStaffId) {
      // Auto-assign: find first staff who (1) can do the service AND (2) is free at this slot.
      // If no one qualifies → return error (do NOT fall through to RPC auto-assign).

      const { data: eligibleStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true) as { data: Array<{ id: string }> | null };

      if (!eligibleStaff || eligibleStaff.length === 0) {
        return NextResponse.json({ error: 'Nessuno staff disponibile' }, { status: 409 });
      }

      // Step A: which staff can do this service?
      // Every staff always has explicit rows in staff_services (auto-assigned on creation).
      // So we just check who has THIS service listed.
      const allStaffIds = eligibleStaff.map(s => s.id);

      const { data: serviceLinks } = await supabase
        .from('staff_services')
        .select('staff_id')
        .in('staff_id', allStaffIds)
        .eq('service_id', serviceId) as { data: Array<{ staff_id: string }> | null };

      const staffWhoCanDoService = new Set((serviceLinks || []).map(r => r.staff_id));

      const candidates = eligibleStaff.filter(s => staffWhoCanDoService.has(s.id));

      if (candidates.length === 0) {
        return NextResponse.json({ error: 'Nessuno staff può eseguire questo servizio' }, { status: 409 });
      }

      // Step B: among candidates, find the first free in this time slot
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('staff_id')
        .eq('business_id', businessId)
        .in('staff_id', candidates.map(s => s.id))
        .neq('status', 'cancelled')
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString()) as { data: Array<{ staff_id: string }> | null };

      const busyIds = new Set((conflicts || []).map(c => c.staff_id));
      const picked = candidates.find(s => !busyIds.has(s.id));

      if (!picked) {
        return NextResponse.json({ error: 'Nessuno staff disponibile in questo orario per il servizio selezionato' }, { status: 409 });
      }

      finalStaffId = picked.id;
    }

    // ========================================================================
    // STEP 5: Create appointment
    // ========================================================================

    const { data: newAppt, error: insertError } = await supabase
      .from('appointments')
      .insert({
        business_id: businessId,
        staff_id:    finalStaffId,
        customer_id: finalCustomerId,
        start_time:  startTime.toISOString(),
        end_time:    endTime.toISOString(),
        status:      'confirmed',
        notes:       notes || null,
        source:      'dashboard',
      })
      .select('id')
      .single();

    if (insertError || !newAppt) {
      console.error('[appointments/create] insert error:', insertError);
      return NextResponse.json({ error: 'Errore nella creazione dell\'appuntamento' }, { status: 500 });
    }

    const appointmentId = (newAppt as { id: string }).id;
    
    // ========================================================================
    // STEP 5: Create appointment_services link
    // ========================================================================
    
    await supabase
      .from('appointment_services')
      .insert({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_name: service.name,
        duration_minutes: service.duration_minutes,
        price: service.price,
        display_order: 0,
      });
    
    // ========================================================================
    // STEP 6: Return success
    // ========================================================================
    
    const { data: fullAppointment } = await supabase
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
        id: fullAppointment?.id,
        startTime: fullAppointment?.start_time,
        endTime: fullAppointment?.end_time,
        status: fullAppointment?.status,
        notes: fullAppointment?.notes,
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