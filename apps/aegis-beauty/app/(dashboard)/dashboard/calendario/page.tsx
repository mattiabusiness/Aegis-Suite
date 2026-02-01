// ============================================================================
// AEGIS BEAUTY - CALENDARIO PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/calendario/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { CalendarioContent } from './CalendarioContent';
import type { CalendarEventData, BusinessHoursData, ClosureData } from '@aegis/ui';

// ============================================================================
// TYPES
// ============================================================================

interface AppointmentRow {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  customer: {
    id: string;
    full_name: string;
  } | null;
  staff: {
    id: string;
    full_name: string;
  } | null;
  appointment_services: {
    service: {
      id: string;
      name: string;
    };
  }[];
}

interface StaffMember {
  id: string;
  full_name: string;
  color: string | null;
}

interface BusinessHoursRow {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

interface ClosureRow {
  title: string;
  start_date: string;
  end_date: string;
  is_recurring_yearly: boolean;
}

interface CustomerRow {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
}

interface ServiceRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category_id: string | null;
  service_categories: {
    name: string;
  } | null;
}

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function CalendarioPage() {
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

  // Ottieni appuntamenti (ultimi 30 giorni + prossimi 60 giorni)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 60);

  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      notes,
      customer:customers(id, full_name),
      staff:staff(id, full_name),
      appointment_services(
        service:services(id, name)
      )
    `)
    .eq('business_id', businessId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true });

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError.message);
  }

  // Ottieni lista staff per filtro
  const { data: staffList } = await supabase
    .from('staff')
    .select('id, full_name, color')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('full_name');

  // Ottieni orari del business
  const { data: businessHoursData } = await supabase
    .from('business_hours')
    .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
    .eq('business_id', businessId);

  // Ottieni chiusure (festività scelte + chiusure straordinarie)
  const { data: closuresData } = await supabase
    .from('business_closures')
    .select('title, start_date, end_date, is_recurring_yearly')
    .eq('business_id', businessId);

  // Ottieni lista clienti per il modal
  const { data: customersData } = await supabase
    .from('customers')
    .select('id, full_name, phone, email')
    .eq('business_id', businessId)
    .order('full_name');

  // Ottieni lista servizi per il modal (con categoria)
  const { data: servicesData } = await supabase
    .from('services')
    .select(`
      id, 
      name, 
      duration_minutes, 
      price, 
      category_id,
      service_categories (
        name
      )
    `)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name');

  // Trasforma appuntamenti in formato CalendarEventData
  const events: CalendarEventData[] = ((appointments as AppointmentRow[]) || []).map((apt) => {
    const serviceName = apt.appointment_services?.[0]?.service?.name || 'Appuntamento';
    
    return {
      id: apt.id,
      title: serviceName,
      startTime: new Date(apt.start_time),
      endTime: new Date(apt.end_time),
      customerName: apt.customer?.full_name,
      staffName: apt.staff?.full_name,
      status: apt.status as CalendarEventData['status'],
      notes: apt.notes || undefined,
    };
  });

  // Trasforma orari business
  const businessHours: BusinessHoursData[] = ((businessHoursData as BusinessHoursRow[]) || []).map((bh) => ({
    day_of_week: bh.day_of_week,
    is_open: bh.is_open,
    open_time_1: bh.open_time_1,
    close_time_1: bh.close_time_1,
    open_time_2: bh.open_time_2,
    close_time_2: bh.close_time_2,
  }));

  // Funzione per calcolare Pasqua (algoritmo di Gauss)
  function getEasterDate(year: number): string {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // Trasforma chiusure - gestisce anche festività ricorrenti annuali
  const closures: ClosureData[] = [];
  const currentYear = new Date().getFullYear();
  
  ((closuresData as ClosureRow[]) || []).forEach((c) => {
    const titleLower = c.title.toLowerCase();
    
    if (c.is_recurring_yearly) {
      // Gestione speciale per Pasqua (data mobile)
      if (titleLower.includes('pasqua') && !titleLower.includes('pasquetta')) {
        // Pasqua - calcola per anno corrente e prossimo
        closures.push({
          date: getEasterDate(currentYear),
          reason: c.title,
        });
        closures.push({
          date: getEasterDate(currentYear + 1),
          reason: c.title,
        });
      } else if (titleLower.includes('pasquetta') || titleLower.includes('lunedì dell\'angelo')) {
        // Pasquetta - giorno dopo Pasqua
        const easter2026 = new Date(getEasterDate(currentYear));
        easter2026.setDate(easter2026.getDate() + 1);
        const easter2027 = new Date(getEasterDate(currentYear + 1));
        easter2027.setDate(easter2027.getDate() + 1);
        
        closures.push({
          date: easter2026.toISOString().split('T')[0],
          reason: c.title,
        });
        closures.push({
          date: easter2027.toISOString().split('T')[0],
          reason: c.title,
        });
      } else {
        // Altre festività fisse - usa mese/giorno
        const monthDay = c.start_date.slice(5); // "MM-DD"
        closures.push({
          date: `${currentYear}-${monthDay}`,
          reason: c.title,
        });
        closures.push({
          date: `${currentYear + 1}-${monthDay}`,
          reason: c.title,
        });
      }
    } else {
      // Chiusura singola (non ricorrente)
      closures.push({
        date: c.start_date,
        reason: c.title,
      });
    }
  });

  // Trasforma clienti
  const customers = ((customersData as CustomerRow[]) || []).map((c) => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone || undefined,
    email: c.email || undefined,
  }));

  // Trasforma servizi
  const services = ((servicesData as ServiceRow[]) || []).map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.duration_minutes,
    price: Number(s.price),
    categoryId: s.category_id || undefined,
    categoryName: s.service_categories?.name || undefined,
  }));

  return (
    <CalendarioContent 
      initialEvents={events}
      staffList={(staffList as StaffMember[]) || []}
      businessId={businessId}
      businessHours={businessHours}
      closures={closures}
      customers={customers}
      services={services}
    />
  );
}