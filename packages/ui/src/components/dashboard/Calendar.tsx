// ============================================================================
// AEGIS SUITE - CALENDAR COMPONENT (v2 — Modern Glass Design)
// File: packages/ui/src/components/dashboard/Calendar.tsx
//
// Redesign: glass header, gradient view tabs, current time indicator,
// glass break overlay, hover glow on slots, modern month view, smooth
// transitions. Matches onboarding + dashboard design language.
// ============================================================================

'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type CalendarEventData } from './CalendarEvent';

// ============================================================================
// TYPES
// ============================================================================

export type CalendarView = 'day' | 'week' | 'month';

export interface BusinessHoursData {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

export interface ClosureData {
  date: string;
  reason: string;
}

export interface CalendarProps {
  events: CalendarEventData[];
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  view?: CalendarView;
  selectedDate?: Date;
  onViewChange?: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEventData) => void;
  onSlotClick?: (date: Date, hour: number, minutes: number) => void;
  onDayClick?: (date: Date) => void;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HOUR_HEIGHT = 60;
const DAYS_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const DAYS_SHORT_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const DAYS_DB = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const ITALIAN_HOLIDAYS: { date: string; name: string }[] = [
  { date: '01-01', name: 'Capodanno' },
  { date: '01-06', name: 'Epifania' },
  { date: '04-25', name: 'Liberazione' },
  { date: '05-01', name: 'Lavoro' },
  { date: '06-02', name: 'Repubblica' },
  { date: '08-15', name: 'Ferragosto' },
  { date: '11-01', name: 'Ognissanti' },
  { date: '12-08', name: 'Immacolata' },
  { date: '12-25', name: 'Natale' },
  { date: '12-26', name: 'S. Stefano' },
];

// ============================================================================
// HELPERS
// ============================================================================

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const startDay = firstDay.getDay();
  const prevDays = startDay === 0 ? 6 : startDay - 1;
  for (let i = prevDays - 1; i >= 0; i--) days.push(new Date(year, month, -i));
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
  return days;
}

function parseTime(time: string | null): { hour: number; minutes: number } {
  if (!time) return { hour: 0, minutes: 0 };
  const [h, m] = time.split(':').map(Number);
  return { hour: h || 0, minutes: m || 0 };
}

function timeToMinutes(time: string | null): number {
  const { hour, minutes } = parseTime(time);
  return hour * 60 + minutes;
}

function getBusinessHoursForDay(bh: BusinessHoursData[] | undefined, date: Date): BusinessHoursData | null {
  if (!bh) return null;
  return bh.find(b => b.day_of_week === DAYS_DB[date.getDay()]) || null;
}

function isClosedForDate(closures: ClosureData[] | undefined, date: Date): ClosureData | null {
  if (!closures || closures.length === 0) return null;
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return closures.find(c => c.date === `${y}-${m}-${d}`) || null;
}

function getEventsForDate(events: CalendarEventData[], date: Date): CalendarEventData[] {
  return events.filter(e => isSameDay(new Date(e.startTime), date));
}

function getHolidayName(date: Date): string | null {
  const md = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return ITALIAN_HOLIDAYS.find(h => h.date === md)?.name || null;
}

function getDisplayHours(bh: BusinessHoursData[] | undefined): number[] {
  if (!bh || bh.length === 0) return Array.from({ length: 12 }, (_, i) => i + 8);
  let earliest = 24, latest = 0;
  bh.forEach(b => {
    if (b.is_open && b.open_time_1) {
      const open = parseTime(b.open_time_1);
      const close = parseTime(b.close_time_2 || b.close_time_1);
      if (open.hour < earliest) earliest = open.hour;
      if (close.hour > latest) latest = close.hour;
      if (close.minutes > 0) latest = close.hour + 1;
    }
  });
  if (earliest >= latest) return Array.from({ length: 12 }, (_, i) => i + 8);
  const hours: number[] = [];
  for (let h = earliest; h <= latest; h++) hours.push(h);
  return hours;
}

