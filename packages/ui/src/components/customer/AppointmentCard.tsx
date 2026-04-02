// ============================================================================
// AEGIS SUITE - APPOINTMENT CARD (Customer Interface, multi-vertical)
// File: packages/ui/src/components/customer/AppointmentCard.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, User, X, RefreshCw } from 'lucide-react';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// TYPES
// ============================================================================

// Minimal shape needed (subset of AppointmentDetailed)
export interface AppointmentCardData {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number | null;
  // Nested from DB join
  customers?: { full_name: string } | null;
  staff?: { full_name: string; nickname: string | null } | null;
  appointment_services?: Array<{ service_name: string }>;
}

export interface AppointmentCardProps {
  appointment: AppointmentCardData;
  theme: DashboardTheme;
  onCancel?: (appointmentId: string) => void;
  onRebook?: (appointment: AppointmentCardData) => void;
  index?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:   { label: 'Confermato',  bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  pending:     { label: 'In attesa',   bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
  completed:   { label: 'Completato',  bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  in_progress: { label: 'In corso',    bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  no_show:     { label: 'Non venuto',  bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  cancelled:   { label: 'Cancellato', bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
};

const ITALIAN_MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const ITALIAN_DAYS   = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return {
    dayName:  ITALIAN_DAYS[d.getDay()],
    day:      d.getDate(),
    month:    ITALIAN_MONTHS[d.getMonth()],
    time:     d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    isFuture: d > new Date(),
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppointmentCard({ appointment, theme, onCancel, onRebook, index = 0 }: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const date    = formatDate(appointment.start_time);
  const status  = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.pending;
  const service = appointment.appointment_services?.[0]?.service_name ?? 'Appuntamento';
  const staffName = appointment.staff?.nickname ?? appointment.staff?.full_name ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Colored left accent strip */}
      <div className={theme.sidebar.background} style={{ width: 5, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', gap: 12 }}>

        {/* Date block */}
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 44 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
            {date.day}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>
            {date.month}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 4 }}>
            {date.time}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              {service}
            </h4>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                background: status.bg,
                color: status.color,
                flexShrink: 0,
              }}
            >
              {status.label}
            </span>
          </div>

          {staffName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <User style={{ width: 12, height: 12, color: '#9ca3af' }} />
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>con {staffName}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarDays style={{ width: 12, height: 12, color: '#9ca3af' }} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{date.dayName}</span>
            <Clock style={{ width: 12, height: 12, color: '#9ca3af', marginLeft: 4 }} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{date.time}</span>
          </div>

          {/* Actions */}
          {(onCancel && date.isFuture) || onRebook ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {onCancel && date.isFuture && appointment.status !== 'cancelled' && (
                <>
                  {!showConfirm ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                    >
                      <X style={{ width: 12, height: 12 }} />
                      Disdici
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { onCancel(appointment.id); setShowConfirm(false); }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                        style={{ background: '#dc2626', border: 'none', cursor: 'pointer' }}
                      >
                        Conferma
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.06)', color: '#6b7280', border: 'none', cursor: 'pointer' }}
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </>
              )}

              {onRebook && !date.isFuture && (
                <button
                  onClick={() => onRebook(appointment)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${theme.header.accentColor}`}
                  style={{ background: 'rgba(168,85,247,0.08)', border: 'none', cursor: 'pointer' }}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  Prenota di nuovo
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
