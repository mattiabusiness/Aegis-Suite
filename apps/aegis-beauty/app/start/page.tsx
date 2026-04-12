// ============================================================================
// AEGIS BEAUTY - /start
// PWA start_url landing: redirect to the right place based on user role.
// Gestore → /dashboard | Cliente → /<slug>/account | Guest → /login
// ============================================================================

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@aegis/core';

export default async function StartPage() {
  const supabase = createServerSupabaseClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if gestore (has an active business_member record)
  const { data: membership } = await supabase
    .from('business_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect('/dashboard');
  }

  // Cliente: find last booked business
  const { data: lastAppt } = await supabase
    .from('appointments')
    .select('businesses ( slug )')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const business = lastAppt?.businesses;
  const slug = Array.isArray(business) ? business[0]?.slug : business?.slug;

  if (slug) {
    redirect(`/${slug}/account`);
  }

  // Fallback: no appointments yet, go to login
  redirect('/login');
}
