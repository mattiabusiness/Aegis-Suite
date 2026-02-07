// ============================================================================
// AEGIS SUITE - CALENDAR COMPONENT (Timeline Continua)
// File: packages/ui/src/components/dashboard/Calendar.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, type CalendarEventData } from './CalendarEvent';

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

const HOUR_HEIGHT = 60; // 1 ora = 60px
const DAYS_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const DAYS_SHORT_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const DAYS_DB = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// ============================================================================
// ITALIAN HOLIDAYS (solo nome informativo)
// ============================================================================

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
  { date: '12-26', name: 'S.Stefano' },
];

function getEasterDate(year: number): Date {
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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
  const fixedHoliday = ITALIAN_HOLIDAYS.find(h => h.date === monthDay);
  if (fixedHoliday) return fixedHoliday.name;
  
  const easter = getEasterDate(year);
  if (date.getDate() === easter.getDate() && date.getMonth() === easter.getMonth()) {
    return 'Pasqua';
  }
  
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  if (date.getDate() === easterMonday.getDate() && date.getMonth() === easterMonday.getMonth()) {
    return 'Pasquetta';
  }
  
  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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
  for (let i = prevDays - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
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

function getBusinessHoursForDay(businessHours: BusinessHoursData[] | undefined, date: Date): BusinessHoursData | null {
  if (!businessHours) return null;
  const dayName = DAYS_DB[date.getDay()];
  return businessHours.find(bh => bh.day_of_week === dayName) || null;
}

function isClosedForDate(closures: ClosureData[] | undefined, date: Date): ClosureData | null {
  if (!closures || closures.length === 0) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return closures.find(c => c.date === dateStr) || null;
}

function getEventsForDate(events: CalendarEventData[], date: Date): CalendarEventData[] {
  return events.filter(event => isSameDay(new Date(event.startTime), date));
}

function formatHeaderTitle(date: Date, view: CalendarView): string {
  const month = MONTHS_IT[date.getMonth()];
  const year = date.getFullYear();
  
  if (view === 'day') {
    return `${date.getDate()} ${month} ${year}`;
  }
  if (view === 'week') {
    const weekDays = getWeekDays(date);
    const startMonth = MONTHS_IT[weekDays[0].getMonth()];
    const endMonth = MONTHS_IT[weekDays[6].getMonth()];
    if (startMonth === endMonth) {
      return `${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${startMonth} ${year}`;
    }
    return `${weekDays[0].getDate()} ${startMonth} - ${weekDays[6].getDate()} ${endMonth}`;
  }
  return `${month} ${year}`;
}

// Calcola le ore da mostrare basate sugli orari business
function getDisplayHours(businessHours: BusinessHoursData[] | undefined): number[] {
  if (!businessHours || businessHours.length === 0) {
    return Array.from({ length: 12 }, (_, i) => i + 8); // 8-19
  }

  let earliestOpen = 24;
  let latestClose = 0;

  businessHours.forEach(bh => {
    if (bh.is_open && bh.open_time_1) {
      const open = parseTime(bh.open_time_1);
      const close = parseTime(bh.close_time_2 || bh.close_time_1);
      
      if (open.hour < earliestOpen) earliestOpen = open.hour;
      if (close.hour > latestClose) latestClose = close.hour;
      if (close.minutes > 0) latestClose = close.hour + 1;
    }
  });

  if (earliestOpen === 24 || earliestOpen >= latestClose) {
    return Array.from({ length: 12 }, (_, i) => i + 8);
  }

  const hours: number[] = [];
  for (let h = earliestOpen; h <= latestClose; h++) {
    hours.push(h);
  }
  return hours;
}

// ============================================================================
// CALENDAR HEADER
// ============================================================================

function CalendarHeader({
  date,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: {
  date: Date;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={onPrev} 
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={onNext} 
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{formatHeaderTitle(date, view)}</h2>
        <button 
          onClick={onToday} 
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Oggi
        </button>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === v 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {v === 'day' ? 'Giorno' : v === 'week' ? 'Settimana' : 'Mese'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DAY VIEW
// ============================================================================

function DayView({
  date,
  events,
  businessHours,
  closures,
  onEventClick,
  onSlotClick,
}: {
  date: Date;
  events: CalendarEventData[];
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onSlotClick?: (date: Date, hour: number, minutes: number) => void;
}) {
  const dayBH = getBusinessHoursForDay(businessHours, date);
  const closure = isClosedForDate(closures, date);
  const holiday = getHolidayName(date);
  const hours = getDisplayHours(businessHours);
  const startHour = hours[0];
  const dayEvents = getEventsForDate(events, date);
  
  // Giorno chiuso?
  const isDayClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
  
  // Pausa pranzo
  let breakStartPx = 0;
  let breakHeightPx = 0;
  if (dayBH?.is_open && dayBH.close_time_1 && dayBH.open_time_2) {
    const breakStartMin = timeToMinutes(dayBH.close_time_1);
    const breakEndMin = timeToMinutes(dayBH.open_time_2);
    breakStartPx = (breakStartMin - startHour * 60);
    breakHeightPx = breakEndMin - breakStartMin;
  }

  const totalHeight = hours.length * HOUR_HEIGHT;

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
      {/* Header */}
      <div className="flex flex-shrink-0 border-b border-gray-200">
        <div className="w-16 flex-shrink-0 bg-gray-100 border-r border-gray-200 h-12" />
        <div className="flex-1 h-12 bg-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-medium text-gray-500 uppercase">{DAYS_IT[date.getDay()]}</p>
          <p className={`text-sm font-semibold ${isToday(date) ? 'text-purple-600' : 'text-gray-900'}`}>
            {date.getDate()}
          </p>
          {holiday && <p className="text-[10px] text-orange-600">{holiday}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time column */}
        <div className="w-16 flex-shrink-0 bg-gray-100 border-r border-gray-200" style={{ minHeight: totalHeight }}>
          {hours.map((hour, idx) => (
            <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
              {idx === 0 ? (
                <span className="absolute right-2 top-0 text-xs text-gray-500 font-medium">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </span>
              ) : (
                <span className="absolute right-2 text-xs text-gray-500 font-medium" style={{ top: 0, transform: 'translateY(-50%)' }}>
                  {`${hour.toString().padStart(2, '0')}:00`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day content */}
        <div 
          className="flex-1 relative bg-white"
          style={{ height: totalHeight }}
          onClick={handleClick}
        >
          {/* Chiuso overlay */}
          {isDayClosed && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center z-20">
              <span className="text-red-600 font-bold text-lg">
                {closure ? 'CHIUSO PER FESTIVITÀ' : 'CHIUSO'}
              </span>
            </div>
          )}

          {/* Hour lines */}
          {!isDayClosed && hours.map((_, idx) => (
            <React.Fragment key={idx}>
              <div 
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ top: idx * HOUR_HEIGHT }}
              />
              <div 
                className="absolute left-0 right-0 border-t border-gray-100 border-dashed"
                style={{ top: idx * HOUR_HEIGHT + 30 }}
              />
            </React.Fragment>
          ))}

          {/* Pausa pranzo */}
          {!isDayClosed && breakHeightPx > 0 && (
            <div 
              className="absolute left-0 right-0 bg-gray-500 flex items-center justify-center z-10"
              style={{ top: breakStartPx, height: breakHeightPx }}
            >
              <span className="text-white font-medium text-sm">PAUSA PRANZO</span>
            </div>
          )}

          {/* Events */}
          {!isDayClosed && dayEvents.map((event) => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            const startMin = eventStart.getHours() * 60 + eventStart.getMinutes();
            const endMin = eventEnd.getHours() * 60 + eventEnd.getMinutes();
            const top = startMin - startHour * 60;
            const height = Math.max(endMin - startMin, 20);

            return (
              <div
                key={event.id}
                className="absolute left-1 right-1 z-30 overflow-hidden rounded"
                style={{ top, height }}
                onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
              >
                <CalendarEvent event={event} variant="compact" style={{ height: '100%' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEK VIEW
// ============================================================================

function WeekView({
  date,
  events,
  businessHours,
  closures,
  onEventClick,
  onSlotClick,
  onDayClick,
}: {
  date: Date;
  events: CalendarEventData[];
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onSlotClick?: (date: Date, hour: number, minutes: number) => void;
  onDayClick?: (date: Date) => void;
}) {
  const weekDays = getWeekDays(date);
  const hours = getDisplayHours(businessHours);
  const startHour = hours[0];
  const totalHeight = hours.length * HOUR_HEIGHT;
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const timeColumnRef = React.useRef<HTMLDivElement>(null);

  // Sincronizza scroll tra time column e content
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timeColumnRef.current) {
      timeColumnRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Time column (fixed width, synced scroll) */}
      <div className="w-16 flex-shrink-0 flex flex-col bg-gray-100 border-r border-gray-200">
        {/* Empty header space + scrollbar padding */}
        <div className="h-14 border-b border-gray-200 flex-shrink-0" />
        {/* Time labels - hidden scrollbar, synced with content */}
        <div 
          ref={timeColumnRef}
          className="flex-1 overflow-y-hidden"
        >
          <div style={{ height: totalHeight }}>
            {hours.map((hour, idx) => (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                {idx === 0 ? (
                  <span className="absolute right-2 top-0 text-xs text-gray-500 font-medium">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </span>
                ) : (
                  <span className="absolute right-2 text-xs text-gray-500 font-medium" style={{ top: 0, transform: 'translateY(-50%)' }}>
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Days area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days header - reserve scrollbar space with padding */}
        <div className="flex flex-shrink-0 border-b border-gray-200 pr-[17px]">
          <div className="flex flex-1">
            {weekDays.map((day, idx) => {
              const holiday = getHolidayName(day);
              const closure = isClosedForDate(closures, day);
              const dayBH = getBusinessHoursForDay(businessHours, day);
              const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 h-14 flex flex-col items-center justify-center cursor-pointer border-r border-gray-200 last:border-r-0 transition-colors ${
                    isClosed ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => onDayClick?.(day)}
                >
                  <p className="text-xs font-medium text-gray-500 uppercase">{DAYS_SHORT_IT[day.getDay()]}</p>
                  <p className={`text-sm font-semibold ${isToday(day) ? 'text-purple-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </p>
                  {holiday && <p className="text-[9px] text-orange-600 leading-tight">{holiday}</p>}
                  {isClosed && (
                    <p className="text-[8px] text-red-600 font-bold leading-tight">
                      {closure ? 'CHIUSO FESTIVITÀ' : 'CHIUSO'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Days content - vertical scroll with same gutter */}
        <div 
          className="flex-1 overflow-y-scroll" 
          style={{ scrollbarGutter: 'stable' }}
          onScroll={handleScroll}
        >
          <div className="flex" style={{ height: totalHeight }}>
            {weekDays.map((day, dayIdx) => {
              const dayBH = getBusinessHoursForDay(businessHours, day);
              const closure = isClosedForDate(closures, day);
              const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
              const dayEvents = getEventsForDate(events, day);
              
              // Pausa pranzo
              let breakStartPx = 0;
              let breakHeightPx = 0;
              if (dayBH?.is_open && dayBH.close_time_1 && dayBH.open_time_2) {
                const breakStartMin = timeToMinutes(dayBH.close_time_1);
                const breakEndMin = timeToMinutes(dayBH.open_time_2);
                breakStartPx = breakStartMin - startHour * 60;
                breakHeightPx = breakEndMin - breakStartMin;
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
                <div 
                  key={day.toISOString()}
                  className="flex-1 relative border-r border-gray-200 last:border-r-0 bg-white"
                  onClick={handleDayClick}
                >
                  {/* Chiuso */}
                  {isClosed && (
                    <div className="absolute inset-0 bg-red-100 flex items-center justify-center z-20">
                      <span className="text-red-600 font-bold text-xs transform -rotate-90 whitespace-nowrap">
                        {closure ? 'CHIUSO PER FESTIVITÀ' : 'CHIUSO'}
                      </span>
                    </div>
                  )}

                  {/* Hour lines */}
                  {!isClosed && hours.map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div 
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{ top: idx * HOUR_HEIGHT }}
                      />
                      <div 
                        className="absolute left-0 right-0 border-t border-gray-100 border-dashed"
                        style={{ top: idx * HOUR_HEIGHT + 30 }}
                      />
                    </React.Fragment>
                  ))}

                  {/* Pausa pranzo */}
                  {!isClosed && breakHeightPx > 0 && (
                    <div 
                      className="absolute left-0 right-0 bg-gray-500 z-10"
                      style={{ top: breakStartPx, height: breakHeightPx }}
                    />
                  )}

                  {/* Events */}
                  {!isClosed && dayEvents.map((event) => {
                    const eventStart = new Date(event.startTime);
                    const eventEnd = new Date(event.endTime);
                    const startMin = eventStart.getHours() * 60 + eventStart.getMinutes();
                    const endMin = eventEnd.getHours() * 60 + eventEnd.getMinutes();
                    const top = startMin - startHour * 60;
                    const height = Math.max(endMin - startMin, 15);

                    return (
                      <div
                        key={event.id}
                        className="absolute left-0.5 right-0.5 z-30 overflow-hidden rounded"
                        style={{ top, height }}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                      >
                        <CalendarEvent event={event} variant="compact" showTime={false} style={{ height: '100%' }} />
                      </div>
                    );
                  })}
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

function MonthView({
  date,
  events,
  businessHours,
  closures,
  onEventClick,
  onDayClick,
}: {
  date: Date;
  events: CalendarEventData[];
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  onEventClick?: (event: CalendarEventData) => void;
  onDayClick?: (date: Date) => void;
}) {
  const monthDays = getMonthDays(date);
  const currentMonth = date.getMonth();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - con padding per scrollbar */}
      <div className="flex flex-shrink-0 bg-gray-100 border-b border-gray-200 pr-[17px]">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day, idx) => (
          <div 
            key={day} 
            className={`flex-1 h-10 flex items-center justify-center text-xs font-medium text-gray-600 uppercase ${
              idx < 6 ? 'border-r border-gray-200' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid - con scrollbar-gutter stable */}
      <div className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable' }}>
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => {
            const dayEvents = getEventsForDate(events, day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isTodayDate = isToday(day);
            const holiday = getHolidayName(day);
            const closure = isClosedForDate(closures, day);
            const dayBH = getBusinessHoursForDay(businessHours, day);
            const isClosed = closure !== null || (dayBH !== null && !dayBH.is_open);
            const isLastInRow = (idx + 1) % 7 === 0;
            const maxEvents = 2;

            let bgClass = 'bg-white';
            if (!isCurrentMonth) bgClass = 'bg-gray-50';
            else if (isTodayDate) bgClass = 'bg-purple-50';
            else if (isClosed) bgClass = 'bg-red-100';

            return (
              <div
                key={idx}
                className={`min-h-[100px] p-1.5 border-b border-gray-200 ${
                  isLastInRow ? '' : 'border-r'
                } ${bgClass} hover:bg-opacity-80 cursor-pointer transition-colors overflow-hidden`}
                onClick={() => onDayClick?.(day)}
              >
                <div className="flex items-start justify-between">
                  {isTodayDate ? (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white text-xs font-medium">
                      {day.getDate()}
                    </span>
                  ) : (
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </span>
                  )}
                  {isClosed && (
                    <span className="text-[8px] text-red-600 font-bold">CHIUSO</span>
                  )}
                </div>
                
                {holiday && <p className="text-[9px] text-orange-600 truncate mt-0.5">{holiday}</p>}
                {closure && <p className="text-[9px] text-red-600 font-bold truncate">FESTIVITÀ</p>}
                
                {!isClosed && (
                  <div className="mt-1 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                    {dayEvents.slice(0, maxEvents).map((event) => (
                      <div
                        key={event.id}
                        className="text-[10px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-purple-200"
                        onClick={() => onEventClick?.(event)}
                      >
                        {new Date(event.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > maxEvents && (
                      <p className="text-[10px] text-purple-600 font-medium cursor-pointer hover:underline">
                        +{dayEvents.length - maxEvents} altri
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
  events,
  businessHours,
  closures,
  view: controlledView,
  selectedDate: controlledDate,
  onViewChange,
  onDateChange,
  onEventClick,
  onSlotClick,
  onDayClick,
  className = '',
}: CalendarProps) {
  const [internalView, setInternalView] = React.useState<CalendarView>('week');
  const [internalDate, setInternalDate] = React.useState<Date>(new Date());

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
    const newDate = new Date(selectedDate);
    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    handleDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    handleDateChange(newDate);
  };

  const handleToday = () => {
    handleDateChange(new Date());
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-16rem)] ${className}`}>
      <CalendarHeader
        date={selectedDate}
        view={view}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 overflow-hidden">
        {view === 'day' ? (
          <DayView
            date={selectedDate}
            events={events}
            businessHours={businessHours}
            closures={closures}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
          />
        ) : view === 'week' ? (
          <WeekView
            date={selectedDate}
            events={events}
            businessHours={businessHours}
            closures={closures}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
            onDayClick={handleDayClick}
          />
        ) : (
          <MonthView
            date={selectedDate}
            events={events}
            businessHours={businessHours}
            closures={closures}
            onEventClick={onEventClick}
            onDayClick={handleDayClick}
          />
        )}
      </div>
    </div>
  );
}
