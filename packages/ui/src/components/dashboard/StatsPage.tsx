// ============================================================================
// AEGIS SUITE - STATS PAGE COMPONENT (FUTURISTIC EDITION v2)
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
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useContentTheme } from './ContentTheme';

// ============================================================================
// TYPES
// ============================================================================

export type PeriodFilter = 'today' | 'week' | 'month' | '3months' | 'year' | 'custom';

export interface KPICard { label: string; value: string; change?: number; icon: LucideIcon; color: string; gradient?: string; }
export interface ChartDataPoint { label: string; value: number; value2?: number; }
export interface TopService { name: string; count: number; revenue: number; }
export interface PopularHour { hour: string; count: number; }
export interface StaffPerformance { name: string; color: string; appointments: number; revenue: number; isIncomplete?: boolean; }
export interface InsightItem { text: string; type: 'positive' | 'neutral' | 'warning'; }
export interface ROIStats { hoursSavedMonthly: number; noShowsAvoided: number; monthlySavings: number; annualSavings: number; dailyPhoneTime?: number; monthlyNoShows?: number; }
export interface RetentionData { returning: number; new: number; returningPct: number; }
export interface DayRevenueData { day: string; revenue: number; appointments: number; }
export interface HeatmapCell { day: number; hour: number; count: number; }

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
  retention?: RetentionData | null;
  dayRevenue?: DayRevenueData[];
  heatmapData?: HeatmapCell[];
  isStaff?: boolean;
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
  today: 'vs ieri', week: 'vs settimana scorsa', month: 'vs mese scorso',
  '3months': 'vs 3 mesi precedenti', year: 'vs anno scorso', custom: 'vs periodo precedente',
};

const DAY_LABELS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function formatCurrency(amount: number, currency = '€'): string {
  return `${currency} ${amount.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================================================
// ANIMATED NUMBER
// ============================================================================

function useAnimatedNumber(target: number, duration = 800): number {
  const [current, setCurrent] = React.useState(0);
  const prevTarget = React.useRef(0);
  React.useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (start === target) { setCurrent(target); return; }
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return current;
}

// ============================================================================
// HOLO CARD (for non-chart sections)
// ============================================================================

function HoloCard({ children, className = '', glowColor }: {
  children: React.ReactNode; className?: string; glowColor?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(147,51,234,0.12)] hover:border-purple-200/60 transition-all duration-500 ease-out group/card p-5 ${className}`}>
      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: glowColor ? `radial-gradient(ellipse at 50% 0%, ${glowColor}08 0%, transparent 70%)` : 'radial-gradient(ellipse at 50% 0%, rgba(147,51,234,0.04) 0%, transparent 70%)' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// HOLO CHART WRAP — container lifts + inner chart zooms, NO colored glow
// ============================================================================

function HoloChartWrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        relative rounded-2xl overflow-hidden p-5
        bg-white/80 backdrop-blur-sm
        border border-gray-200/60
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.18)]
        hover:border-purple-200/60
        hover:-translate-y-1.5
        transition-all duration-500 ease-out
        group/chart
      "
    >
      {/* Inner content zooms slightly on hover — the "emerging" effect */}
      <div className="relative z-10 transition-transform duration-500 ease-out group-hover/chart:scale-[1.02]" style={{ transformOrigin: 'center center' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// KPI CARD
// ============================================================================

function KPICardComponent({ card, comparisonLabel }: { card: KPICard; comparisonLabel: string }) {
  const isPos = (card.change ?? 0) >= 0;
  const [tip, setTip] = React.useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-default"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
        borderRadius: 16,
        padding: '1.25rem',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08), 0 8px 24px rgba(147,51,234,0.15)';
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
      }}
    >
      {/* Blob colorato top-right */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07]"
        style={{ background: card.gradient || 'linear-gradient(135deg, #9333ea, #7c3aed)' }}
      />

      {/* Top row: badge % sinistra + colored box destra */}
      <div className="relative flex items-start justify-between mb-3">
        {card.change !== undefined ? (
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(card.change).toFixed(1)}%
            </div>
            <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
              <Info className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help transition-colors" />
              {tip && (
                <div className="absolute left-0 top-full mt-1.5 z-50 whitespace-nowrap">
                  <div className="bg-gradient-to-br from-purple-600 to-violet-600 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-[0_4px_15px_rgba(147,51,234,0.3)]">
                    {comparisonLabel}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : <div />}
        {/* Colored box — identico a GlassStat */}
        <div
          className="w-11 h-11 rounded-xl flex-shrink-0"
          style={{ background: card.gradient || 'linear-gradient(135deg, #9333ea, #7c3aed)', opacity: 0.12, borderRadius: 14 }}
        />
      </div>

      {/* Value + label */}
      <p className="relative text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
      <p className="relative text-sm font-medium text-gray-500 mt-1">{card.label}</p>
    </div>
  );
}

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label, currency = '€', isCurrency = true }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; currency?: string; isCurrency?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gradient-to-br from-purple-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm shadow-[0_8px_25px_rgba(147,51,234,0.35)] border border-purple-400/20">
      <p className="text-purple-200 text-xs mb-1">{label}</p>
      <p className="font-bold text-white">{isCurrency ? formatCurrency(payload[0].value, currency) : payload[0].value}</p>
    </div>
  );
}

