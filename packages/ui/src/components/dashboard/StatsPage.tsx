// ============================================================================
// AEGIS SUITE - STATS PAGE COMPONENT (v2 — Glass Holographic Design)
// File: packages/ui/src/components/dashboard/StatsPage.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Sparkles,
  BarChart3,
  LineChart,
  AlertTriangle,
  Lightbulb,
  Clock,
  Info,
  Shield,
  PhoneOff,
  PiggyBank,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

// ============================================================================
// TYPES (unchanged — keep compatibility)
// ============================================================================

export type PeriodFilter = 'today' | 'week' | 'month' | '3months' | 'year' | 'custom';

export interface KPICard {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface PopularHour {
  hour: string;
  count: number;
}

export interface StaffPerformance {
  name: string;
  color: string;
  appointments: number;
  revenue: number;
}

export interface InsightItem {
  text: string;
  type: 'positive' | 'neutral' | 'warning';
}

export interface ROIStats {
  hoursSavedMonthly: number;
  noShowsAvoided: number;
  monthlySavings: number;
  annualSavings: number;
  dailyPhoneTime?: number;
  monthlyNoShows?: number;
}

export interface StatsPageProps {
  kpis: KPICard[];
  revenueChart: ChartDataPoint[];
  appointmentsChart: ChartDataPoint[];
  topServices: TopService[];
  popularHours: PopularHour[];
  staffPerformance: StaffPerformance[];
  insights: InsightItem[];
  roi?: ROIStats | null;
  currency?: string;
  activePeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  onExport?: () => void;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_OPTIONS: { id: PeriodFilter; label: string }[] = [
  { id: 'today', label: 'Oggi' },
  { id: 'week', label: 'Settimana' },
  { id: 'month', label: 'Mese' },
  { id: '3months', label: '3 Mesi' },
  { id: 'year', label: 'Anno' },
];

const PERIOD_COMPARISON_LABELS: Record<PeriodFilter, string> = {
  today: 'vs ieri',
  week: 'vs settimana scorsa',
  month: 'vs mese scorso',
  '3months': 'vs 3 mesi precedenti',
  year: 'vs anno scorso',
  custom: 'vs periodo precedente',
};

function formatCurrency(amount: number, currency = '€'): string {
  return `${currency} ${amount.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Glass card style shared by all sections
const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1.5px solid rgba(168,85,247,0.1)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03), 0 0 0 1px rgba(168,85,247,0.04)',
};

const DONUT_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

// ============================================================================
// KPI CARD — glass with violet accent line
// ============================================================================

function KPICardComponent({ card, comparisonLabel }: { card: KPICard; comparisonLabel: string }) {
  const Icon = card.icon;
  const isPositive = (card.change ?? 0) >= 0;
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className="relative p-4 overflow-hidden transition-all duration-200 group"
      style={{
        ...GLASS_CARD,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(147,51,234,0.1), 0 0 0 1px rgba(168,85,247,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = GLASS_CARD.boxShadow as string;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.4), transparent)' }} />

      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(168,85,247,0.04))',
            border: '1px solid rgba(168,85,247,0.1)',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
        </div>
        {card.change !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive ? 'text-emerald-600' : 'text-red-500'
            }`} style={{
              background: isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            }}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(card.change).toFixed(1)}%
            </div>
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help transition-colors" />
              {showTooltip && (
                <div className="absolute right-0 top-full mt-1.5 z-50 whitespace-nowrap">
                  <div className="text-white text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', boxShadow: '0 4px 12px rgba(147,51,234,0.3)' }}>
                    {comparisonLabel}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
    </div>
  );
}

// ============================================================================
// GLASS CHART TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label, currency = '€', isCurrency = true }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string; currency?: string; isCurrency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{
      background: 'linear-gradient(135deg, rgba(30,20,60,0.92), rgba(50,30,80,0.88))',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(168,85,247,0.2)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2), 0 0 12px rgba(147,51,234,0.15)',
    }}>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-bold text-white">{isCurrency ? formatCurrency(payload[0].value, currency) : payload[0].value}</p>
    </div>
  );
}

// ============================================================================
// REVENUE CHART — holographic glow
// ============================================================================

