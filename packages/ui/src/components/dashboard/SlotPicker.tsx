// ============================================================================
// AEGIS SUITE - SLOT PICKER COMPONENT
// File: packages/ui/src/components/dashboard/SlotPicker.tsx
//
// Visual time slot picker that shows only available slots.
// Groups by morning/afternoon, shows workstation occupancy.
// Falls back to classic dropdown if no dynamic slots provided.
// ============================================================================

'use client';

import * as React from 'react';
import { Clock, AlertTriangle, RefreshCw, Sun, Sunset } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface SlotInfo {
  time: string;        // "HH:MM"
  endTime: string;     // "HH:MM"
  availableStaffIds: string[];
  freeWorkstations: number;
  totalWorkstations: number;
}

export interface SlotPickerProps {
  /** Available slots from availability engine */
  slots: SlotInfo[];
  /** Currently selected time */
  selectedTime: string | null;
  /** Callback when a slot is selected */
  onSelectTime: (time: string) => void;
  /** Whether slots are loading */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Whether a date and service have been selected (to show prompt) */
  readyToLoad?: boolean;
  /** Callback to retry loading */
  onRetry?: () => void;
  /** Show workstation indicator */
  showWorkstations?: boolean;
  /** Labels */
  labels?: {
    morning?: string;
    afternoon?: string;
    noSlots?: string;
    selectDateFirst?: string;
    loading?: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const defaultLabels = {
  morning: 'Mattina',
  afternoon: 'Pomeriggio',
  noSlots: 'Nessun orario disponibile per questa data',
  selectDateFirst: 'Seleziona data e servizio per vedere gli orari',
  loading: 'Caricamento orari...',
};

// ============================================================================
// HELPERS
// ============================================================================

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function groupSlotsByPeriod(slots: SlotInfo[]): { morning: SlotInfo[]; afternoon: SlotInfo[] } {
  const noon = 13 * 60; // 13:00 as divider
  return {
    morning: slots.filter(s => timeToMinutes(s.time) < noon),
    afternoon: slots.filter(s => timeToMinutes(s.time) >= noon),
  };
}

function getOccupancyLevel(slot: SlotInfo): 'low' | 'medium' | 'high' {
  const ratio = slot.freeWorkstations / slot.totalWorkstations;
  if (ratio > 0.6) return 'low';
  if (ratio > 0.3) return 'medium';
  return 'high';
}

// ============================================================================
// SLOT BUTTON
// ============================================================================

function SlotButton({
  slot,
  isSelected,
  onSelect,
  showWorkstations,
  index = 0,
}: {
  slot: SlotInfo;
  isSelected: boolean;
  onSelect: () => void;
  showWorkstations?: boolean;
  index?: number;
}) {
  const occupancy = getOccupancyLevel(slot);
  const dotColor =
    occupancy === 'low' ? '#10b981' :
    occupancy === 'medium' ? '#f59e0b' :
    '#ef4444';

  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        minWidth: 72,
        cursor: 'pointer',
        outline: 'none',
        background: isSelected
          ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
          : '#ffffff',
        border: isSelected
          ? '1.5px solid transparent'
          : hovered
            ? '1.5px solid rgba(168,85,247,0.3)'
            : '1.5px solid rgba(0,0,0,0.08)',
        color: isSelected ? '#ffffff' : '#374151',
        boxShadow: isSelected
          ? '0 4px 16px rgba(147,51,234,0.3)'
          : hovered
            ? '0 2px 8px rgba(168,85,247,0.08)'
            : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered && !isSelected ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.18s ease-out',
        animation: `sp-slot-in 0.2s ease-out ${index * 0.02}s both`,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{slot.time}</span>

      {/* Single occupancy dot — top right corner */}
      {showWorkstations && slot.totalWorkstations > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
      )}

      {/* Tooltip on hover */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(100% + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.15s ease',
        background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
        color: '#fff',
        fontSize: 11,
        borderRadius: 8,
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
        zIndex: 50,
      }}>
        {slot.time} – {slot.endTime}
        {showWorkstations && slot.totalWorkstations > 1 && (
          <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>
            {slot.freeWorkstations}/{slot.totalWorkstations} libere
          </span>
        )}
        {/* Tooltip arrow (pointing down) */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid #9333ea',
        }} />
      </div>
    </button>
  );
}

