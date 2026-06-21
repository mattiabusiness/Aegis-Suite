// ============================================================================
// AEGIS SUITE - APPOINTMENT CARD (Customer Interface, multi-vertical)
// File: packages/ui/src/components/customer/AppointmentCard.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, X, RefreshCw, Calendar } from 'lucide-react';
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
  appointment_services?: Array<{ service_id?: string | null; service_name: string; price?: number | null }>;
}

export interface AppointmentCardProps {
  appointment:   AppointmentCardData;
  theme:         DashboardTheme;
  businessName?: string;
  onCancel?:     (appointmentId: string) => void;
  onRebook?:     (appointment: AppointmentCardData) => void;
  onReschedule?: (appointment: AppointmentCardData) => void;
  index?:        number;
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

export function AppointmentCard({ appointment, theme, businessName, onCancel, onRebook, onReschedule, index = 0 }: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const date      = formatDate(appointment.start_time);
  const status    = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.pending;
  const service   = appointment.appointment_services?.[0]?.service_name ?? 'Appuntamento';
  const staffName = appointment.staff?.nickname ?? appointment.staff?.full_name ?? '';
  const price     = appointment.total_price ?? appointment.appointment_services?.[0]?.price ?? null;
  const isPast    = !date.isFuture;

  // Link a Google Calendar (nativo, evento preimpostato) — niente file .ics.
  const gcalUrl = (() => {
    const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const text = encodeURIComponent(businessName ? `${service} — ${businessName}` : service);
    const details = encodeURIComponent(staffName ? `con ${staffName}` : '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${stamp(appointment.start_time)}/${stamp(appointment.end_time)}&details=${details}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: isPast ? '0 6px 20px rgba(0,0,0,0.06)' : '0 8px 28px rgba(124,58,237,0.1), 0 2px 8px rgba(0,0,0,0.04)' }}
      style={{
        background: isPast ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: isPast ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(168,85,247,0.1)',
        boxShadow: isPast ? '0 1px 4px rgba(0,0,0,0.03)' : '0 2px 12px rgba(124,58,237,0.06)',
        overflow: 'hidden',
        display: 'flex',
        opacity: isPast ? 0.85 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Colored left accent strip */}
      <div
        className={theme.sidebar.background}
        style={{ width: 4, flexShrink: 0, opacity: isPast ? 0.45 : 1 }}
      />

      {/* Content */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', gap: 14 }}>

        {/* Date block */}
        <div style={{
          flexShrink: 0, textAlign: 'center', minWidth: 48,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: isPast ? 'rgba(0,0,0,0.03)' : 'rgba(124,58,237,0.06)',
          borderRadius: 12, padding: '8px 10px',
          border: isPast ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(168,85,247,0.12)',
        }}>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: isPast ? '#6b7280' : '#4c1d95', lineHeight: 1 }}>
            {date.day}
          </div>
          <div style={{ fontSize: '0.65rem', color: isPast ? '#9ca3af' : '#7c3aed', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
            {date.month}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: isPast ? 'rgba(0,0,0,0.05)' : 'rgba(168,85,247,0.1)', flexShrink: 0, alignSelf: 'stretch' }} />

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isPast ? '#6b7280' : '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              {service}
            </h4>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: '0.63rem', fontWeight: 700,
              background: status.bg, color: status.color, flexShrink: 0, letterSpacing: '0.02em',
            }}>
              {status.label}
            </span>
          </div>

          {staffName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <User style={{ width: 11, height: 11, color: '#9ca3af' }} />
              <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>con {staffName}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 11, height: 11, color: '#9ca3af' }} />
              <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{date.dayName} · {date.time}</span>
            </div>
            {price != null && price > 0 && (
              <span style={{
                fontSize: '0.82rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                flexShrink: 0,
              }}>
                €{price.toFixed(0)}
              </span>
            )}
          </div>

          {/* Actions */}
          {onCancel && date.isFuture && appointment.status !== 'cancelled' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {!showConfirm ? (
                <>
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                      borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff',
                      border: '1px solid rgba(124,58,237,0.4)', cursor: 'pointer',
                    }}
                  >
                    <Calendar style={{ width: 11, height: 11 }} />
                    Aggiungi al calendario
                  </a>
                  {onReschedule && (
                    <button
                      onClick={() => onReschedule(appointment)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                        borderRadius: 8, fontSize: '0.73rem', fontWeight: 600,
                        background: 'rgba(124,58,237,0.07)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.18)', cursor: 'pointer',
                      }}
                    >
                      <RefreshCw style={{ width: 11, height: 11 }} />
                      Sposta
                    </button>
                  )}
                  <button
                    onClick={() => setShowConfirm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                      borderRadius: 8, fontSize: '0.73rem', fontWeight: 600,
                      background: 'rgba(239,68,68,0.07)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer',
                    }}
                  >
                    <X style={{ width: 11, height: 11 }} />
                    Disdici
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => { onCancel(appointment.id); setShowConfirm(false); }}
                    style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Conferma
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.73rem', fontWeight: 600, background: 'rgba(0,0,0,0.06)', color: '#6b7280', border: 'none', cursor: 'pointer' }}
                  >
                    Annulla
                  </button>
                </div>
              )}
            </div>
          )}

          {onRebook && isPast && (
            <div style={{ marginTop: 4 }}>
              <button
                onClick={() => onRebook(appointment)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                  borderRadius: 8, fontSize: '0.73rem', fontWeight: 600,
                  background: 'rgba(168,85,247,0.08)', color: '#7c3aed', border: '1px solid rgba(168,85,247,0.15)', cursor: 'pointer',
                }}
              >
                <RefreshCw style={{ width: 11, height: 11 }} />
                Prenota di nuovo
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