// ============================================================================
// REVENUE CHART
// ============================================================================

function RevenueChart({ data, currency, chartColors }: { data: ChartDataPoint[]; currency: string; chartColors: string[] }) {
  const p = chartColors[0];
  return (
    <HoloChartWrap>
      <style>{`
        .revenue-chart-wrap .recharts-area-curve {
          transition: filter 0.5s cubic-bezier(0.22, 1, 0.36, 1), stroke-width 0.4s ease;
        }
        .revenue-chart-wrap:hover .recharts-area-curve {
          filter: drop-shadow(0 6px 12px ${p}50) drop-shadow(0 2px 4px ${p}30);
          stroke-width: 3.5px;
        }
        .revenue-chart-wrap .recharts-area-area {
          transition: opacity 0.5s ease;
        }
        .revenue-chart-wrap:hover .recharts-area-area {
          opacity: 0.7 !important;
        }
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-base font-semibold text-gray-900">Entrate</h3><p className="text-sm text-gray-500">Andamento nel periodo</p></div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50/80 rounded-lg border border-purple-100/50"><div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: p }} /><span className="text-xs font-medium" style={{ color: p }}>Entrate</span></div>
      </div>
      <div className="h-64 revenue-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGradF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={p} stopOpacity={0.3} /><stop offset="50%" stopColor={p} stopOpacity={0.1} /><stop offset="100%" stopColor={p} stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area type="monotone" dataKey="value" stroke={p} strokeWidth={8} strokeOpacity={0.08} fill="none" dot={false} />
            <Area type="monotone" dataKey="value" stroke={p} strokeWidth={2.5} fill="url(#revGradF)" dot={false} activeDot={{ r: 6, fill: p, stroke: '#fff', strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </HoloChartWrap>
  );
}

// ============================================================================
// APPOINTMENTS CHART
// ============================================================================

function AppointmentsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <HoloChartWrap>
      <style>{`
        .appt-chart-wrap .recharts-bar-rectangle rect {
          transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .appt-chart-wrap .recharts-bar-rectangle rect:hover {
          filter: drop-shadow(0 6px 14px rgba(30,58,138,0.45)) drop-shadow(0 2px 4px rgba(30,58,138,0.25));
        }
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-base font-semibold text-gray-900">Appuntamenti</h3><p className="text-sm text-gray-500">Distribuzione nel periodo</p></div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 rounded-lg border border-blue-100/50"><div className="w-2 h-2 rounded-full bg-blue-800 animate-pulse" /><span className="text-xs font-medium text-blue-800">Prenotazioni</span></div>
      </div>
      <div className="h-64 appt-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#1e40af" stopOpacity={0.8} /></linearGradient>
              <linearGradient id="bG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={({ active, payload, label: lbl }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white px-4 py-2.5 rounded-xl text-sm shadow-[0_8px_25px_rgba(30,58,138,0.35)] border border-blue-700/30">
                  <p className="text-blue-300 text-xs mb-1">{lbl}</p>
                  <p className="font-bold text-white">{payload[0].value}</p>
                </div>
              );
            }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>{data.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? 'url(#bG1)' : 'url(#bG2)'} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </HoloChartWrap>
  );
}

