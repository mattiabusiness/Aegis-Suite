// ============================================================================
// AEGIS BEAUTY - STAFF REGISTER API
// File: apps/aegis-beauty/app/api/staff/register/route.ts
// Creates staff account via admin client (email_confirm: true) so no
// confirmation email is sent — same pattern as customer invite flow.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, staffId, termsAcceptedAt } = await request.json();

    if (!email || !password || !staffId) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }
    if (typeof email !== 'string' || email.length > 254) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password troppo corta (min 6 caratteri)' }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify staffId exists and is not yet linked — prevents abuse
    const { data: staffCheck } = await admin
      .from('staff')
      .select('id, business_id')
      .eq('id', staffId)
      .is('user_id', null)
      .single();

    if (!staffCheck) {
      return NextResponse.json({ error: 'Invito non valido o già utilizzato' }, { status: 400 });
    }

    // Create user with email already confirmed — no confirmation email sent.
    // Staff linking (user_id, business_member, profile) is handled by
    // /api/staff/setup called client-side after signInWithPassword.
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
        phone: phone || null,
        staff_id: staffId,
        invite_type: 'staff',
        terms_accepted_at: termsAcceptedAt || null,
      },
    });

    if (createError || !created.user) {
      console.error('[staff/register] createUser error:', createError);
      return NextResponse.json(
        { error: createError?.message || 'Errore creazione account' },
        { status: 400 }
      );
    }

    // Inline setup — admin client bypasses RLS, no session cookie needed.
    // Link staff.user_id first (sequential, then parallel for the rest).
    await admin.from('staff').update({ user_id: created.user.id }).eq('id', staffId);

    await Promise.all([
      admin.from('business_members').insert({
        user_id: created.user.id,
        business_id: staffCheck.business_id,
        role: 'staff',
        is_active: true,
      }),
      admin.from('profiles').upsert({
        id: created.user.id,
        email: created.user.email,
        full_name: fullName || '',
        phone: phone || null,
      }, { onConflict: 'id' }),
    ]);

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error('[staff/register] unexpected error:', e);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
