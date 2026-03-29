// ============================================================================
// AEGIS BEAUTY - DASHBOARD OVERVIEW CONTENT (Perfected v4)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/OverviewContent.tsx
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OverviewPage, AppointmentModal, ServiceModal } from '@aegis/ui';
import type {
  AppointmentFormData,
  Customer as ModalCustomer,
  Service as ModalService,
  Staff as ModalStaff,
  StaffServicesMap,
  BusinessHoursData,
  ClosureData,
  SlotInfo,
  ServiceFormData,
  ServiceModalCategory,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import { useStaffPermissions } from '@/lib/staff-permissions-context';
import {
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  UserCheck,
  AlertCircle,
  Clock,
  Plus,
  BarChart3,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Stats {
  appointmentsToday: number;
  appointmentsWeek: number;
  totalCustomers: number;
  totalServices: number;
  totalStaff: number;
  incompleteStaff: number;
}

export interface TodayAppointment {
  id: string;
  time: string;
  endTime: string;
  customerName: string;
  staffName: string;
  staffColor: string;
  serviceName: string;
  status: string;
}

interface CustomerProp {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface ServiceProp {
  id: string;
  name: string;
  duration: number;
  price: number;
  categoryId?: string;
  categoryName?: string;
}

interface StaffProp {
  id: string;
  full_name: string;
  color: string | null;
}

interface StaffServiceProp {
  staff_id: string;
  service_id: string;
}

interface BHProp {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

interface ClosureProp {
  date: string;
  reason: string;
}

interface OverviewContentProps {
  stats: Stats;
  roiData: unknown;
  businessName: string;
  businessSlug?: string;
  businessType?: string;
  todayAppointments?: TodayAppointment[];
  allTodayAppointments?: TodayAppointment[];
  businessStats?: { appointmentsToday: number; appointmentsWeek: number };
  businessId: string;
  customers: CustomerProp[];
  services: ServiceProp[];
  staff: StaffProp[];
  staffServices: StaffServiceProp[];
  businessHours: BHProp[];
  closures: ClosureProp[];
  categories: ServiceModalCategory[];
}

// ============================================================================
// HELPERS
// ============================================================================

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getBusinessLabel(type?: string): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    default: return 'attività';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OverviewContent({
  stats, businessName, businessSlug, businessType, todayAppointments = [],
  allTodayAppointments = [], businessStats,
  businessId, customers, services, staff, staffServices, businessHours,
  closures, categories,
}: OverviewContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const permissions = useStaffPermissions();
  const [activeApptTab, setActiveApptTab] = useState<'mine' | 'team'>('mine');

  const operativeStaff = stats.totalStaff - stats.incompleteStaff;

  // ── Build modal-ready data ────────────────────────────────────────────────
  const staffServicesMap: StaffServicesMap = {};
  staffServices.forEach(ss => {
    if (!staffServicesMap[ss.staff_id]) staffServicesMap[ss.staff_id] = [];
    staffServicesMap[ss.staff_id].push(ss.service_id);
  });

  const modalCustomers: ModalCustomer[] = customers.map(c => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone || undefined,
    email: c.email || undefined,
  }));

  const modalServices: ModalService[] = services.map(s => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: s.price,
    categoryId: s.categoryId,
    categoryName: s.categoryName,
  }));

  const modalStaff: ModalStaff[] = staff.map(s => ({
    id: s.id,
    name: s.full_name,
    color: s.color || undefined,
  }));

  const modalBusinessHours: BusinessHoursData[] = businessHours.map(bh => ({
    day_of_week: bh.day_of_week,
    is_open: bh.is_open,
    open_time_1: bh.open_time_1,
    close_time_1: bh.close_time_1,
    open_time_2: bh.open_time_2,
    close_time_2: bh.close_time_2,
  }));

  const modalClosures: ClosureData[] = closures.map(c => ({
    date: c.date,
    reason: c.reason,
  }));

  // ── Appointment Modal ─────────────────────────────────────────────────────
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Identical to CalendarioContent.fetchAvailableSlots
  const fetchAvailableSlots = useCallback(async (
    date: string,
    serviceId: string,
    staffId?: string | null,
  ) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setAvailableSlots([]);
    try {
      const params = new URLSearchParams({ date, serviceId, businessId });
      if (staffId) params.set('staffId', staffId);
      const response = await fetch(`/api/availability?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Errore nel caricamento');
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
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : 'Errore nel caricamento orari');
    } finally {
      setSlotsLoading(false);
    }
  }, [businessId]);

  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    setIsSubmittingAppt(true);
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, businessId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella creazione');
      setIsApptModalOpen(false);
      setAvailableSlots([]);
      router.refresh();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error instanceof Error ? error.message : 'Errore nella creazione dell\'appuntamento');
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  // ── Service Modal ─────────────────────────────────────────────────────────
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceError, setServiceError] = useState('');

  const handleServiceSubmit = async (data: ServiceFormData) => {
    setServiceError('');
    try {
      const { error: insertError } = await supabase
        .from('services')
        .insert({
          business_id: businessId,
          name: data.name,
          description: data.description || null,
          duration_minutes: data.duration,
          price: data.price,
          category_id: data.categoryId || null,
          is_active: data.isActive,
          display_order: 0,
        } as never);
      if (insertError) throw insertError;
      setIsServiceModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error creating service:', err);
      setServiceError('Errore durante il salvataggio del servizio.');
      throw err;
    }
  };

  // KPI cards — staff vede solo i propri appuntamenti, senza clienti/servizi/team
  const statCards = permissions.isStaff
    ? permissions.canSeeBusinessCalendar
      ? [
          {
            title: 'I miei oggi',
            value: stats.appointmentsToday,
            icon: Calendar,
            gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            iconColor: '#9333ea',
          },
          {
            title: 'I miei questa settimana',
            value: stats.appointmentsWeek,
            icon: CalendarDays,
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            iconColor: '#3b82f6',
          },
          {
            title: 'Team oggi',
            value: businessStats?.appointmentsToday ?? 0,
            icon: Users,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            iconColor: '#10b981',
          },
          {
            title: 'Team questa settimana',
            value: businessStats?.appointmentsWeek ?? 0,
            icon: BarChart3,
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            iconColor: '#f59e0b',
          },
        ]
      : [
          {
            title: 'Miei appuntamenti oggi',
            value: stats.appointmentsToday,
            icon: Calendar,
            gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            iconColor: '#9333ea',
          },
          {
            title: 'Questa settimana',
            value: stats.appointmentsWeek,
            icon: CalendarDays,
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            iconColor: '#3b82f6',
          },
        ]
    : [
        {
          title: 'Appuntamenti oggi',
          value: stats.appointmentsToday,
          icon: Calendar,
          gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)',
          iconColor: '#9333ea',
        },
        {
          title: 'Questa settimana',
          value: stats.appointmentsWeek,
          icon: CalendarDays,
          gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          iconColor: '#3b82f6',
        },
        {
          title: 'Clienti totali',
          value: stats.totalCustomers,
          icon: Users,
          gradient: 'linear-gradient(135deg, #10b981, #059669)',
          iconColor: '#10b981',
        },
        {
          title: 'Servizi attivi',
          value: stats.totalServices,
          icon: Scissors,
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          iconColor: '#f59e0b',
        },
      ];

  // Conta da mostrare nel subtitle della sezione Oggi
  const todayCount = permissions.isStaff && permissions.canSeeBusinessCalendar
    ? (activeApptTab === 'mine' ? stats.appointmentsToday : (businessStats?.appointmentsToday ?? 0))
    : stats.appointmentsToday;

  const todayApptList = permissions.isStaff && permissions.canSeeBusinessCalendar && activeApptTab === 'team'
    ? allTodayAppointments
    : todayAppointments;

  // Sezioni — staff non vede "Il tuo team"
  const sections = [
    {
      title: permissions.isStaff && permissions.canSeeBusinessCalendar
        ? (activeApptTab === 'mine' ? 'I miei appuntamenti' : 'Appuntamenti team')
        : permissions.isStaff ? 'I miei appuntamenti oggi' : 'Oggi',
      subtitle: `${todayCount} appuntament${todayCount === 1 ? 'o' : 'i'}`,
      icon: Clock,
      iconColor: '#9333ea',
      iconBg: 'rgba(168,85,247,0.06)',
      linkLabel: '',
      onLinkClick: () => {},
      linkColor: '#9333ea',
      children: (
        <>
          {/* Tab switcher — solo staff con canSeeBusinessCalendar */}
          {permissions.isStaff && permissions.canSeeBusinessCalendar && (
            <div className="flex gap-1 mb-4 p-1 rounded-2xl w-fit" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.1)' }}>
              {(['mine', 'team'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveApptTab(tab)}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: activeApptTab === tab ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                    color: activeApptTab === tab ? '#fff' : '#9333ea',
                    boxShadow: activeApptTab === tab ? '0 2px 8px rgba(147,51,234,0.3)' : 'none',
                  }}
                >
                  {tab === 'mine' ? 'I miei' : 'Team'}
                </button>
              ))}
            </div>
          )}
          {/* Lista appuntamenti */}
          {todayApptList.length === 0 ? (
            <EmptyTodaySection onAdd={() => router.push('/dashboard/calendario')} />
          ) : (
            <TodayTimelineSection appointments={todayApptList} onView={() => router.push('/dashboard/calendario')} />
          )}
        </>
      ),
    },
    ...(!permissions.isStaff ? [{
      title: 'Il tuo team',
      subtitle: `${stats.totalStaff} membr${stats.totalStaff === 1 ? 'o' : 'i'} totali`,
      icon: UserCheck,
      iconColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.06)',
      linkLabel: 'Gestisci staff',
      onLinkClick: () => router.push('/dashboard/staff'),
      linkColor: '#10b981',
      children: stats.totalStaff === 0 ? (
        <EmptyTeamSection onAdd={() => router.push('/dashboard/staff')} />
      ) : (
        <TeamStatusSection
          operative={operativeStaff}
          incomplete={stats.incompleteStaff}
          total={stats.totalStaff}
          onManage={() => router.push('/dashboard/staff')}
        />
      ),
    }] : []),
  ];

  // Quick actions — staff non può aggiungere servizi
  const quickActions = permissions.isStaff
    ? [
        {
          label: 'Nuovo appuntamento',
          description: 'Apri il form di prenotazione',
          icon: Plus,
          onClick: () => { setAvailableSlots([]); setIsApptModalOpen(true); },
        },
        {
          label: 'Vedi statistiche',
          description: 'Le mie performance',
          icon: BarChart3,
          onClick: () => router.push('/dashboard/statistiche'),
        },
      ]
    : [
        {
          label: 'Nuovo appuntamento',
          description: 'Apri il form di prenotazione',
          icon: Plus,
          onClick: () => { setAvailableSlots([]); setIsApptModalOpen(true); },
        },
        {
          label: 'Aggiungi servizio',
          description: 'Crea un nuovo servizio',
          icon: Scissors,
          onClick: () => { setServiceError(''); setIsServiceModalOpen(true); },
        },
        {
          label: 'Vedi statistiche',
          description: 'Analisi e performance',
          icon: BarChart3,
          onClick: () => router.push('/dashboard/statistiche'),
        },
      ];

  return (
    <>
      <OverviewPage
        greeting={getGreeting()}
        businessName={businessName}
        dateString={getFormattedDate()}
        stats={statCards}
        sections={sections}
        quickActions={quickActions}
        businessSlug={businessSlug}
        qrTitle={`QR Code del tuo ${getBusinessLabel(businessType)}`}
      />

      {/* Full AppointmentModal — same as CalendarioContent */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => { setIsApptModalOpen(false); setAvailableSlots([]); }}
        onSubmit={handleAppointmentSubmit}
        customers={modalCustomers}
        services={modalServices}
        staff={modalStaff}
        staffServices={staffServicesMap}
        businessHours={modalBusinessHours}
        closures={modalClosures}
        isLoading={isSubmittingAppt}
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
      />

      {/* ServiceModal — same as ServiziContent */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleServiceSubmit}
        categories={categories}
        initialData={null}
        error={serviceError}
      />
    </>
  );
}

// ============================================================================
// SECTION CONTENT COMPONENTS (Beauty-specific)
// ============================================================================

function EmptyTodaySection({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(168,85,247,0.05)' }}
      >
        <Calendar className="w-7 h-7" style={{ color: '#c084fc' }} />
      </div>
      <p className="text-sm font-medium text-gray-500">Nessun appuntamento per oggi</p>
      <p className="text-xs text-gray-400 mt-1">Goditi la giornata libera o aggiungi un appuntamento</p>
      <button
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white"
        style={{
          background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
          boxShadow: '0 2px 8px rgba(147,51,234,0.25)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={onAdd}
      >
        <Calendar className="w-4 h-4" />
        Vedi calendario
      </button>
    </div>
  );
}

function getStatusBadge(status: string): { label: string; bg: string; color: string } {
  switch (status) {
    case 'confirmed': return { label: 'Conf.', bg: 'rgba(16,185,129,0.1)', color: '#059669' };
    case 'pending': return { label: 'In att.', bg: 'rgba(245,158,11,0.1)', color: '#d97706' };
    case 'completed': return { label: 'Comp.', bg: 'rgba(59,130,246,0.1)', color: '#2563eb' };
    default: return { label: 'N/D', bg: 'rgba(156,163,175,0.1)', color: '#6b7280' };
  }
}

function TodayTimelineSection({ appointments, onView }: { appointments: TodayAppointment[]; onView: () => void }) {
  const maxVisible = 5;
  const visible = appointments.slice(0, maxVisible);
  const remaining = appointments.length - maxVisible;

  return (
    <div>
      <div className="space-y-1.5">
        {visible.map((apt, i) => {
          const badge = getStatusBadge(apt.status);
          return (
            <div
              key={apt.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.015)',
                border: '1px solid rgba(0,0,0,0.03)',
                animation: `ov-card-in 0.3s ease-out ${0.05 * i}s both`,
                transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(147,51,234,0.05)';
                e.currentTarget.style.borderColor = 'rgba(147,51,234,0.15)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.015)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="w-12 flex-shrink-0 text-center">
                <p className="text-[11px] font-bold text-gray-900 leading-none">{apt.time}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-none">{apt.endTime}</p>
              </div>
              <div
                className="w-0.5 h-7 rounded-full flex-shrink-0"
                style={{ background: apt.staffColor, opacity: 0.85 }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{apt.serviceName}</p>
                <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {apt.customerName}
                  {apt.staffName && <span className="text-gray-300"> · {apt.staffName}</span>}
                </p>
              </div>
              <div
                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0"
                style={{ background: badge.bg, color: badge.color }}
              >
                {badge.label}
              </div>
            </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          + altri {remaining} appuntament{remaining === 1 ? 'o' : 'i'}
        </p>
      )}

      <div className="flex justify-center mt-4">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
          style={{
            color: '#9333ea',
            background: 'rgba(168,85,247,0.06)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
          onClick={onView}
        >
          Apri calendario
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyTeamSection({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-gray-500">Nessun membro nello staff</p>
      <p className="text-xs text-gray-400 mt-1">Aggiungi il tuo team per gestire gli appuntamenti</p>
      <button
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white"
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
        Aggiungi staff
      </button>
    </div>
  );
}

function TeamStatusSection({ operative, incomplete, total, onManage }: {
  operative: number;
  incomplete: number;
  total: number;
  onManage: () => void;
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{operative}</div>
          <p className="text-xs text-gray-400 mt-1">operativ{operative === 1 ? 'o' : 'i'}</p>
        </div>
        {incomplete > 0 && (
          <>
            <div className="w-px h-12" style={{ background: 'rgba(0,0,0,0.06)' }} />
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-500">{incomplete}</div>
              <p className="text-xs text-gray-400 mt-1">da completare</p>
            </div>
          </>
        )}
        <div className="w-px h-12" style={{ background: 'rgba(0,0,0,0.06)' }} />
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{total}</div>
          <p className="text-xs text-gray-400 mt-1">totali</p>
        </div>
      </div>
      {incomplete > 0 && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.12)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
          onClick={onManage}
        >
          <div className="relative flex-shrink-0 w-4 h-4">
            <AlertCircle className="w-4 h-4 text-amber-500 relative z-10" />
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(245,158,11,0.25)', animationDuration: '2s' }} />
          </div>
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{incomplete} membr{incomplete === 1 ? 'o' : 'i'}</span> con profilo incompleto — completa i dati per attivarli
          </p>
        </div>
      )}
    </div>
  );
}
