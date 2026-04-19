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
