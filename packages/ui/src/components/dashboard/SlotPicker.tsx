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
import { Clock, Users, AlertTriangle, RefreshCw, Sun, Sunset } from 'lucide-react';

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
}: {
  slot: SlotInfo;
  isSelected: boolean;
  onSelect: () => void;
  showWorkstations?: boolean;
}) {
  const occupancy = getOccupancyLevel(slot);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative group flex flex-col items-center justify-center
        px-3 py-2 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out
        border-2 min-w-[72px]
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent-500
        ${isSelected
          ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm shadow-accent-200'
          : 'border-gray-200 bg-white text-gray-700 hover:border-accent-300 hover:bg-accent-50/50 hover:shadow-sm'
        }
      `}
    >
      <span className={`text-sm font-semibold ${isSelected ? 'text-accent-700' : 'text-gray-900'}`}>
        {slot.time}
      </span>

      {showWorkstations && slot.totalWorkstations > 1 && (
        <div className="flex items-center gap-1 mt-0.5">
          {Array.from({ length: slot.totalWorkstations }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i < slot.freeWorkstations
                  ? occupancy === 'high'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
          {slot.time} - {slot.endTime}
          {showWorkstations && slot.totalWorkstations > 1 && (
            <span className="ml-1 text-gray-300">
              · {slot.freeWorkstations}/{slot.totalWorkstations} libere
            </span>
          )}
        </div>
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
}: {
  icon: React.ElementType;
  title: string;
  slots: SlotInfo[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  showWorkstations?: boolean;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-xs text-gray-400">({slots.length} disponibili)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map(slot => (
          <SlotButton
            key={slot.time}
            slot={slot}
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">{labels.selectDateFirst}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <RefreshCw className="w-6 h-6 text-accent-500 animate-spin mb-2" />
        <p className="text-sm text-gray-500">{labels.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-sm text-red-600 mb-2">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-accent-600 hover:text-accent-700 font-medium"
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">{labels.noSlots}</p>
        <p className="text-xs text-gray-400 mt-1">Prova a cambiare data, servizio o operatore</p>
      </div>
    );
  }

  // Group by period
  const { morning, afternoon } = groupSlotsByPeriod(slots);

  return (
    <div className="space-y-4">
      {/* Workstation legend */}
      {showWorkstations && slots[0]?.totalWorkstations > 1 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            I pallini indicano le postazioni disponibili
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-400">Libera</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 ml-2" />
            <span className="text-xs text-gray-400">Occupata</span>
            <div className="relative group ml-2" style={{ lineHeight: 1 }}>
              <span className="flex items-center justify-center cursor-help"
                style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', fontSize: 9, fontWeight: 700, color: '#9ca3af' }}>?</span>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', fontSize: 10, zIndex: 50, boxShadow: '0 4px 12px rgba(147,51,234,0.3)', whiteSpace: 'nowrap' }}>
                Ogni pallino = una postazione. Verde = libera, Grigio = occupata.
                <div className="absolute top-full right-2 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #9333ea' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <PeriodSection
        icon={Sun}
        title={labels.morning}
        slots={morning}
        selectedTime={selectedTime}
        onSelectTime={onSelectTime}
        showWorkstations={showWorkstations}
      />

      <PeriodSection
        icon={Sunset}
        title={labels.afternoon}
        slots={afternoon}
        selectedTime={selectedTime}
        onSelectTime={onSelectTime}
        showWorkstations={showWorkstations}
      />

      {/* Selected time summary */}
      {selectedTime && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-50 rounded-lg border border-accent-200">
          <Clock className="w-4 h-4 text-accent-600" />
          <span className="text-sm font-medium text-accent-700">
            Orario selezionato: {selectedTime}
            {slots.find(s => s.time === selectedTime)?.endTime && (
              <span className="text-accent-500"> - {slots.find(s => s.time === selectedTime)!.endTime}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}