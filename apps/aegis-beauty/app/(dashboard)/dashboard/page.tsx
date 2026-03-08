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
    .select('name, slug, business_type, roi_data, onboarding_completed')
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

  // Conta staff incompleti (senza email)
  const { count: incompleteStaff } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_active', true)
    .is('email', null);

  // Prepara dati per il client
  const stats = {
    appointmentsToday: appointmentsToday || 0,
    appointmentsWeek: appointmentsWeek || 0,
    totalCustomers: totalCustomers || 0,
    totalServices: totalServices || 0,
    totalStaff: totalStaff || 0,
    incompleteStaff: incompleteStaff || 0,
  };

  // Fetch appuntamenti di oggi con dettagli
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      id, start_time, end_time, status,
      customer:customers(full_name),
      staff:staff(full_name, color),
      appointment_services(service_name)
    `)
    .eq('business_id', businessId)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true }) as { data: Array<{
      id: string;
      start_time: string;
      end_time: string;
      status: string;
      customer: { full_name: string } | null;
      staff: { full_name: string; color: string | null } | null;
      appointment_services: Array<{ service_name: string }>;
    }> | null };

  // ============================================================================
  // FETCH DATA FOR APPOINTMENT MODAL
  // ============================================================================

  // Fetch staff
  const { data: staffList } = await supabase
    .from('staff')
    .select('id, full_name, color')
    .eq('business_id', businessId)
    .eq('is_active', true) as { data: Array<{ id: string; full_name: string; color: string | null }> | null };

  // Fetch services
  const { data: servicesList } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category:service_categories(id, name)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name') as { data: Array<{ id: string; name: string; duration_minutes: number; price: number; category: { id: string; name: string } | null }> | null };

  // Fetch staff_services
  const { data: staffServices } = await supabase
    .from('staff_services')
    .select('staff_id, service_id')
    .in('staff_id', (staffList || []).map(s => s.id)) as { data: Array<{ staff_id: string; service_id: string }> | null };

  // Fetch business hours
  const { data: businessHoursData } = await supabase
    .from('business_hours')
    .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
    .eq('business_id', businessId) as { data: Array<{ day_of_week: string; is_open: boolean; open_time_1: string | null; close_time_1: string | null; open_time_2: string | null; close_time_2: string | null }> | null };

  // Fetch closures (single-date format for AppointmentModal)
  const { data: closuresData } = await supabase
    .from('business_closures')
    .select('start_date, title')
    .eq('business_id', businessId) as { data: Array<{ start_date: string; title: string }> | null };

  // Fetch customers for appointment modal
  const { data: customersList } = await supabase
    .from('customers')
    .select('id, full_name, email, phone')
    .eq('business_id', businessId)
    .order('full_name') as { data: Array<{ id: string; full_name: string; email: string | null; phone: string | null }> | null };

  // Fetch categories for service modal
  const { data: categoriesList } = await supabase
    .from('service_categories')
    .select('id, name')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name') as { data: Array<{ id: string; name: string }> | null };

  return (
    <OverviewContent
      stats={stats}
      roiData={null}
      businessName={(business as any)?.name || 'Il tuo salone'}
      businessSlug={(business as any)?.slug || ''}
      businessType={(business as any)?.business_type || 'mixed'}
      businessId={businessId}
      todayAppointments={(todayAppointments || []).map(apt => ({
        id: apt.id,
        time: new Date(apt.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(apt.end_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        customerName: apt.customer?.full_name || 'Cliente',
        staffName: apt.staff?.full_name || '',
        staffColor: apt.staff?.color || '#9333ea',
        serviceName: apt.appointment_services?.[0]?.service_name || 'Appuntamento',
        status: apt.status,
      }))}
      customers={customersList || []}
      services={(servicesList || []).map(s => ({
        id: s.id,
        name: s.name,
        duration: s.duration_minutes,
        price: s.price,
        categoryId: s.category?.id,
        categoryName: s.category?.name,
      }))}
      staff={staffList || []}
      staffServices={staffServices || []}
      businessHours={businessHoursData || []}
      closures={(closuresData || []).map(c => ({ date: c.start_date, reason: c.title }))}
      categories={categoriesList || []}
    />
  );
}