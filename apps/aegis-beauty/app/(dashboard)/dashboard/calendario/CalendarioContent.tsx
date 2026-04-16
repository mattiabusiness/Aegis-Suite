// ============================================================================
// AEGIS BEAUTY - CALENDARIO CONTENT (v2 — Dynamic Fetch + Availability)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/calendario/CalendarioContent.tsx
//
// Changes from v1:
//  - Dynamic appointment fetch when navigating (not just initial week)
//  - Availability API integration for appointment modal
//  - Slot picker instead of static time dropdown
//  - Better error handling and loading states
// ============================================================================

'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  AppointmentModal,
  EventDetailModal,
  type CalendarEventData,
  type CalendarView,
  type BusinessHoursData,
  type ClosureData,
  type Customer,
  type Service,
  type Staff,
  type AppointmentFormData,
  type StaffServicesMap,
  type SlotInfo,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import { useStaffPermissions } from '@/lib/staff-permissions-context';
import { Plus, Calendar as CalendarIcon, Users, Briefcase, ChevronDown } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StaffMember {
  id: string;
  full_name: string;
  color: string | null;
}

interface CalendarioContentProps {
  businessId: string;
  initialEvents: CalendarEventData[];
  initialStaff: StaffMember[];
  businessHours: BusinessHoursData[];
  closures: ClosureData[];
  services: Service[];
  staffServices: StaffServicesMap;
  shampooPrice: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function getDateRange(date: Date, view: CalendarView): { start: string; end: string } {
  const d = new Date(date);

  if (view === 'day') {
    const dateStr = formatDateStr(d);
    return { start: `${dateStr}T00:00:00`, end: `${dateStr}T23:59:59` };
  }

  if (view === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const start = new Date(d);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      start: `${formatDateStr(start)}T00:00:00`,
      end: `${formatDateStr(end)}T23:59:59`,
    };
  }

