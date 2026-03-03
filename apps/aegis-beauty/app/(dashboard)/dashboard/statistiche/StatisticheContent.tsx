// ============================================================================
// AEGIS BEAUTY - STATISTICHE CONTENT (FUTURISTIC EDITION)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/statistiche/StatisticheContent.tsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StatsPage,
  type KPICard,
  type ChartDataPoint,
  type TopService,
  type PopularHour,
  type StaffPerformance,
  type InsightItem,
  type PeriodFilter,
  type ROIStats,
  type RetentionData,
  type DayRevenueData,
  type HeatmapCell,
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

const DAY_LABELS_FULL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const DAY_LABELS_RADAR = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// ============================================================================
// ENHANCED INSIGHTS GENERATOR
// ============================================================================

function generateInsights(
  appointments: AppointmentRow[],
  appointmentServices: AppointmentServiceRow[],
  staff: Array<{ id: string; display_name: string }>,
  prevAppointments: AppointmentRow[],
  prevServices: AppointmentServiceRow[],
): InsightItem[] {
  const insights: InsightItem[] = [];
  const completed = appointments.filter(a => a.status === 'completed');
  const noShows = appointments.filter(a => a.status === 'no_show');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const prevCompleted = prevAppointments.filter(a => a.status === 'completed');

  if (completed.length === 0 && appointments.length === 0) {
    return [{ text: 'Quando ci saranno dati sufficienti, Aegis AI genererà insights predittivi sulla tua attività.', type: 'neutral' as const }];
  }

  // ===== 1. Revenue forecast (moving average 3 months) =====
  const curRevenue = appointmentServices
    .filter(s => completed.some(a => a.id === s.appointment_id))
    .reduce((sum, s) => sum + s.price, 0);
  const prevRevenue = prevServices
    .filter(s => prevCompleted.some(a => a.id === s.appointment_id))
    .reduce((sum, s) => sum + s.price, 0);

  if (curRevenue > 0 && prevRevenue > 0) {
    const avgRevenue = Math.round((curRevenue + prevRevenue) / 2);
    const trend = curRevenue > prevRevenue ? 'in crescita' : 'stabile';
    insights.push({
      text: `Previsione entrate prossimo mese: ~€${avgRevenue.toLocaleString('it-IT')} (trend ${trend} basato sulla media mobile).`,
      type: curRevenue >= prevRevenue ? 'positive' : 'neutral',
    });
  }

  // ===== 2. Clients at risk (no booking >30 days) =====
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCustomerIds = new Set(
    appointments
      .filter(a => a.customer_id && new Date(a.start_time) >= thirtyDaysAgo)
      .map(a => a.customer_id)
  );
  const allCustomerIds = new Set(
    appointments.filter(a => a.customer_id).map(a => a.customer_id)
  );
  const atRiskCount = [...allCustomerIds].filter(id => !recentCustomerIds.has(id)).length;
  if (atRiskCount > 0) {
    insights.push({
      text: `${atRiskCount} client${atRiskCount === 1 ? 'e' : 'i'} a rischio abbandono (nessuna prenotazione negli ultimi 30 giorni). Valuta un messaggio di riattivazione.`,
      type: 'warning',
    });
  }

  // ===== 3. Underutilized time slot =====
  const hourCount: Record<number, number> = {};
  appointments.forEach(a => {
    const h = new Date(a.start_time).getHours();
    hourCount[h] = (hourCount[h] || 0) + 1;
  });
  const hours = Object.entries(hourCount).sort(([, a], [, b]) => a - b);
  const peakHours = Object.entries(hourCount).sort(([, a], [, b]) => b - a);
  if (hours.length >= 3) {
    const leastUsed = hours[0];
    const mostUsed = peakHours[0];
    if (parseInt(leastUsed[0]) >= 8 && parseInt(leastUsed[0]) <= 19) {
      insights.push({
        text: `La fascia ${leastUsed[0]}:00 è sotto-utilizzata (${leastUsed[1]} app.) vs il picco delle ${mostUsed[0]}:00 (${mostUsed[1]}). Ideale per promozioni mirate.`,
        type: 'neutral',
      });
    }
  }

  // ===== 4. Average ticket comparison =====
  if (completed.length > 0) {
    const avgTicket = curRevenue / completed.length;
    const prevAvgTicket = prevCompleted.length > 0 ? prevRevenue / prevCompleted.length : 0;
    if (prevAvgTicket > 0) {
      const change = ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100;
      if (change > 5) {
        insights.push({
          text: `Ticket medio a €${avgTicket.toFixed(0)} (+${change.toFixed(0)}% vs periodo precedente). Ottimo lavoro sull'upselling!`,
          type: 'positive',
        });
      } else if (change < -5) {
        insights.push({
          text: `Ticket medio in calo a €${avgTicket.toFixed(0)} (${change.toFixed(0)}%). Valuta servizi aggiuntivi o ritocco prezzi.`,
          type: 'warning',
        });
      } else {
        insights.push({
          text: `Ticket medio stabile a €${avgTicket.toFixed(0)}. Potrebbe essere il momento di proporre servizi premium.`,
          type: 'neutral',
        });
      }
    }
  }

  // ===== 5. Weak day suggestion =====
  const dayRevenue: Record<number, number> = {};
  completed.forEach(a => {
    const day = new Date(a.start_time).getDay();
    const rev = appointmentServices
      .filter(s => s.appointment_id === a.id)
      .reduce((sum, s) => sum + s.price, 0);
    dayRevenue[day] = (dayRevenue[day] || 0) + rev;
  });
  const dayEntries = Object.entries(dayRevenue).sort(([, a], [, b]) => a - b);
  if (dayEntries.length >= 3) {
    const weakDay = dayEntries[0];
    const strongDay = dayEntries[dayEntries.length - 1];
    const weakDayName = DAY_LABELS_FULL[parseInt(weakDay[0])];
    const strongDayName = DAY_LABELS_FULL[parseInt(strongDay[0])];
    insights.push({
      text: `${weakDayName} è il giorno più debole (€${parseInt(weakDay[1] as unknown as string).toLocaleString('it-IT')}). Prova promozioni dedicate, come "${weakDayName} Special" per riempire l'agenda.`,
      type: 'warning',
    });
  }

  // ===== 6. Best staff (keep original) =====
  if (staff.length > 1) {
    const staffRev: Record<string, number> = {};
    completed.forEach(a => {
      if (!a.staff_id) return;
      staffRev[a.staff_id] = (staffRev[a.staff_id] || 0) +
        appointmentServices.filter(s => s.appointment_id === a.id).reduce((sum, s) => sum + s.price, 0);
    });
    const bestId = Object.entries(staffRev).sort(([, a], [, b]) => b - a)[0]?.[0];
    const bestMember = staff.find(s => s.id === bestId);
    if (bestMember) {
      insights.push({ text: `${bestMember.display_name} è l'operatore con le entrate più alte nel periodo.`, type: 'neutral' });
    }
  }

  // ===== 7. No-show rate =====
  if (noShows.length > 0 && appointments.length > 0) {
    const noShowRate = Math.round((noShows.length / appointments.length) * 100);
    if (noShowRate > 5) {
      insights.push({
        text: `Tasso di no-show al ${noShowRate}%. Considera di richiedere un anticipo o conferma obbligatoria.`,
        type: 'warning',
      });
    } else {
      insights.push({
        text: `Tasso di no-show solo al ${noShowRate}%, ottimo risultato!`,
        type: 'positive',
      });
    }
  }

  // ===== 8. Cancellation rate =====
  if (cancelled.length > 0 && appointments.length > 0) {
    const cancelRate = Math.round((cancelled.length / appointments.length) * 100);
    if (cancelRate > 10) {
      insights.push({
        text: `${cancelRate}% di cancellazioni nel periodo. Una policy di cancellazione più strutturata potrebbe aiutare.`,
        type: 'warning',
      });
    }
  }

  return insights.slice(0, 8);
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
  // NEW state
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [dayRevenue, setDayRevenue] = useState<DayRevenueData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);

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

    // Popular Hours (kept as fallback)
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
    setStaffPerfData(staff.map(s => ({ name: s.display_name, color: s.color, appointments: staffStats[s.id]?.appointments || 0, revenue: staffStats[s.id]?.revenue || 0 })).sort((a, b) => b.revenue - a.revenue));

    // ===== NEW: Retention Data =====
    const allCustomerIds = current.filter(a => a.customer_id).map(a => a.customer_id!);
    const uniqueCustomerIds = [...new Set(allCustomerIds)];
    // Count how many had previous appointments (before this period)
    const prevCustomerIds = new Set(prev.filter(a => a.customer_id).map(a => a.customer_id!));
    // A "returning" customer is one who also appeared in previous period
    const returningCount = uniqueCustomerIds.filter(id => prevCustomerIds.has(id)).length;
    const newCount = uniqueCustomerIds.length - returningCount;
    const returningPct = uniqueCustomerIds.length > 0 ? (returningCount / uniqueCustomerIds.length) * 100 : 0;
    setRetention({ returning: returningCount, new: newCount, returningPct });

    // ===== NEW: Day Revenue for Radar =====
    // Use JS getDay() but remap to Mon=0...Sun=6 for Italian week
    const dayRevenueMap: Record<number, { revenue: number; appointments: number }> = {};
    for (let i = 0; i < 7; i++) dayRevenueMap[i] = { revenue: 0, appointments: 0 };

    completed.forEach(a => {
      const jsDay = new Date(a.start_time).getDay(); // 0=Sun
      const mappedDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon...6=Sun
      dayRevenueMap[mappedDay].appointments++;
      dayRevenueMap[mappedDay].revenue += currentServices
        .filter(s => s.appointment_id === a.id)
        .reduce((sum, s) => sum + s.price, 0);
    });

    setDayRevenue(
      DAY_LABELS_RADAR.map((label, idx) => ({
        day: label,
        revenue: Math.round(dayRevenueMap[idx].revenue),
        appointments: dayRevenueMap[idx].appointments,
      }))
    );

    // ===== NEW: Heatmap Data (day × hour) =====
    const heatmap: HeatmapCell[] = [];
    current.forEach(a => {
      const jsDay = new Date(a.start_time).getDay();
      const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
      const hour = new Date(a.start_time).getHours();
      const existing = heatmap.find(c => c.day === mappedDay && c.hour === hour);
      if (existing) {
        existing.count++;
      } else {
        heatmap.push({ day: mappedDay, hour, count: 1 });
      }
    });
    // Fill missing cells with 0
    const allHours = [...new Set(heatmap.map(h => h.hour))].sort((a, b) => a - b);
    for (let d = 0; d < 7; d++) {
      for (const h of allHours) {
        if (!heatmap.find(c => c.day === d && c.hour === h)) {
          heatmap.push({ day: d, hour: h, count: 0 });
        }
      }
    }
    setHeatmapData(heatmap);

    // Enhanced Insights (now with prev data)
    setInsights(generateInsights(current, currentServices, staff, prev, prevServices));
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
      [], ['Tasso ritorno clienti'],
      ...(retention ? [['Ricorrenti', String(retention.returning)], ['Nuovi', String(retention.new)], ['% Ritorno', `${retention.returningPct.toFixed(1)}%`]] : []),
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
      <div className="pb-8">
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
          retention={retention}
          dayRevenue={dayRevenue}
          heatmapData={heatmapData}
        />
      </div>
    </div>
  );
}