// ============================================================================
// RETENTION DONUT
// ============================================================================

function RetentionDonut({ retention }: { retention: RetentionData }) {
  const total = retention.returning + retention.new;
  const pct = retention.returningPct;
  const C = 2 * Math.PI * 48;
  const targetOff = C - (C * pct) / 100;
  const aPct = useAnimatedNumber(Math.round(pct));
  const [hovered, setHovered] = React.useState(false);
  // When hovered, reset to full offset (empty) then animate to target
  const [animOff, setAnimOff] = React.useState(targetOff);

  React.useEffect(() => {
    setAnimOff(targetOff);
  }, [targetOff]);

  const handleMouseEnter = () => {
    setHovered(true);
    // Reset to empty (full circumference = no arc visible)
    setAnimOff(C);
    // After a tiny delay, animate to target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimOff(targetOff);
      });
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <HoloCard glowColor="#10b981">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Tasso di ritorno</h3>
      <p className="text-sm text-gray-500 mb-4">Clienti ricorrenti vs nuovi nel periodo</p>
      <div className="flex items-center gap-6">
        <div
          className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="rG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
              <filter id="donutGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
            </defs>
            {/* Background track */}
            <circle cx="64" cy="64" r="48" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            {/* Glow arc — thicker, semi-transparent */}
            <circle
              cx="64" cy="64" r="48" fill="none"
              stroke="#10b981"
              strokeWidth={hovered ? 18 : 14}
              strokeOpacity={hovered ? 0.25 : 0.12}
              strokeDasharray={C}
              strokeDashoffset={animOff}
              strokeLinecap="round"
              style={{ transition: `stroke-dashoffset ${hovered ? '1s' : '0.6s'} cubic-bezier(0.22, 1, 0.36, 1), stroke-width 0.4s ease, stroke-opacity 0.4s ease` }}
              filter={hovered ? 'url(#donutGlow)' : undefined}
            />
            {/* Main arc */}
            <circle
              cx="64" cy="64" r="48" fill="none"
              stroke="url(#rG)"
              strokeWidth={hovered ? 12 : 10}
              strokeDasharray={C}
              strokeDashoffset={animOff}
              strokeLinecap="round"
              style={{ transition: `stroke-dashoffset ${hovered ? '1s' : '0.6s'} cubic-bezier(0.22, 1, 0.36, 1), stroke-width 0.4s ease` }}
            />
          </svg>
          {/* Center text */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-transform duration-400 ${hovered ? 'scale-110' : ''}`}>
            <span className="text-xl font-bold text-gray-900">{aPct}%</span>
            <span className="text-xs text-gray-500">ritorno</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 p-2.5 bg-emerald-50/60 rounded-xl hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"><UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" /><div><p className="text-sm font-semibold text-gray-900">{retention.returning}</p><p className="text-xs text-gray-500">Clienti ricorrenti</p></div></div>
          <div className="flex items-center gap-3 p-2.5 bg-blue-50/60 rounded-xl hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"><Users className="w-4 h-4 text-blue-600 flex-shrink-0" /><div><p className="text-sm font-semibold text-gray-900">{retention.new}</p><p className="text-xs text-gray-500">Nuovi clienti</p></div></div>
          <p className="text-xs text-gray-400 mt-2">{total} clienti unici nel periodo</p>
        </div>
      </div>
    </HoloCard>
  );
}

// ============================================================================
// RADAR CHART
// ============================================================================

function DayRevenueRadar({ data, currency, chartColors }: { data: DayRevenueData[]; currency: string; chartColors: string[] }) {
  const p = chartColors[0];
  return (
    <HoloChartWrap>
      <style>{`
        .radar-chart-wrap .recharts-radar polygon {
          transition: filter 0.5s cubic-bezier(0.22, 1, 0.36, 1), stroke-width 0.4s ease, fill-opacity 0.4s ease;
        }
        .radar-chart-wrap:hover .recharts-radar polygon {
          filter: drop-shadow(0 6px 16px ${p}50) drop-shadow(0 2px 6px ${p}30);
          stroke-width: 3.5px;
          fill-opacity: 0.5;
        }
        .radar-chart-wrap .recharts-dot circle {
          transition: filter 0.4s ease, r 0.4s ease;
        }
        .radar-chart-wrap:hover .recharts-dot circle {
          filter: drop-shadow(0 3px 8px ${p}60);
        }
        .radar-chart-wrap .recharts-polar-grid-concentric path,
        .radar-chart-wrap .recharts-polar-grid-angle line {
          transition: stroke-opacity 0.4s ease;
        }
        .radar-chart-wrap:hover .recharts-polar-grid-concentric path,
        .radar-chart-wrap:hover .recharts-polar-grid-angle line {
          stroke-opacity: 0.4;
        }
      `}</style>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Entrate per giorno</h3>
      <p className="text-sm text-gray-500 mb-2">Distribuzione settimanale delle entrate</p>
      <div className="h-44 radar-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <defs><linearGradient id="rFV2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={p} stopOpacity={0.35} /><stop offset="100%" stopColor={p} stopOpacity={0.05} /></linearGradient></defs>
            <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Radar name="Entrate" dataKey="revenue" stroke={p} strokeWidth={2} fill="url(#rFV2)" dot={{ r: 5, fill: p, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: p, stroke: '#fff', strokeWidth: 3 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </HoloChartWrap>
  );
}

// ============================================================================
// HEATMAP — FIXED: compact table, controlled size, single-cell tooltip
// ============================================================================

function HeatmapSection({ data, chartColors, isStaff }: { data: HeatmapCell[]; chartColors: string[]; isStaff?: boolean }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const primary = chartColors[0];
  const [hov, setHov] = React.useState<{ day: number; hour: number } | null>(null);

  const dataHours = data.filter(d => d.count > 0).map(d => d.hour);
  const startH = Math.min(dataHours.length > 0 ? Math.min(...dataHours) : 8, 8);
  const endH = Math.max(dataHours.length > 0 ? Math.max(...dataHours) : 19, 19);
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => i + startH);

  // Emerald color scale: lightest → darkest
  const getColor = (count: number) => {
    if (count === 0) return '#f0fdf4'; // emerald-50
    const r = count / maxCount;
    if (r >= 0.8) return '#047857'; // emerald-700
    if (r >= 0.6) return '#059669'; // emerald-600
    if (r >= 0.4) return '#10b981'; // emerald-500
    if (r >= 0.2) return '#6ee7b7'; // emerald-300
    return '#a7f3d0'; // emerald-200
  };

  const cnt = (d: number, h: number) => data.find(x => x.day === d && x.hour === h)?.count ?? 0;

  return (
    <HoloChartWrap>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Mappa attività</h3>
      <p className="text-sm text-gray-500 mb-3">{isStaff ? 'Quando sei più impegnato durante la settimana' : 'Concentrazione appuntamenti per giorno e ora'}</p>
      <div>
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="w-10" />
              {hours.map(h => <th key={h} className="text-[10px] text-gray-400 font-medium text-center pb-1.5">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <tr key={day}>
                <td className="text-[11px] text-gray-500 font-medium text-right pr-2 py-0">{DAY_LABELS_SHORT[day]}</td>
                {hours.map(hour => {
                  const c = cnt(day, hour);
                  const isH = hov?.day === day && hov?.hour === hour;
                  return (
                    <td key={hour} className="p-[2px] relative">
                      <div
                        className={`w-full rounded-[4px] cursor-default transition-all duration-200 ${isH ? 'ring-2 ring-emerald-400 ring-offset-1 z-30 brightness-110' : ''}`}
                        style={{ backgroundColor: getColor(c), height: '22px' }}
                        onMouseEnter={() => setHov({ day, hour })}
                        onMouseLeave={() => setHov(null)}
                      />
                      {isH && c > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-[0_6px_20px_rgba(16,185,129,0.35)] border border-emerald-400/20">
                            <span className="font-semibold">{DAY_LABELS_SHORT[day]} {hour}:00</span>
                            <span className="text-emerald-200"> — </span>
                            <span className="font-bold">{c}</span>
                            <span className="text-emerald-200"> app.</span>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end mt-3 gap-1.5">
        <span className="text-[10px] text-gray-400">Meno</span>
        {[0, 0.25, 0.5, 0.75, 1].map((i, idx) => <div key={idx} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: i === 0 ? '#f0fdf4' : getColor(Math.ceil(maxCount * i)) }} />)}
        <span className="text-[10px] text-gray-400">Più</span>
      </div>
    </HoloChartWrap>
  );
}

// ============================================================================
// TOP SERVICES
// ============================================================================

function TopServicesSection({ services, currency, chartColors }: { services: TopService[]; currency: string; chartColors: string[] }) {
  const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);
  const pieData = services.map((s, i) => ({ name: s.name, value: s.revenue, count: s.count, fill: chartColors[i] || chartColors[0] }));

  return (
    <HoloChartWrap>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top 5 Servizi</h3>
      {services.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nessun dato disponibile</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Donut */}
          <div className="w-44 h-44 flex-shrink-0 relative self-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={72}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  animationBegin={0} animationDuration={1200}
                  animationEasing="ease-out"
                  stroke="none"
                  paddingAngle={2}
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip
                  position={{ y: -10 }}
                  offset={20}
                  content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-gradient-to-br from-purple-600 to-violet-600 text-white px-3 py-2 rounded-xl text-sm shadow-[0_6px_20px_rgba(147,51,234,0.35)] border border-purple-400/20">
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-purple-200 text-xs">{formatCurrency(d.value, currency)} · {d.count} volte</p>
                    </div>
                  );
                }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue, currency)}</span>
              <span className="text-[10px] text-gray-500">totale</span>
            </div>
          </div>
          {/* Legend */}
          <div className="w-full sm:flex-1 space-y-2.5 min-w-0">
            {services.map((s, i) => {
              const pct = totalRevenue > 0 ? Math.round((s.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={s.name} className="flex items-center gap-2.5 group/leg">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[i] || chartColors[0] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                      <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: chartColors[i] || chartColors[0] }}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{formatCurrency(s.revenue, currency)}</span>
                      <span className="text-xs text-gray-400">· {s.count} volte</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </HoloChartWrap>
  );
}

// ============================================================================
// STAFF PERFORMANCE — FIXED: always shows all staff passed as props
// ============================================================================

function StaffPerformanceSection({ staff, currency }: { staff: StaffPerformance[]; currency: string }) {
  return (
    <HoloCard>
      <h3 className="text-base font-semibold text-gray-900 mb-3">Performance Staff</h3>
      {staff.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-4">Nessun membro dello staff configurato</div>
      ) : (
        <div
          className="space-y-2 max-h-[320px] overflow-y-auto pt-1 pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}
        >
          {staff.map((s, idx) => {
            const barColor = s.isIncomplete ? '#f59e0b' : '#22c55e';
            return (
              <div
                key={s.name}
                className="flex items-center gap-3 p-3 rounded-lg cursor-default"
                style={{
                  background: 'rgba(249,250,251,1)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(147,51,234,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(147,51,234,0.2)';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(168,85,247,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(249,250,251,1)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: barColor }} />
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${s.color || '#9333ea'}, ${s.color || '#9333ea'}aa)` }}
                >
                  {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{s.appointments} app.</span>
                    <span className="text-xs font-bold text-purple-600">{formatCurrency(s.revenue, currency)}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-300 flex-shrink-0">#{idx + 1}</span>
              </div>
            );
          })}
        </div>
      )}
    </HoloCard>
  );
}

