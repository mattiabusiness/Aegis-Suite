// ============================================================================
// AEGIS BEAUTY - SERVIZI PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/servizi/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { ServiziContent } from './ServiceContent';

// ============================================================================
// PAGE
// ============================================================================

export default async function ServiziPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Get user's business
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string } | null };

  if (!businessMember) {
    redirect('/login');
  }

  const businessId = businessMember.business_id;

  // Fetch categories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, icon, display_order')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch services with category info
  const { data: services } = await supabase
    .from('services')
    .select(`
      id, 
      name, 
      description, 
      duration_minutes, 
      price, 
      is_active, 
      category_id, 
      display_order,
      category:service_categories(id, name)
    `)
    .eq('business_id', businessId)
    .order('display_order', { ascending: true });

  return (
    <ServiziContent
      initialServices={services || []}
      initialCategories={categories || []}
      businessId={businessId}
    />
  );
}