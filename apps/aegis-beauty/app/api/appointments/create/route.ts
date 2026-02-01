// ============================================================================
// AEGIS BEAUTY - API CREATE APPOINTMENT
// File: apps/aegis-beauty/app/api/appointments/create/route.ts
// Handles: Create appointment + Create new customer + Send invite email
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { createClient } from '@supabase/supabase-js';

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
// HELPER: Create Supabase Admin Client (for sending invites)
// ============================================================================

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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
    
    // Validate required fields
    if (!serviceId || !staffId || !date || !time || !businessId) {
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
            const adminClient = createAdminClient();
            
            const { data: business } = await supabase
              .from('businesses')
              .select('name, slug')
              .eq('id', businessId)
              .single();
            
            const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
              customerEmail.toLowerCase(),
              {
                data: {
                  full_name: fullName,
                  phone: customerPhone,
                  invited_by_business: businessId,
                  business_name: business?.name || 'Salone',
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
    // STEP 4: Create appointment
    // ========================================================================
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        business_id: businessId,
        customer_id: finalCustomerId,
        staff_id: staffId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
        notes: notes || null,
        booked_online: false,
        source: 'dashboard',
      })
      .select('id')
      .single();
    
    if (appointmentError || !appointment) {
      console.error('Error creating appointment:', appointmentError);
      return NextResponse.json({ error: 'Errore nella creazione dell\'appuntamento' }, { status: 500 });
    }
    
    // ========================================================================
    // STEP 5: Create appointment_services link
    // ========================================================================
    
    await supabase
      .from('appointment_services')
      .insert({
        appointment_id: appointment.id,
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
      .eq('id', appointment.id)
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