// ============================================================================
// AEGIS AI INSIGHTS — redesign coinvolgente con header gradient + numbered
// ============================================================================

function AegisAIInsights({ insights }: { insights: InsightItem[] }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: '1px solid rgba(147,51,234,0.12)',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header gradiente */}
      <div
        className="px-5 py-4"
        style={{
          background: 'linear-gradient(145deg, #3b0764 0%, #581c87 30%, #6b21a8 60%, #7c3aed 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Aegis AI</h3>
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  BETA
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(216,180,254,0.8)' }}>
                Insights predittivi sulla tua attività
              </p>
            </div>
          </div>
          {insights.length > 0 && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-3">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(147,51,234,0.06)' }}
            >
              <Sparkles className="w-7 h-7" style={{ color: '#9333ea' }} />
            </div>
            <p className="text-sm font-medium text-gray-700">Analisi in corso</p>
            <p className="text-xs text-gray-400 mt-1">Gli insights appariranno quando ci saranno dati sufficienti.</p>
          </div>
        ) : (
          <div
            className="space-y-2 max-h-[300px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}
          >
            {insights.map((ins, i) => {
              const isP = ins.type === 'positive', isW = ins.type === 'warning';
              const Ic = isP ? TrendingUp : isW ? AlertTriangle : Lightbulb;
              const barColor = isP ? '#10b981' : isW ? '#f59e0b' : '#9333ea';
              const bgColor = isP ? 'rgba(16,185,129,0.04)' : isW ? 'rgba(245,158,11,0.04)' : 'rgba(147,51,234,0.03)';
              const borderColor = isP ? 'rgba(16,185,129,0.12)' : isW ? 'rgba(245,158,11,0.12)' : 'rgba(147,51,234,0.1)';
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-default"
                  style={{
                    borderLeft: `2px solid ${barColor}`,
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderLeftColor: barColor,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = barColor;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${barColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span
                    className="text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{ color: barColor, minWidth: 20 }}
                  >
                    #{i + 1}
                  </span>
                  <Ic className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: barColor }} />
                  <p className="text-sm text-gray-700 leading-relaxed">{ins.text}</p>
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
// ROI SECTION — hover lift on sub-cards
// ============================================================================

function ROISection({ roi, currency }: { roi: ROIStats; currency: string }) {
  const aM = useAnimatedNumber(roi.monthlySavings);
  const aA = useAnimatedNumber(roi.annualSavings);
  return (
    <HoloCard glowColor="#10b981">
      <h3 className="text-base font-semibold text-gray-900 mb-1">ROI — Risparmio stimato della tua attività</h3>
      <p className="text-sm text-gray-500 mb-4">Basato sui dati inseriti durante la configurazione</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(147,51,234,0.35)] transition-all duration-300 cursor-default">
          <p className="text-2xl font-bold text-white">{formatCurrency(aM, currency)}</p>
          <p className="text-xs text-purple-100 mt-1">Risparmio mensile</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] transition-all duration-300 cursor-default">
          <p className="text-2xl font-bold text-white">{formatCurrency(aA, currency)}</p>
          <p className="text-xs text-emerald-100 mt-1">Risparmio annuale</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Ore risparmiate al mese', value: `${roi.hoursSavedMonthly}h`, icon: Clock },
          { label: 'No-show evitati al mese', value: String(roi.noShowsAvoided), icon: ShieldCheck },
          ...(roi.dailyPhoneTime !== undefined ? [{ label: 'Tempo telefono/giorno (prima)', value: `${roi.dailyPhoneTime} min`, icon: CalendarClock }] : []),
          ...(roi.monthlyNoShows !== undefined ? [{ label: 'No-show/mese (prima)', value: String(roi.monthlyNoShows), icon: UserX }] : []),
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg cursor-default"
            style={{
              background: 'rgba(249,250,251,1)',
              border: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(147,51,234,0.04)';
              e.currentTarget.style.borderColor = 'rgba(147,51,234,0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(249,250,251,1)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center gap-2.5"><item.icon className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{item.label}</span></div>
            <span className="text-sm font-bold text-purple-700">{item.value}</span>
          </div>
        ))}
      </div>
    </HoloCard>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white/60 rounded-2xl p-4 border border-gray-100"><div className="flex items-start justify-between"><div className="w-11 h-11 rounded-xl bg-gray-200/80" /><div className="w-16 h-6 rounded-full bg-gray-200/80" /></div><div className="w-24 h-7 rounded-lg bg-gray-200/80 mt-3" /><div className="w-32 h-4 rounded bg-gray-200/80 mt-2" /></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="bg-white/60 rounded-2xl p-5 border border-gray-100"><div className="w-32 h-5 rounded bg-gray-200/80 mb-2" /><div className="w-48 h-4 rounded bg-gray-200/80 mb-4" /><div className="h-64 rounded-xl bg-gray-100/80" /></div>)}
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
  retention, dayRevenue, heatmapData, isStaff = false,
}: StatsPageProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'analysis'>('overview');
  const theme = useContentTheme();
  const chartColors = theme.chart;
  const tabs = [
    { id: 'overview' as const, label: 'Panoramica', icon: LineChart },
    { id: 'analysis' as const, label: 'Analisi', icon: BarChart3 },
  ];

  return (
    <div className={className}>
      {/* Header: Title left, filters + export right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Left: title + desc */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Statistiche</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isStaff ? 'Le tue performance personali' : 'Analisi completa delle performance del tuo salone'}</p>
        </div>

        {/* Right: tabs + period + export all inline */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map(tab => { const Icon = tab.icon; return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            ); })}
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onPeriodChange(opt.id)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activePeriod === opt.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export button — gradient purple matching clienti page */}
          {onExport && (
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const container = e.currentTarget.querySelector('[data-ripple-stats]');
                if (container) {
                  const span = document.createElement('span');
                  Object.assign(span.style, {
                    position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)',
                    animation: 'stats-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                  });
                  container.appendChild(span);
                  setTimeout(() => span.remove(), 600);
                }
                onExport();
              }}
              className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', boxShadow: '0 2px 8px rgba(147,51,234,0.25)', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'stats-shimmer 2.5s ease-in-out infinite',
              }} />
              <div data-ripple-stats="" className="absolute inset-0 pointer-events-none" />
              <Download className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Esporta</span>
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSkeleton /> : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(c => <KPICardComponent key={c.label} card={c} comparisonLabel={PERIOD_COMPARISON_LABELS[activePeriod]} />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueChart} currency={currency} chartColors={chartColors} />
                <AppointmentsChart data={appointmentsChart} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {retention && <RetentionDonut retention={retention} />}
                {dayRevenue && dayRevenue.length > 0 && <DayRevenueRadar data={dayRevenue} currency={currency} chartColors={chartColors} />}
              </div>
            </div>
          )}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Row 1: Top Servizi (full width per staff, metà per titolare) + Staff Performance */}
              <div className={isStaff ? undefined : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                <TopServicesSection services={topServices} currency={currency} chartColors={chartColors} />
                {!isStaff && <StaffPerformanceSection staff={staffPerformance} currency={currency} />}
              </div>
              {/* Row 2: Heatmap full width */}
              {heatmapData && heatmapData.length > 0 ? <HeatmapSection data={heatmapData} chartColors={chartColors} isStaff={isStaff} /> : (
                <HoloCard>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Orari più richiesti</h3>
                  <p className="text-sm text-gray-500 mb-4">Fasce orarie più popolari</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={popularHours} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip isCurrency={false} />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                          {popularHours.map((h, i) => { const mx = Math.max(...popularHours.map(x => x.count), 1); return <Cell key={i} fill={h.count >= mx * 0.8 ? chartColors[0] : h.count >= mx * 0.5 ? (chartColors[2] || chartColors[0]) : (chartColors[4] || chartColors[0])} />; })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </HoloCard>
              )}
              {/* Row 3: AI Insights + ROI */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AegisAIInsights insights={insights} />
                {roi && <ROISection roi={roi} currency={currency} />}
              </div>
            </div>
          )}
        </>
      )}
      <style>{`
        @keyframes stats-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes stats-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}