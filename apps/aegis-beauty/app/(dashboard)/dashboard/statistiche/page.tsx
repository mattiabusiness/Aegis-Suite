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

  // Fetch business (for roi_data and business_type)
  const { data: business } = await supabase
    .from('businesses')
    .select('roi_data, business_type')
    .eq('id', businessId)
    .single() as { data: { roi_data: Record<string, unknown> | null; business_type: string | null } | null };

  // Fetch staff — include email to detect incomplete profiles (no email = incompleto)
  const { data: staffData } = await supabase
    .from('staff')
    .select('id, full_name, color, email')
    .eq('business_id', businessId)
    .eq('is_active', true) as { data: Array<{ id: string; full_name: string; color: string; email: string | null }> | null };

  // Fetch services
  const { data: servicesData } = await supabase
    .from('services')
    .select('id, name, price')
    .eq('business_id', businessId) as { data: Array<{ id: string; name: string; price: number }> | null };

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