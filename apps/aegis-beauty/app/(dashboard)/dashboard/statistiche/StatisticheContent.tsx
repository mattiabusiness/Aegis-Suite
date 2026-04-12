// ============================================================================
// AEGIS BEAUTY - STATISTICHE CONTENT (FUTURISTIC EDITION)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/statistiche/StatisticheContent.tsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import {
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
import { useStaffPermissions } from '@/lib/staff-permissions-context';

const StatsPage = dynamic(
  () => import('@aegis/ui').then((m) => ({ default: m.StatsPage })),
  { ssr: false }
);
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
  staff: Array<{ id: string; display_name: string; color: string; hasEmail?: boolean }>;
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
// INSIGHTS — versione personalizzata per lo staff
// ============================================================================

function generateStaffInsights(
  appointments: AppointmentRow[],
  appointmentServices: AppointmentServiceRow[],
  prevAppointments: AppointmentRow[],
  prevServices: AppointmentServiceRow[],
): InsightItem[] {
  const insights: InsightItem[] = [];
  const completed = appointments.filter(a => a.status === 'completed');
  const noShows = appointments.filter(a => a.status === 'no_show');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const prevCompleted = prevAppointments.filter(a => a.status === 'completed');

  if (completed.length === 0 && appointments.length === 0) {
    return [{ text: 'Quando ci saranno dati sufficienti, Aegis AI genererà insights personalizzati sulla tua attività.', type: 'neutral' }];
  }

  // ===== 1. Trend appuntamenti completati =====
  if (prevCompleted.length > 0) {
    const change = Math.round(((completed.length - prevCompleted.length) / prevCompleted.length) * 100);
    if (change > 10) {
      insights.push({ text: `Hai completato ${completed.length} appuntamenti, il ${change}% in più rispetto al periodo precedente. Ottima performance!`, type: 'positive' });
    } else if (change < -10) {
      insights.push({ text: `Hai completato ${completed.length} appuntamenti, il ${Math.abs(change)}% in meno rispetto al periodo precedente. Valuta se ci sono giorni o orari da ottimizzare.`, type: 'warning' });
    } else {
      insights.push({ text: `Hai completato ${completed.length} appuntamenti, in linea con il periodo precedente. Continua così!`, type: 'neutral' });
    }
  } else if (completed.length > 0) {
    insights.push({ text: `Hai completato ${completed.length} appuntamenti nel periodo. Ottimo inizio!`, type: 'positive' });
  }

  // ===== 2. Ticket medio personale =====
  const curRevenue = appointmentServices
    .filter(s => completed.some(a => a.id === s.appointment_id))
    .reduce((sum, s) => sum + s.price, 0);
  const prevRevenue = prevServices
    .filter(s => prevCompleted.some(a => a.id === s.appointment_id))
    .reduce((sum, s) => sum + s.price, 0);
  if (completed.length > 0 && curRevenue > 0) {
    const avgTicket = curRevenue / completed.length;
    const prevAvgTicket = prevCompleted.length > 0 && prevRevenue > 0 ? prevRevenue / prevCompleted.length : 0;
    if (prevAvgTicket > 0) {
      const change = ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100;
      if (change > 5) {
        insights.push({ text: `Il tuo ticket medio è €${avgTicket.toFixed(0)} (+${change.toFixed(0)}% vs periodo precedente). Stai valorizzando molto bene il tuo lavoro!`, type: 'positive' });
      } else if (change < -5) {
        insights.push({ text: `Il tuo ticket medio è sceso a €${avgTicket.toFixed(0)} (${change.toFixed(0)}%). Considera di proporre trattamenti aggiuntivi durante le sessioni.`, type: 'warning' });
      } else {
        insights.push({ text: `Il tuo ticket medio è stabile a €${avgTicket.toFixed(0)}. Potresti proporre upgrade o trattamenti complementari.`, type: 'neutral' });
      }
    } else {
      insights.push({ text: `Il tuo ticket medio nel periodo è €${avgTicket.toFixed(0)}.`, type: 'neutral' });
    }
  }

  // ===== 3. Servizio più eseguito =====
  const serviceCounts: Record<string, { name: string; count: number }> = {};
  completed.forEach(a => {
    appointmentServices.filter(s => s.appointment_id === a.id).forEach(s => {
      if (!s.service_id) return;
      serviceCounts[s.service_id] = {
        name: s.service_name || s.service_id,
        count: (serviceCounts[s.service_id]?.count || 0) + 1,
      };
    });
  });
  const topService = Object.values(serviceCounts).sort((a, b) => b.count - a.count)[0];
  if (topService) {
    insights.push({ text: `Il tuo servizio più eseguito è "${topService.name}" (${topService.count} volt${topService.count === 1 ? 'a' : 'e'} nel periodo). Sei il punto di riferimento per questo trattamento.`, type: 'positive' });
  }

  // ===== 4. Orario di punta personale =====
  const hourCount: Record<number, number> = {};
  appointments.forEach(a => {
    const h = new Date(a.start_time).getHours();
    hourCount[h] = (hourCount[h] || 0) + 1;
  });
  const peakHours = Object.entries(hourCount).sort(([, a], [, b]) => b - a);
  const quietHours = Object.entries(hourCount).sort(([, a], [, b]) => a - b);
  if (peakHours.length > 0) {
    const peak = peakHours[0];
    insights.push({ text: `La tua fascia più richiesta è le ${peak[0]}:00 (${peak[1]} appuntamenti). Assicurati di essere sempre disponibile in quell'orario.`, type: 'neutral' });
  }
  if (quietHours.length >= 3) {
    const quiet = quietHours[0];
    if (parseInt(quiet[0]) >= 8 && parseInt(quiet[0]) <= 19) {
      insights.push({ text: `Le ${quiet[0]}:00 è la tua fascia meno sfruttata (${quiet[1]} appuntamenti). Potresti segnalarlo per promozioni mirate in quell'orario.`, type: 'neutral' });
    }
  }

  // ===== 5. Giorno più tranquillo =====
  const dayCount: Record<number, number> = {};
  appointments.forEach(a => {
    const day = new Date(a.start_time).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const dayEntries = Object.entries(dayCount).sort(([, a], [, b]) => a - b);
  if (dayEntries.length >= 3) {
    const quietDay = DAY_LABELS_FULL[parseInt(dayEntries[0][0])];
    const busyDay = DAY_LABELS_FULL[parseInt(dayEntries[dayEntries.length - 1][0])];
    insights.push({ text: `Il ${quietDay} è il tuo giorno più tranquillo, mentre il ${busyDay} è il più intenso. Tienilo a mente per pianificare ferie e pause.`, type: 'neutral' });
  }

  // ===== 6. No-show personali =====
  if (noShows.length > 0 && appointments.length > 0) {
    const noShowRate = Math.round((noShows.length / appointments.length) * 100);
    if (noShowRate > 5) {
      insights.push({ text: `Hai avuto ${noShows.length} no-show nel periodo (${noShowRate}% dei tuoi appuntamenti). Considera di inviare un promemoria ai tuoi clienti.`, type: 'warning' });
    } else {
      insights.push({ text: `Solo ${noShows.length} no-show nel periodo (${noShowRate}%). I tuoi clienti sono molto fedeli!`, type: 'positive' });
    }
  }

  // ===== 7. Cancellazioni personali =====
  if (cancelled.length > 0 && appointments.length > 0) {
    const cancelRate = Math.round((cancelled.length / appointments.length) * 100);
    if (cancelRate > 10) {
      insights.push({ text: `${cancelled.length} cancellazioni nel periodo (${cancelRate}%). Potrebbe valere la pena capire il motivo con i clienti abituali.`, type: 'warning' });
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
  const permissions = useStaffPermissions();
  // Tab attivo: 'mine' = le mie statistiche (filtrate per staff), 'business' = tutto il business
  const [activeStatsTab, setActiveStatsTab] = useState<'mine' | 'business'>('mine');

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

  // Determina se filtrare per staff_id:
  // - staff senza visibilità business: sempre filtra
  // - staff con visibilità business: filtra solo sul tab 'mine'
  const filterByCurrentStaff =
    permissions.isStaff &&
    permissions.currentStaffId &&
    (!permissions.canSeeBusinessStats || activeStatsTab === 'mine');

  const fetchData = useCallback(async (p: PeriodFilter) => {
    setLoading(true);
    const { start, end, prevStart, prevEnd } = getPeriodDates(p);

    const curQuery = supabase
      .from('appointments')
      .select('id, staff_id, status, start_time, created_at, customer_id')
      .eq('business_id', businessId)
      .gte('start_time', formatDateISO(start))
      .lt('start_time', formatDateISO(end));
    if (filterByCurrentStaff) curQuery.eq('staff_id', permissions.currentStaffId!);
    const { data: currentAppts } = await curQuery as { data: AppointmentRow[] | null };

    const prevQuery = supabase
      .from('appointments')
      .select('id, staff_id, status, start_time, created_at, customer_id')
      .eq('business_id', businessId)
      .gte('start_time', formatDateISO(prevStart))
      .lt('start_time', formatDateISO(prevEnd));
    if (filterByCurrentStaff) prevQuery.eq('staff_id', permissions.currentStaffId!);
    const { data: prevAppts } = await prevQuery as { data: AppointmentRow[] | null };

    const current = currentAppts || [];
    const prev = prevAppts || [];

    // Fetch appointment services in parallelo (currentServices e prevServices sono indipendenti)
    const currentIds = current.map(a => a.id);
    const prevIds = prev.map(a => a.id);
    const [currentServicesRes, prevServicesRes] = await Promise.all([
      currentIds.length > 0
        ? supabase.from('appointment_services').select('appointment_id, service_id, service_name, price').in('appointment_id', currentIds) as unknown as Promise<{ data: AppointmentServiceRow[] | null }>
        : Promise.resolve({ data: [] as AppointmentServiceRow[] }),
      prevIds.length > 0
        ? supabase.from('appointment_services').select('appointment_id, service_id, service_name, price').in('appointment_id', prevIds) as unknown as Promise<{ data: AppointmentServiceRow[] | null }>
        : Promise.resolve({ data: [] as AppointmentServiceRow[] }),
    ]);
    const currentServices = currentServicesRes.data || [];
    const prevServices = prevServicesRes.data || [];

    // KPIs
    const completed = current.filter(a => a.status === 'completed');
    const prevCompleted = prev.filter(a => a.status === 'completed');

    // Map appointmentId → servizi per lookup O(1) invece di O(n) per ogni ricerca
    const svcByAppt = currentServices.reduce((m, s) => {
      m.set(s.appointment_id, [...(m.get(s.appointment_id) ?? []), s]);
      return m;
    }, new Map<string, AppointmentServiceRow[]>());
    const prevSvcByAppt = prevServices.reduce((m, s) => {
      m.set(s.appointment_id, [...(m.get(s.appointment_id) ?? []), s]);
      return m;
    }, new Map<string, AppointmentServiceRow[]>());
    const completedIds = new Set(completed.map(a => a.id));
    const prevCompletedIds = new Set(prevCompleted.map(a => a.id));

    const curRevenue = currentServices.filter(s => completedIds.has(s.appointment_id)).reduce((sum, s) => sum + s.price, 0);
    const prevRevenue = prevServices.filter(s => prevCompletedIds.has(s.appointment_id)).reduce((sum, s) => sum + s.price, 0);

    const curCustomers = new Set(current.filter(a => a.customer_id).map(a => a.customer_id)).size;
    const prevCustomers = new Set(prev.filter(a => a.customer_id).map(a => a.customer_id)).size;

    const noShows = current.filter(a => a.status === 'no_show').length;
    const prevNoShows = prev.filter(a => a.status === 'no_show').length;
    const noShowRate = current.length > 0 ? (noShows / current.length) * 100 : 0;
    const prevNoShowRate = prev.length > 0 ? (prevNoShows / prev.length) * 100 : 0;

    const calcChange = (cur: number, prv: number) => prv > 0 ? ((cur - prv) / prv) * 100 : cur > 0 ? 100 : 0;

    setKpis([
      { label: 'Entrate totali', value: `€ ${curRevenue.toLocaleString('it-IT')}`, change: calcChange(curRevenue, prevRevenue), icon: Euro, color: 'bg-purple-100 text-purple-600', gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)' },
      { label: 'Appuntamenti', value: current.length.toString(), change: calcChange(current.length, prev.length), icon: Calendar, color: 'bg-blue-100 text-blue-600', gradient: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
      { label: 'Clienti unici', value: curCustomers.toString(), change: calcChange(curCustomers, prevCustomers), icon: Users, color: 'bg-emerald-100 text-emerald-600', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      { label: 'No-show', value: `${noShowRate.toFixed(1)}%`, change: prevNoShowRate > 0 ? -(calcChange(noShowRate, prevNoShowRate)) : undefined, icon: UserX, color: 'bg-red-100 text-red-600', gradient: 'linear-gradient(135deg, #b91c1c, #7f1d1d)' },
    ]);

    // Charts
    const revenueByDate: Record<string, number> = {};
    const apptsByDate: Record<string, number> = {};
    const useMonths = p === 'year' || p === '3months';

    completed.forEach(a => {
      const key = useMonths
        ? `${new Date(a.start_time).getFullYear()}-${String(new Date(a.start_time).getMonth() + 1).padStart(2, '0')}`
        : a.start_time.slice(0, 10);
      revenueByDate[key] = (revenueByDate[key] || 0) + (svcByAppt.get(a.id) ?? []).reduce((sum, s) => sum + s.price, 0);
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
    currentServices.filter(s => completedIds.has(s.appointment_id)).forEach(s => {
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
      staffStats[a.staff_id].revenue += (svcByAppt.get(a.id) ?? []).reduce((sum, s) => sum + s.price, 0);
    });
    setStaffPerfData(staff.map(s => ({ name: s.display_name, color: s.color, appointments: staffStats[s.id]?.appointments || 0, revenue: staffStats[s.id]?.revenue || 0, isIncomplete: !s.hasEmail })).sort((a, b) => b.revenue - a.revenue));

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
      dayRevenueMap[mappedDay].revenue += (svcByAppt.get(a.id) ?? []).reduce((sum, s) => sum + s.price, 0);
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

    // Enhanced Insights — versione personalizzata per lo staff
    setInsights(
      filterByCurrentStaff
        ? generateStaffInsights(current, currentServices, prev, prevServices)
        : generateInsights(current, currentServices, staff, prev, prevServices)
    );
    setLoading(false);
  }, [businessId, staff, supabase, filterByCurrentStaff, permissions.currentStaffId]);

  useEffect(() => { fetchData(period); }, [period, fetchData, activeStatsTab]);

  const handleExport = async () => {
    if (loading) return;
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Aegis Beauty';
      workbook.created = new Date();

      // ── Color palette ──
      const HEADER_FILL = 'FF7C3AED';
      const HEADER_BD   = 'FF5B21B6';
      const EVEN_FILL   = 'FFF5F3FF';
      const ODD_FILL    = 'FFFFFFFF';
      const BORDER_CLR  = 'FFE5E7EB';
      const TITLE_FILL  = 'FF4C1D95';
      const SEC_FILL    = 'FFF3E8FF';
      const SEC_TXT     = 'FF6D28D9';
      const BODY_TXT    = 'FF1F2937';

      const periodLabels: Record<PeriodFilter, string> = {
        today: 'Oggi', week: 'Settimana', month: 'Mese',
        '3months': 'Ultimi 3 mesi', year: 'Anno', custom: 'Personalizzato',
      };

      // KPI card gradients (matching the page)
      const KPI_COLORS = ['FF9333EA', 'FF1E3A8A', 'FF10B981', 'FFB91C1C'];

      // ── Shared helpers ──
      const addTitleRow = (ws: ExcelJS.Worksheet, text: string, colCount: number) => {
        const row = ws.addRow([text, ...Array(colCount - 1).fill('')]);
        row.height = 30;
        ws.mergeCells(row.number, 1, row.number, colCount);
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_FILL } };
        row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 14 };
        row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      };

      const addSectionHeader = (ws: ExcelJS.Worksheet, text: string, colCount: number) => {
        const row = ws.addRow([text, ...Array(colCount - 1).fill('')]);
        row.height = 20;
        ws.mergeCells(row.number, 1, row.number, colCount);
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
        row.getCell(1).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
        row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      };

      const addTableHeader = (ws: ExcelJS.Worksheet, labels: string[]) => {
        const row = ws.addRow(labels);
        row.height = 22;
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: { style: 'thin', color: { argb: HEADER_BD } }, left: { style: 'thin', color: { argb: HEADER_BD } }, bottom: { style: 'medium', color: { argb: HEADER_BD } }, right: { style: 'thin', color: { argb: HEADER_BD } } };
        });
      };

      const styleDataRow = (row: ExcelJS.Row, isEven: boolean) => {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? EVEN_FILL : ODD_FILL } };
          cell.font = { name: 'Calibri', size: 10, color: { argb: BODY_TXT } };
          cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      };

      // ════════════════════════════════════════════════════════════════
      // SHEET 1: PANORAMICA
      // Mirrors: KPI cards, Entrate chart, Appuntamenti chart,
      //          Tasso di ritorno (retention), Entrate per giorno (radar)
      // ════════════════════════════════════════════════════════════════
      const ws1 = workbook.addWorksheet('Panoramica');
      ws1.views = [{ state: 'frozen', ySplit: 1 }];
      ws1.columns = [
        { key: 'a', width: 28 }, { key: 'b', width: 18 }, { key: 'c', width: 14 },
        { key: 'd', width: 2 },
        { key: 'e', width: 28 }, { key: 'f', width: 18 }, { key: 'g', width: 14 },
      ];

      // Title
      {
        const row = ws1.addRow([`Report Statistiche — ${periodLabels[period]}`, '', '', '', '', '', new Date().toLocaleDateString('it-IT')]);
        row.height = 30;
        ws1.mergeCells(row.number, 1, row.number, 6);
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_FILL } };
        row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 14 };
        row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_FILL } };
        row.getCell(7).font = { color: { argb: 'FFCBA7FC' }, name: 'Calibri', size: 10 };
        row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
      }
      ws1.addRow([]);

      // ── KPI cards (2 × 2 grid) ──
      // Layout: [KPI label merged cols 1-3] [spacer col 4] [KPI label merged cols 5-7]
      //         [KPI value col 1] [change col 2]           [KPI value col 5] [change col 6]
      addSectionHeader(ws1, 'KPI Principali', 7);
      ws1.addRow([]);

      // Helper to render one KPI pair row-by-row
      const renderKpiPair = (kL: typeof kpis[0] | undefined, kR: typeof kpis[0] | undefined, colorL: string, colorR: string) => {
        // Row 1: colored label headers
        const labelRow = ws1.addRow([kL?.label ?? '', '', '', '', kR?.label ?? '', '', '']);
        labelRow.height = 18;
        if (kL) {
          ws1.mergeCells(labelRow.number, 1, labelRow.number, 3);
          labelRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorL } };
          labelRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
          labelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (kR) {
          ws1.mergeCells(labelRow.number, 5, labelRow.number, 7);
          labelRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorR } };
          labelRow.getCell(5).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
          labelRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Row 2: value + change
        const chStrL = kL?.change !== undefined ? `${(kL.change ?? 0) >= 0 ? '+' : ''}${(kL.change ?? 0).toFixed(1)}%` : '';
        const chStrR = kR?.change !== undefined ? `${(kR.change ?? 0) >= 0 ? '+' : ''}${(kR.change ?? 0).toFixed(1)}%` : '';
        const valRow = ws1.addRow([kL?.value ?? '', chStrL, '', '', kR?.value ?? '', chStrR, '']);
        valRow.height = 30;
        if (kL) {
          valRow.getCell(1).font = { bold: true, name: 'Calibri', size: 20, color: { argb: BODY_TXT } };
          valRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
          valRow.getCell(2).font = { bold: true, name: 'Calibri', size: 11, color: { argb: (kL.change ?? 0) >= 0 ? 'FF059669' : 'FFDC2626' } };
          valRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        }
        if (kR) {
          valRow.getCell(5).font = { bold: true, name: 'Calibri', size: 20, color: { argb: BODY_TXT } };
          valRow.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
          valRow.getCell(6).font = { bold: true, name: 'Calibri', size: 11, color: { argb: (kR.change ?? 0) >= 0 ? 'FF059669' : 'FFDC2626' } };
          valRow.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };
        }
        ws1.addRow([]);
      };

      renderKpiPair(kpis[0], kpis[1], KPI_COLORS[0], KPI_COLORS[1]);
      renderKpiPair(kpis[2], kpis[3], KPI_COLORS[2], KPI_COLORS[3]);

      ws1.addRow([]);

      // ── Andamento: Entrate + Appuntamenti (combined) ──
      addSectionHeader(ws1, 'Andamento nel Periodo — Entrate & Appuntamenti', 7);
      addTableHeader(ws1, ['Periodo', 'Entrate (€)', 'Appuntamenti', '', '', '', '']);
      {
        const allLabels = [...new Set([...revenueChart.map(d => d.label), ...appointmentsChart.map(d => d.label)])];
        allLabels.forEach((label, i) => {
          const rev  = revenueChart.find(d => d.label === label)?.value ?? 0;
          const appt = appointmentsChart.find(d => d.label === label)?.value ?? 0;
          const row = ws1.addRow([label, rev, appt, '', '', '', '']);
          styleDataRow(row, i % 2 === 0);
          row.getCell(2).numFmt = '#,##0.00 "€"';
          row.getCell(3).numFmt = '#,##0';
        });
      }
      ws1.addRow([]);

      // ── Tasso di Ritorno (Retention) ──
      if (retention) {
        addSectionHeader(ws1, 'Tasso di Ritorno — Clienti Ricorrenti vs Nuovi', 7);
        addTableHeader(ws1, ['Categoria', 'N. Clienti', '% sul Totale', '', '', '', '']);
        const retRows: [string, number, number][] = [
          ['Clienti di ritorno', retention.returning, retention.returningPct / 100],
          ['Nuovi clienti', retention.new, (100 - retention.returningPct) / 100],
          ['Totale clienti unici', retention.returning + retention.new, 1],
        ];
        retRows.forEach((r, i) => {
          const row = ws1.addRow([r[0], r[1], r[2], '', '', '', '']);
          styleDataRow(row, i % 2 === 0);
          row.getCell(2).numFmt = '#,##0';
          row.getCell(3).numFmt = '0.0%';
          if (r[0] === 'Clienti di ritorno') row.getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
          if (r[0] === 'Nuovi clienti') row.getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2563EB' } };
        });
        ws1.addRow([]);
      }

      // ── Entrate per Giorno (Radar data) ──
      if (dayRevenue && dayRevenue.length > 0) {
        addSectionHeader(ws1, 'Entrate per Giorno — Distribuzione Settimanale', 7);
        addTableHeader(ws1, ['Giorno', 'Entrate (€)', 'Appuntamenti', '', '', '', '']);
        const maxDayRev = Math.max(...dayRevenue.map(d => d.revenue), 1);
        dayRevenue.forEach((d, i) => {
          const row = ws1.addRow([d.day, d.revenue, d.appointments, '', '', '', '']);
          styleDataRow(row, i % 2 === 0);
          row.getCell(2).numFmt = '#,##0.00 "€"';
          row.getCell(3).numFmt = '#,##0';
          // Color intensity bar in col D as visual hint
          const intensity = d.revenue / maxDayRev;
          const rHex = Math.round(255 - (255 - 147) * intensity).toString(16).padStart(2, '0').toUpperCase();
          const gHex = Math.round(255 - (255 - 51)  * intensity).toString(16).padStart(2, '0').toUpperCase();
          const bHex = Math.round(255 - (255 - 234) * intensity).toString(16).padStart(2, '0').toUpperCase();
          row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${rHex}${gHex}${bHex}` } };
          row.getCell(4).border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
        });
      }

      // ════════════════════════════════════════════════════════════════
      // SHEET 2: ANALISI
      // Mirrors: Top 5 Servizi, Performance Staff,
      //          Mappa Attività (heatmap), Insights AI, ROI
      // ════════════════════════════════════════════════════════════════
      const ws2 = workbook.addWorksheet('Analisi');
      ws2.views = [{ state: 'frozen', ySplit: 1 }];
      ws2.columns = [
        { key: 'a', width: 28 }, { key: 'b', width: 16 }, { key: 'c', width: 18 }, { key: 'd', width: 14 }, { key: 'e', width: 14 },
        { key: 'f', width: 2 },
        { key: 'g', width: 26 }, { key: 'h', width: 16 }, { key: 'i', width: 18 }, { key: 'j', width: 16 },
      ];

      // Title
      addTitleRow(ws2, `Analisi — ${periodLabels[period]}`, 10);
      ws2.addRow([]);

      // ── Row 1: Top Servizi (cols A-E) + Staff Performance (cols G-J) ──
      // Top Servizi section header
      {
        const sec = ws2.addRow(['Top 5 Servizi', '', '', '', '', '', 'Performance Staff', '', '', '']);
        sec.height = 20;
        ws2.mergeCells(sec.number, 1, sec.number, 5);
        sec.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
        sec.getCell(1).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
        sec.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        ws2.mergeCells(sec.number, 7, sec.number, 10);
        sec.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
        sec.getCell(7).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
        sec.getCell(7).alignment = { horizontal: 'left', vertical: 'middle' };
      }

      // Headers for both tables
      {
        const hdr = ws2.addRow(['#', 'Servizio', 'Prenotazioni', 'Entrate (€)', '% Entrate', '', 'Operatore', 'Appuntamenti', 'Entrate (€)', 'Ticket Medio']);
        hdr.height = 22;
        [1, 2, 3, 4, 5, 7, 8, 9, 10].forEach(cn => {
          const cell = hdr.getCell(cn);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: { style: 'thin', color: { argb: HEADER_BD } }, left: { style: 'thin', color: { argb: HEADER_BD } }, bottom: { style: 'medium', color: { argb: HEADER_BD } }, right: { style: 'thin', color: { argb: HEADER_BD } } };
        });
      }

      // Data rows (both tables same row count — pad shorter one)
      const totalSvcRev = topServicesData.reduce((s, sv) => s + sv.revenue, 0);
      const maxRows = Math.max(topServicesData.length, staffPerfData.length);
      for (let i = 0; i < maxRows; i++) {
        const svc = topServicesData[i];
        const stf = staffPerfData[i];
        const isEven = i % 2 === 0;
        const rowData: (string | number)[] = [
          svc ? i + 1 : '',
          svc ? svc.name : '',
          svc ? svc.count : '',
          svc ? svc.revenue : '',
          svc ? (totalSvcRev > 0 ? svc.revenue / totalSvcRev : 0) : '',
          '',
          stf ? stf.name : '',
          stf ? stf.appointments : '',
          stf ? stf.revenue : '',
          stf ? (stf.appointments > 0 ? stf.revenue / stf.appointments : 0) : '',
        ];
        const row = ws2.addRow(rowData);
        [1, 2, 3, 4, 5].forEach(cn => {
          const cell = row.getCell(cn);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? EVEN_FILL : ODD_FILL } };
          cell.font = { name: 'Calibri', size: 10, color: { argb: BODY_TXT } };
          cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
        [7, 8, 9, 10].forEach(cn => {
          const cell = row.getCell(cn);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? EVEN_FILL : ODD_FILL } };
          cell.font = { name: 'Calibri', size: 10, color: { argb: BODY_TXT } };
          cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
        if (svc) { row.getCell(4).numFmt = '#,##0.00 "€"'; row.getCell(5).numFmt = '0.0%'; }
        if (stf) { row.getCell(9).numFmt = '#,##0.00 "€"'; row.getCell(10).numFmt = '#,##0.00 "€"'; }
      }
      ws2.addRow([]);

      // ── Mappa Attività (heatmap) ──
      if (heatmapData && heatmapData.length > 0) {
        const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const allHrs = [...new Set(heatmapData.map(c => c.hour))].sort((a, b) => a - b);
        const colCount = 1 + allHrs.length;

        // Extend columns if needed
        if (ws2.columnCount < colCount) {
          for (let ci = ws2.columnCount + 1; ci <= colCount; ci++) {
            ws2.getColumn(ci).width = 7;
          }
        }

        // Section title
        {
          const sec = ws2.addRow(['Mappa Attività — Concentrazione Appuntamenti per Giorno/Ora', ...Array(colCount - 1).fill('')]);
          sec.height = 20;
          ws2.mergeCells(sec.number, 1, sec.number, colCount);
          sec.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
          sec.getCell(1).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
          sec.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        }

        // Heatmap header
        const hmHdr = ws2.addRow(['Giorno \\ Ora', ...allHrs.map(h => `${h}:00`), ...Array(Math.max(0, 9 - allHrs.length)).fill('')]);
        hmHdr.height = 22;
        for (let ci = 1; ci <= colCount; ci++) {
          const cell = hmHdr.getCell(ci);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: { style: 'thin', color: { argb: HEADER_BD } }, left: { style: 'thin', color: { argb: HEADER_BD } }, bottom: { style: 'medium', color: { argb: HEADER_BD } }, right: { style: 'thin', color: { argb: HEADER_BD } } };
        }

        // Heatmap uses emerald color scale (matching the page)
        const maxCount = Math.max(...heatmapData.map(c => c.count), 1);
        const getEmeraldHex = (count: number): string => {
          if (count === 0) return 'FFF0FDF4'; // emerald-50
          const r = count / maxCount;
          if (r >= 0.8) return 'FF047857'; // emerald-700
          if (r >= 0.6) return 'FF059669'; // emerald-600
          if (r >= 0.4) return 'FF10B981'; // emerald-500
          if (r >= 0.2) return 'FF6EE7B7'; // emerald-300
          return 'FFA7F3D0';               // emerald-200
        };
        const getEmeraldTextHex = (count: number): string => {
          const r = count / maxCount;
          return r >= 0.5 ? 'FFFFFFFF' : BODY_TXT;
        };

        DAY_NAMES.forEach((dayName, dayIdx) => {
          const hmRow = ws2.addRow([dayName, ...allHrs.map(h => {
            const c = heatmapData.find(x => x.day === dayIdx && x.hour === h)?.count ?? 0;
            return c > 0 ? c : '';
          })]);
          hmRow.height = 20;
          // Day label cell
          const dc = hmRow.getCell(1);
          dc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
          dc.font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
          dc.alignment = { horizontal: 'center', vertical: 'middle' };
          dc.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          // Count cells
          allHrs.forEach((h, hIdx) => {
            const count = heatmapData.find(x => x.day === dayIdx && x.hour === h)?.count ?? 0;
            const cell = hmRow.getCell(hIdx + 2);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getEmeraldHex(count) } };
            cell.font = { name: 'Calibri', size: 9, bold: count > 0, color: { argb: getEmeraldTextHex(count) } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          });
        });

        // Legend row
        ws2.addRow([]);
        const leg = ws2.addRow(['Legenda:', 'Vuoto', 'Bassa', 'Media-bassa', 'Media', 'Media-alta', 'Alta', 'Massima']);
        leg.height = 16;
        leg.getCell(1).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 9 };
        ['FFF0FDF4', 'FFA7F3D0', 'FF6EE7B7', 'FF10B981', 'FF059669', 'FF047857'].forEach((color, i) => {
          const cell = leg.getCell(i + 2);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
          cell.font = { name: 'Calibri', size: 8, color: { argb: i >= 4 ? 'FFFFFFFF' : BODY_TXT } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
        });
      } else if (popularHoursData.length > 0) {
        // Fallback: popular hours bar data
        addSectionHeader(ws2, 'Orari Più Richiesti', 5);
        addTableHeader(ws2, ['Fascia Oraria', 'N. Appuntamenti', '', '', '']);
        [...popularHoursData].sort((a, b) => parseInt(a.hour) - parseInt(b.hour)).forEach((h, i) => {
          const row = ws2.addRow([h.hour, h.count, '', '', '']);
          styleDataRow(row, i % 2 === 0);
          row.getCell(2).numFmt = '#,##0';
        });
      }
      ws2.addRow([]);

      // ── Insights AI + ROI (side by side: cols A-E | G-J) ──
      {
        const sec = ws2.addRow(['Insights AI — Aegis BETA', '', '', '', '', '', roi ? 'ROI — Risparmio Stimato' : '', '', '', '']);
        sec.height = 20;
        ws2.mergeCells(sec.number, 1, sec.number, 5);
        sec.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B0764' } };
        sec.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
        sec.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        if (roi) {
          ws2.mergeCells(sec.number, 7, sec.number, 10);
          sec.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEC_FILL } };
          sec.getCell(7).font = { bold: true, color: { argb: SEC_TXT }, name: 'Calibri', size: 10 };
          sec.getCell(7).alignment = { horizontal: 'left', vertical: 'middle' };
        }
      }

      // Insights header
      {
        const hdr = ws2.addRow(['Tipo', 'Analisi', '', '', '', '', roi ? 'Indicatore' : '', roi ? 'Valore' : '', '', '']);
        hdr.height = 22;
        [1, 2].forEach(cn => {
          const cell = hdr.getCell(cn);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: { style: 'thin', color: { argb: 'FF3B0764' } }, left: { style: 'thin', color: { argb: '3B0764' } }, bottom: { style: 'medium', color: { argb: 'FF3B0764' } }, right: { style: 'thin', color: { argb: 'FF3B0764' } } };
        });
        if (roi) {
          [7, 8].forEach(cn => {
            const cell = hdr.getCell(cn);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'thin', color: { argb: HEADER_BD } }, left: { style: 'thin', color: { argb: HEADER_BD } }, bottom: { style: 'medium', color: { argb: HEADER_BD } }, right: { style: 'thin', color: { argb: HEADER_BD } } };
          });
        }
      }

      // Merge insight "Analisi" col across B-E
      const typeLabel: Record<string, string> = { positive: '✓ Positivo', neutral: '→ Neutro', warning: '⚠ Attenzione' };
      const typeColor: Record<string, string> = { positive: 'FF059669', neutral: 'FF6D28D9', warning: 'FFD97706' };
      const roiRows = roi ? [
        ['Risparmio mensile', `€ ${roi.monthlySavings.toLocaleString('it-IT')}`],
        ['Risparmio annuale', `€ ${roi.annualSavings.toLocaleString('it-IT')}`],
        ['Ore risparmiate/mese', `${roi.hoursSavedMonthly}h`],
        ['No-show evitati/mese', roi.noShowsAvoided.toString()],
        ...(roi.dailyPhoneTime !== undefined ? [['Tempo tel./giorno (prima)', `${roi.dailyPhoneTime} min`]] : []),
        ...(roi.monthlyNoShows !== undefined ? [['No-show/mese (prima)', String(roi.monthlyNoShows)]] : []),
      ] : [];

      const maxInsRows = Math.max(insights.length, roiRows.length);
      for (let i = 0; i < maxInsRows; i++) {
        const ins = insights[i];
        const roiR = roiRows[i];
        const isEven = i % 2 === 0;
        const row = ws2.addRow([
          ins ? (typeLabel[ins.type] ?? ins.type) : '',
          ins ? ins.text : '',
          '', '', '',
          '',
          roiR ? roiR[0] : '',
          roiR ? roiR[1] : '',
          '', '',
        ]);
        row.height = ins ? 30 : 18;
        ws2.mergeCells(row.number, 2, row.number, 5);

        // Insight cells
        if (ins) {
          row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF5F3FF' : 'FFFFFFFF' } };
          row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: { argb: typeColor[ins.type] ?? BODY_TXT } };
          row.getCell(1).border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          row.getCell(1).alignment = { vertical: 'middle' };
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF5F3FF' : 'FFFFFFFF' } };
          row.getCell(2).font = { name: 'Calibri', size: 10, color: { argb: BODY_TXT } };
          row.getCell(2).border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
          row.getCell(2).alignment = { vertical: 'top', wrapText: true };
        }

        // ROI cells
        if (roiR) {
          [7, 8].forEach(cn => {
            const cell = row.getCell(cn);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? EVEN_FILL : ODD_FILL } };
            cell.font = cn === 8
              ? { bold: true, name: 'Calibri', size: 10, color: { argb: 'FF7C3AED' } }
              : { name: 'Calibri', size: 10, color: { argb: BODY_TXT } };
            cell.border = { top: { style: 'thin', color: { argb: BORDER_CLR } }, left: { style: 'thin', color: { argb: BORDER_CLR } }, bottom: { style: 'thin', color: { argb: BORDER_CLR } }, right: { style: 'thin', color: { argb: BORDER_CLR } } };
            cell.alignment = { vertical: 'middle' };
          });
        }
      }

      // ── Auto-height rows for wrapped text (columns keep their fixed widths) ──
      const autoHeightWorksheet = (ws: ExcelJS.Worksheet) => {
        ws.eachRow((row) => {
          let maxLines = 1;

          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (!cell.alignment?.wrapText) return;
            if (typeof cell.value !== 'string' || cell.value.length <= 25) return;

            const colWidth = Math.max((ws.getColumn(colNumber).width as number | undefined) ?? 20, 12);
            const charsPerLine = Math.floor(colWidth * 1.05);
            const lines = Math.ceil(cell.value.length / charsPerLine);
            maxLines = Math.max(maxLines, lines);
          });

          if (maxLines > 1) {
            const estimatedHeight = Math.min(120, maxLines * 15 + 4);
            if (!row.height || row.height < estimatedHeight) {
              row.height = estimatedHeight;
            }
          }
        });
      };

      autoHeightWorksheet(ws1);
      autoHeightWorksheet(ws2);

      // ── Download ──
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-statistiche-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export statistiche error:', err);
      toast.error('Errore durante l\'esportazione');
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      {/* Tab switcher — solo per staff con visibilità statistiche business */}
      {permissions.isStaff && permissions.canSeeBusinessStats && (
        <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.1)' }}>
          {(['mine', 'business'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatsTab(tab)}
              className="relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 overflow-hidden"
              style={{
                background: activeStatsTab === tab ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                color: activeStatsTab === tab ? '#fff' : '#9333ea',
                boxShadow: activeStatsTab === tab ? '0 2px 8px rgba(147,51,234,0.3)' : 'none',
              }}
            >
              {activeStatsTab === tab && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                  animation: 'stats-shimmer 2.5s ease-in-out infinite',
                }} />
              )}
              <span className="relative z-10">{tab === 'mine' ? 'Le mie statistiche' : 'Business'}</span>
            </button>
          ))}
        </div>
      )}

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
          isStaff={permissions.isStaff && activeStatsTab !== 'business'}
        />
      </div>
    </div>
  );
}