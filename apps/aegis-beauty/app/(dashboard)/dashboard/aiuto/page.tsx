// ============================================================================
// AEGIS BEAUTY - AIUTO PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/aiuto/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser, getCurrentProfile } from '@aegis/core';
import { AiutoContent } from './HelpContent';

export default async function AiutoPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentProfile(supabase);

  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, businesses(name)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string; businesses: { name: string } | null } | null };

  return (
    <AiutoContent
      userName={profile?.full_name || user.email || ''}
      userEmail={user.email || ''}
      businessName={businessMember?.businesses?.name || ''}
      businessId={businessMember?.business_id || ''}
    />
  );
}