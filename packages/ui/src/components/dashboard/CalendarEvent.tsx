// ============================================================================
// AEGIS SUITE - CALENDAR EVENT COMPONENT
// File: packages/ui/src/components/dashboard/CalendarEvent.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { Clock, User, Scissors, MapPin, MoreVertical, X, CheckCircle, UserX, XCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type EventStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show';

export interface CalendarEventData {
  /** Unique identifier */
  id: string;
  /** Event title (e.g., service name) */
  title: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Customer name */
  customerName?: string;
  /** Staff member name */
  staffName?: string;
  /** Service name (if different from title) */
  serviceName?: string;
  /** Event status */
  status: EventStatus;
  /** Optional notes */
  notes?: string;
  /** Optional color override */
  color?: string;
  /** Staff color for display */
  staffColor?: string;
}

export interface CalendarEventProps {
  /** Event data */
  event: CalendarEventData;
  /** Display variant */
  variant?: 'compact' | 'default' | 'detailed';
  /** Show time */
  showTime?: boolean;
  /** Show status badge */
  showStatus?: boolean;
  /** Click handler */
  onClick?: (event: CalendarEventData) => void;
  /** More options click handler */
  onMoreClick?: (event: CalendarEventData, e: React.MouseEvent) => void;
  /** Custom className */
  className?: string;
  /** Custom style */
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
// COMPONENT
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

  // Variant-specific classes
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
      {/* Header */}
      <div className={eventStyles.header}>
        <div className="min-w-0 flex-1">
          <p className={`${eventStyles.title} ${titleClass} ${status.text}`}>
            {event.title}
          </p>
          
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

      {/* Details (only for default and detailed variants) */}
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

      {/* Status badge (only for detailed variant or when explicitly shown) */}
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
// LIST VARIANT - For use in lists (e.g., "Prossimi appuntamenti")
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
      {/* Time column */}
      <div className="flex-shrink-0 text-center w-16">
        <p className="text-sm font-semibold text-gray-900">
          {formatTime(event.startTime)}
        </p>
        <p className="text-xs text-gray-500">
          {formatTime(event.endTime)}
        </p>
      </div>

      {/* Color indicator */}
      <div className={`w-1 h-12 rounded-full ${status.border.replace('border-l-', 'bg-')}`} />

      {/* Content */}
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

      {/* Status */}
      <span className={`${eventStyles.statusBadge} ${status.bg} ${status.text}`}>
        {status.label}
      </span>
    </div>
  );
}

// ============================================================================
// EVENT DETAIL MODAL - Reusable modal for viewing event details + actions
// ============================================================================

export interface EventDetailModalProps {
  /** The event to display (null = modal closed) */
  event: CalendarEventData | null;
  /** Close the modal */
  onClose: () => void;
  /** Mark appointment as completed (paid) */
  onComplete?: (eventId: string) => void;
  /** Mark appointment as no-show */
  onNoShow?: (eventId: string) => void;
  /** Cancel appointment */
  onCancel?: (eventId: string) => void;
  /** Whether an action is in progress */
  isLoading?: boolean;
  /** Labels override */
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
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  // Reset confirm state when modal opens/closes
  React.useEffect(() => {
    setConfirmCancel(false);
  }, [event?.id]);

  if (!event) return null;

  const status = statusConfig[event.status];
  const isActionable = event.status === 'confirmed' || event.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {event.title}
          </h3>

          {/* Event details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente</span>
              <span className="font-medium">{event.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operatore</span>
              <span className="font-medium">{event.staffName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Orario</span>
              <span className="font-medium">
                {formatTimeRange(new Date(event.startTime), new Date(event.endTime))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Stato</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            {event.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block mb-1">Note</span>
                <p className="text-gray-700">{event.notes}</p>
              </div>
            )}
          </div>

          {/* Action buttons — only for confirmed/pending appointments */}
          {isActionable && (
            <div className="mt-6 space-y-3">
              {/* Primary actions row */}
              <div className="flex gap-3">
                {onComplete && (
                  <button
                    onClick={() => onComplete(event.id)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {labels?.complete || 'Completato'}
                  </button>
                )}
                {onNoShow && (
                  <button
                    onClick={() => onNoShow(event.id)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    {labels?.noShow || 'No-show'}
                  </button>
                )}
              </div>

              {/* Cancel — separate, with confirmation */}
              {onCancel && (
                <div>
                  {!confirmCancel ? (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      disabled={isLoading}
                      className="w-full text-center text-sm text-red-500 hover:text-red-700 font-medium py-1.5 transition-colors disabled:opacity-50"
                    >
                      {labels?.cancel || 'Cancella appuntamento'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-red-700 flex-1">Confermi la cancellazione?</span>
                      <button
                        onClick={() => onCancel(event.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Sì, cancella
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close button for already resolved events */}
          {!isActionable && (
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {labels?.close || 'Chiudi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}