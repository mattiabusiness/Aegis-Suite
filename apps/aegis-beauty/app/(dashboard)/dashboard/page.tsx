// ============================================================================
// AEGIS BEAUTY - DASHBOARD OVERVIEW PAGE
// File: apps/aegis-beauty/app/(dashboard)/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { OverviewContent } from './OverviewContent';

// ============================================================================
// TYPES
// ============================================================================

interface BusinessStats {
  appointmentsToday: number;
  appointmentsWeek: number;
  revenueMonth: number;
  totalCustomers: number;
  noShowRate: number;
}

interface ROIData {
  weeklyHours: number;
  monthlyHours: number;
  yearlyHours: number;
  noShowReduction: number;
  hourlyValue: number;
}

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function DashboardOverviewPage() {
  // Next.js 15: cookies() è async
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Ottieni business member
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!businessMember) {
    redirect('/login');
  }

  const businessId = (businessMember as { business_id: string }).business_id;

  // Ottieni dati business (incluso ROI data)
  const { data: business } = await supabase
    .from('businesses')
    .select('name, roi_data, onboarding_completed')
    .eq('id', businessId)
    .single();

  // Se onboarding non completato, redirect
  if (!(business as any)?.onboarding_completed) {
    redirect('/onboarding');
  }

  // ============================================================================
  // FETCH STATISTICHE (per ora valori placeholder, poi implementeremo query reali)
  // ============================================================================

  // Conta appuntamenti di oggi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: appointmentsToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .neq('status', 'cancelled');

  // Conta appuntamenti settimana
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lunedì
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { count: appointmentsWeek } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('start_time', weekStart.toISOString())
    .lt('start_time', weekEnd.toISOString())
    .neq('status', 'cancelled');

  // Conta clienti totali
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  // Conta servizi attivi
  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_active', true);

  // Conta staff attivo
  const { count: totalStaff } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_active', true);

  // Prepara dati per il client
  const stats = {
    appointmentsToday: appointmentsToday || 0,
    appointmentsWeek: appointmentsWeek || 0,
    totalCustomers: totalCustomers || 0,
    totalServices: totalServices || 0,
    totalStaff: totalStaff || 0,
  };

  const roiData = (business as any)?.roi_data as ROIData | null;

  return (
    <OverviewContent 
      stats={stats} 
      roiData={roiData}
      businessName={(business as any)?.name || 'Il tuo salone'}
    />
  );
}