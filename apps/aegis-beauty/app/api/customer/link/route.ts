// ============================================================================
// AEGIS BEAUTY - CUSTOMER LINK API
// File: apps/aegis-beauty/app/api/customer/link/route.ts
// Links customers.user_id after invite registration is completed.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Verify the caller is authenticated
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
  const { customerId } = body;
  if (!customerId || typeof customerId !== 'string') {
    return NextResponse.json({ error: 'customerId mancante' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Verify ownership: the customer record's email must match the authenticated user's email.
  // Prevents an attacker from linking their user_id to a foreign customer record
  // by guessing a valid customerId with user_id = null.
  const { data: customerCheck } = await supabaseAdmin
    .from('customers')
    .select('id, email')
    .eq('id', customerId)
    .is('user_id', null)
    .single();

  if (!customerCheck || customerCheck.email?.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  }

  // Only link if user_id is still null — prevents overwriting an existing link
  const { error } = await supabaseAdmin
    .from('customers')
    .update({ user_id: user.id })
    .eq('id', customerId)
    .is('user_id', null);

  if (error) {
    console.error('[customer/link] error:', error);
    return NextResponse.json({ error: 'Errore durante il collegamento' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ============================================================================
// PATCH — il cliente aggiorna la PROPRIA scheda (preferenze + sync nome/telefono).
// La scrittura su `customers` è RLS admin-only, quindi passa da qui (admin client)
// dopo aver verificato che la scheda appartenga all'utente loggato. Colonne limitate.
// ============================================================================

export async function PATCH(request: NextRequest) {
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

  const body = await request.json() as {
    customerId?: string;
    preferences?: string;
    fullName?: string;
    phone?: string;
  };
  const { customerId, preferences, fullName, phone } = body;
  if (!customerId || typeof customerId !== 'string') {
    return NextResponse.json({ error: 'customerId mancante' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Ownership: la scheda deve appartenere all'utente loggato (no IDOR).
  const { data: own } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('user_id', user.id)
    .single();

  if (!own) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  }

  // Solo colonne sicure — MAI total_spent/notes/tags/is_active ecc.
  const patch: Record<string, unknown> = {};
  if (typeof preferences === 'string') patch.preferences = preferences;
  if (typeof fullName === 'string' && fullName.trim()) patch.full_name = fullName.trim();
  if (typeof phone === 'string') patch.phone = phone.trim() || null;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: true });
  }
  patch.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('customers')
    .update(patch)
    .eq('id', customerId)
    .eq('user_id', user.id);

  if (error) {
    console.error('[customer/link PATCH] error:', error);
    return NextResponse.json({ error: 'Errore durante il salvataggio' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
