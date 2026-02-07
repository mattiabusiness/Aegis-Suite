// ============================================================================
// AEGIS SUITE - STATS PAGE COMPONENT
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
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Button } from '../ui/button';
import { useContentTheme } from './ContentTheme';

// ============================================================================
// TYPES
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

// ============================================================================
// KPI CARD
// ============================================================================

function KPICardComponent({ card, comparisonLabel }: { card: KPICard; comparisonLabel: string }) {
  const Icon = card.icon;
  const isPositive = (card.change ?? 0) >= 0;
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {card.change !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
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
                  <div className="bg-accent-600 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
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
// CHART TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label, currency = '€', isCurrency = true }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string; currency?: string; isCurrency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-bold">{isCurrency ? formatCurrency(payload[0].value, currency) : payload[0].value}</p>
    </div>
  );
}

// ============================================================================
// REVENUE CHART
// ============================================================================

function RevenueChart({ data, currency, chartColors }: { data: ChartDataPoint[]; currency: string; chartColors: string[] }) {
  const primary = chartColors[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Entrate</h3>
          <p className="text-sm text-gray-500">Andamento nel periodo</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-accent-500" />
          <span className="text-xs font-medium text-accent-700">Entrate</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primary} stopOpacity={0.15} />
                <stop offset="95%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area type="monotone" dataKey="value" stroke={primary} strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5, fill: primary, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// APPOINTMENTS CHART
// ============================================================================

function AppointmentsChart({ data, chartColors }: { data: ChartDataPoint[]; chartColors: string[] }) {
  const barColor1 = '#6366f1';
  const barColor2 = '#818cf8';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Appuntamenti</h3>
          <p className="text-sm text-gray-500">Distribuzione nel periodo</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-medium text-indigo-700">Prenotazioni</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip isCurrency={false} />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={idx % 2 === 0 ? barColor1 : barColor2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// TOP SERVICES
// ============================================================================

function TopServicesSection({ services, currency, chartColors }: { services: TopService[]; currency: string; chartColors: string[] }) {
  const maxCount = Math.max(...services.map(s => s.count), 1);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top 5 Servizi</h3>
      <div className="space-y-3">
        {services.map((s, idx) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                <span className="text-sm font-semibold text-accent-600 ml-2 flex-shrink-0">{formatCurrency(s.revenue, currency)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / maxCount) * 100}%`, backgroundColor: chartColors[idx] || chartColors[0] }} />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{s.count} volte</span>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nessun dato disponibile</p>}
      </div>
    </div>
  );
}

// ============================================================================
// POPULAR HOURS
// ============================================================================

function PopularHoursSection({ hours, chartColors }: { hours: PopularHour[]; chartColors: string[] }) {
  const maxCount = Math.max(...hours.map(h => h.count), 1);
  const colorHigh = chartColors[0];
  const colorMid = chartColors[2] || chartColors[0];
  const colorLow = chartColors[4] || chartColors[2] || chartColors[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Orari più richiesti</h3>
      <p className="text-sm text-gray-500 mb-4">Fasce orarie più popolari</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hours} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip isCurrency={false} />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {hours.map((h, idx) => (
                <Cell key={idx} fill={h.count >= maxCount * 0.8 ? colorHigh : h.count >= maxCount * 0.5 ? colorMid : colorLow} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// STAFF PERFORMANCE
// ============================================================================

function StaffPerformanceSection({ staff, currency }: { staff: StaffPerformance[]; currency: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Performance Staff</h3>
      {staff.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Staff</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Appuntamenti</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Entrate</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Media</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-700">{s.appointments}</td>
                  <td className="py-3 text-right font-semibold text-accent-600">{formatCurrency(s.revenue, currency)}</td>
                  <td className="py-3 text-right text-gray-500">
                    {s.appointments > 0 ? formatCurrency(Math.round(s.revenue / s.appointments), currency) : '—'}
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
// AEGIS AI INSIGHTS BOX — viola glow pulsante
// ============================================================================

function AegisAIInsights({ insights }: { insights: InsightItem[] }) {
  const isEmpty = insights.length === 0 || (insights.length === 1 && insights[0].type === 'neutral' && insights[0].text.includes('dati sufficienti'));

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500 via-violet-500 to-accent-500 animate-pulse opacity-60" />
      <div className="absolute inset-[2px] rounded-[10px] bg-white" />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-600 to-violet-500 flex items-center justify-center shadow-lg shadow-accent-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Aegis AI</h3>
            <p className="text-xs text-gray-500">Analisi intelligente dei tuoi dati</p>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-100">
            <Clock className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Quando ci saranno dati sufficienti, Aegis AI genererà insights predittivi sulla tua attività.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${
                insight.type === 'positive' ? 'bg-emerald-50/80' :
                insight.type === 'warning' ? 'bg-amber-50/80' :
                'bg-accent-50/50'
              }`}>
                {insight.type === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROI SECTION
// ============================================================================

function ROISection({ roi, currency }: { roi: ROIStats; currency: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">ROI — Risparmio stimato</h3>
      <p className="text-sm text-gray-500 mb-4">Basato sui dati inseriti durante la configurazione</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-accent-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent-700">{formatCurrency(roi.monthlySavings, currency)}</p>
          <p className="text-xs text-accent-600 mt-1">Risparmio mensile</p>
        </div>
        <div className="bg-gradient-to-br from-accent-600 to-violet-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{formatCurrency(roi.annualSavings, currency)}</p>
          <p className="text-xs text-accent-200 mt-1">Risparmio annuale</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Ore risparmiate al mese</span>
          <span className="text-sm font-semibold text-gray-900">{roi.hoursSavedMonthly}h</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">No-show evitati al mese</span>
          <span className="text-sm font-semibold text-gray-900">{roi.noShowsAvoided}</span>
        </div>
        {roi.dailyPhoneTime !== undefined && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Tempo telefono/giorno (prima)</span>
            <span className="text-sm font-semibold text-gray-900">{roi.dailyPhoneTime} min</span>
          </div>
        )}
        {roi.monthlyNoShows !== undefined && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">No-show/mese (prima)</span>
            <span className="text-sm font-semibold text-gray-900">{roi.monthlyNoShows}</span>
          </div>
        )}
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
  const theme = useContentTheme();
  const chartColors = theme.chart;

  const tabs = [
    { id: 'overview' as const, label: 'Panoramica', icon: LineChart },
    { id: 'analysis' as const, label: 'Analisi', icon: BarChart3 },
  ];

  return (
    <div className={className}>
      {/* Top bar: tabs + period filter + export */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onPeriodChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activePeriod === opt.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {onExport && (
          <Button variant="outline" onClick={onExport} className="flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Esporta Report
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
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
                <RevenueChart data={revenueChart} currency={currency} chartColors={chartColors} />
                <AppointmentsChart data={appointmentsChart} chartColors={chartColors} />
              </div>
            </div>
          )}

          {/* ==================== TAB: ANALISI ==================== */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Top Services + Popular Hours */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopServicesSection services={topServices} currency={currency} chartColors={chartColors} />
                <PopularHoursSection hours={popularHours} chartColors={chartColors} />
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
    </div>
  );
}