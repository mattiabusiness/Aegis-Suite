// ============================================================================
// AEGIS SUITE - APPOINTMENT MODAL (Perfected v3)
// File: packages/ui/src/components/dashboard/AppointmentModal.tsx
//
// Changes from v2:
//   - Removed icon hover animations (distracting)
//   - AnimatedList-style portal dropdowns for services & staff
//   - Services grouped by category in dropdown
//   - Toggle open/close on both bar and button click
//   - Date picker opens upward with modern calendar UI
//   - SlotPicker integration for dynamic time slots
//   - Glass/glow design preserved
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  X, Calendar, Clock, User, Briefcase, Users,
  FileText, Search, Plus, AlertTriangle, Mail,
  ChevronLeft, ChevronRight, Check,
} from 'lucide-react';
import { SlotPicker, type SlotInfo } from './SlotPicker';

// ============================================================================
// TYPES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  categoryId?: string;
  categoryName?: string;
}

export interface Staff {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
}

export interface AppointmentFormData {
  customerId: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  notes: string;
  isNewCustomer: boolean;
  sendInvite: boolean;
}

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
  reason?: string;
}

export interface StaffServicesMap {
  [staffId: string]: string[];
}

export interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  staffServices?: StaffServicesMap;
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  initialDate?: Date;
  initialTime?: string;
  initialStaffId?: string;
  initialCustomerId?: string;
  isLoading?: boolean;
  labels?: {
    title?: string;
    customer?: string;
    service?: string;
    staff?: string;
    newCustomer?: string;
    searchCustomer?: string;
    submit?: string;
  };
  availableSlots?: SlotInfo[];
  slotsLoading?: boolean;
  slotsError?: string;
  onSlotsNeeded?: (date: string, serviceId: string, staffId?: string | null) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const defaultLabels = {
  title: 'Nuovo Appuntamento',
  customer: 'Cliente',
  service: 'Servizio',
  staff: 'Operatore',
  newCustomer: 'Nuovo cliente',
  searchCustomer: 'Cerca cliente...',
  submit: 'Crea appuntamento',
};

const DAYS_DB = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

// ============================================================================
// HELPERS
// ============================================================================

function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fmtPrice(price: number): string {
  return `€${price.toFixed(2).replace('.00', '')}`;
}

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const mn = minutes % 60;
  return mn > 0 ? `${h}h ${mn}min` : `${h}h`;
}

function fmtDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

function isDateClosedFn(date: Date, bh?: BusinessHoursData[], cl?: ClosureData[]): { closed: boolean; reason?: string } {
  if (bh) {
    const dayName = DAYS_DB[date.getDay()];
    const dayHours = bh.find(h => h.day_of_week === dayName);
    if (dayHours && !dayHours.is_open) return { closed: true, reason: 'Chiuso' };
  }
  if (cl) {
    const ds = fmtDate(date);
    const c = cl.find(x => x.date === ds);
    if (c) return { closed: true, reason: c.reason || 'Chiuso per festività' };
  }
  return { closed: false };
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ============================================================================
// SHARED STYLES
// ============================================================================

const inputBase: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  transition: 'border 0.15s ease, box-shadow 0.15s ease',
  fontSize: 14,
  padding: '10px 12px',
  outline: 'none',
  width: '100%',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = '1px solid rgba(168,85,247,0.4)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

const greenFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = '1px solid rgba(5,150,105,0.5)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
    e.currentTarget.style.background = '#fff';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = '1px solid rgba(5,150,105,0.2)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
  },
};

const errorBorder = (hasError: boolean): React.CSSProperties =>
  hasError ? { border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.03)' } : {};

// ============================================================================
// MINI CALENDAR (upward-opening, modern)
// ============================================================================

