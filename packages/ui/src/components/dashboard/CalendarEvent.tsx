// ============================================================================
// AEGIS SUITE - CALENDAR EVENT COMPONENT
// File: packages/ui/src/components/dashboard/CalendarEvent.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Clock, User, Scissors, MapPin, MoreVertical, X, CheckCircle, UserX, XCircle, FileText, AlertTriangle, Droplets } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type EventStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show';

export interface CalendarEventData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  customerName?: string;
  staffName?: string;
  serviceName?: string;
  status: EventStatus;
  notes?: string;
  color?: string;
  staffColor?: string;
  /** Staff member ID (for filtering) */
  staffId?: string;
  /** Whether shampoo was requested for this appointment */
  includeShampoo?: boolean;
  /** Price of the service (for display in detail modal) */
  servicePrice?: number;
  /** Business shampoo price (for display in shampoo card) */
  shampooPrice?: number;
}

export interface CalendarEventProps {
  event: CalendarEventData;
  variant?: 'compact' | 'default' | 'detailed';
  showTime?: boolean;
  showStatus?: boolean;
  onClick?: (event: CalendarEventData) => void;
  onMoreClick?: (event: CalendarEventData, e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// STYLES
// ============================================================================

const statusConfig: Record<EventStatus, { bg: string; text: string; border: string; label: string }> = {
  confirmed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-l-green-500',
    label: 'Confermato',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-l-amber-500',
    label: 'In attesa',
  },
  completed: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-l-gray-400',
    label: 'Completato',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-l-red-500',
    label: 'Cancellato',
  },
  no_show: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-l-purple-500',
    label: 'No-show',
  },
};

