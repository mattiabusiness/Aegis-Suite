// ============================================================================
// AEGIS BEAUTY - STATISTICHE PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/statistiche/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { StatisticheContent } from './StatisticheContent';

export default async function StatistichePage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) redirect('/login');

  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string } | null };

  if (!businessMember) redirect('/login');

  const businessId = businessMember.business_id;

  // Fetch business, staff e services in parallelo
  const [businessResult, staffResult, servicesResult] = await Promise.all([
    supabase.from('businesses').select('roi_data, business_type').eq('id', businessId).single(),
    supabase.from('staff').select('id, full_name, color, email').eq('business_id', businessId).eq('is_active', true),
    supabase.from('services').select('id, name, price').eq('business_id', businessId),
  ]);

  const business = businessResult.data as { roi_data: Record<string, unknown> | null; business_type: string | null } | null;
  const staffData = staffResult.data as Array<{ id: string; full_name: string; color: string; email: string | null }> | null;
  const servicesData = servicesResult.data as Array<{ id: string; name: string; price: number }> | null;

  return (
    <StatisticheContent
      businessId={businessId}
      businessType={business?.business_type || 'mixed'}
      staff={(staffData || []).map(s => ({ id: s.id, display_name: s.full_name, color: s.color, hasEmail: !!s.email }))}
      services={servicesData || []}
      roiData={business?.roi_data || null}
    />
  );
}