function MiniCalendar({
  value,
  onChange,
  onClose,
  businessHours,
  closures,
  position,
}: {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  businessHours?: BusinessHoursData[];
  closures?: ClosureData[];
  position: { bottom: number; left: number; width: number };
}) {
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewMonth, setViewMonth] = React.useState(selected ? selected.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = React.useState(selected ? selected.getFullYear() : today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: prevMonthDays - i, month: m, year: y, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
  }
  const totalCells = 42;
  const remaining = Math.max(0, totalCells - cells.length);
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelect = (cell: typeof cells[0]) => {
    const d = new Date(cell.year, cell.month, cell.day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    onChange(fmtDate(d));
    onClose();
  };

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const calRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={calRef}
      style={{
        position: 'fixed',
        zIndex: 10001,
        bottom: position.bottom,
        left: position.left,
        width: Math.max(position.width, 260),
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(168,85,247,0.12)',
        borderRadius: 14,
        boxShadow: '0 -12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        padding: 12,
        animation: 'apm-cal-enter 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={handlePrev}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft style={{ width: 14, height: 14, color: '#6b7280' }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
          {MONTHS_IT[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={handleNext}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight style={{ width: 14, height: 14, color: '#6b7280' }} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center" style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', padding: '3px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid — fixed 6 rows */}
      <div className="grid grid-cols-7" style={{ height: 6 * 32 }}>
        {cells.map((cell, idx) => {
          const cellDate = new Date(cell.year, cell.month, cell.day);
          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isFuture = cellDate > maxDate;
          const isDisabled = isPast || isFuture;
          const isToday = isSameDay(cellDate, today);
          const isSelected = selected && isSameDay(cellDate, selected);
          const { closed } = isDateClosedFn(cellDate, businessHours, closures);

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && handleSelect(cell)}
              className="relative flex items-center justify-center"
              style={{
                width: '100%',
                height: 32,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                color: isDisabled
                  ? '#d1d5db'
                  : !cell.isCurrentMonth
                    ? '#9ca3af'
                    : isSelected
                      ? '#fff'
                      : closed
                        ? '#ef4444'
                        : isToday
                          ? '#7c3aed'
                          : '#374151',
                background: isSelected
                  ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
                  : 'transparent',
                boxShadow: isSelected ? '0 2px 8px rgba(147,51,234,0.3)' : 'none',
                cursor: isDisabled ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isSelected) {
                  e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isSelected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {cell.day}
              {isToday && !isSelected && (
                <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 3, height: 3, borderRadius: '50%', background: '#7c3aed',
                }} />
              )}
              {closed && !isSelected && (
                <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 3, height: 3, borderRadius: '50%', background: '#ef4444',
                }} />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes apm-cal-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>,
    document.body
  );
}

// ============================================================================
// SERVICE DROPDOWN (Portal-based, grouped by category)
// ============================================================================

function ServiceDropdown({
  services,
  selectedId,
  searchQuery,
  onSelect,
  onClose,
  position,
}: {
  services: Service[];
  selectedId: string;
  searchQuery: string;
  onSelect: (service: Service) => void;
  onClose: () => void;
  position: { top: number; left: number; width: number };
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    const s = searchQuery.toLowerCase();
    return services.filter(sv => sv.name.toLowerCase().includes(s) || sv.categoryName?.toLowerCase().includes(s));
  }, [services, searchQuery]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, Service[]> = {};
    filtered.forEach(sv => {
      const cat = sv.categoryName || 'Altri';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sv);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (filtered.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        zIndex: 10001,
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: 260,
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(168,85,247,0.12)',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        animation: 'apm-drop-enter 0.2s ease-out',
        scrollbarWidth: 'thin' as const,
        scrollbarColor: 'rgba(168,85,247,0.15) transparent',
      }}
    >
      {grouped.map(([cat, svcs]) => (
        <div key={cat}>
          <div style={{
            padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.015)',
            borderBottom: '1px solid rgba(0,0,0,0.03)',
          }}>
            {cat}
          </div>
          {svcs.map(sv => {
            const isSelected = sv.id === selectedId;
            const isHovered = sv.id === hoveredId;
            return (
              <button
                key={sv.id}
                type="button"
                onClick={() => onSelect(sv)}
                onMouseEnter={() => setHoveredId(sv.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full text-left outline-none"
                style={{ padding: '0 4px' }}
              >
                <div
                  className="flex items-center justify-between px-2.5 py-2.5 mx-0.5 rounded-lg"
                  style={{
                    background: isSelected
                      ? 'rgba(168,85,247,0.08)'
                      : isHovered ? 'rgba(168,85,247,0.04)' : 'transparent',
                    borderLeft: isSelected
                      ? '2.5px solid #a855f7'
                      : isHovered ? '2.5px solid rgba(168,85,247,0.3)' : '2.5px solid transparent',
                    transform: isHovered ? 'translateY(-1px) scale(1.01)' : 'none',
                    boxShadow: isHovered ? '0 2px 8px rgba(168,85,247,0.08)' : 'none',
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#7c3aed' : '#374151' }}>
                      {sv.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                      {fmtDuration(sv.duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>{fmtPrice(sv.price)}</span>
                    {isSelected && <Check style={{ width: 14, height: 14, color: '#7c3aed' }} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
      <style>{`@keyframes apm-drop-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>,
    document.body
  );
}

// ============================================================================
// STAFF DROPDOWN (Portal-based, with avatar + color)
// ============================================================================

function StaffDropdown({
  staff,
  selectedId,
  searchQuery,
  onSelect,
  onClose,
  position,
}: {
  staff: Staff[];
  selectedId: string;
  searchQuery: string;
  onSelect: (member: Staff) => void;
  onClose: () => void;
  position: { top: number; left: number; width: number };
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return staff;
    const s = searchQuery.toLowerCase();
    return staff.filter(m => m.name.toLowerCase().includes(s));
  }, [staff, searchQuery]);

  if (filtered.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        zIndex: 10001,
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: 220,
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(168,85,247,0.12)',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        animation: 'apm-drop-enter 0.2s ease-out',
        scrollbarWidth: 'thin' as const,
        scrollbarColor: 'rgba(168,85,247,0.15) transparent',
      }}
    >
      <div className="py-1">
        {filtered.map(m => {
          const isSelected = m.id === selectedId;
          const isHovered = m.id === hoveredId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="w-full text-left outline-none"
              style={{ padding: '0 4px' }}
            >
              <div
                className="flex items-center gap-2.5 px-2.5 py-2 mx-0.5 rounded-lg"
                style={{
                  background: isSelected
                    ? 'rgba(168,85,247,0.08)'
                    : isHovered ? 'rgba(168,85,247,0.04)' : 'transparent',
                  borderLeft: isSelected
                    ? '2.5px solid #a855f7'
                    : isHovered ? '2.5px solid rgba(168,85,247,0.3)' : '2.5px solid transparent',
                  transform: isHovered ? 'translateY(-1px) scale(1.01)' : 'none',
                  boxShadow: isHovered ? '0 2px 8px rgba(168,85,247,0.08)' : 'none',
                  transition: 'all 0.15s ease-out',
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: m.color || '#9333ea' }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? '#7c3aed' : '#374151',
                  flex: 1,
                }}>
                  {m.name}
                </span>
                {isSelected && <Check style={{ width: 14, height: 14, color: '#7c3aed' }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// CUSTOMER DROPDOWN (Portal-based, animated list style)
// ============================================================================

function CustomerDropdown({
  customers,
  searchQuery,
  onSelect,
  onNewCustomer,
  onClose,
  position,
  newCustomerLabel,
}: {
  customers: Customer[];
  searchQuery: string;
  onSelect: (customer: Customer) => void;
  onNewCustomer: () => void;
  onClose: () => void;
  position: { top: number; left: number; width: number };
  newCustomerLabel: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [hoveredNew, setHoveredNew] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        zIndex: 10001,
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: 240,
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(168,85,247,0.12)',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        animation: 'apm-drop-enter 0.2s ease-out',
        scrollbarWidth: 'thin' as const,
        scrollbarColor: 'rgba(168,85,247,0.15) transparent',
      }}
    >
      <div className="py-1">
        {searchQuery.trim() && (
          <button type="button" onClick={onNewCustomer}
            onMouseEnter={() => setHoveredNew(true)}
            onMouseLeave={() => setHoveredNew(false)}
            className="w-full text-left outline-none"
            style={{ padding: '0 4px' }}
          >
            <div
              className="flex items-center gap-2 px-2.5 py-2.5 mx-0.5 rounded-lg"
              style={{
                background: hoveredNew ? 'rgba(5,150,105,0.06)' : 'transparent',
                borderLeft: hoveredNew ? '2.5px solid rgba(5,150,105,0.4)' : '2.5px solid transparent',
                transform: hoveredNew ? 'translateY(-1px) scale(1.01)' : 'none',
                boxShadow: hoveredNew ? '0 2px 8px rgba(5,150,105,0.08)' : 'none',
                transition: 'all 0.15s ease-out',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
              }}
            >
              <Plus style={{ width: 14, height: 14, color: '#059669' }} />
              <span style={{ fontSize: 13 }}><span style={{ fontWeight: 600, color: '#059669' }}>{newCustomerLabel}:</span> {searchQuery}</span>
            </div>
          </button>
        )}
        {customers.map(c => {
          const isHovered = c.id === hoveredId;
          return (
            <button key={c.id} type="button" onClick={() => onSelect(c)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="w-full text-left outline-none"
              style={{ padding: '0 4px' }}
            >
              <div
                className="px-2.5 py-2.5 mx-0.5 rounded-lg"
                style={{
                  background: isHovered ? 'rgba(168,85,247,0.04)' : 'transparent',
                  borderLeft: isHovered ? '2.5px solid rgba(168,85,247,0.3)' : '2.5px solid transparent',
                  transform: isHovered ? 'translateY(-1px) scale(1.01)' : 'none',
                  boxShadow: isHovered ? '0 2px 8px rgba(168,85,247,0.08)' : 'none',
                  transition: 'all 0.15s ease-out',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: isHovered ? '#6b21a8' : '#374151' }}>{c.name}</p>
                {c.phone && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{c.phone}</p>}
              </div>
            </button>
          );
        })}
        {customers.length === 0 && !searchQuery.trim() && (
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>Digita per cercare</p>
        )}
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppointmentModal({
  isOpen, onClose, onSubmit, customers, services, staff,
  staffServices, businessHours, closures,
  initialDate, initialTime, initialStaffId, initialCustomerId,
  isLoading = false, labels: customLabels,
  availableSlots, slotsLoading = false, slotsError, onSlotsNeeded,
}: AppointmentModalProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);
  const isDynamicMode = !!onSlotsNeeded;

  // Animation
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<AppointmentFormData>({
    customerId: null, customerFirstName: '', customerLastName: '',
    customerPhone: '', customerEmail: '', serviceId: '',
    staffId: initialStaffId || '',
    date: initialDate ? fmtDate(initialDate) : fmtDate(new Date()),
    time: initialTime || '', notes: '', isNewCustomer: false, sendInvite: true,
  });

  // UI state
  const [customerSearch, setCustomerSearch] = React.useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [showServiceList, setShowServiceList] = React.useState(false);
  const [staffSearch, setStaffSearch] = React.useState('');
  const [showStaffList, setShowStaffList] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Refs for dropdown positioning
  const serviceFieldRef = React.useRef<HTMLDivElement>(null);
  const staffFieldRef = React.useRef<HTMLDivElement>(null);
  const dateFieldRef = React.useRef<HTMLDivElement>(null);
  const customerFieldRef = React.useRef<HTMLDivElement>(null);

  // Dropdown positions
  const [servicePos, setServicePos] = React.useState({ top: 0, left: 0, width: 0 });
  const [staffPos, setStaffPos] = React.useState({ top: 0, left: 0, width: 0 });
  const [calendarPos, setCalendarPos] = React.useState({ bottom: 0, left: 0, width: 0 });
  const [customerPos, setCustomerPos] = React.useState({ top: 0, left: 0, width: 0 });

  // Derived
  const selectedDateClosed = React.useMemo(() => {
    if (!formData.date) return { closed: false };
    return isDateClosedFn(new Date(formData.date + 'T00:00:00'), businessHours, closures);
  }, [formData.date, businessHours, closures]);

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedStaffMember = staff.find(s => s.id === formData.staffId);

  const incompatibleStaffService = React.useMemo(() => {
    if (!formData.staffId || !formData.serviceId || !staffServices) return null;
    const list = staffServices[formData.staffId];
    if (!list || list.length === 0 || !list.includes(formData.serviceId)) {
      return {
        staffName: staff.find(s => s.id === formData.staffId)?.name || 'Operatore',
        serviceName: services.find(s => s.id === formData.serviceId)?.name || 'servizio',
      };
    }
    return null;
  }, [formData.staffId, formData.serviceId, staffServices, services, staff]);

  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10);
    const s = customerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s)).slice(0, 10);
  }, [customers, customerSearch]);

  // ── Handlers ──
  const handleInputChange = (field: keyof AppointmentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // === DYNAMIC SLOT FETCHING ===
  React.useEffect(() => {
    if (!isDynamicMode) return;
    if (!formData.date || !formData.serviceId || !formData.staffId) return;
    onSlotsNeeded(formData.date, formData.serviceId, formData.staffId);
  }, [isDynamicMode, formData.date, formData.serviceId, formData.staffId, onSlotsNeeded]);

  React.useEffect(() => {
    if (!isDynamicMode || !availableSlots) return;
    if (formData.time && !availableSlots.some(s => s.time === formData.time)) {
      handleInputChange('time', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableSlots, isDynamicMode]);

  // ── Lifecycle ──
  React.useEffect(() => {
    if (isOpen) {
      setClosing(false);
      document.body.style.overflow = 'hidden';
      const prefill = initialCustomerId ? customers.find(c => c.id === initialCustomerId) : null;
      const parts = prefill?.name.split(' ') || [];
      setFormData({
        customerId: prefill?.id || null,
        customerFirstName: parts[0] || '', customerLastName: parts.slice(1).join(' ') || '',
        customerPhone: prefill?.phone || '', customerEmail: prefill?.email || '',
        serviceId: '', staffId: initialStaffId || '',
        date: initialDate ? fmtDate(initialDate) : fmtDate(new Date()),
        time: initialTime || '', notes: '', isNewCustomer: false, sendInvite: true,
      });
      setCustomerSearch(prefill?.name || '');
      setServiceSearch(''); setShowServiceList(false);
      setStaffSearch(''); setShowStaffList(false);
      setShowCalendar(false);
      setErrors({});
      requestAnimationFrame(() => { requestAnimationFrame(() => setMounted(true)); });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true); setMounted(false);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  // ── Position calculators ──
  const updateServicePos = () => {
    if (serviceFieldRef.current) {
      const rect = serviceFieldRef.current.getBoundingClientRect();
      setServicePos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const updateStaffPos = () => {
    if (staffFieldRef.current) {
      const rect = staffFieldRef.current.getBoundingClientRect();
      setStaffPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const updateCalendarPos = () => {
    if (dateFieldRef.current) {
      const rect = dateFieldRef.current.getBoundingClientRect();
      setCalendarPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width });
    }
  };

  const updateCustomerPos = () => {
    if (customerFieldRef.current) {
      const rect = customerFieldRef.current.getBoundingClientRect();
      setCustomerPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  // ── Toggle dropdowns ──
  const toggleServiceList = () => {
    if (showServiceList) {
      setShowServiceList(false);
    } else {
      updateServicePos();
      setShowServiceList(true);
      setShowStaffList(false);
      setShowCalendar(false);
    }
  };

  const toggleStaffList = () => {
    if (showStaffList) {
      setShowStaffList(false);
    } else {
      updateStaffPos();
      setShowStaffList(true);
      setShowServiceList(false);
      setShowCalendar(false);
    }
  };

  const toggleCalendar = () => {
    if (showCalendar) {
      setShowCalendar(false);
    } else {
      updateCalendarPos();
      setShowCalendar(true);
      setShowServiceList(false);
      setShowStaffList(false);
    }
  };

  // ── Customer ──
  const handleCustomerSelect = (c: Customer) => {
    const parts = c.name.split(' ');
    setFormData(prev => ({
      ...prev, customerId: c.id,
      customerFirstName: parts[0] || '', customerLastName: parts.slice(1).join(' ') || '',
      customerPhone: c.phone || '', customerEmail: c.email || '', isNewCustomer: false,
    }));
    setCustomerSearch(c.name);
    setShowCustomerDropdown(false);
    if (errors.customerFirstName) setErrors(prev => { const n = { ...prev }; delete n.customerFirstName; return n; });
  };

  const handleNewCustomer = () => {
    const parts = customerSearch.trim().split(' ');
    setFormData(prev => ({
      ...prev, customerId: null,
      customerFirstName: parts[0] || '', customerLastName: parts.slice(1).join(' ') || '',
      isNewCustomer: true, sendInvite: true,
    }));
    setShowCustomerDropdown(false);
  };

  const handleServiceSelect = (sv: Service) => {
    setFormData(prev => ({ ...prev, serviceId: sv.id }));
    setServiceSearch(''); setShowServiceList(false);
    if (errors.serviceId) setErrors(prev => { const n = { ...prev }; delete n.serviceId; return n; });
  };

  const handleStaffSelect = (m: Staff) => {
    setFormData(prev => ({ ...prev, staffId: m.id }));
    setStaffSearch(''); setShowStaffList(false);
    if (errors.staffId) setErrors(prev => { const n = { ...prev }; delete n.staffId; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (formData.isNewCustomer) {
      if (!formData.customerFirstName.trim()) e.customerFirstName = 'Inserisci il nome';
      if (!formData.customerLastName.trim()) e.customerLastName = 'Inserisci il cognome';
      if (!formData.customerPhone.trim()) e.customerPhone = 'Inserisci il telefono';
      if (!formData.customerEmail.trim()) e.customerEmail = 'Inserisci l\'email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) e.customerEmail = 'Email non valida';
    } else if (!formData.customerId && !formData.customerFirstName.trim()) {
      e.customerFirstName = 'Seleziona o inserisci un cliente';
    }
    if (!formData.serviceId) e.serviceId = 'Seleziona un servizio';
    if (!formData.staffId) e.staffId = 'Seleziona un operatore';
    if (!formData.date) e.date = 'Seleziona una data';
    else if (selectedDateClosed.closed) e.date = selectedDateClosed.reason || 'Giorno chiuso';
    if (!formData.time) e.time = 'Seleziona un orario';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { doShake(); return; }
    try { await onSubmit(formData); handleClose(); }
    catch (err) { console.error('Error creating appointment:', err); }
  };

  if (!isOpen && !closing) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={handleClose}
        style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease',
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24, border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: mounted
            ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden',
          animation: shake ? 'apm-shake 0.4s ease-in-out' : undefined,
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{labels.title}</h2>
          <button onClick={handleClose}
            className="p-2 rounded-xl" style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* ═══ FORM ═══ */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5" style={{ scrollbarWidth: 'none' as const, overflowY: (showCustomerDropdown || showServiceList || showStaffList || showCalendar) ? 'hidden' : 'auto' }}>
          <div className="space-y-5">

            {/* Incompatibility Warning */}
            {incompatibleStaffService && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Servizio non disponibile</p>
                  <p className="text-xs text-amber-700 mt-0.5"><strong>{incompatibleStaffService.staffName}</strong> non può eseguire "<strong>{incompatibleStaffService.serviceName}</strong>".</p>
                </div>
              </div>
            )}

            {/* ── CUSTOMER ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4" style={{ color: '#9333ea' }} />{labels.customer}
              </label>
              <div ref={customerFieldRef} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (!showCustomerDropdown) { updateCustomerPos(); setShowCustomerDropdown(true); }
                    if (formData.customerId) setFormData(prev => ({ ...prev, customerId: null, isNewCustomer: false }));
                  }}
                  placeholder={labels.searchCustomer}
                  style={{ ...inputBase, paddingLeft: 36, ...errorBorder(!!errors.customerFirstName) }}
                  onFocus={(e) => {
                    updateCustomerPos();
                    setShowCustomerDropdown(true);
                    setShowServiceList(false);
                    setShowStaffList(false);
                    setShowCalendar(false);
                    e.currentTarget.style.border = '1px solid rgba(168,85,247,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {showCustomerDropdown && (
                  <CustomerDropdown
                    customers={filteredCustomers}
                    searchQuery={customerSearch}
                    onSelect={handleCustomerSelect}
                    onNewCustomer={handleNewCustomer}
                    onClose={() => setShowCustomerDropdown(false)}
                    position={customerPos}
                    newCustomerLabel={labels.newCustomer}
                  />
                )}
              </div>
              {errors.customerFirstName && <p className="text-xs" style={{ color: '#dc2626' }}>* {errors.customerFirstName}</p>}
            </div>

            {/* ── NEW CUSTOMER FORM ── */}
            {formData.isNewCustomer && (
              <div className="p-4 rounded-xl space-y-3" style={{
                background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.2)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 12px rgba(5,150,105,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
                animation: 'apm-slide-down 0.3s ease-out',
              }}>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#047857' }}>
                  <Plus className="w-4 h-4" />Dati nuovo cliente
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={formData.customerFirstName}
                    onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                    placeholder="Nome *"
                    style={{ ...inputBase, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(5,150,105,0.2)', ...errorBorder(!!errors.customerFirstName) }}
                    {...greenFocusHandlers}
                  />
                  <input type="text" value={formData.customerLastName}
                    onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                    placeholder="Cognome *"
                    style={{ ...inputBase, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(5,150,105,0.2)', ...errorBorder(!!errors.customerLastName) }}
                    {...greenFocusHandlers}
                  />
                </div>
                <input type="tel" value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="Telefono *"
                  style={{ ...inputBase, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(5,150,105,0.2)', ...errorBorder(!!errors.customerPhone) }}
                  {...greenFocusHandlers}
                />
                <input type="email" value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="Email *"
                  style={{ ...inputBase, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(5,150,105,0.2)', ...errorBorder(!!errors.customerEmail) }}
                  {...greenFocusHandlers}
                />
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: formData.sendInvite ? '#059669' : 'transparent',
                      border: formData.sendInvite ? 'none' : '1.5px solid rgba(5,150,105,0.3)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: formData.sendInvite ? 'scale(1.05)' : 'scale(0.85)',
                    }}
                    onClick={() => handleInputChange('sendInvite', !formData.sendInvite)}
                  >
                    {formData.sendInvite && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm flex items-center gap-1.5" style={{ color: '#047857' }}>
                    <Mail className="w-3.5 h-3.5" />Invia invito via email
                  </span>
                </label>
              </div>
            )}

            {/* ── SERVICE ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Briefcase className="w-4 h-4" style={{ color: '#9333ea' }} />{labels.service}
              </label>
              <div ref={serviceFieldRef} className="relative">
                {selectedService && !showServiceList ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)', transition: 'border 0.15s ease', animation: 'apm-slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onClick={toggleServiceList}
                    onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(168,85,247,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(168,85,247,0.15)'; }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedService.name}</p>
                      <p className="text-xs text-gray-400">{fmtDuration(selectedService.duration)} · {fmtPrice(selectedService.price)}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#9333ea' }}>Cambia</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input type="text" value={serviceSearch}
                        onChange={(e) => { setServiceSearch(e.target.value); if (!showServiceList) { updateServicePos(); setShowServiceList(true); } }}
                        placeholder="Cerca servizio..."
                        style={{ ...inputBase, paddingLeft: 36, ...errorBorder(!!errors.serviceId) }}
                        onFocus={(e) => {
                          updateServicePos();
                          setShowServiceList(true);
                          setShowStaffList(false);
                          setShowCalendar(false);
                          setShowCustomerDropdown(false);
                          e.currentTarget.style.border = '1px solid rgba(168,85,247,0.4)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <button type="button" onClick={toggleServiceList}
                      className="px-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: showServiceList ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${showServiceList ? 'rgba(168,85,247,0.2)' : 'rgba(0,0,0,0.06)'}`,
                        color: showServiceList ? '#9333ea' : '#6b7280',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: showServiceList ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <Briefcase className="w-4 h-4" style={{
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: showServiceList ? 'rotate(-12deg) scale(1.1)' : 'rotate(0) scale(1)',
                      }} />
                    </button>
                  </div>
                )}

                {showServiceList && (
                  <ServiceDropdown
                    services={services}
                    selectedId={formData.serviceId}
                    searchQuery={serviceSearch}
                    onSelect={handleServiceSelect}
                    onClose={() => setShowServiceList(false)}
                    position={servicePos}
                  />
                )}
              </div>
              {errors.serviceId && <p className="text-xs" style={{ color: '#dc2626' }}>* {errors.serviceId}</p>}
            </div>

            {/* ── STAFF ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4" style={{ color: '#9333ea' }} />{labels.staff}
              </label>
              <div ref={staffFieldRef} className="relative">
                {selectedStaffMember && !showStaffList ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)', transition: 'border 0.15s ease', animation: 'apm-slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onClick={toggleStaffList}
                    onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(168,85,247,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(168,85,247,0.15)'; }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: selectedStaffMember.color || '#9333ea' }}>
                        {selectedStaffMember.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{selectedStaffMember.name}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#9333ea' }}>Cambia</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input type="text" value={staffSearch}
                        onChange={(e) => { setStaffSearch(e.target.value); if (!showStaffList) { updateStaffPos(); setShowStaffList(true); } }}
                        placeholder="Cerca operatore..."
                        style={{ ...inputBase, paddingLeft: 36, ...errorBorder(!!errors.staffId) }}
                        onFocus={(e) => {
                          updateStaffPos();
                          setShowStaffList(true);
                          setShowServiceList(false);
                          setShowCalendar(false);
                          setShowCustomerDropdown(false);
                          e.currentTarget.style.border = '1px solid rgba(168,85,247,0.4)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <button type="button" onClick={toggleStaffList}
                      className="px-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: showStaffList ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${showStaffList ? 'rgba(168,85,247,0.2)' : 'rgba(0,0,0,0.06)'}`,
                        color: showStaffList ? '#9333ea' : '#6b7280',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: showStaffList ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <Users className="w-4 h-4" style={{
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: showStaffList ? 'rotate(-12deg) scale(1.1)' : 'rotate(0) scale(1)',
                      }} />
                    </button>
                  </div>
                )}

                {showStaffList && (
                  <StaffDropdown
                    staff={staff}
                    selectedId={formData.staffId}
                    searchQuery={staffSearch}
                    onSelect={handleStaffSelect}
                    onClose={() => setShowStaffList(false)}
                    position={staffPos}
                  />
                )}
              </div>
              {errors.staffId && <p className="text-xs" style={{ color: '#dc2626' }}>* {errors.staffId}</p>}
            </div>

            {/* ── DATE ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4" style={{ color: '#9333ea' }} />Data
              </label>
              <div ref={dateFieldRef}>
                <button
                  type="button"
                  onClick={toggleCalendar}
                  style={{
                    ...inputBase,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    ...(showCalendar ? { border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 0 0 3px rgba(168,85,247,0.08)' } : {}),
                    ...errorBorder(!!errors.date || selectedDateClosed.closed),
                  }}
                >
                  <span style={{ color: formData.date ? '#1f2937' : '#9ca3af', fontWeight: formData.date ? 500 : 400 }}>
                    {formData.date ? fmtDateDisplay(formData.date) : 'Seleziona data'}
                  </span>
                  <Calendar style={{ width: 16, height: 16, color: showCalendar ? '#9333ea' : '#9ca3af', transition: 'color 0.15s' }} />
                </button>
              </div>
              {selectedDateClosed.closed && <p className="text-xs flex items-center gap-1" style={{ color: '#d97706' }}><AlertTriangle className="w-3 h-3" />{selectedDateClosed.reason}</p>}
              {errors.date && !selectedDateClosed.closed && <p className="text-xs" style={{ color: '#dc2626' }}>* {errors.date}</p>}

              {showCalendar && (
                <MiniCalendar
                  value={formData.date}
                  onChange={(d) => handleInputChange('date', d)}
                  onClose={() => setShowCalendar(false)}
                  businessHours={businessHours}
                  closures={closures}
                  position={calendarPos}
                />
              )}
            </div>

            {/* ── TIME ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4" style={{ color: '#9333ea' }} />Orario
              </label>
              {isDynamicMode ? (
                <SlotPicker
                  slots={availableSlots || []}
                  selectedTime={formData.time || null}
                  onSelectTime={(time) => handleInputChange('time', time)}
                  loading={slotsLoading}
                  error={slotsError}
                  readyToLoad={!!formData.date && !!formData.serviceId && !!formData.staffId}
                  onRetry={() => {
                    if (formData.date && formData.serviceId) {
                      onSlotsNeeded!(formData.date, formData.serviceId, formData.staffId || null);
                    }
                  }}
                  showWorkstations={true}
                />
              ) : (
                <select value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  style={{ ...inputBase, ...errorBorder(!!errors.time) }}
                  {...focusHandlers}
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              )}
              {errors.time && <p className="text-xs" style={{ color: '#dc2626' }}>* {errors.time}</p>}
            </div>

            {/* ── NOTES ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" style={{ color: '#9333ea' }} />Note
              </label>
              <textarea value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Note opzionali..."
                rows={2}
                className="resize-none outline-none"
                style={{ ...inputBase, padding: '10px 14px' }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(168,85,247,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)'; }}
                onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </form>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* ═══ FOOTER ═══ */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0">
          <button type="button" onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
          >
            Annulla
          </button>
          <button type="submit" onClick={handleSubmit} disabled={isLoading}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
            style={{
              background: isLoading ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
              boxShadow: isLoading ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
              opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 2px 8px rgba(147,51,234,0.25)'; e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {!isLoading && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'apm-shimmer 2.5s ease-in-out infinite',
              }} />
            )}
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4 relative z-10" />
            )}
            <span className="relative z-10">{isLoading ? 'Creazione...' : labels.submit}</span>
          </button>
        </div>

        <style>{`
          @keyframes apm-shake { 0%,100% { transform: translateX(0); } 10%,50%,90% { transform: translateX(-3px); } 30%,70% { transform: translateX(3px); } }
          @keyframes apm-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          @keyframes apm-slide-down { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}