const eventStyles = {
  base: `
    rounded-lg
    border-l-4
    transition-all duration-150
    cursor-pointer
    hover:shadow-md
    overflow-hidden
  `,
  compact: 'px-2 py-1',
  default: 'px-3 py-2',
  detailed: 'px-4 py-3',
  
  header: 'flex items-start justify-between gap-2',
  title: 'font-medium truncate',
  titleCompact: 'text-xs',
  titleDefault: 'text-sm',
  titleDetailed: 'text-base',
  
  time: 'flex items-center gap-1 text-gray-500',
  timeCompact: 'text-xs',
  timeDefault: 'text-xs',
  timeDetailed: 'text-sm',
  
  details: 'mt-2 space-y-1',
  detailRow: 'flex items-center gap-2 text-gray-600',
  detailIcon: 'w-3.5 h-3.5 flex-shrink-0',
  detailText: 'text-xs truncate',
  
  statusBadge: `
    inline-flex items-center
    px-2 py-0.5
    rounded-full
    text-xs font-medium
  `,
  
  moreButton: `
    p-1
    rounded
    hover:bg-black/10
    transition-colors duration-150
    flex-shrink-0
  `,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// ============================================================================
// CALENDAR EVENT COMPONENT
// ============================================================================

export function CalendarEvent({
  event,
  variant = 'default',
  showTime = true,
  showStatus = false,
  onClick,
  onMoreClick,
  className = '',
  style,
}: CalendarEventProps) {
  const status = statusConfig[event.status];
  
  const handleClick = () => {
    onClick?.(event);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreClick?.(event, e);
  };

  const sizeClass = eventStyles[variant];
  const titleClass = variant === 'compact' 
    ? eventStyles.titleCompact 
    : variant === 'detailed' 
      ? eventStyles.titleDetailed 
      : eventStyles.titleDefault;
  const timeClass = variant === 'detailed' 
    ? eventStyles.timeDetailed 
    : eventStyles.timeDefault;

  return (
    <div
      onClick={handleClick}
      className={`
        ${eventStyles.base}
        ${sizeClass}
        ${status.bg}
        ${status.border}
        ${className}
      `.trim()}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className={eventStyles.header}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <p className={`${eventStyles.title} ${titleClass} ${status.text}`}>
              {event.title}
            </p>
            {event.includeShampoo && (
              <span
                title="Shampoo incluso"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  fontSize: '0.6rem', fontWeight: 700, lineHeight: 1,
                  padding: '1px 5px', borderRadius: 999,
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  color: '#7c3aed', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                <Droplets className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          
          {showTime && (
            <p className={`${eventStyles.time} ${timeClass}`}>
              <Clock className="w-3 h-3" />
              {variant === 'compact' 
                ? formatTime(event.startTime)
                : formatTimeRange(event.startTime, event.endTime)
              }
            </p>
          )}
        </div>

        {onMoreClick && (
          <button
            onClick={handleMoreClick}
            className={eventStyles.moreButton}
            aria-label="Altre opzioni"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {variant !== 'compact' && (event.customerName || event.staffName) && (
        <div className={eventStyles.details}>
          {event.customerName && (
            <div className={eventStyles.detailRow}>
              <User className={eventStyles.detailIcon} />
              <span className={eventStyles.detailText}>{event.customerName}</span>
            </div>
          )}
          
          {event.staffName && (
            <div className={eventStyles.detailRow}>
              <Scissors className={eventStyles.detailIcon} />
              <span className={eventStyles.detailText}>{event.staffName}</span>
            </div>
          )}
        </div>
      )}

      {(variant === 'detailed' || showStatus) && (
        <div className="mt-2">
          <span className={`${eventStyles.statusBadge} ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LIST VARIANT
// ============================================================================

export interface CalendarEventListItemProps {
  event: CalendarEventData;
  onClick?: (event: CalendarEventData) => void;
  className?: string;
}

export function CalendarEventListItem({
  event,
  onClick,
  className = '',
}: CalendarEventListItemProps) {
  const status = statusConfig[event.status];

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`
        flex items-center gap-4 p-3
        rounded-lg
        hover:bg-gray-50
        cursor-pointer
        transition-colors duration-150
        ${className}
      `.trim()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(event);
        }
      }}
    >
      <div className="flex-shrink-0 text-center w-16">
        <p className="text-sm font-semibold text-gray-900">
          {formatTime(event.startTime)}
        </p>
        <p className="text-xs text-gray-500">
          {formatTime(event.endTime)}
        </p>
      </div>

      <div className={`w-1 h-12 rounded-full ${status.border.replace('border-l-', 'bg-')}`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-1">
          {event.customerName && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              {event.customerName}
            </span>
          )}
          {event.staffName && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Scissors className="w-3 h-3" />
              {event.staffName}
            </span>
          )}
        </div>
      </div>

      <span className={`${eventStyles.statusBadge} ${status.bg} ${status.text}`}>
        {status.label}
      </span>
    </div>
  );
}

// ============================================================================
// EVENT DETAIL MODAL (Perfected v2 - Portal/Glass/Glow)
// ============================================================================

export interface EventDetailModalProps {
  event: CalendarEventData | null;
  onClose: () => void;
  onComplete?: (eventId: string) => void;
  onNoShow?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  isLoading?: boolean;
  labels?: {
    complete?: string;
    noShow?: string;
    cancel?: string;
    close?: string;
  };
}

export function EventDetailModal({
  event,
  onClose,
  onComplete,
  onNoShow,
  onCancel,
  isLoading = false,
  labels,
}: EventDetailModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  React.useEffect(() => {
    if (event) {
      setClosing(false);
      setConfirmCancel(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => { requestAnimationFrame(() => setMounted(true)); });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [event]);

  React.useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [event]);

  const handleClose = () => {
    setClosing(true); setMounted(false);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  if (!event && !closing) return null;
  if (!event) return null;

  const status = statusConfig[event.status];
  const isActionable = event.status === 'confirmed' || event.status === 'pending';

  const statusColors: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: 'rgba(168,85,247,0.08)', color: '#7c3aed' },
    pending: { bg: 'rgba(245,158,11,0.08)', color: '#d97706' },
    completed: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
    no_show: { bg: 'rgba(107,114,128,0.08)', color: '#4b5563' },
  };
  const sc = statusColors[event.status] || statusColors.pending;

  const rippleClick = (e: React.MouseEvent<HTMLButtonElement>, cb: () => void) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const container = e.currentTarget.querySelector('[data-ripple]');
    if (container) {
      const span = document.createElement('span');
      Object.assign(span.style, {
        position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.5)',
        animation: 'edm-ripple 0.7s ease-out forwards', pointerEvents: 'none',
      });
      container.appendChild(span);
      setTimeout(() => span.remove(), 600);
    }
    cb();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={handleClose}
        style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease',
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md"
        style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24, border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: mounted
            ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18), 0 0 80px rgba(147,51,234,0.08)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        {/* Close */}
        <button onClick={handleClose} className="absolute right-4 top-4 p-2 rounded-xl z-10"
          style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-4">
          <h2 className="text-lg font-bold text-gray-900 pr-8">{event.title}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ background: sc.bg, color: sc.color }}>
              {status.label}
            </span>
            {event.servicePrice !== undefined && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(168,85,247,0.08)', color: '#7c3aed' }}>
                €{event.servicePrice % 1 === 0 ? event.servicePrice.toFixed(0) : event.servicePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* Details */}
        <div className="px-6 py-5 space-y-3">
          {[
            { icon: Clock, label: 'Orario', value: `${formatTime(new Date(event.startTime))} – ${formatTime(new Date(event.endTime))}` },
            { icon: User, label: 'Cliente', value: event.customerName || 'N/A' },
            { icon: Scissors, label: 'Operatore', value: event.staffName || 'N/A' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(147,51,234,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span className="flex items-center gap-2 text-sm" style={{ color: '#9333ea' }}><row.icon className="w-4 h-4" />{row.label}</span>
              <span className="text-sm font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}

          {/* Shampoo card — solo se richiesto */}
          {event.includeShampoo && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(124,58,237,0.05))', border: '1px solid rgba(168,85,247,0.22)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
              >
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Shampoo incluso</p>
                <p className="text-xs text-gray-500 mt-0.5">Lavaggio richiesto dal cliente</p>
              </div>
              {event.shampooPrice !== undefined && event.shampooPrice > 0 && (
                <span className="text-sm font-bold flex-shrink-0" style={{ color: '#7c3aed' }}>
                  +€{event.shampooPrice % 1 === 0 ? event.shampooPrice.toFixed(0) : event.shampooPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {event.notes && (
            <div className="p-3.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)' }}>
              <span className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5"><FileText className="w-3.5 h-3.5" />Note</span>
              <p className="text-sm text-gray-700">{event.notes}</p>
            </div>
          )}
        </div>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />

        {/* Actions */}
        <div className="px-6 py-5">
          {isActionable ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                {onComplete && (
                  <button onClick={(e) => rippleClick(e, () => onComplete(event.id))} disabled={isLoading}
                    className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
                    style={{ background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #059669, #047857)', boxShadow: isLoading ? 'none' : '0 2px 8px rgba(5,150,105,0.25)', opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.35)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 2px 8px rgba(5,150,105,0.25)'; }}
                  >
                    {!isLoading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'edm-shimmer 2.5s ease-in-out infinite' }} />}
                    <div data-ripple="" className="absolute inset-0 pointer-events-none" />
                    <CheckCircle className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{labels?.complete || 'Completato'}</span>
                  </button>
                )}
                {onNoShow && (
                  <button onClick={(e) => rippleClick(e, () => onNoShow(event.id))} disabled={isLoading}
                    className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
                    style={{ background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #6b7280, #4b5563)', boxShadow: isLoading ? 'none' : '0 2px 8px rgba(107,114,128,0.25)', opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,114,128,0.35)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 2px 8px rgba(107,114,128,0.25)'; }}
                  >
                    {!isLoading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'edm-shimmer 2.5s ease-in-out infinite' }} />}
                    <div data-ripple="" className="absolute inset-0 pointer-events-none" />
                    <UserX className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{labels?.noShow || 'No-show'}</span>
                  </button>
                )}
              </div>

              {onCancel && (
                <>
                  {!confirmCancel ? (
                    <button onClick={() => setConfirmCancel(true)} disabled={isLoading}
                      className="w-full text-center text-sm font-medium py-2"
                      style={{ color: '#dc2626', transition: 'opacity 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {labels?.cancel || 'Cancella appuntamento'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', animation: 'edm-fade-in 0.2s ease-out' }}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700 flex-1">Confermi?</span>
                      <button onClick={(e) => rippleClick(e, () => onCancel(event.id))} disabled={isLoading}
                        className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 2px 8px rgba(220,38,38,0.25)', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.35)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,38,38,0.25)'; }}
                      >
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'edm-shimmer 2.5s ease-in-out infinite' }} />
                        <div data-ripple="" className="absolute inset-0 pointer-events-none" />
                        <XCircle className="w-3.5 h-3.5 relative z-10" />
                        <span className="relative z-10">Sì, cancella</span>
                      </button>
                      <button onClick={() => setConfirmCancel(false)}
                        className="px-3 py-2 text-sm font-medium text-gray-600 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <button onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            >
              {labels?.close || 'Chiudi'}
            </button>
          )}
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        <style>{`
          @keyframes edm-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          @keyframes edm-ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(6); opacity: 0; } }
          @keyframes edm-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>,
    document.body
  );
}