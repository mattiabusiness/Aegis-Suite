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

    // Fetch business name for the invite page subtitle
    let businessName = '';
    const { data: businessData } = await supabaseAdmin
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single();
    if (businessData) businessName = businessData.name;

    // Build fallback QR URL — always available regardless of invite outcome
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fallbackUrl = new URL(`${baseUrl}/register`);
    fallbackUrl.searchParams.set('staff_invite', 'true');
    fallbackUrl.searchParams.set('email', email);
    fallbackUrl.searchParams.set('name', fullName);
    fallbackUrl.searchParams.set('phone', phone || '');
    fallbackUrl.searchParams.set('staff_id', staffId);
    fallbackUrl.searchParams.set('business_slug', businessSlug || '');
    fallbackUrl.searchParams.set('business_name', businessName);
    fallbackUrl.searchParams.set('role', role || 'employee');

    // Return QR URL — no email sent here.
    // The confirmation email is triggered automatically by Supabase when the staff
    // fills in the pre-compiled form and clicks "Registrati".
    return NextResponse.json({
      success: true,
      inviteUrl: fallbackUrl.toString(),
    });

  } catch (error) {
    console.error('Staff invite error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