// ============================================================================
// PERIOD SECTION
// ============================================================================

function PeriodSection({
  icon: Icon,
  title,
  slots,
  selectedTime,
  onSelectTime,
  showWorkstations,
  indexOffset = 0,
}: {
  icon: React.ElementType;
  title: string;
  slots: SlotInfo[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  showWorkstations?: boolean;
  indexOffset?: number;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      {/* Period label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <Icon style={{ width: 13, height: 13, color: '#9ca3af' }} />
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#9ca3af',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
        }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: '#d1d5db' }}>({slots.length})</span>
      </div>

      {/* Slot grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 8,
      }}>
        {slots.map((slot, i) => (
          <SlotButton
            key={slot.time}
            slot={slot}
            index={indexOffset + i}
            isSelected={selectedTime === slot.time}
            onSelect={() => onSelectTime(slot.time)}
            showWorkstations={showWorkstations}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  error,
  readyToLoad = true,
  onRetry,
  showWorkstations = true,
  labels: customLabels,
}: SlotPickerProps) {
  const labels = { ...defaultLabels, ...customLabels };

  // Not ready state
  if (!readyToLoad) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', textAlign: 'center' }}>
        <Clock style={{ width: 32, height: 32, color: '#d1d5db', marginBottom: 8 }} />
        <p style={{ fontSize: 13, color: '#6b7280' }}>{labels.selectDateFirst}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', textAlign: 'center' }}>
        <RefreshCw style={{ width: 24, height: 24, color: '#9333ea', marginBottom: 8, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#6b7280' }}>{labels.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', textAlign: 'center' }}>
        <AlertTriangle style={{ width: 24, height: 24, color: '#f59e0b', marginBottom: 8 }} />
        <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 8 }}>{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{ fontSize: 13, color: '#9333ea', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Riprova
          </button>
        )}
      </div>
    );
  }

  // No slots available
  if (slots.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', textAlign: 'center' }}>
        <AlertTriangle style={{ width: 24, height: 24, color: '#fbbf24', marginBottom: 8 }} />
        <p style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{labels.noSlots}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Prova a cambiare data, servizio o operatore</p>
      </div>
    );
  }

  // Group by period
  const { morning, afternoon } = groupSlotsByPeriod(slots);

  // CSS keyframes injected once
  const styleTag = (
    <style>{`
      @keyframes sp-slot-in {
        from { opacity: 0; transform: translateY(6px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  );

  const selectedSlot = slots.find(s => s.time === selectedTime);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {styleTag}

      <PeriodSection
        icon={Sun}
        title={labels.morning}
        slots={morning}
        selectedTime={selectedTime}
        onSelectTime={onSelectTime}
        showWorkstations={showWorkstations}
        indexOffset={0}
      />

      {morning.length > 0 && afternoon.length > 0 && (
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 4px' }} />
      )}

      <PeriodSection
        icon={Sunset}
        title={labels.afternoon}
        slots={afternoon}
        selectedTime={selectedTime}
        onSelectTime={onSelectTime}
        showWorkstations={showWorkstations}
        indexOffset={morning.length}
      />

      {/* Selected time summary */}
      {selectedTime && selectedSlot && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(147,51,234,0.05)',
          borderRadius: 10,
          border: '1px solid rgba(147,51,234,0.15)',
        }}>
          <Clock style={{ width: 14, height: 14, color: '#9333ea', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>
            {selectedTime}
            {selectedSlot.endTime && (
              <span style={{ color: '#a855f7', fontWeight: 400 }}> – {selectedSlot.endTime}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
