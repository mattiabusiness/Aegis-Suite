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

  // Get user's business + role
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string; role: string } | null };

  if (!businessMember) {
    redirect('/login');
  }

  const businessId = businessMember.business_id;
  const isStaff = businessMember.role === 'staff';

  type ServiceRow = {
    id: string; name: string; description: string | null; duration_minutes: number;
    price: number; is_active: boolean; category_id: string | null; display_order: number | null;
    category: { id: string; name: string } | null;
  };

  // Fetch all services with category info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allServicesRaw } = await (supabase as any)
    .from('services')
    .select(`id, name, description, duration_minutes, price, is_active, category_id, display_order, category:service_categories(id, name)`)
    .eq('business_id', businessId)
    .order('display_order', { ascending: true }) as { data: ServiceRow[] | null };

  // Se staff → filtra ai soli servizi assegnati tramite staff_services
  let services: ServiceRow[] = allServicesRaw || [];
  if (isStaff) {
    // Trova staff.id
    const { data: staffRecord } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single() as { data: { id: string } | null };

    if (staffRecord) {
      const { data: staffServices } = await supabase
        .from('staff_services')
        .select('service_id')
        .eq('staff_id', staffRecord.id) as { data: Array<{ service_id: string }> | null };

      // Se ha assegnazioni esplicite → mostra solo quelle; altrimenti mostra tutte (nessuna restrizione)
      if (staffServices && staffServices.length > 0) {
        const allowedIds = new Set(staffServices.map(r => r.service_id));
        services = services.filter(s => allowedIds.has(s.id));
      }
    }
  }

  // Fetch categories (solo quelle effettivamente usate dallo staff, o tutte per il titolare)
  const usedCategoryIds = new Set(services.map(s => s.category_id).filter(Boolean));
  type CategoryRow = { id: string; name: string; icon: string | null; display_order: number | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allCategories } = await (supabase as any)
    .from('service_categories')
    .select('id, name, icon, display_order')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('display_order', { ascending: true }) as { data: CategoryRow[] | null };

  const categories = isStaff
    ? (allCategories || []).filter(c => usedCategoryIds.has(c.id))
    : (allCategories || []);

  // Fetch shampoo price
  const { data: businessData } = await supabase
    .from('businesses')
    .select('shampoo_price')
    .eq('id', businessId)
    .single() as { data: { shampoo_price: number } | null };

  const shampooPrice = businessData?.shampoo_price ?? 2;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <ServiziContent
      initialServices={services as unknown as any[]}
      initialCategories={categories as unknown as any[]}
      businessId={businessId}
      shampooPrice={shampooPrice}
    />
  );
}