function RevenueChart({ data, currency }: { data: ChartDataPoint[]; currency: string }) {
  return (
    <div className="p-5" style={GLASS_CARD}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Entrate</h3>
          <p className="text-xs text-gray-400">Andamento nel periodo</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.1)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6', boxShadow: '0 0 6px rgba(139,92,246,0.5)' }} />
          <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>Entrate</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#revenueGlow)"
              dot={false}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, filter: 'url(#glow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// APPOINTMENTS CHART — gradient bars
// ============================================================================

function AppointmentsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="p-5" style={GLASS_CARD}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Appuntamenti</h3>
          <p className="text-xs text-gray-400">Distribuzione nel periodo</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
          <span className="text-xs font-medium text-indigo-600">Prenotazioni</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip isCurrency={false} />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={36} fill="url(#barGrad)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// TOP SERVICES — donut + list
// ============================================================================

function TopServicesSection({ services, currency }: { services: TopService[]; currency: string }) {
  const pieData = services.slice(0, 5).map((s, i) => ({
    name: s.name,
    value: s.revenue,
    fill: DONUT_COLORS[i],
  }));
  const totalRevenue = services.reduce((s, v) => s + v.revenue, 0);

  return (
    <div className="p-5" style={GLASS_CARD}>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top 5 Servizi</h3>
      {services.length > 0 ? (
        <div className="flex gap-5">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={64}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.8)"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400">Totale</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(totalRevenue, currency)}</span>
            </div>
          </div>
          {/* List */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {services.slice(0, 5).map((s, idx) => (
              <div key={s.name} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[idx], boxShadow: `0 0 6px ${DONUT_COLORS[idx]}40` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{s.name}</span>
                    <span className="text-sm font-semibold ml-2 flex-shrink-0" style={{ color: '#6d28d9' }}>{formatCurrency(s.revenue, currency)}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{s.count} prenotazioni</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Nessun dato disponibile</p>
      )}
    </div>
  );
}

// ============================================================================
// POPULAR HOURS — gradient bars with glow
// ============================================================================

function PopularHoursSection({ hours }: { hours: PopularHour[] }) {
  const maxCount = Math.max(...hours.map(h => h.count), 1);

  return (
    <div className="p-5" style={GLASS_CARD}>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Ore Popolari</h3>
      {hours.length > 0 ? (
        <div className="space-y-2">
          {hours.map(h => {
            const pct = (h.count / maxCount) * 100;
            const isHot = pct > 75;
            return (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-10 flex-shrink-0">{h.hour}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <div
                    className="h-full rounded-full relative overflow-hidden transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isHot
                        ? 'linear-gradient(90deg, #8b5cf6, #a855f7, #c084fc)'
                        : 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
                      boxShadow: isHot ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
                    }}
                  >
                    {/* Shimmer on hot bars */}
                    {isHot && (
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        animation: 'stats-shimmer 2s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold w-6 text-right ${isHot ? 'text-violet-600' : 'text-gray-500'}`}>{h.count}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Nessun dato disponibile</p>
      )}
    </div>
  );
}

// ============================================================================
// STAFF PERFORMANCE — glass table with inline bars
// ============================================================================

function StaffPerformanceSection({ staff, currency }: { staff: StaffPerformance[]; currency: string }) {
  const maxRevenue = Math.max(...staff.map(s => s.revenue), 1);

  return (
    <div className="p-5" style={GLASS_CARD}>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Performance Staff</h3>
      {staff.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                <th className="text-left pb-3 font-semibold">Operatore</th>
                <th className="text-center pb-3 font-semibold">App.</th>
                <th className="text-right pb-3 font-semibold">Entrate</th>
                <th className="text-right pb-3 font-semibold">Media</th>
                <th className="pb-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {staff.map((s, idx) => (
                <tr key={s.name} className="border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}40` }} />
                      <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      {idx === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(147,51,234,0.08)', color: '#7c3aed' }}>TOP</span>}
                    </div>
                  </td>
                  <td className="text-center text-sm text-gray-600 py-2.5">{s.appointments}</td>
                  <td className="text-right text-sm font-semibold py-2.5" style={{ color: '#6d28d9' }}>{formatCurrency(s.revenue, currency)}</td>
                  <td className="text-right text-sm text-gray-500 py-2.5">{s.appointments > 0 ? formatCurrency(Math.round(s.revenue / s.appointments), currency) : '—'}</td>
                  <td className="py-2.5 pl-3">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(s.revenue / maxRevenue) * 100}%`,
                        background: `linear-gradient(90deg, ${s.color}cc, ${s.color}80)`,
                        boxShadow: idx === 0 ? `0 0 8px ${s.color}40` : 'none',
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">Nessun dato disponibile</p>
      )}
    </div>
  );
}

// ============================================================================
// AEGIS AI INSIGHTS — premium animated border + glass
// ============================================================================

function AegisAIInsights({ insights }: { insights: InsightItem[] }) {
  const isEmpty = insights.length === 0 || (insights.length === 1 && insights[0].type === 'neutral' && insights[0].text.includes('dati sufficienti'));

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl" style={{
        background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc, #7c3aed)',
        animation: 'stats-pulse-border 3s ease-in-out infinite',
        opacity: 0.7,
      }} />
      {/* Inner glass */}
      <div className="absolute inset-[2px] rounded-[14px]" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
      }} />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            boxShadow: '0 4px 16px rgba(147,51,234,0.35)',
          }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Aegis AI</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide uppercase" style={{
                background: 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(168,85,247,0.06))',
                color: '#7c3aed',
                border: '1px solid rgba(147,51,234,0.15)',
              }}>BETA</span>
            </div>
            <p className="text-xs text-gray-400">Insights predittivi basati sui tuoi dati</p>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.04), rgba(168,85,247,0.02))',
            border: '1px solid rgba(147,51,234,0.08)',
          }}>
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
            <p className="text-sm text-gray-500 leading-relaxed">
              Quando ci saranno dati sufficienti, Aegis AI genererà insights predittivi sulla tua attività.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, idx) => {
              const bgColor = insight.type === 'positive'
                ? 'rgba(16,185,129,0.06)'
                : insight.type === 'warning'
                  ? 'rgba(245,158,11,0.06)'
                  : 'rgba(147,51,234,0.04)';
              const borderColor = insight.type === 'positive'
                ? 'rgba(16,185,129,0.1)'
                : insight.type === 'warning'
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(147,51,234,0.08)';
              return (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-200"
                  style={{ background: bgColor, border: `1px solid ${borderColor}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  {insight.type === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : insight.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROI SECTION — premium dark gradient card
// ============================================================================

function ROISection({ roi, currency }: { roi: ROIStats; currency: string }) {
  const roiItems = [
    { icon: Timer, label: 'Ore risparmiate / mese', value: `${roi.hoursSavedMonthly}h`, pct: Math.min(roi.hoursSavedMonthly / 40 * 100, 100) },
    { icon: Shield, label: 'No-show evitati / mese', value: `${roi.noShowsAvoided}`, pct: Math.min(roi.noShowsAvoided / 20 * 100, 100) },
    ...(roi.dailyPhoneTime !== undefined ? [{ icon: PhoneOff, label: 'Min. telefono risparmiati / giorno', value: `${roi.dailyPhoneTime} min`, pct: Math.min(roi.dailyPhoneTime / 60 * 100, 100) }] : []),
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Premium dark gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1e1040, #2d1660, #1a0e35)',
      }} />
      {/* Subtle glow orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)' }} />

      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.15))',
            border: '1px solid rgba(168,85,247,0.3)',
          }}>
            <PiggyBank className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">ROI — Il tuo risparmio</h3>
            <p className="text-xs text-purple-300/60">Basato sulla configurazione iniziale</p>
          </div>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="text-center py-4 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))',
            border: '1px solid rgba(168,85,247,0.2)',
          }}>
            <p className="text-2xl font-bold text-white">{formatCurrency(roi.monthlySavings, currency)}</p>
            <p className="text-xs text-purple-300/70 mt-1">Risparmio mensile</p>
          </div>
          <div className="text-center py-4 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15))',
            border: '1px solid rgba(168,85,247,0.3)',
            boxShadow: '0 0 20px rgba(139,92,246,0.15)',
          }}>
            <p className="text-2xl font-bold text-white" style={{ textShadow: '0 0 12px rgba(168,85,247,0.5)' }}>
              {formatCurrency(roi.annualSavings, currency)}
            </p>
            <p className="text-xs text-purple-300/70 mt-1">Risparmio annuale</p>
          </div>
        </div>

        {/* Progress items */}
        <div className="space-y-3">
          {roiItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-purple-400/60" />
                    <span className="text-xs text-purple-200/70">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${item.pct}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
                    boxShadow: '0 0 8px rgba(139,92,246,0.4)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StatsPage({
  kpis, revenueChart, appointmentsChart, topServices, popularHours,
  staffPerformance, insights, roi, currency = '€',
  activePeriod, onPeriodChange, onExport, loading = false, className = '',
}: StatsPageProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'analysis'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Panoramica', icon: LineChart },
    { id: 'analysis' as const, label: 'Analisi', icon: BarChart3 },
  ];

  return (
    <div className={className}>
      {/* Top bar: tabs + period filter + export */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {/* Tab switcher — glass */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(168,85,247,0.08)',
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                    color: isActive ? '#6d28d9' : '#6b7280',
                    boxShadow: isActive ? '0 2px 8px rgba(147,51,234,0.12)' : 'none',
                    border: isActive ? '1px solid rgba(168,85,247,0.12)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(168,85,247,0.08)',
          }}>
            {PERIOD_OPTIONS.map(opt => {
              const isActive = activePeriod === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onPeriodChange(opt.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                    color: isActive ? '#6d28d9' : '#9ca3af',
                    boxShadow: isActive ? '0 2px 8px rgba(147,51,234,0.12)' : 'none',
                    border: isActive ? '1px solid rgba(168,85,247,0.12)' : '1px solid transparent',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              ...GLASS_CARD,
              color: '#6b7280',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(147,51,234,0.2)'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.1)'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <Download className="w-4 h-4" />
            Esporta Report
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[2.5px]" style={{
            borderColor: 'rgba(168,85,247,0.15)',
            borderTopColor: '#8b5cf6',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <>
          {/* ==================== TAB: PANORAMICA ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(card => <KPICardComponent key={card.label} card={card} comparisonLabel={PERIOD_COMPARISON_LABELS[activePeriod]} />)}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueChart} currency={currency} />
                <AppointmentsChart data={appointmentsChart} />
              </div>
            </div>
          )}

          {/* ==================== TAB: ANALISI ==================== */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Top Services + Popular Hours */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopServicesSection services={topServices} currency={currency} />
                <PopularHoursSection hours={popularHours} />
              </div>

              {/* Staff Performance */}
              <StaffPerformanceSection staff={staffPerformance} currency={currency} />

              {/* Aegis AI + ROI */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AegisAIInsights insights={insights} />
                {roi && <ROISection roi={roi} currency={currency} />}
              </div>
            </div>
          )}
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes stats-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes stats-pulse-border { 0%,100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}