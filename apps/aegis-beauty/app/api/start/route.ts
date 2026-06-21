// ============================================================================
// AEGIS BEAUTY - GET /api/start
// Risolve la destinazione del PWA start_url in base al ruolo:
// Gestore → /dashboard | Cliente → /<slug>/account | Guest → /login
// Chiamato da /start (client) mentre mostra la splash.
// ============================================================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@aegis/core';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const supabase = createServerSupabaseClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: '/login' });

  // Gestore: ha un business_member attivo
  const { data: membership } = await supabase
    .from('business_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (membership) return NextResponse.json({ url: '/dashboard' });

  // Cliente: ultimo business prenotato
  const { data: lastApptRaw } = await supabase
    .from('appointments')
    .select('businesses ( slug )')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastAppt = lastApptRaw as { businesses: { slug: string } | { slug: string }[] | null } | null;
  const business = lastAppt?.businesses;
  const slug = Array.isArray(business) ? business[0]?.slug : business?.slug;

  if (slug) return NextResponse.json({ url: `/${slug}/account` });

  return NextResponse.json({ url: '/login' });
}
