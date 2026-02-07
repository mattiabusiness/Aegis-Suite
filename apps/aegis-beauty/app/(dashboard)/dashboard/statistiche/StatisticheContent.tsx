// ============================================================================
// AEGIS BEAUTY - STATISTICHE CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/statistiche/StatisticheContent.tsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader,
  StatsPage,
  type KPICard,
  type ChartDataPoint,
  type TopService,
  type PopularHour,
  type StaffPerformance,
  type InsightItem,
  type PeriodFilter,
  type ROIStats,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import {
  Euro,
  Calendar,
  Users,
  UserX,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StatisticheContentProps {
  businessId: string;
  businessType: string;
  staff: Array<{ id: string; display_name: string; color: string }>;
  services: Array<{ id: string; name: string; price: number }>;
  roiData: Record<string, unknown> | null;
}

interface AppointmentRow {
  id: string;
  staff_id: string | null;
  status: string;
  start_time: string;
  created_at: string;
  customer_id: string | null;
}

interface AppointmentServiceRow {
  appointment_id: string;
  service_id: string;
  service_name: string;
  price: number;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

function getPeriodDates(period: PeriodFilter): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date, end: Date, prevStart: Date, prevEnd: Date;

  switch (period) {
    case 'today':
      start = today;
      end = new Date(today.getTime() + 86400000);
      prevStart = new Date(today.getTime() - 86400000);
      prevEnd = today;
      break;
    case 'week': {
      const dayOfWeek = today.getDay() || 7;
      start = new Date(today.getTime() - (dayOfWeek - 1) * 86400000);
      end = new Date(start.getTime() + 7 * 86400000);
      prevStart = new Date(start.getTime() - 7 * 86400000);
      prevEnd = start;
      break;
    }
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      prevEnd = start;
      break;
    case '3months':
      start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      prevStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      prevEnd = start;
      break;
    case 'year':
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear() + 1, 0, 1);
      prevStart = new Date(today.getFullYear() - 1, 0, 1);
      prevEnd = start;
      break;
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      prevEnd = start;
  }
  return { start, end, prevStart, prevEnd };
}

function formatDateISO(d: Date): string { return d.toISOString(); }

