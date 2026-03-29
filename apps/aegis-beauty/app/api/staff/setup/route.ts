// ============================================================================
// AEGIS BEAUTY - STAFF SETUP API
// File: apps/aegis-beauty/app/api/staff/setup/route.ts
// Called by dashboard layout when business_members row is missing for a user.
// Uses admin client throughout to bypass any RLS dependency.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Authenticated client — only used to verify the current user's identity
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
    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Admin client — bypasses RLS for all DB operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find staff record by email (admin bypasses RLS — safe because email is verified by auth)
    const { data: staffRecord, error: staffErr } = await adminClient
      .from('staff')
      .select('id, business_id')
      .eq('email', user.email)
      .single();

    console.log('[Setup API] email:', user.email, '| staffRecord:', staffRecord, '| err:', staffErr?.message);

    if (!staffRecord?.business_id) {
      return NextResponse.json({ error: 'Staff non trovato' }, { status: 404 });
    }

    // Link staff.user_id
    await adminClient.from('staff').update({ user_id: user.id }).eq('id', staffRecord.id);

    // Create business_members row — ignore if already exists (idempotent)
    const { error: memberErr } = await adminClient.from('business_members').insert({
      user_id: user.id,
      business_id: staffRecord.business_id,
      role: 'staff',
      is_active: true,
    });
    if (memberErr && !memberErr.message.includes('duplicate')) {
      console.error('[Setup API] business_members insert error:', memberErr.message);
    }

    // Upsert profile
    await adminClient.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || null,
    }, { onConflict: 'id' });

    return NextResponse.json({
      businessId: staffRecord.business_id,
      role: 'staff',
    });

  } catch (e) {
    console.error('[Setup API] error:', e);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
