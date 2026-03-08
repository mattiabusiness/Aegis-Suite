// ============================================================================
// AEGIS BEAUTY - STAFF INVITE API
// File: apps/aegis-beauty/app/api/staff/invite/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// POST - SEND STAFF INVITE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Instantiate inside the handler so env vars are read at runtime, not build time
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const body = await request.json();
    const { staffId, email, fullName, phone, businessId, businessSlug, role } = body;

    // Validate required fields
    if (!staffId || !email || !fullName || !businessId) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Build redirect URL with staff metadata
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/auth/callback?type=staff_invite`;

    // Send invite via Supabase
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          phone: phone || '',
          staff_id: staffId,
          business_id: businessId,
          business_slug: businessSlug,
          role: role || 'employee',
          invite_type: 'staff',
        },
        redirectTo: redirectUrl,
      }
    );

    if (inviteError) {
      console.error('Supabase invite error:', inviteError);
      
      // Check if user already exists
      if (inviteError.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Questa email è già registrata. L\'utente può accedere direttamente.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: inviteError.message || 'Errore nell\'invio dell\'invito' },
        { status: 500 }
      );
    }

    // Build QR code URL - this is what staff will scan
    // It points to login page which will handle the invite token from email
    const qrUrl = new URL(`${baseUrl}/register`);
    qrUrl.searchParams.set('staff_invite', 'true');
    qrUrl.searchParams.set('email', email);
    qrUrl.searchParams.set('name', fullName);
    qrUrl.searchParams.set('phone', phone || '');
    qrUrl.searchParams.set('staff_id', staffId);
    qrUrl.searchParams.set('business_slug', businessSlug || '');
    qrUrl.searchParams.set('role', role || 'employee');

    return NextResponse.json({
      success: true,
      inviteUrl: qrUrl.toString(),
      message: 'Invito inviato con successo',
    });

  } catch (error) {
    console.error('Staff invite error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}