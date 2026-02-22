// ============================================================================
// AEGIS BEAUTY - DASHBOARD OVERVIEW CONTENT (Perfected v2)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/OverviewContent.tsx
// Imports OverviewPage from @aegis/ui, configures for Beauty.
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { OverviewPage } from '@aegis/ui';
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

interface OverviewContentProps {
  stats: Stats;
  roiData: unknown;
  businessName: string;
  businessSlug?: string;
  businessType?: string;
  todayAppointments?: TodayAppointment[];
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

// ============================================================================
// COMPONENT
// ============================================================================

function getBusinessLabel(type?: string): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    default: return 'attività';
  }
}

export function OverviewContent({ stats, businessName, businessSlug, businessType, todayAppointments = [] }: OverviewContentProps) {
  const router = useRouter();

  const operativeStaff = stats.totalStaff - stats.incompleteStaff;

  return (
    <OverviewPage
      greeting={getGreeting()}
      businessName={businessName}
      dateString={getFormattedDate()}
      stats={[
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
      ]}
      sections={[
        // === TODAY ===
        {
          title: 'Oggi',
          subtitle: `${stats.appointmentsToday} appuntament${stats.appointmentsToday === 1 ? 'o' : 'i'}`,
          icon: Clock,
          iconColor: '#9333ea',
          iconBg: 'rgba(168,85,247,0.06)',
          linkLabel: '',
          onLinkClick: () => {},
          linkColor: '#9333ea',
          children: todayAppointments.length === 0 ? (
            <EmptyTodaySection onAdd={() => router.push('/dashboard/calendario')} />
          ) : (
            <TodayTimelineSection appointments={todayAppointments} onView={() => router.push('/dashboard/calendario')} />
          ),
        },
        // === TEAM ===
        {
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
        },
      ]}
      quickActions={[
        {
          label: 'Nuovo appuntamento',
          description: 'Apri il form di prenotazione',
          icon: Plus,
          onClick: () => router.push('/dashboard/calendario?new=true'),
        },
        {
          label: 'Aggiungi servizio',
          description: 'Crea un nuovo servizio',
          icon: Scissors,
          onClick: () => router.push('/dashboard/servizi?new=true'),
        },
        {
          label: 'Vedi statistiche',
          description: 'Analisi e performance',
          icon: BarChart3,
          onClick: () => router.push('/dashboard/statistiche'),
        },
      ]}
      businessSlug={businessSlug}
      qrTitle={`QR Code del tuo ${getBusinessLabel(businessType)}`}
    />
  );
}

// ============================================================================
// SECTION CONTENT COMPONENTS (Beauty-specific)
// ============================================================================

function EmptyTodaySection({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-10">
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

function TodayTimelineSection({ appointments, onView }: { appointments: TodayAppointment[]; onView: () => void }) {
  const maxVisible = 5;
  const visible = appointments.slice(0, maxVisible);
  const remaining = appointments.length - maxVisible;

  return (
    <div>
      <div className="space-y-2">
        {visible.map((apt, i) => (
          <div
            key={apt.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.015)',
              border: '1px solid rgba(0,0,0,0.03)',
              animation: `ov-card-in 0.3s ease-out ${0.05 * i}s both`,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168,85,247,0.04)';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.08)';
              const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement;
              if (bar) { bar.style.width = '3px'; bar.style.opacity = '1'; }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.015)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
              const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement;
              if (bar) { bar.style.width = '2px'; bar.style.opacity = '0.85'; }
            }}
          >
            {/* Time */}
            <div className="w-14 text-center flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">{apt.time}</p>
              <p className="text-[10px] text-gray-400">{apt.endTime}</p>
            </div>

            {/* Color bar */}
            <div
              data-bar=""
              className="h-10 rounded-full flex-shrink-0"
              style={{ background: apt.staffColor, width: 2, opacity: 0.85, transition: 'width 0.2s ease, opacity 0.2s ease' }}
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{apt.serviceName}</p>
              <p className="text-xs text-gray-400 truncate">
                {apt.customerName}
                {apt.staffName && <span> · {apt.staffName}</span>}
              </p>
            </div>

            {/* Status dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: apt.status === 'confirmed' ? '#10b981' : apt.status === 'pending' ? '#f59e0b' : '#9333ea',
              }}
            />
          </div>
        ))}
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
            transition: 'background 0.15s ease, border-color 0.15s ease',
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
      {/* Staff counts */}
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

      {/* Warning for incomplete staff */}
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