function getDayLabel(date: string): string {
  return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function getMonthLabel(date: string): string {
  return new Date(date).toLocaleDateString('it-IT', { month: 'short' });
}

// ============================================================================
// INSIGHTS GENERATOR
// ============================================================================

function generateInsights(
  appointments: AppointmentRow[],
  appointmentServices: AppointmentServiceRow[],
  staff: Array<{ id: string; display_name: string }>,
): InsightItem[] {
  const insights: InsightItem[] = [];
  const completed = appointments.filter(a => a.status === 'completed');
  const noShows = appointments.filter(a => a.status === 'no_show');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  if (completed.length === 0) return [{ text: 'Quando ci saranno dati sufficienti, Aegis AI genererà insights predittivi sulla tua attività.', type: 'neutral' as const }];

  const dayLabels = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  // Best day of week
  const dayRevenue: Record<number, number> = {};
  completed.forEach(a => {
    const day = new Date(a.start_time).getDay();
    const services = appointmentServices.filter(s => s.appointment_id === a.id);
    dayRevenue[day] = (dayRevenue[day] || 0) + services.reduce((sum, s) => sum + s.price, 0);
  });
  const totalRevenue = Object.values(dayRevenue).reduce((a, b) => a + b, 0);
  const bestDay = Object.entries(dayRevenue).sort(([, a], [, b]) => b - a)[0];
  if (bestDay && totalRevenue > 0) {
    const pct = Math.round((bestDay[1] / totalRevenue) * 100);
    insights.push({ text: `${dayLabels[parseInt(bestDay[0])]} genera il ${pct}% delle entrate del periodo.`, type: 'positive' });
  }

  // Top service
  const serviceCount: Record<string, number> = {};
  appointmentServices.forEach(s => { serviceCount[s.service_name] = (serviceCount[s.service_name] || 0) + 1; });
  const topService = Object.entries(serviceCount).sort(([, a], [, b]) => b - a)[0];
  if (topService) {
    insights.push({ text: `"${topService[0]}" è il servizio più richiesto con ${topService[1]} prenotazioni.`, type: 'positive' });
  }

  // No-show rate
  if (noShows.length > 0 && appointments.length > 0) {
    const noShowRate = Math.round((noShows.length / appointments.length) * 100);
    const noShowByDay: Record<number, number> = {};
    noShows.forEach(a => { const d = new Date(a.start_time).getDay(); noShowByDay[d] = (noShowByDay[d] || 0) + 1; });
    const worstDay = Object.entries(noShowByDay).sort(([, a], [, b]) => b - a)[0];
    if (worstDay && noShowRate > 5) {
      insights.push({ text: `${noShowRate}% di no-show, concentrati di ${dayLabels[parseInt(worstDay[0])].toLowerCase()}.`, type: 'warning' });
    } else if (noShowRate <= 5) {
      insights.push({ text: `Tasso di no-show al ${noShowRate}%, ottimo risultato!`, type: 'positive' });
    }
  }

  // Best staff
  if (staff.length > 1) {
    const staffRev: Record<string, number> = {};
    completed.forEach(a => {
      if (!a.staff_id) return;
      staffRev[a.staff_id] = (staffRev[a.staff_id] || 0) + appointmentServices.filter(s => s.appointment_id === a.id).reduce((sum, s) => sum + s.price, 0);
    });
    const bestId = Object.entries(staffRev).sort(([, a], [, b]) => b - a)[0]?.[0];
    const bestMember = staff.find(s => s.id === bestId);
    if (bestMember) insights.push({ text: `${bestMember.display_name} è l'operatore con le entrate più alte nel periodo.`, type: 'neutral' });
  }

  // Peak hour
  const hourCount: Record<number, number> = {};
  completed.forEach(a => { const h = new Date(a.start_time).getHours(); hourCount[h] = (hourCount[h] || 0) + 1; });
  const peakHour = Object.entries(hourCount).sort(([, a], [, b]) => b - a)[0];
  if (peakHour) insights.push({ text: `La fascia oraria più attiva è alle ${peakHour[0]}:00 con ${peakHour[1]} appuntamenti.`, type: 'neutral' });

  // Cancellation
  if (cancelled.length > 0) {
    const cancelRate = Math.round((cancelled.length / appointments.length) * 100);
    if (cancelRate > 10) insights.push({ text: `${cancelRate}% di cancellazioni. Considera di richiedere un anticipo o conferma.`, type: 'warning' });
  }

  return insights.slice(0, 5);
}

// ============================================================================
// ROI PARSER
// ============================================================================

function parseROI(roiData: Record<string, unknown> | null): ROIStats | null {
  if (!roiData) return null;

  const calculated = roiData.calculated as Record<string, number> | undefined;
  if (!calculated) return null;

  return {
    hoursSavedMonthly: calculated.hours_saved_monthly || 0,
    noShowsAvoided: calculated.no_shows_avoided || 0,
    monthlySavings: calculated.monthly_savings || 0,
    annualSavings: calculated.annual_savings || 0,
    dailyPhoneTime: roiData.daily_phone_time as number | undefined,
    monthlyNoShows: roiData.monthly_no_shows as number | undefined,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StatisticheContent({ businessId, businessType, staff, services, roiData }: StatisticheContentProps) {
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [revenueChart, setRevenueChart] = useState<ChartDataPoint[]>([]);
  const [appointmentsChart, setAppointmentsChart] = useState<ChartDataPoint[]>([]);
  const [topServicesData, setTopServicesData] = useState<TopService[]>([]);
  const [popularHoursData, setPopularHoursData] = useState<PopularHour[]>([]);
  const [staffPerfData, setStaffPerfData] = useState<StaffPerformance[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);

  const supabase = createClient();
  const roi = useMemo(() => parseROI(roiData), [roiData]);

  const fetchData = useCallback(async (p: PeriodFilter) => {
    setLoading(true);
    const { start, end, prevStart, prevEnd } = getPeriodDates(p);

    const { data: currentAppts } = await supabase
      .from('appointments')
      .select('id, staff_id, status, start_time, created_at, customer_id')
      .eq('business_id', businessId)
      .gte('start_time', formatDateISO(start))
      .lt('start_time', formatDateISO(end)) as { data: AppointmentRow[] | null };

    const { data: prevAppts } = await supabase
      .from('appointments')
      .select('id, staff_id, status, start_time, created_at, customer_id')
      .eq('business_id', businessId)
      .gte('start_time', formatDateISO(prevStart))
      .lt('start_time', formatDateISO(prevEnd)) as { data: AppointmentRow[] | null };

    const current = currentAppts || [];
    const prev = prevAppts || [];

    // Fetch appointment services
    let currentServices: AppointmentServiceRow[] = [];
    const currentIds = current.map(a => a.id);
    if (currentIds.length > 0) {
      const { data } = await supabase
        .from('appointment_services')
        .select('appointment_id, service_id, service_name, price')
        .in('appointment_id', currentIds) as { data: AppointmentServiceRow[] | null };
      currentServices = data || [];
    }

    let prevServices: AppointmentServiceRow[] = [];
    const prevIds = prev.map(a => a.id);
    if (prevIds.length > 0) {
      const { data } = await supabase
        .from('appointment_services')
        .select('appointment_id, service_id, service_name, price')
        .in('appointment_id', prevIds) as { data: AppointmentServiceRow[] | null };
      prevServices = data || [];
    }

    // KPIs
    const completed = current.filter(a => a.status === 'completed');
    const prevCompleted = prev.filter(a => a.status === 'completed');

    const curRevenue = currentServices.filter(s => completed.some(a => a.id === s.appointment_id)).reduce((sum, s) => sum + s.price, 0);
    const prevRevenue = prevServices.filter(s => prevCompleted.some(a => a.id === s.appointment_id)).reduce((sum, s) => sum + s.price, 0);

    const curCustomers = new Set(current.filter(a => a.customer_id).map(a => a.customer_id)).size;
    const prevCustomers = new Set(prev.filter(a => a.customer_id).map(a => a.customer_id)).size;

    const noShows = current.filter(a => a.status === 'no_show').length;
    const prevNoShows = prev.filter(a => a.status === 'no_show').length;
    const noShowRate = current.length > 0 ? (noShows / current.length) * 100 : 0;
    const prevNoShowRate = prev.length > 0 ? (prevNoShows / prev.length) * 100 : 0;

    const calcChange = (cur: number, prv: number) => prv > 0 ? ((cur - prv) / prv) * 100 : cur > 0 ? 100 : 0;

    setKpis([
      { label: 'Entrate totali', value: `€ ${curRevenue.toLocaleString('it-IT')}`, change: calcChange(curRevenue, prevRevenue), icon: Euro, color: 'bg-purple-100 text-purple-600' },
      { label: 'Appuntamenti', value: current.length.toString(), change: calcChange(current.length, prev.length), icon: Calendar, color: 'bg-blue-100 text-blue-600' },
      { label: 'Clienti unici', value: curCustomers.toString(), change: calcChange(curCustomers, prevCustomers), icon: Users, color: 'bg-emerald-100 text-emerald-600' },
      { label: 'No-show', value: `${noShowRate.toFixed(1)}%`, change: prevNoShowRate > 0 ? -(calcChange(noShowRate, prevNoShowRate)) : undefined, icon: UserX, color: 'bg-red-100 text-red-600' },
    ]);

    // Charts
    const revenueByDate: Record<string, number> = {};
    const apptsByDate: Record<string, number> = {};
    const useMonths = p === 'year' || p === '3months';

    completed.forEach(a => {
      const key = useMonths
        ? `${new Date(a.start_time).getFullYear()}-${String(new Date(a.start_time).getMonth() + 1).padStart(2, '0')}`
        : a.start_time.slice(0, 10);
      revenueByDate[key] = (revenueByDate[key] || 0) + currentServices.filter(s => s.appointment_id === a.id).reduce((sum, s) => sum + s.price, 0);
    });

    current.forEach(a => {
      const key = useMonths
        ? `${new Date(a.start_time).getFullYear()}-${String(new Date(a.start_time).getMonth() + 1).padStart(2, '0')}`
        : a.start_time.slice(0, 10);
      apptsByDate[key] = (apptsByDate[key] || 0) + 1;
    });

    const allDates = Array.from(new Set([...Object.keys(revenueByDate), ...Object.keys(apptsByDate)])).sort();

    setRevenueChart(allDates.map(d => ({ label: useMonths ? getMonthLabel(d + '-01') : getDayLabel(d), value: revenueByDate[d] || 0 })));
    setAppointmentsChart(allDates.map(d => ({ label: useMonths ? getMonthLabel(d + '-01') : getDayLabel(d), value: apptsByDate[d] || 0 })));

    // Top Services
    const serviceStats: Record<string, { count: number; revenue: number }> = {};
    currentServices.filter(s => completed.some(a => a.id === s.appointment_id)).forEach(s => {
      if (!serviceStats[s.service_name]) serviceStats[s.service_name] = { count: 0, revenue: 0 };
      serviceStats[s.service_name].count++;
      serviceStats[s.service_name].revenue += s.price;
    });
    setTopServicesData(Object.entries(serviceStats).sort(([, a], [, b]) => b.revenue - a.revenue).slice(0, 5).map(([name, data]) => ({ name, count: data.count, revenue: data.revenue })));

    // Popular Hours
    const hourStats: Record<number, number> = {};
    current.forEach(a => { const h = new Date(a.start_time).getHours(); hourStats[h] = (hourStats[h] || 0) + 1; });
    setPopularHoursData(Object.entries(hourStats).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([hour, count]) => ({ hour: `${hour}:00`, count })));

    // Staff Performance
    const staffStats: Record<string, { appointments: number; revenue: number }> = {};
    completed.forEach(a => {
      if (!a.staff_id) return;
      if (!staffStats[a.staff_id]) staffStats[a.staff_id] = { appointments: 0, revenue: 0 };
      staffStats[a.staff_id].appointments++;
      staffStats[a.staff_id].revenue += currentServices.filter(s => s.appointment_id === a.id).reduce((sum, s) => sum + s.price, 0);
    });
    setStaffPerfData(staff.filter(s => staffStats[s.id]).map(s => ({ name: s.display_name, color: s.color, appointments: staffStats[s.id]?.appointments || 0, revenue: staffStats[s.id]?.revenue || 0 })).sort((a, b) => b.revenue - a.revenue));

    // Insights
    setInsights(generateInsights(current, currentServices, staff));
    setLoading(false);
  }, [businessId, staff, supabase]);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  const handleExport = () => {
    const rows = [
      ['Metrica', 'Valore'],
      ...kpis.map(k => [k.label, k.value]),
      [], ['Servizio', 'Prenotazioni', 'Entrate'],
      ...topServicesData.map(s => [s.name, s.count.toString(), `€${s.revenue}`]),
      [], ['Staff', 'Appuntamenti', 'Entrate'],
      ...staffPerfData.map(s => [s.name, s.appointments.toString(), `€${s.revenue}`]),
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-statistiche-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <PageHeader
        title="Statistiche"
        description="Analisi completa delle performance del tuo salone"
      />
      <div className="mt-6 pb-8">
        <StatsPage
          kpis={kpis}
          revenueChart={revenueChart}
          appointmentsChart={appointmentsChart}
          topServices={topServicesData}
          popularHours={popularHoursData}
          staffPerformance={staffPerfData}
          insights={insights}
          roi={roi}
          currency="€"
          activePeriod={period}
          onPeriodChange={setPeriod}
          onExport={handleExport}
          loading={loading}
        />
      </div>
    </div>
  );
}