function formatHeaderTitle(date: Date, view: CalendarView): string {
  const month = MONTHS_IT[date.getMonth()];
  const year = date.getFullYear();
  if (view === 'day') return `${date.getDate()} ${month} ${year}`;
  if (view === 'week') {
    const w = getWeekDays(date);
    const sm = MONTHS_IT[w[0].getMonth()];
    const em = MONTHS_IT[w[6].getMonth()];
    return sm === em
      ? `${w[0].getDate()} - ${w[6].getDate()} ${sm} ${year}`
      : `${w[0].getDate()} ${sm} - ${w[6].getDate()} ${em}`;
  }
  return `${month} ${year}`;
}

// ============================================================================
// EVENT LAYOUT — Side-by-side overlapping events
// ============================================================================

interface LayoutedEvent {
  event: CalendarEventData;
  column: number;
  totalColumns: number;
}

function layoutOverlappingEvents(events: CalendarEventData[]): LayoutedEvent[] {
  // Filter out cancelled events
  const visible = events.filter(e => e.status !== 'cancelled');
  if (visible.length === 0) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...visible].sort((a, b) => {
    const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    if (diff !== 0) return diff;
    const durA = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
    const durB = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
    return durB - durA;
  });

  // Step 1: Group into clusters of overlapping events
  const clusters: CalendarEventData[][] = [];
  let currentCluster: CalendarEventData[] = [];
  let clusterEnd = 0;

  sorted.forEach(event => {
    const startMs = new Date(event.startTime).getTime();
    const endMs = new Date(event.endTime).getTime();

    if (currentCluster.length === 0 || startMs < clusterEnd) {
      // Overlaps with current cluster — add to it
      currentCluster.push(event);
      clusterEnd = Math.max(clusterEnd, endMs);
    } else {
      // No overlap — start new cluster
      clusters.push(currentCluster);
      currentCluster = [event];
      clusterEnd = endMs;
    }
  });
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // Step 2: Within each cluster, assign columns independently
  const result: LayoutedEvent[] = [];

  clusters.forEach(cluster => {
    const columns: { end: number; event: CalendarEventData }[][] = [];

    cluster.forEach(event => {
      const startMs = new Date(event.startTime).getTime();
      const endMs = new Date(event.endTime).getTime();

      // Find first column where this event fits
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (lastInCol.end <= startMs) {
          columns[col].push({ end: endMs, event });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([{ end: endMs, event }]);
      }
    });

    // Each event in this cluster shares only with cluster siblings
    const totalColumns = columns.length;
    columns.forEach((col, colIdx) => {
      col.forEach(item => {
        result.push({ event: item.event, column: colIdx, totalColumns });
      });
    });
  });

  return result;
}

// ============================================================================
// STATUS GRADIENT COLORS
// ============================================================================

function getStatusGradient(status: string): { bg: string; text: string; border: string; tooltipBg: string } {
  switch (status) {
    case 'confirmed':
    case 'pending':
      return {
        bg: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(168,85,247,0.22))',
        text: '#6d28d9',
        border: 'rgba(139,92,246,0.5)',
        tooltipBg: 'linear-gradient(135deg, #7c3aed, #9333ea)',
      };
    case 'completed':
      return {
        bg: 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(52,211,153,0.22))',
        text: '#047857',
        border: 'rgba(16,185,129,0.5)',
        tooltipBg: 'linear-gradient(135deg, #059669, #10b981)',
      };
    case 'no_show':
      return {
        bg: 'linear-gradient(135deg, rgba(156,163,175,0.35), rgba(209,213,219,0.25))',
        text: '#4b5563',
        border: 'rgba(156,163,175,0.5)',
        tooltipBg: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      };
    default:
      return {
        bg: 'linear-gradient(135deg, rgba(156,163,175,0.25), rgba(209,213,219,0.18))',
        text: '#6b7280',
        border: 'rgba(156,163,175,0.35)',
        tooltipBg: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      };
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed': return 'Confermato';
    case 'pending': return 'In attesa';
    case 'completed': return 'Completato';
    case 'no_show': return 'No-show';
    default: return status;
  }
}

