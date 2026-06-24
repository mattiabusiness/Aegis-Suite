// ============================================================================
// AEGIS BEAUTY - CUSTOMER PROVISION API
// File: apps/aegis-beauty/app/api/customer/provision/route.ts
// Crea/linka profilo + record `customers` SUBITO dopo la registrazione,
// senza dipendere dalla conferma email.
//
// Idempotente. No-op se non c'è sessione attiva (es. "Confirm email" ON =>
// la creazione la fa /auth/callback come prima). Riproduce ESATTAMENTE la
// logica del callback per self-registration cliente, così i due percorsi
// restano coerenti e non generano doppioni.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Identità: leggi l'utente autenticato dai cookie (solo lui può provisionare sé stesso).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // Nessuna sessione => conferma email attiva: provisiona il callback. No-op qui.
  if (!user) return NextResponse.json({ success: true, skipped: 'no-session' });

  const slug = (user.user_metadata?.business_slug as string | undefined)?.trim();
  if (!slug) return NextResponse.json({ success: true, skipped: 'no-slug' });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { data: business } = await admin
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (!business?.id) return NextResponse.json({ success: true, skipped: 'no-business' });

    // 1. Profilo (idempotente) — stesso RPC usato dal callback.
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await admin.rpc('create_profile', {
        user_id: user.id,
        user_email: user.email,
        user_full_name: (user.user_metadata?.full_name as string) || '',
        user_phone: (user.user_metadata?.phone as string) || null,
      });
    }

    // 2. Record customers (idempotente): linka se già importato dal gestore, altrimenti crea.
    const { data: existing } = await admin
      .from('customers')
      .select('id, user_id')
      .eq('business_id', business.id)
      .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
      .maybeSingle();

    if (existing && !existing.user_id) {
      await admin
        .from('customers')
        .update({ user_id: user.id, is_active: true })
        .eq('id', existing.id);
    } else if (!existing) {
      await admin.from('customers').insert({
        business_id: business.id,
        user_id:     user.id,
        full_name:   profile?.full_name || (user.user_metadata?.full_name as string) || 'Cliente',
        email:       user.email || '',
        phone:       profile?.phone || (user.user_metadata?.phone as string) || null,
        source:      'online',
        is_active:   true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[customer/provision] error:', e);
    // Non-critical: la registrazione è comunque andata a buon fine.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
