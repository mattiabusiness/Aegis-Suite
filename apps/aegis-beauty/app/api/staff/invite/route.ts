// ============================================================================
// AEGIS BEAUTY - STAFF INVITE API
// File: apps/aegis-beauty/app/api/staff/invite/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// POST - SEND STAFF INVITE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify caller is authenticated and is owner/admin of the target business
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { staffId, email, fullName, phone, businessId, businessSlug, role } = body;

    // Validate required fields
    if (!staffId || !email || !fullName || !businessId) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Verify the caller is owner/admin of this specific business
    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Instantiate inside the handler so env vars are read at runtime, not build time
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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