function formatTimeShort(d: Date): string {
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// EVENT BLOCK — Inline rendered event with tooltip
// ============================================================================

function EventBlock({ event, style: posStyle, onClick, showTime = true }: {
  event: CalendarEventData;
  style: React.CSSProperties;
  onClick?: (event: CalendarEventData) => void;
  showTime?: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const colors = getStatusGradient(event.status);

  const updateTipPos = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTipPos({ x: r.left + r.width / 2, y: r.top });
  };

  return (
    <div
      ref={ref}
      className="absolute z-30 overflow-visible rounded-lg cursor-pointer"
      style={{
        ...posStyle,
        transition: 'box-shadow 0.15s ease',
      }}
      onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
      onMouseEnter={(e) => {
        updateTipPos();
        setHovered(true);
        e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}`;
        e.currentTarget.style.zIndex = '50';
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.zIndex = '30';
      }}
    >
      {/* Event body — glass */}
      <div className="h-full rounded-lg overflow-hidden px-1.5 py-0.5" style={{
        background: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}>
        <p className="text-[10px] font-semibold truncate leading-tight" style={{ color: colors.text }}>{event.title}</p>
        {showTime && (
          <p className="text-[9px] truncate leading-tight" style={{ color: colors.text, opacity: 0.7 }}>
            {formatTimeShort(new Date(event.startTime))}
          </p>
        )}
        {event.customerName && (
          <p className="text-[9px] truncate leading-tight" style={{ color: colors.text, opacity: 0.6 }}>
            {event.customerName}
          </p>
        )}
      </div>

      {/* Portal tooltip — always above, escapes any overflow */}
      {hovered && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div style={{ position: 'fixed', left: tipPos.x, top: tipPos.y - 6, transform: 'translate(-50%, -100%)', zIndex: 9999, pointerEvents: 'none', animation: 'cal-tooltip 0.1s ease-out' }}>
          <div className="relative rounded-lg px-2.5 py-1.5 text-white text-[10px] whitespace-nowrap shadow-lg" style={{ background: colors.tooltipBg }}>
            <p className="font-bold text-[11px]">{event.title}</p>
            <p className="opacity-90">{formatTimeShort(new Date(event.startTime))} - {formatTimeShort(new Date(event.endTime))}</p>
            {event.staffName && <p className="opacity-80">{event.staffName}</p>}
            <p className="mt-0.5 text-[9px] font-semibold opacity-90">{getStatusLabel(event.status)}</p>
            <div style={{ width: 6, height: 6, background: colors.tooltipBg.includes('#059669') ? '#059669' : colors.tooltipBg.includes('#6b7280') ? '#6b7280' : '#7c3aed', position: 'absolute', bottom: -2, left: '50%', marginLeft: -3, transform: 'rotate(45deg)' }} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function CurrentTimeIndicator({ startHour, endHour }: { startHour: number; endHour: number }) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const mins = now.getHours() * 60 + now.getMinutes();
  const top = mins - startHour * 60;
  const maxTop = (endHour - startHour) * HOUR_HEIGHT;

  // Hide if before start or after end of displayed hours
  if (top < 0 || top > maxTop) return null;

  return (
    <div className="absolute left-0 right-0 z-40 pointer-events-none" style={{ top }}>
      <div className="relative flex items-center">
        {/* Pulsing dot */}
        <div
          className="absolute -left-1.5 w-3 h-3 rounded-full"
          style={{
            background: '#9333ea',
            boxShadow: '0 0 8px rgba(147,51,234,0.5)',
            animation: 'cal-pulse 2s ease-in-out infinite',
          }}
        />
        {/* Line */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, #9333ea 0%, rgba(147,51,234,0.3) 50%, transparent 100%)' }} />
      </div>
    </div>
  );
}

// ============================================================================
// CALENDAR HEADER — Glass design
// ============================================================================

function CalendarHeader({
  date, view, onPrev, onNext, onToday, onViewChange, isMobile,
}: {
  date: Date; view: CalendarView;
  onPrev: () => void; onNext: () => void; onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  isMobile: boolean;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-5 py-2 sm:py-3.5 flex-shrink-0 gap-2"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168,85,247,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        {/* Nav arrows */}
        <div className="flex items-center gap-0.5">
          <button onClick={onPrev}
            className="p-1.5 sm:p-2 rounded-xl transition-all duration-150"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={onNext}
            className="p-1.5 sm:p-2 rounded-xl transition-all duration-150"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight truncate flex-1 min-w-0">{formatHeaderTitle(date, view)}</h2>

        {/* Today button */}
        <button onClick={onToday}
          className="relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold overflow-hidden flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(168,85,247,0.04))',
            color: '#7c3aed',
            border: '1px solid rgba(168,85,247,0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.12), rgba(168,85,247,0.08))';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(168,85,247,0.04))';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Oggi
        </button>
      </div>

      {/* View tabs — gradient selection */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
        style={{
          background: 'rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {(['day', 'week', 'month'] as CalendarView[]).map((v) => {
          const isActive = view === v;
          const label = v === 'day' ? 'Giorno' : v === 'week' ? 'Settimana' : 'Mese';
          const shortLabel = v === 'day' ? 'Giorno' : v === 'week' ? 'Sett.' : 'Mese';
          return (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className="relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                color: isActive ? '#fff' : '#6b7280',
                boxShadow: isActive ? '0 2px 8px rgba(147,51,234,0.25)' : 'none',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#7c3aed'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#6b7280'; }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                  animation: 'cal-shimmer 2.5s ease-in-out infinite',
                }} />
              )}
              <span className="relative z-10 hidden sm:inline">{label}</span>
              <span className="relative z-10 sm:hidden">{shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// DAY VIEW
// ============================================================================

function DayView({
  date, events, businessHours, closures, onEventClick, onSlotClick,
}: {
  date: Date; events: CalendarEventData[];
  businessHours?: BusinessHoursData[]; closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onSlotClick?: (date: Date, hour: number, minutes: number) => void;
}) {
  const dayBH = getBusinessHoursForDay(businessHours, date);
  const closure = isClosedForDate(closures, date);
  const holiday = getHolidayName(date);
  const hours = getDisplayHours(businessHours);
  const startHour = hours[0];
  const dayEvents = getEventsForDate(events, date);
  const isDayClosed = closure !== null || (dayBH !== null && !dayBH.is_open);

  let breakStartPx = 0, breakHeightPx = 0;
  if (dayBH?.is_open && dayBH.close_time_1 && dayBH.open_time_2) {
    breakStartPx = timeToMinutes(dayBH.close_time_1) - startHour * 60;
    breakHeightPx = timeToMinutes(dayBH.open_time_2) - timeToMinutes(dayBH.close_time_1);
  }

  const totalHeight = hours.length * HOUR_HEIGHT;
  const todayDate = isToday(date);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDayClosed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.floor(y) + startHour * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = Math.round((totalMinutes % 60) / 15) * 15;
    onSlotClick?.(date, hour, minutes >= 60 ? 0 : minutes);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="w-16 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.015)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="h-14" />
        </div>
        <div className="flex-1 h-14 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.015)' }}>
          <p className="text-xs font-medium text-gray-400 uppercase">{DAYS_IT[date.getDay()]}</p>
          {todayDate ? (
            <span className="w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', boxShadow: '0 2px 8px rgba(147,51,234,0.3)' }}
            >
              {date.getDate()}
            </span>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{date.getDate()}</p>
          )}
          {holiday && <p className="text-[10px] text-amber-600">{holiday}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.12) transparent' }}>
        {/* Time column */}
        <div className="w-12 sm:w-16 flex-shrink-0" style={{ minHeight: totalHeight, background: 'rgba(0,0,0,0.015)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          {hours.map((hour, idx) => (
            <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute right-1 sm:right-2 text-[9px] sm:text-[11px] font-medium text-gray-400"
                style={{ top: idx === 0 ? 2 : 0, transform: idx === 0 ? 'none' : 'translateY(-50%)' }}
              >
                {`${hour.toString().padStart(2, '0')}:00`}
              </span>
            </div>
          ))}
        </div>

        {/* Day content */}
        <div className="flex-1 relative" style={{ height: totalHeight }} onClick={handleClick}>
          {isDayClosed && (
            <div className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: 'rgba(239,68,68,0.06)', backdropFilter: 'blur(2px)' }}
            >
              <span className="text-red-500 font-bold text-lg">{closure ? 'CHIUSO PER FESTIVITÀ' : 'CHIUSO'}</span>
            </div>
          )}

          {!isDayClosed && hours.map((_, idx) => (
            <React.Fragment key={idx}>
              <div className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT, height: 1, background: 'rgba(0,0,0,0.05)' }} />
              <div className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT + 30, height: 1, background: 'rgba(0,0,0,0.03)', borderTop: '1px dashed rgba(0,0,0,0.04)' }} />
            </React.Fragment>
          ))}

          {/* Break overlay — glass */}
          {!isDayClosed && breakHeightPx > 0 && (
            <div className="absolute left-0 right-0 flex items-center justify-center z-10"
              style={{
                top: breakStartPx, height: breakHeightPx,
                background: 'repeating-linear-gradient(135deg, rgba(217,119,6,0.06), rgba(217,119,6,0.06) 4px, rgba(217,119,6,0.03) 4px, rgba(217,119,6,0.03) 8px)',
                borderTop: '1px solid rgba(217,119,6,0.12)',
                borderBottom: '1px solid rgba(217,119,6,0.12)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span className="text-xs font-semibold" style={{ color: 'rgba(217,119,6,0.5)' }}>PAUSA</span>
            </div>
          )}

          {/* Current time indicator */}
          {todayDate && <CurrentTimeIndicator startHour={startHour} endHour={hours[hours.length - 1] + 1} />}

          {/* Events — side-by-side layout */}
          {!isDayClosed && (() => {
            const layouted = layoutOverlappingEvents(dayEvents);
            return layouted.map(({ event, column, totalColumns }) => {
              const startMin = new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes();
              const endMin = new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes();
              const top = startMin - startHour * 60;
              const height = Math.max(endMin - startMin, 20);
              const widthPct = 100 / totalColumns;
              const leftPct = column * widthPct;
              return (
                <EventBlock key={event.id} event={event} onClick={onEventClick}
                  style={{ top, height, left: `calc(${leftPct}% + 2px)`, width: `calc(${widthPct}% - 4px)` }}
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEK VIEW
// ============================================================================

function WeekView({
  date, events, businessHours, closures, onEventClick, onSlotClick, onDayClick, isMobile,
}: {
  date: Date; events: CalendarEventData[];
  businessHours?: BusinessHoursData[]; closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onSlotClick?: (date: Date, hour: number, minutes: number) => void;
  onDayClick?: (date: Date) => void;
  isMobile?: boolean;
}) {
  const weekDays = getWeekDays(date);
  const selectedIdx = weekDays.findIndex(d => isSameDay(d, date));
  const mobileStart = Math.min(Math.max(selectedIdx === -1 ? 0 : selectedIdx, 0), weekDays.length - 3);
  const visibleDays = isMobile ? weekDays.slice(mobileStart, mobileStart + 3) : weekDays;
  const hours = getDisplayHours(businessHours);
  const startHour = hours[0];
  const totalHeight = hours.length * HOUR_HEIGHT;
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const timeColumnRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timeColumnRef.current) timeColumnRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Time column */}
      <div className="w-12 sm:w-16 flex-shrink-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.015)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="h-14 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }} />
        <div ref={timeColumnRef} className="flex-1 overflow-y-hidden">
          <div style={{ height: totalHeight }}>
            {hours.map((hour, idx) => (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute right-1 sm:right-2 text-[9px] sm:text-[11px] font-medium text-gray-400"
                  style={{ top: idx === 0 ? 2 : 0, transform: idx === 0 ? 'none' : 'translateY(-50%)' }}
                >
                  {`${hour.toString().padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Days area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days header — matched to content scrollbar gutter */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', overflowY: 'auto', scrollbarGutter: 'stable', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
          <div className="flex flex-1">
            {visibleDays.map((day) => {
              const holiday = getHolidayName(day);
              const closure = isClosedForDate(closures, day);
              const dayBH = getBusinessHoursForDay(businessHours, day);
              const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
              const todayDate = isToday(day);

              return (
                <div key={day.toISOString()}
                  className="flex-1 h-14 flex flex-col items-center justify-center cursor-pointer transition-colors duration-150"
                  style={{
                    background: isClosed ? 'rgba(239,68,68,0.04)' : 'rgba(0,0,0,0.015)',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                  }}
                  onClick={() => onDayClick?.(day)}
                  onMouseEnter={(e) => { if (!isClosed) e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isClosed ? 'rgba(239,68,68,0.04)' : 'rgba(0,0,0,0.015)'; }}
                >
                  <p className="text-[10px] font-medium text-gray-400 uppercase">{DAYS_SHORT_IT[day.getDay()]}</p>
                  {todayDate ? (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', boxShadow: '0 2px 6px rgba(147,51,234,0.3)' }}
                    >
                      {day.getDate()}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{day.getDate()}</p>
                  )}
                  {holiday && <p className="text-[9px] text-amber-600 leading-tight">{holiday}</p>}
                  {isClosed && <p className="text-[8px] text-red-500 font-bold leading-tight">{closure ? 'FESTIVITÀ' : 'CHIUSO'}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable', scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.12) transparent' }} onScroll={handleScroll}>
          <div className="flex" style={{ height: totalHeight }}>
            {visibleDays.map((day) => {
              const dayBH = getBusinessHoursForDay(businessHours, day);
              const closure = isClosedForDate(closures, day);
              const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
              const dayEvents = getEventsForDate(events, day);
              const todayDate = isToday(day);

              let breakStartPx = 0, breakHeightPx = 0;
              if (dayBH?.is_open && dayBH.close_time_1 && dayBH.open_time_2) {
                breakStartPx = timeToMinutes(dayBH.close_time_1) - startHour * 60;
                breakHeightPx = timeToMinutes(dayBH.open_time_2) - timeToMinutes(dayBH.close_time_1);
              }

              const handleDayClick = (e: React.MouseEvent<HTMLDivElement>) => {
                if (isClosed) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const totalMinutes = Math.floor(y) + startHour * 60;
                const hour = Math.floor(totalMinutes / 60);
                const minutes = Math.round((totalMinutes % 60) / 15) * 15;
                onSlotClick?.(day, hour, minutes >= 60 ? 0 : minutes);
              };

              return (
                <div key={day.toISOString()}
                  className="flex-1 relative"
                  style={{ borderRight: '1px solid rgba(0,0,0,0.04)' }}
                  onClick={handleDayClick}
                >
                  {isClosed && (
                    <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: 'rgba(239,68,68,0.04)' }}>
                      <span className="text-red-400 font-bold text-[10px] transform -rotate-90 whitespace-nowrap">
                        {closure ? 'FESTIVITÀ' : 'CHIUSO'}
                      </span>
                    </div>
                  )}

                  {!isClosed && hours.map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT, height: 1, background: 'rgba(0,0,0,0.05)' }} />
                      <div className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT + 30, height: 1, background: 'rgba(0,0,0,0.025)' }} />
                    </React.Fragment>
                  ))}

                  {!isClosed && breakHeightPx > 0 && (
                    <div className="absolute left-0 right-0 z-10"
                      style={{
                        top: breakStartPx, height: breakHeightPx,
                        background: 'repeating-linear-gradient(135deg, rgba(217,119,6,0.06), rgba(217,119,6,0.06) 4px, rgba(217,119,6,0.03) 4px, rgba(217,119,6,0.03) 8px)',
                        borderTop: '1px solid rgba(217,119,6,0.12)',
                        borderBottom: '1px solid rgba(217,119,6,0.12)',
                      }}
                    />
                  )}

                  {todayDate && <CurrentTimeIndicator startHour={startHour} endHour={hours[hours.length - 1] + 1} />}

                  {!isClosed && (() => {
                    const layouted = layoutOverlappingEvents(dayEvents);
                    return layouted.map(({ event, column, totalColumns }) => {
                      const startMin = new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes();
                      const endMin = new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes();
                      const top = startMin - startHour * 60;
                      const height = Math.max(endMin - startMin, 15);
                      const widthPct = 100 / totalColumns;
                      const leftPct = column * widthPct;
                      return (
                        <EventBlock key={event.id} event={event} onClick={onEventClick} showTime={false}
                          style={{ top, height, left: `calc(${leftPct}% + 1px)`, width: `calc(${widthPct}% - 2px)` }}
                        />
                      );
                    });
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MONTH VIEW
// ============================================================================

// ============================================================================
// MONTH EVENT PILL — Small event with mini tooltip (no time)
// ============================================================================

function MonthEventPill({ event, onClick }: { event: CalendarEventData; onClick?: (e: CalendarEventData) => void }) {
  const [hovered, setHovered] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const sc = getStatusGradient(event.status);
  const arrowColor = sc.tooltipBg.includes('#059669') ? '#059669' : sc.tooltipBg.includes('#6b7280') ? '#6b7280' : '#7c3aed';

  const updateTipPos = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTipPos({ x: r.left + r.width / 2, y: r.top });
  };

  return (
    <div ref={ref} className="relative"
      onMouseEnter={() => { updateTipPos(); setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer transition-all duration-150"
        style={{ background: sc.bg, color: sc.text, fontWeight: 600, borderLeft: `2px solid ${sc.border}`, backdropFilter: 'blur(4px)' }}
        onClick={() => onClick?.(event)}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 2px 8px ${sc.border}`; e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {formatTimeShort(new Date(event.startTime))} {event.title}
      </div>
      {/* Portal tooltip — always above */}
      {hovered && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div style={{ position: 'fixed', left: tipPos.x, top: tipPos.y - 4, transform: 'translate(-50%, -100%)', zIndex: 9999, pointerEvents: 'none', animation: 'cal-tooltip 0.1s ease-out' }}>
          <div className="relative rounded-lg px-2 py-1 text-white text-[9px] whitespace-nowrap shadow-md" style={{ background: sc.tooltipBg }}>
            <p className="font-bold text-[10px]">{event.title}</p>
            {event.customerName && <p className="opacity-85">{event.customerName}</p>}
            {event.staffName && <p className="opacity-80">{event.staffName}</p>}
            <p className="text-[8px] font-semibold opacity-90 mt-0.5">{getStatusLabel(event.status)}</p>
            <div style={{ width: 5, height: 5, background: arrowColor, position: 'absolute', bottom: -1.5, left: '50%', marginLeft: -2.5, transform: 'rotate(45deg)' }} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MonthView({
  date, events, businessHours, closures, onEventClick, onDayClick, isMobile,
}: {
  date: Date; events: CalendarEventData[];
  businessHours?: BusinessHoursData[]; closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onDayClick?: (date: Date) => void;
  isMobile?: boolean;
}) {
  const monthDays = getMonthDays(date);
  const currentMonth = date.getMonth();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day names header */}
      <div className="flex flex-shrink-0 pr-[17px]" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {(isMobile ? ['L', 'M', 'M', 'G', 'V', 'S', 'D'] : ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']).map((day, idx) => (
          <div key={idx}
            className="flex-1 h-8 sm:h-10 flex items-center justify-center"
            style={{
              fontSize: isMobile ? 10 : 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              background: 'rgba(0,0,0,0.015)',
              borderRight: idx < 6 ? '1px solid rgba(0,0,0,0.04)' : 'none',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable', scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.12) transparent' }}>
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => {
            const dayEvents = getEventsForDate(events, day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const todayDate = isToday(day);
            const holiday = getHolidayName(day);
            const closure = isClosedForDate(closures, day);
            const dayBH = getBusinessHoursForDay(businessHours, day);
            const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
            const isLastInRow = (idx + 1) % 7 === 0;
            const maxEvents = isMobile ? 1 : 2;

            return (
              <div key={idx}
                className="min-h-[60px] sm:min-h-[100px] p-1 sm:p-1.5 cursor-pointer transition-all duration-150 overflow-hidden"
                style={{
                  background: !isCurrentMonth ? 'rgba(0,0,0,0.01)' : todayDate ? 'rgba(147,51,234,0.03)' : isClosed ? 'rgba(239,68,68,0.03)' : '#fff',
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                  borderRight: isLastInRow ? 'none' : '1px solid rgba(0,0,0,0.04)',
                }}
                onClick={() => onDayClick?.(day)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = todayDate ? 'rgba(147,51,234,0.06)' : 'rgba(168,85,247,0.03)';
                  e.currentTarget.style.transform = 'scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !isCurrentMonth ? 'rgba(0,0,0,0.01)' : todayDate ? 'rgba(147,51,234,0.03)' : isClosed ? 'rgba(239,68,68,0.03)' : '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="flex items-start justify-between">
                  {todayDate ? (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', boxShadow: '0 2px 6px rgba(147,51,234,0.3)' }}
                    >
                      {day.getDate()}
                    </span>
                  ) : (
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </span>
                  )}
                  {isClosed && <span className="text-[8px] text-red-400 font-bold">CHIUSO</span>}
                </div>

                {holiday && <p className="text-[9px] text-amber-600 truncate mt-0.5">{holiday}</p>}
                {closure && <p className="text-[9px] text-red-500 font-bold truncate">FESTIVITÀ</p>}

                {!isClosed && (
                  <div className="mt-1 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                    {dayEvents.filter(ev => ev.status !== 'cancelled').slice(0, maxEvents).map((event) => (
                      <MonthEventPill key={event.id} event={event} onClick={onEventClick} />
                    ))}
                    {dayEvents.filter(ev => ev.status !== 'cancelled').length > maxEvents && (
                      <p className="text-[10px] font-semibold cursor-pointer" style={{ color: '#9333ea' }}>
                        +{dayEvents.filter(ev => ev.status !== 'cancelled').length - maxEvents} altri
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CALENDAR COMPONENT
// ============================================================================

export function Calendar({
  events, businessHours, closures,
  view: controlledView, selectedDate: controlledDate,
  onViewChange, onDateChange, onEventClick, onSlotClick, onDayClick,
  className = '',
}: CalendarProps) {
  const [internalView, setInternalView] = React.useState<CalendarView>('week');
  const [internalDate, setInternalDate] = React.useState<Date>(new Date());
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    if (isMobile && !controlledView && internalView === 'week') {
      setInternalView('day');
    }
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = controlledView ?? internalView;
  const selectedDate = controlledDate ?? internalDate;

  const handleViewChange = (newView: CalendarView) => {
    if (!controlledView) setInternalView(newView);
    onViewChange?.(newView);
  };

  const handleDateChange = (newDate: Date) => {
    if (!controlledDate) setInternalDate(newDate);
    onDateChange?.(newDate);
  };

  const handleDayClick = (clickedDate: Date) => {
    handleDateChange(clickedDate);
    handleViewChange('day');
    onDayClick?.(clickedDate);
  };

  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (view === 'day') d.setDate(d.getDate() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    handleDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (view === 'day') d.setDate(d.getDate() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    handleDateChange(d);
  };

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 16,
        border: '1.5px solid rgba(168,85,247,0.15)',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <CalendarHeader
        date={selectedDate} view={view}
        onPrev={handlePrev} onNext={handleNext}
        onToday={() => { handleDateChange(new Date()); handleViewChange('day'); }}
        onViewChange={handleViewChange}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-hidden">
        {view === 'day' ? (
          <DayView date={selectedDate} events={events} businessHours={businessHours} closures={closures} onEventClick={onEventClick} onSlotClick={onSlotClick} />
        ) : view === 'week' ? (
          <WeekView date={selectedDate} events={events} businessHours={businessHours} closures={closures} onEventClick={onEventClick} onSlotClick={onSlotClick} onDayClick={handleDayClick} isMobile={isMobile} />
        ) : (
          <MonthView date={selectedDate} events={events} businessHours={businessHours} closures={closures} onEventClick={onEventClick} onDayClick={handleDayClick} isMobile={isMobile} />
        )}
      </div>

      <style>{`
        @keyframes cal-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        @keyframes cal-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes cal-tooltip { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}