  // Month: fetch full month + buffer
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: `${formatDateStr(start)}T00:00:00`,
    end: `${formatDateStr(end)}T23:59:59`,
  };
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CalendarioContent({
  businessId,
  initialEvents,
  initialStaff,
  businessHours,
  closures,
  services: initialServices,
  staffServices: initialStaffServices,
  shampooPrice,
}: CalendarioContentProps) {
  const supabase = useMemo(() => createClient(), []);
  const permissions = useStaffPermissions();

  // ========================================================================
  // STATE
  // ========================================================================

  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | null>(null);
  const [showStaffFilter, setShowStaffFilter] = useState(false);
  const [showServiceFilter, setShowServiceFilter] = useState(false);
  const [btnRipple, setBtnRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerAnimated, setDrawerAnimated] = useState(false);
  const staffList = initialStaff;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event detail modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Availability slots for modal
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Business hours — inizializzati dalla prop ma aggiornabili on demand
  const [liveBusinessHours, setLiveBusinessHours] = useState<BusinessHoursData[]>(businessHours);

  // Customers (can grow as new ones are created)
  const handleCustomerSearch = useCallback(async (query: string): Promise<Customer[]> => {
    const params = new URLSearchParams({ limit: '50' });
    if (query) params.set('q', query);
    try {
      const res = await fetch(`/api/customers/search?${params}`);
      if (!res.ok) return [];
      const json = await res.json() as { customers: Customer[] };
      return json.customers ?? [];
    } catch {
      return [];
    }
  }, []);
  const modalServices: Service[] = initialServices;
  const modalStaff: Staff[] = initialStaff.map(s => ({
    id: s.id,
    name: s.full_name,
    color: s.color || undefined,
  }));
  const staffServicesMap = initialStaffServices;

  // Lock body scroll on mobile so calendar scroll doesn't bleed into page
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  // Track last fetched range to avoid redundant fetches
  const lastFetchedRange = useRef<string>('');
  // AbortController per cancellare fetch slot in volo
  const slotsAbortRef = useRef<AbortController | null>(null);

  // ========================================================================
  // DYNAMIC APPOINTMENT FETCHING
  // ========================================================================

  const fetchAppointments = useCallback(async (date: Date, currentView: CalendarView, force = false, silent = false) => {
    const range = getDateRange(date, currentView);
    const rangeKey = `${range.start}_${range.end}`;

    // Skip if already fetched this range (unless forced by polling)
    if (!force && rangeKey === lastFetchedRange.current) return;
    lastFetchedRange.current = rangeKey;

    if (!silent) setLoading(true);
    try {
      const query = supabase
        .from('appointments')
        .select(`
          id, start_time, end_time, status, staff_notes,
          customer:customers(full_name),
          staff:staff(full_name, color),
          appointment_services(service_name)
        `)
        .eq('business_id', businessId)
        .gte('start_time', range.start)
        .lte('start_time', range.end)
        .order('start_time', { ascending: true });

      // Staff senza visibilità agenda completa: vede solo i propri appuntamenti
      if (permissions.isStaff && !permissions.canSeeBusinessCalendar && permissions.currentStaffId) {
        query.eq('staff_id', permissions.currentStaffId);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      const mapped: CalendarEventData[] = (appointments || []).map((a: Record<string, unknown>) => {
        const customer = a.customer as { full_name: string } | null;
        const staff = a.staff as { full_name: string; color: string | null } | null;
        const services = a.appointment_services as Array<{ service_name: string }> | null;

        return {
          id: a.id as string,
          title: services?.[0]?.service_name || 'Appuntamento',
          startTime: new Date(a.start_time as string),
          endTime: new Date(a.end_time as string),
          customerName: customer?.full_name,
          staffName: staff?.full_name,
          staffColor: staff?.color || undefined,
          staffId: (a.staff_id as string) || undefined,
          status: a.status as CalendarEventData['status'],
          notes: a.staff_notes as string | undefined,
        };
      });

      setEvents(mapped);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [businessId, supabase, permissions]);

  // Fetch when date or view changes
  useEffect(() => {
    fetchAppointments(selectedDate, view);
  }, [selectedDate, view, fetchAppointments]);

  // Cleanup: abort any in-flight slot fetch on unmount
  useEffect(() => {
    return () => { slotsAbortRef.current?.abort(); };
  }, []);

  // Poll for new appointments every 60s — silent (no spinner), only when tab is visible
  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === 'visible') {
        fetchAppointments(selectedDate, view, true, true);
      }
    };

    const intervalId = setInterval(poll, 60_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAppointments(selectedDate, view, true, true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [selectedDate, view, fetchAppointments]);

  // ========================================================================
  // AVAILABILITY SLOT FETCHING
  // ========================================================================

  const fetchAvailableSlots = useCallback(async (
    date: string,
    serviceId: string,
    staffId?: string | null,
  ) => {
    // Cancella richieste precedenti in volo
    slotsAbortRef.current?.abort();
    const controller = new AbortController();
    slotsAbortRef.current = controller;

    setSlotsLoading(true);
    setSlotsError(null);
    setAvailableSlots([]);

    try {
      const params = new URLSearchParams({
        date,
        serviceId,
        businessId,
      });
      if (staffId) params.set('staffId', staffId);

      const response = await fetch(`/api/availability?${params}`, { signal: controller.signal });

      if (controller.signal.aborted) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel caricamento');
      }

      if (!controller.signal.aborted) {
        setAvailableSlots(() => {
          const slots: SlotInfo[] = data.slots || [];
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (date === todayStr) {
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            return slots.filter(s => {
              const [h, m] = s.time.split(':').map(Number);
              return h * 60 + m > nowMinutes;
            });
          }
          return slots;
        });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Error fetching slots:', err);
      setSlotsError(err instanceof Error ? err.message : 'Errore nel caricamento orari');
    } finally {
      if (!controller.signal.aborted) setSlotsLoading(false);
    }
  }, [businessId]);

  // Ricarica business hours dal DB (usato quando si apre il modal dopo aver modificato gli orari)
  const refreshBusinessHours = useCallback(async () => {
    const { data } = await supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', businessId);
    if (data) setLiveBusinessHours(data as BusinessHoursData[]);
  }, [businessId, supabase]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleNewClick = useCallback(() => {
    setModalInitialDate(selectedDate);
    setModalInitialTime(undefined);
    setAvailableSlots([]);
    refreshBusinessHours();
    setIsModalOpen(true);
  }, [selectedDate, refreshBusinessHours]);

  const handleSlotClick = useCallback((date: Date, hour: number, minutes: number) => {
    setModalInitialDate(date);
    setModalInitialTime(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    setAvailableSlots([]);
    refreshBusinessHours();
    setIsModalOpen(true);
  }, [refreshBusinessHours]);

  const handleEventClick = useCallback((event: CalendarEventData) => {
    setSelectedEvent(event);
  }, []);

  const handleStaffFilter = useCallback((staffId: string | null) => {
    setSelectedStaff(staffId);
    setShowStaffFilter(false);
  }, []);

  const handleServiceFilter = useCallback((serviceId: string | null) => {
    setSelectedServiceFilter(serviceId);
    setShowServiceFilter(false);
  }, []);

  // Filter events by selected staff AND service
  const filteredEvents = useMemo(() => events.filter(e => {
    // Staff filter
    if (selectedStaff) {
      const ext = e as CalendarEventData & { staffId?: string };
      if (ext.staffId) {
        if (ext.staffId !== selectedStaff) return false;
      } else {
        const staffMember = staffList.find(s => s.id === selectedStaff);
        if (!staffMember || e.staffName !== staffMember.full_name) return false;
      }
    }
    // Service filter
    if (selectedServiceFilter) {
      const svc = initialServices.find(s => s.id === selectedServiceFilter);
      if (svc && e.title !== svc.name) return false;
    }
    return true;
  }), [events, selectedStaff, selectedServiceFilter, staffList, initialServices]);

  // Drawer open/close with mount animation
  useEffect(() => {
    if (showDrawer) {
      setDrawerMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawerAnimated(true)));
    } else {
      setDrawerAnimated(false);
      const t = setTimeout(() => setDrawerMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [showDrawer]);

  // Next 5 upcoming events — only confirmed/pending (to be served)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => {
        const start = new Date(e.startTime);
        return start >= now && (e.status === 'confirmed' || e.status === 'pending');
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [events]);

  // ========================================================================
  // STATUS UPDATES
  // ========================================================================

  const updateEventStatus = async (eventId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'completed') updateData.completed_at = new Date().toISOString();
      if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = 'Cancellato dal gestore';
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData as never)
        .eq('id', eventId)
        .eq('business_id', businessId);

      if (error) throw error;

      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, status: newStatus as CalendarEventData['status'] } : e)
      );
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Errore nell\'aggiornamento dello stato');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ========================================================================
  // APPOINTMENT CREATION
  // ========================================================================

  const handleModalSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      // Se staffId è vuoto (nessuna preferenza), prendi il primo staff disponibile dallo slot
      let resolvedStaffId = data.staffId;
      if (!resolvedStaffId && data.time) {
        const chosenSlot = availableSlots.find(s => s.time === data.time);
        const firstAvailable = chosenSlot?.availableStaffIds?.find(id => id !== '__any__');
        if (firstAvailable) resolvedStaffId = firstAvailable;
      }

      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          staffId: resolvedStaffId || null,
          businessId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella creazione');

      // Add new event to calendar
      const selectedService = initialServices.find(s => s.id === data.serviceId);
      const selectedStaffMember = staffList.find(s => s.id === data.staffId);

      const newEvent: CalendarEventData = {
        id: result.appointment.id,
        title: result.appointment.serviceName || selectedService?.name || 'Appuntamento',
        startTime: new Date(result.appointment.startTime),
        endTime: new Date(result.appointment.endTime),
        customerName: result.appointment.customerName,
        staffName: result.appointment.staffName || selectedStaffMember?.full_name,
        staffColor: selectedStaffMember?.color || undefined,
        status: result.appointment.status || 'confirmed',
        notes: result.appointment.notes || undefined,
        includeShampoo: data.includeShampoo === true,
      };

      setEvents(prev => [...prev, newEvent]);
      setIsModalOpen(false);

      // Reset fetch cache so next navigation refetches
      lastFetchedRange.current = '';
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error instanceof Error ? error.message : 'Errore nella creazione dell\'appuntamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const selectedStaffName = useMemo(() => selectedStaff ? staffList.find(s => s.id === selectedStaff)?.full_name : null, [selectedStaff, staffList]);
  const selectedServiceName = useMemo(() => selectedServiceFilter ? initialServices.find(s => s.id === selectedServiceFilter)?.name : null, [selectedServiceFilter, initialServices]);

  const formatUpcomingDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    if (isSameDay(d, today)) return `Oggi ${time}`;
    if (isSameDay(d, tomorrow)) return `Domani ${time}`;
    const day = d.toLocaleDateString('it-IT', { weekday: 'short' });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d.getDate()} · ${time}`;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <div className="cal-outer flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 7.5rem)', overflow: 'hidden', animation: 'calC-fadeIn 0.35s ease-out both' }}>

        {/* ============================================================== */}
        {/* LEFT SIDEBAR — desktop only                                     */}
        {/* ============================================================== */}
        <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.1) transparent' }}>


          {/* Page title — same format as other pages */}
          <div className="pb-0.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendario</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Gestisci gli appuntamenti del tuo business</p>
          </div>

          {/* Nuovo appuntamento button — with ripple */}
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setBtnRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
              setTimeout(() => setBtnRipple(null), 600);
              handleNewClick();
            }}
            className="relative w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-white text-sm font-semibold overflow-hidden transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)', animation: 'calC-shimmer 2.5s ease-in-out infinite' }} />
            {btnRipple && (
              <span key={btnRipple.id} className="absolute rounded-full pointer-events-none"
                style={{
                  left: btnRipple.x, top: btnRipple.y,
                  width: 4, height: 4,
                  background: 'rgba(255,255,255,0.35)',
                  transform: 'translate(-50%,-50%)',
                  animation: 'calC-ripple 0.6s ease-out forwards',
                }}
              />
            )}
            <Plus className="w-4.5 h-4.5 relative z-10" />
            <span className="relative z-10">Nuovo appuntamento</span>
          </button>

          {/* Filtri */}
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(168,85,247,0.08)', }}
          >
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Filtri</p>
            <div className="flex gap-2">
              {/* Staff toggle — nascosto per staff senza visibilità agenda completa */}
              {(!permissions.isStaff || permissions.canSeeBusinessCalendar) && (
                <button
                  onClick={() => { setShowStaffFilter(!showStaffFilter); setShowServiceFilter(false); }}
                  className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    background: selectedStaff || showStaffFilter ? 'rgba(147,51,234,0.08)' : 'rgba(0,0,0,0.02)',
                    color: selectedStaff || showStaffFilter ? '#7c3aed' : '#6b7280',
                    border: `1px solid ${selectedStaff || showStaffFilter ? 'rgba(147,51,234,0.15)' : 'rgba(0,0,0,0.04)'}`,
                  }}
                >
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{selectedStaffName || 'Staff'}</span>
                  <ChevronDown className="w-3 h-3" style={{ transform: showStaffFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
              {/* Service toggle */}
              <button
                onClick={() => { setShowServiceFilter(!showServiceFilter); setShowStaffFilter(false); }}
                className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                style={{
                  background: selectedServiceFilter || showServiceFilter ? 'rgba(147,51,234,0.08)' : 'rgba(0,0,0,0.02)',
                  color: selectedServiceFilter || showServiceFilter ? '#7c3aed' : '#6b7280',
                  border: `1px solid ${selectedServiceFilter || showServiceFilter ? 'rgba(147,51,234,0.15)' : 'rgba(0,0,0,0.04)'}`,
                }}
              >
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{selectedServiceName || 'Servizio'}</span>
                <ChevronDown className="w-3 h-3" style={{ transform: showServiceFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>

            {/* Staff dropdown list */}
            {showStaffFilter && (
              <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => handleStaffFilter(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ background: !selectedStaff ? 'rgba(147,51,234,0.08)' : 'transparent', color: !selectedStaff ? '#7c3aed' : '#374151', transition: 'background 0.15s, color 0.15s', animation: 'calC-listItem 0.25s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0ms' }}
                  onMouseEnter={(e) => { if (selectedStaff) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { if (selectedStaff) e.currentTarget.style.background = 'transparent'; }}
                >
                  Tutti
                </button>
                {staffList.map((s, i) => (
                  <button key={s.id} onClick={() => handleStaffFilter(s.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                    style={{ background: selectedStaff === s.id ? 'rgba(147,51,234,0.08)' : 'transparent', color: selectedStaff === s.id ? '#7c3aed' : '#374151', transition: 'background 0.15s, color 0.15s', animation: 'calC-listItem 0.25s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${(i + 1) * 40}ms` }}
                    onMouseEnter={(e) => { if (selectedStaff !== s.id) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                    onMouseLeave={(e) => { if (selectedStaff !== s.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || '#9333ea' }} />
                    {s.full_name}
                  </button>
                ))}
              </div>
            )}

            {/* Service dropdown list */}
            {showServiceFilter && (
              <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => handleServiceFilter(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ background: !selectedServiceFilter ? 'rgba(147,51,234,0.08)' : 'transparent', color: !selectedServiceFilter ? '#7c3aed' : '#374151', transition: 'background 0.15s, color 0.15s', animation: 'calC-listItem 0.25s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0ms' }}
                  onMouseEnter={(e) => { if (selectedServiceFilter) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { if (selectedServiceFilter) e.currentTarget.style.background = 'transparent'; }}
                >
                  Tutti
                </button>
                {initialServices.map((s, i) => (
                  <button key={s.id} onClick={() => handleServiceFilter(s.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between"
                    style={{ background: selectedServiceFilter === s.id ? 'rgba(147,51,234,0.08)' : 'transparent', color: selectedServiceFilter === s.id ? '#7c3aed' : '#374151', transition: 'background 0.15s, color 0.15s', animation: 'calC-listItem 0.25s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${(i + 1) * 40}ms` }}
                    onMouseEnter={(e) => { if (selectedServiceFilter !== s.id) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                    onMouseLeave={(e) => { if (selectedServiceFilter !== s.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{s.duration}min</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prossimi appuntamenti — compact */}
          <div
            className="rounded-2xl p-2.5 flex-1 min-h-0 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(168,85,247,0.08)', }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prossimi</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: upcomingEvents.length > 0 ? 'rgba(147,51,234,0.08)' : 'rgba(0,0,0,0.03)', color: upcomingEvents.length > 0 ? '#7c3aed' : '#9ca3af' }}
              >
                {upcomingEvents.length}
              </span>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-1 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {upcomingEvents.map((event, i) => {
                  const statusColor = event.status === 'confirmed' ? '#10b981' : event.status === 'pending' ? '#f59e0b' : event.status === 'cancelled' ? '#ef4444' : event.status === 'no_show' ? '#8b5cf6' : '#6b7280';
                  return (
                    <div key={event.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150"
                      style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.03)', animation: 'calC-listItem 0.2s ease-out both', animationDelay: `${i * 40}ms`, transition: 'all 0.18s ease' }}
                      onClick={() => handleEventClick(event)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(147,51,234,0.05)'; e.currentTarget.style.borderColor = 'rgba(147,51,234,0.15)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Status color bar */}
                      <div className="w-0.5 h-7 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-900 truncate">{event.title}</p>
                        <p className="text-[9px] text-gray-400 truncate">
                          {event.customerName}{event.staffName ? ` · ${event.staffName}` : ''}
                        </p>
                      </div>
                      <p className="text-[9px] font-semibold flex-shrink-0" style={{ color: '#7c3aed' }}>
                        {formatUpcomingDate(new Date(event.startTime))}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <div className="w-8 h-8 rounded-full mb-1.5 flex items-center justify-center" style={{ background: 'rgba(147,51,234,0.06)' }}>
                  <CalendarIcon className="w-3.5 h-3.5" style={{ color: '#c4b5fd' }} />
                </div>
                <p className="text-[10px] text-gray-400">Nessun prossimo</p>
              </div>
            )}
          </div>

          {/* Stats mini — compact */}
          <div
            className="rounded-2xl p-2"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(168,85,247,0.08)', }}
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Statistiche</p>
            <div className="grid grid-cols-4 gap-1">
              <div className="text-center py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.015)' }}>
                <p className="text-sm font-bold text-gray-900">{events.length}</p>
                <p className="text-[8px] text-gray-400">Totali</p>
              </div>
              <div className="text-center py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.015)' }}>
                <p className="text-sm font-bold" style={{ color: '#6d28d9' }}>{events.filter(e => e.status === 'confirmed').length}</p>
                <p className="text-[8px] text-gray-400">Confermati</p>
              </div>
              <div className="text-center py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.015)' }}>
                <p className="text-sm font-bold" style={{ color: '#047857' }}>{events.filter(e => e.status === 'completed').length}</p>
                <p className="text-[8px] text-gray-400">Completati</p>
              </div>
              <div className="text-center py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.015)' }}>
                <p className="text-sm font-bold" style={{ color: '#4b5563' }}>{events.filter(e => e.status === 'no_show').length}</p>
                <p className="text-[8px] text-gray-400">No-show</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT - CALENDAR (full remaining space)                         */}
        {/* ============================================================== */}
        <div className="cal-right flex-1 min-w-0 min-h-0 flex flex-col">
          <Calendar
            view={view}
            onViewChange={setView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
            businessHours={liveBusinessHours}
            closures={closures}
            className="flex-1 min-h-0"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM DRAWER                                            */}
      {/* ============================================================== */}

      {/* ── Portal: Drawer + FABs (escape transform stacking context) ────── */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Drawer backdrop */}
          {drawerMounted && (
            <div
              className="fixed inset-0 lg:hidden"
              style={{
                zIndex: 48,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                opacity: drawerAnimated ? 1 : 0,
                transition: 'opacity 0.25s ease',
              }}
              onClick={() => setShowDrawer(false)}
            />
          )}

          {/* Drawer panel */}
          {drawerMounted && (
            <div
              className="fixed left-0 right-0 lg:hidden flex flex-col"
              style={{
                zIndex: 49,
                bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
                maxHeight: 'calc(100dvh - 56px - 60px - 2rem)',
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px 20px 0 0',
                borderTop: '1px solid rgba(168,85,247,0.35)',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.12), 0 -2px 0 rgba(168,85,247,0.2), 0 0 60px rgba(147,51,234,0.1)',
                transform: drawerAnimated ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
              </div>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
                <h2 className="text-base font-bold text-gray-900">Calendario</h2>
                <button onClick={() => setShowDrawer(false)} className="p-1.5 rounded-xl" style={{ color: 'rgba(0,0,0,0.35)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Drawer scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" style={{ scrollbarWidth: 'none' }}>

                {/* Filtri */}
          <div className="rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(168,85,247,0.08)' }}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Filtri</p>
            <div className="flex gap-2">
              {(!permissions.isStaff || permissions.canSeeBusinessCalendar) && (
                <button
                  onClick={() => { setShowStaffFilter(!showStaffFilter); setShowServiceFilter(false); }}
                  className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{ background: selectedStaff || showStaffFilter ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.8)', color: selectedStaff || showStaffFilter ? '#7c3aed' : '#6b7280', border: `1px solid ${selectedStaff || showStaffFilter ? 'rgba(147,51,234,0.15)' : 'rgba(0,0,0,0.06)'}` }}
                >
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{selectedStaffName || 'Staff'}</span>
                  <ChevronDown className="w-3 h-3" style={{ transform: showStaffFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
              <button
                onClick={() => { setShowServiceFilter(!showServiceFilter); setShowStaffFilter(false); }}
                className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                style={{ background: selectedServiceFilter || showServiceFilter ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.8)', color: selectedServiceFilter || showServiceFilter ? '#7c3aed' : '#6b7280', border: `1px solid ${selectedServiceFilter || showServiceFilter ? 'rgba(147,51,234,0.15)' : 'rgba(0,0,0,0.06)'}` }}
              >
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{selectedServiceName || 'Servizio'}</span>
                <ChevronDown className="w-3 h-3" style={{ transform: showServiceFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>
            {showStaffFilter && (
              <div className="mt-2 space-y-0.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => handleStaffFilter(null)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium" style={{ background: !selectedStaff ? 'rgba(147,51,234,0.08)' : 'transparent', color: !selectedStaff ? '#7c3aed' : '#374151' }}>Tutti</button>
                {staffList.map(s => (
                  <button key={s.id} onClick={() => handleStaffFilter(s.id)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2" style={{ background: selectedStaff === s.id ? 'rgba(147,51,234,0.08)' : 'transparent', color: selectedStaff === s.id ? '#7c3aed' : '#374151' }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || '#9333ea' }} />{s.full_name}
                  </button>
                ))}
              </div>
            )}
            {showServiceFilter && (
              <div className="mt-2 space-y-0.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => handleServiceFilter(null)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium" style={{ background: !selectedServiceFilter ? 'rgba(147,51,234,0.08)' : 'transparent', color: !selectedServiceFilter ? '#7c3aed' : '#374151' }}>Tutti</button>
                {initialServices.map(s => (
                  <button key={s.id} onClick={() => handleServiceFilter(s.id)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between" style={{ background: selectedServiceFilter === s.id ? 'rgba(147,51,234,0.08)' : 'transparent', color: selectedServiceFilter === s.id ? '#7c3aed' : '#374151' }}>
                    <span className="truncate">{s.name}</span><span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{s.duration}min</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prossimi appuntamenti */}
          <div className="rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(168,85,247,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prossimi</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: upcomingEvents.length > 0 ? 'rgba(147,51,234,0.08)' : 'rgba(0,0,0,0.03)', color: upcomingEvents.length > 0 ? '#7c3aed' : '#9ca3af' }}>{upcomingEvents.length}</span>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-1">
                {upcomingEvents.map((event, i) => {
                  const statusColor = event.status === 'confirmed' ? '#10b981' : event.status === 'pending' ? '#f59e0b' : event.status === 'cancelled' ? '#ef4444' : '#6b7280';
                  return (
                    <div key={event.id} className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.04)', animation: `calC-listItem 0.2s ease-out ${i * 40}ms both` }}
                      onClick={() => { setShowDrawer(false); handleEventClick(event); }}>
                      <div className="w-0.5 h-7 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-900 truncate">{event.title}</p>
                        <p className="text-[9px] text-gray-400 truncate">{event.customerName}{event.staffName ? ` · ${event.staffName}` : ''}</p>
                      </div>
                      <p className="text-[9px] font-semibold flex-shrink-0" style={{ color: '#7c3aed' }}>{formatUpcomingDate(new Date(event.startTime))}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <CalendarIcon className="w-5 h-5 mb-1" style={{ color: '#c4b5fd' }} />
                <p className="text-[10px] text-gray-400">Nessun prossimo appuntamento</p>
              </div>
            )}
          </div>

          {/* Statistiche */}
          <div className="rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(168,85,247,0.08)' }}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Statistiche</p>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <p className="text-sm font-bold text-gray-900">{events.length}</p>
                <p className="text-[9px] text-gray-400">Totali</p>
              </div>
              <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <p className="text-sm font-bold" style={{ color: '#6d28d9' }}>{events.filter(e => e.status === 'confirmed').length}</p>
                <p className="text-[9px] text-gray-400">Confermati</p>
              </div>
              <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <p className="text-sm font-bold" style={{ color: '#047857' }}>{events.filter(e => e.status === 'completed').length}</p>
                <p className="text-[9px] text-gray-400">Completati</p>
              </div>
              <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <p className="text-sm font-bold" style={{ color: '#4b5563' }}>{events.filter(e => e.status === 'no_show').length}</p>
                <p className="text-[9px] text-gray-400">No-show</p>
              </div>
            </div>
          </div>

              </div>
            </div>
          )}

          {/* FABs */}
          <div
            className="fixed lg:hidden flex flex-col items-center gap-2.5"
            style={{ zIndex: 50, bottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 10px)', right: 16 }}
          >
            {/* Drawer toggle — pill with icon */}
            <button
              onClick={() => setShowDrawer(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: 14,
                background: showDrawer
                  ? 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(168,85,247,0.1))'
                  : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: showDrawer ? '1.5px solid rgba(168,85,247,0.4)' : '1.5px solid rgba(168,85,247,0.2)',
                boxShadow: showDrawer
                  ? '0 4px 16px rgba(147,51,234,0.25), 0 0 0 3px rgba(168,85,247,0.08)'
                  : '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
                color: '#7c3aed',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {showDrawer
                ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              }
            </button>
            {/* New appointment FAB */}
            <button
              onClick={handleNewClick}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                boxShadow: '0 6px 20px rgba(147,51,234,0.45), 0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Plus style={{ width: 22, height: 22, color: '#fff', strokeWidth: 2.5 }} />
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Event detail modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onComplete={(id) => updateEventStatus(id, 'completed')}
        onNoShow={(id) => updateEventStatus(id, 'no_show')}
        onCancel={(id) => updateEventStatus(id, 'cancelled')}
        isLoading={isUpdatingStatus}
      />

      {/* Appointment modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customers={[]}
        onCustomerSearch={handleCustomerSearch}
        services={modalServices}
        staff={modalStaff}
        staffServices={staffServicesMap}
        businessHours={businessHours}
        closures={closures}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
        isLoading={isSubmitting}
        availableSlots={availableSlots}
        slotsLoading={slotsLoading}
        slotsError={slotsError || undefined}
        onSlotsNeeded={fetchAvailableSlots}
        lockedStaffId={permissions.isStaff && !permissions.canManageTeamBookings ? (permissions.currentStaffId ?? undefined) : undefined}
        allowedStaffIds={permissions.isStaff && permissions.canManageTeamBookings && permissions.teamBookingStaffIds.length > 0 ? permissions.teamBookingStaffIds : undefined}
        labels={{
          title: 'Nuovo Appuntamento',
          customer: 'Cliente',
          service: 'Servizio',
          staff: 'Operatore',
          newCustomer: 'Nuovo cliente',
          searchCustomer: 'Cerca cliente per nome o telefono...',
          submit: 'Crea appuntamento',
        }}
        shampooPrice={shampooPrice}
      />

      <style>{`
        @keyframes calC-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes calC-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes calC-dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes calC-ripple { 0% { width: 4px; height: 4px; opacity: 0.5; } 100% { width: 300px; height: 300px; opacity: 0; } }
        @keyframes calC-listItem { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 1023px) {
          /* Full-bleed: cancel p-4 from dashboard wrapper */
          .cal-outer {
            margin: -1rem -1rem 0 -1rem;
            width: calc(100% + 2rem);
            height: calc(100dvh - 56px - 60px) !important;
          }
          .cal-right {
            gap: 0;
          }
          /* Remove border/radius from calendar on mobile */
          .cal-right > * {
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}