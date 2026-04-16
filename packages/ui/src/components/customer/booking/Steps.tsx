// ============================================================================
// AEGIS SUITE - BOOKING STEPS (Front + Back faces for all 3 cards)
// File: packages/ui/src/components/customer/booking/Steps.tsx
// Exports: Step1Front, Step1Back, Step2Front, Step2Back, Step3Front, Step3Back
// ============================================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scissors, Calendar, CheckCircle, MapPin, Phone, Clock,
  ChevronLeft, ChevronRight, ChevronDown, ArrowLeft, HelpCircle,
  Loader2, Bell, User, Droplets,
} from 'lucide-react';
import type {
  BookingBusiness, BookingCategory, BookingService, BookingStaff, BookingHours,
  BookingSlot, BookingState, FetchSlotsFn,
} from './types';

// ============================================================================
// SHARED STYLE HELPERS
// ============================================================================

const cardPad   = { padding: '20px 18px' };
const titleStyle: React.CSSProperties = {
  fontSize: '0.95rem', fontWeight: 800, color: '#fff',
  margin: '0 0 14px', letterSpacing: '-0.01em',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0',
};
const btnPrimary: React.CSSProperties = {
  padding: '11px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
  color: '#fff', fontWeight: 700, fontSize: '0.82rem',
  boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  flex: 1,
};
const btnSecondary: React.CSSProperties = {
  padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.82rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
};
const flipBtnStyle: React.CSSProperties = {
  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'rgba(255,255,255,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};
const backHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
};
const backTitleStyle: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0,
};
const bodyTextStyle: React.CSSProperties = {
  fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
};

const DAY_ORDER_FULL: string[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function formatTime(t: string): string { return t.slice(0, 5); }

// ============================================================================
// SHIMMER PRIMARY BUTTON
// ============================================================================

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={e => { e.stopPropagation(); onClick(); }}
      whileHover={!disabled ? { scale: 1.02, boxShadow: '0 0 26px rgba(168,85,247,0.5)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{ ...btnPrimary, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      {!disabled && (
        <motion.span
          style={{
            position: 'absolute', top: 0, bottom: 0, width: '55%', zIndex: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
            pointerEvents: 'none',
          }}
          animate={{ x: ['-120%', '280%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {children}
      </span>
    </motion.button>
  );
}


// ============================================================================
// ──────────────────────────────────────────────────────────────────────────
//  STEP 1 — FRONT: Servizio + Staff
// ──────────────────────────────────────────────────────────────────────────
// ============================================================================

interface Step1FrontProps {
  business:     BookingBusiness;
  services:     BookingService[];
  staff:        BookingStaff[];
  categories:   BookingCategory[];
  bookingState: BookingState;
  onUpdate:     (patch: Partial<BookingState>) => void;
  onNext:       () => void;
  onFlip:       () => void;
}

function ServiceRow({ s, isSelected, onSelect }: { s: BookingService; isSelected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      onClick={e => { e.stopPropagation(); onSelect(); }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 11px', borderRadius: 11, cursor: 'pointer', textAlign: 'left', width: '100%',
        border: `1px solid ${isSelected ? 'rgba(168,85,247,0.55)' : 'rgba(255,255,255,0.06)'}`,
        background: isSelected ? 'rgba(124,58,237,0.22)' : 'rgba(255,255,255,0.025)',
        boxShadow: isSelected ? '0 0 12px rgba(168,85,247,0.15)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: isSelected ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Scissors style={{ width: 12, height: 12, color: isSelected ? '#a855f7' : 'rgba(255,255,255,0.35)' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{s.name}</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{s.duration_minutes} min</div>
        </div>
      </div>
      <span style={{
        fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {s.price_from ? `Da €${s.price.toFixed(0)}` : `€${s.price.toFixed(0)}`}
      </span>
    </motion.button>
  );
}

export function Step1Front({ business, services, staff, categories, bookingState, onUpdate, onNext, onFlip }: Step1FrontProps) {
  const canNext = !!bookingState.selectedService;

  // Group services by category
  const hasCategories = categories.length > 0;
  const [openCats, setOpenCats] = useState<Set<string | null>>(() => {
    const s = new Set<string | null>([null]);
    categories.forEach(c => s.add(c.id));
    return s;
  });

  const toggleCat = (id: string | null) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const catServices = useMemo(() => {
    const map = new Map<string | null, BookingService[]>();
    map.set(null, []);
    categories.forEach(c => map.set(c.id, []));
    services.forEach(s => {
      const key = s.category_id ?? null;
      if (!map.has(key)) map.set(null, [...(map.get(null) ?? [])]);
      map.get(key)?.push(s);
    });
    return map;
  }, [services, categories]);

  const uncategorized = catServices.get(null) ?? [];

  return (
    <div style={{ ...cardPad, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>Scegli il servizio</h3>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle} aria-label="Info">
          <HelpCircle style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      {/* Service list — grouped by category, collapsible */}
      <div
        style={{ flex: '1 1 0', overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {hasCategories ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categories.map(cat => {
              const items = catServices.get(cat.id) ?? [];
              if (items.length === 0) return null;
              const isOpen = openCats.has(cat.id);
              return (
                <div key={cat.id}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    padding: '6px 10px', borderRadius: 10, marginBottom: 4,
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.18)',
                  }}>
                    <button
                      onClick={e => { e.stopPropagation(); toggleCat(cat.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, flex: 1,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: 'rgba(168,85,247,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                          <ChevronDown style={{ width: 11, height: 11, color: '#a855f7' }} />
                        </motion.div>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>
                        ({items.length})
                      </span>
                    </button>
                  </div>
                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4, paddingBottom: 4 }}>
                      {items.map(s => (
                        <ServiceRow key={s.id} s={s}
                          isSelected={bookingState.selectedService?.id === s.id}
                          onSelect={() => onUpdate({ selectedService: s })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {uncategorized.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 10, marginBottom: 4,
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.18)',
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleCat(null); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, flex: 1,
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: 'rgba(168,85,247,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <motion.div animate={{ rotate: openCats.has(null) ? 0 : -90 }} transition={{ duration: 0.2 }}>
                        <ChevronDown style={{ width: 11, height: 11, color: '#a855f7' }} />
                      </motion.div>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                      Altro
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>
                      ({uncategorized.length})
                    </span>
                  </button>
                </div>
                {openCats.has(null) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4, paddingBottom: 4 }}>
                    {uncategorized.map(s => (
                      <ServiceRow key={s.id} s={s}
                        isSelected={bookingState.selectedService?.id === s.id}
                        onSelect={() => onUpdate({ selectedService: s })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {services.map(s => (
              <ServiceRow key={s.id} s={s}
                isSelected={bookingState.selectedService?.id === s.id}
                onSelect={() => onUpdate({ selectedService: s })}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ ...dividerStyle, margin: '8px 0' }} />

      {/* Staff selection */}
      <div onClick={e => e.stopPropagation()}>
        <p style={{ ...labelStyle, marginBottom: 5 }}>Professionista</p>
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          <motion.button
            onClick={e => { e.stopPropagation(); onUpdate({ selectedStaff: null }); }}
            whileTap={{ scale: 0.95 }}
            style={{
              flexShrink: 0, padding: '5px 11px', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.7rem', fontWeight: 600,
              background: bookingState.selectedStaff === null ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${bookingState.selectedStaff === null ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: bookingState.selectedStaff === null ? '#fff' : 'rgba(255,255,255,0.45)',
            } as React.CSSProperties}
          >
            Qualsiasi
          </motion.button>
          {staff.map(m => {
            const isSelected = bookingState.selectedStaff?.id === m.id;
            const initials = m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <motion.button
                key={m.id}
                onClick={e => { e.stopPropagation(); onUpdate({ selectedStaff: m }); }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px 4px 4px', borderRadius: 20, cursor: 'pointer',
                  background: isSelected ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: '0.7rem', fontWeight: 600,
                } as React.CSSProperties}
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.full_name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 800, color: '#fff',
                  }}>
                    {initials}
                  </div>
                )}
                {m.nickname || m.full_name.split(' ')[0]}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Shampoo toggle */}
      <div
        onClick={e => { e.stopPropagation(); onUpdate({ includeShampoo: !bookingState.includeShampoo }); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 11, cursor: 'pointer', marginTop: 6,
          background: bookingState.includeShampoo ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
          border: bookingState.includeShampoo ? '1px solid rgba(168,85,247,0.35)' : '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.25s ease',
        }}
      >
        <div style={{
          width: 32, height: 18, borderRadius: 999, flexShrink: 0, position: 'relative',
          background: bookingState.includeShampoo ? '#a855f7' : 'rgba(255,255,255,0.15)',
          boxShadow: bookingState.includeShampoo ? '0 0 8px rgba(168,85,247,0.4)' : 'none',
          transition: 'background 0.25s ease, box-shadow 0.25s ease',
        }}>
          <span style={{
            position: 'absolute', width: 14, height: 14, borderRadius: '50%',
            top: 2, left: 2, background: '#fff',
            transform: bookingState.includeShampoo ? 'translateX(14px)' : 'translateX(0)',
            transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Droplets style={{ width: 12, height: 12, color: bookingState.includeShampoo ? '#a855f7' : 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
            <span>Aggiungi shampoo</span>
            {(business.shampoo_price ?? 3) > 0 && (
              <span style={{
                fontSize: '0.62rem', fontWeight: 600,
                color: bookingState.includeShampoo ? '#d8b4fe' : 'rgba(255,255,255,0.3)',
              }}>
                +€{(business.shampoo_price ?? 3).toFixed(2).replace('.00', '')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <PrimaryButton disabled={!canNext} onClick={() => { if (canNext) onNext(); }}>
          Avanti <ChevronRight style={{ width: 14, height: 14 }} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
//  STEP 1 — BACK
// ============================================================================

export function Step1Back({ onFlip }: { onFlip: () => void }) {
  return (
    <div style={{ ...cardPad, height: '100%', boxSizing: 'border-box', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(76,29,149,0.25), rgba(30,10,60,0.2))' }}>
      <div style={backHeaderStyle}>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle}>
          <ArrowLeft style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
        </button>
        <h3 style={backTitleStyle}>Come funziona</h3>
      </div>

      <p style={{ ...bodyTextStyle, marginBottom: 18, fontStyle: 'italic', opacity: 0.75 }}>
        È semplicissimo, in 3 passi:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          {
            icon: <Scissors style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Scegli il servizio',
            desc: 'Seleziona il trattamento e il tuo professionista preferito — o lascia scegliere a noi.',
          },
          {
            icon: <Calendar style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Seleziona data e ora',
            desc: 'Scegli il giorno e l\'orario più comodo tra quelli disponibili.',
          },
          {
            icon: <CheckCircle style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Conferma',
            desc: 'Rivedi il riepilogo e premi conferma. Il gioco è fatto!',
          },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.title}</div>
              <div style={bodyTextStyle}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...dividerStyle, margin: '16px 0 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell style={{ width: 13, height: 13, color: '#a855f7', flexShrink: 0 }} />
        <p style={{ ...bodyTextStyle, margin: 0, fontSize: '0.76rem' }}>
          Riceverai una notifica di conferma immediata.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// ──────────────────────────────────────────────────────────────────────────
//  STEP 2 — FRONT: Data + Ora
// ──────────────────────────────────────────────────────────────────────────
// ============================================================================

const MONTH_NAMES = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

interface Step2FrontProps {
  business:     BookingBusiness;
  hours:        BookingHours[];
  staff:        BookingStaff[];
  bookingState: BookingState;
  fetchSlots:   FetchSlotsFn;
  onUpdate:     (patch: Partial<BookingState>) => void;
  onNext:       () => void;
  onBack:       () => void;
  onFlip:       () => void;
}

export function Step2Front({ business, hours, staff, bookingState, fetchSlots, onUpdate, onNext, onBack, onFlip }: Step2FrontProps) {
  const today  = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth,     setCurrentMonth]     = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [slots,            setSlots]            = useState<BookingSlot[]>([]);
  const [slotsLoading,     setSlotsLoading]     = useState(false);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  const openDayIndices = useMemo(
    () => new Set(hours.filter(h => h.is_open).map(h => DAY_ORDER_FULL.indexOf(h.day_of_week))),
    [hours]
  );

  // Fetch slots when date or service changes
  useEffect(() => {
    if (!bookingState.selectedDate || !bookingState.selectedService) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    const dateStr = bookingState.selectedDate.toISOString().split('T')[0];

    fetchSlots({
      businessId: business.id,
      serviceId:  bookingState.selectedService.id,
      staffId:    bookingState.selectedStaff?.id,
      date:       dateStr,
    })
      .then(result => { setSlots(result); setCalendarCollapsed(!!bookingState.selectedDate); })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [bookingState.selectedDate, bookingState.selectedService, bookingState.selectedStaff, business.id, fetchSlots]);

  // Calendar helpers
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay   = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset — always 42 cells (6 rows) so calendar height never changes
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length < 42) cells.push(null);

  function isDisabled(d: Date): boolean {
    if (d < today) return true;
    const dayIdx = (d.getDay() + 6) % 7; // 0=Mon
    if (!openDayIndices.has(dayIdx)) return true;
    return false;
  }

  const canNext = !!bookingState.selectedDate && !!bookingState.selectedTime;

  // When a slot is selected with no-preference staff, look up which staff would handle it
  function handleSlotSelect(slot: BookingSlot) {
    let autoAssignedStaff = bookingState.autoAssignedStaff;
    if (bookingState.selectedStaff === null && slot.availableStaffIds && slot.availableStaffIds.length > 0) {
      autoAssignedStaff = staff.find(s => s.id === slot.availableStaffIds![0]) ?? null;
    }
    onUpdate({ selectedTime: slot.time, autoAssignedStaff });
  }

  const selectedDateLabel = bookingState.selectedDate?.toLocaleDateString('it-IT', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <div style={{ ...cardPad, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>Data e ora</h3>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle} aria-label="Info">
          <HelpCircle style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      {/* Calendar — collapsed or full */}
      <div onClick={e => e.stopPropagation()}>
        {calendarCollapsed && bookingState.selectedDate ? (
          /* Compact pill — click to expand */
          <button
            onClick={e => { e.stopPropagation(); setCalendarCollapsed(false); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 8,
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(168,85,247,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar style={{ width: 13, height: 13, color: '#a855f7' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{selectedDateLabel}</span>
            </div>
            <ChevronDown style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} />
          </button>
        ) : (
          /* Full calendar */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <button
                onClick={e => { e.stopPropagation(); setCurrentMonth(new Date(year, month - 1, 1)); }}
                style={{ ...flipBtnStyle, width: 24, height: 24 }}
                disabled={new Date(year, month, 1) <= new Date(today.getFullYear(), today.getMonth(), 1)}
              >
                <ChevronLeft style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
              </button>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                {MONTH_NAMES[month]} {year}
              </span>
              <button onClick={e => { e.stopPropagation(); setCurrentMonth(new Date(year, month + 1, 1)); }} style={{ ...flipBtnStyle, width: 24, height: 24 }}>
                <ChevronRight style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 3 }}>
              {['Lu','Ma','Me','Gi','Ve','Sa','Do'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600, padding: '2px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {cells.map((d, idx) => {
                if (!d) return <div key={`e-${idx}`} style={{ height: 26 }} />;
                const disabled   = isDisabled(d);
                const isSelected = bookingState.selectedDate?.toDateString() === d.toDateString();
                const isToday    = d.toDateString() === today.toDateString();
                return (
                  <motion.button
                    key={d.toISOString()}
                    onClick={e => { e.stopPropagation(); if (!disabled) { onUpdate({ selectedDate: d }); setCalendarCollapsed(true); } }}
                    whileTap={!disabled ? { scale: 0.88 } : {}}
                    style={{
                      height: 26, borderRadius: 6, border: 'none', cursor: disabled ? 'default' : 'pointer',
                      background: isSelected ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : isToday ? 'rgba(168,85,247,0.1)' : 'transparent',
                      color: disabled ? 'rgba(255,255,255,0.14)' : isSelected ? '#fff' : 'rgba(255,255,255,0.78)',
                      fontSize: '0.68rem', fontWeight: isSelected || isToday ? 700 : 400,
                      boxShadow: isSelected ? '0 0 8px rgba(168,85,247,0.4)' : 'none',
                      textAlign: 'center', transition: 'all 0.14s',
                    }}
                  >
                    {d.getDate()}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ ...dividerStyle, margin: '8px 0' }} />

      {/* Slot grid */}
      <div style={{ flex: '1 1 0', overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }} onClick={e => e.stopPropagation()}>
        {!bookingState.selectedDate ? (
          <p style={{ ...bodyTextStyle, textAlign: 'center', opacity: 0.4, marginTop: 8, fontSize: '0.76rem' }}>Seleziona prima una data</p>
        ) : slotsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, paddingTop: 2 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                style={{ height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p style={{ ...bodyTextStyle, textAlign: 'center', marginTop: 8, fontSize: '0.76rem', opacity: 0.55 }}>
            Nessun orario disponibile.<br />Prova un altro giorno.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, paddingTop: 2 }}>
            {slots.map(slot => {
              const isSelected = bookingState.selectedTime === slot.time;
              return (
                <motion.button key={slot.time}
                  onClick={e => { e.stopPropagation(); handleSlotSelect(slot); }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    padding: '8px 4px', borderRadius: 9, cursor: 'pointer', textAlign: 'center',
                    background: isSelected ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.72)',
                    fontSize: '0.76rem', fontWeight: 700,
                    boxShadow: isSelected ? '0 0 12px rgba(168,85,247,0.32)' : 'none',
                    transition: 'all 0.13s',
                  } as React.CSSProperties}
                >
                  {formatTime(slot.time)}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
        <motion.button
          onClick={e => { e.stopPropagation(); onBack(); }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(168,85,247,0.35)', color: 'rgba(255,255,255,0.85)' }}
          whileTap={{ scale: 0.96 }}
          style={{ ...btnSecondary, position: 'relative', overflow: 'hidden' }}
        >
          <motion.span
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '55%', zIndex: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              pointerEvents: 'none',
            }}
            animate={{ x: ['-120%', '280%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
          />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ChevronLeft style={{ width: 13, height: 13 }} />
            Indietro
          </span>
        </motion.button>
        <PrimaryButton disabled={!canNext} onClick={() => { if (canNext) onNext(); }}>
          Avanti <ChevronRight style={{ width: 14, height: 14 }} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
//  STEP 2 — BACK
// ============================================================================

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
  thursday: 'Gio', friday: 'Ven', saturday: 'Sab', sunday: 'Dom',
};

export function Step2Back({ business, hours, onFlip }: { business: BookingBusiness; hours: BookingHours[]; onFlip: () => void }) {
  const addr = [business.address_street, business.address_city, business.address_province].filter(Boolean).join(', ');
  const mapsUrl = addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : null;

  const sortedHours = DAY_ORDER_FULL.map(day => hours.find(h => h.day_of_week === day)).filter(Boolean) as BookingHours[];

  return (
    <div style={{ ...cardPad, height: '100%', boxSizing: 'border-box', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(76,29,149,0.25), rgba(30,10,60,0.2))' }}>
      <div style={backHeaderStyle}>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle}>
          <ArrowLeft style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
        </button>
        <h3 style={backTitleStyle}>Informazioni utili</h3>
      </div>

      {/* Cancellation policy */}
      {business.cancellation_policy_hours != null && (
        <div style={{ marginBottom: 12, padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ ...labelStyle, marginBottom: 4 }}>Cancellazione</p>
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            Puoi cancellare fino a <strong style={{ color: '#a855f7' }}>{business.cancellation_policy_hours}h</strong> prima dell&apos;appuntamento.
          </p>
        </div>
      )}

      {/* Address + Phone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {mapsUrl && addr && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', alignItems: 'flex-start' }}>
              <MapPin style={{ width: 13, height: 13, color: '#a855f7', flexShrink: 0, marginTop: 1 }} />
              <span style={{ ...bodyTextStyle, color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem' }}>{addr}</span>
            </div>
          </a>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', alignItems: 'center' }}>
              <Phone style={{ width: 13, height: 13, color: '#a855f7', flexShrink: 0 }} />
              <span style={{ ...bodyTextStyle, color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.76rem' }}>{business.phone}</span>
            </div>
          </a>
        )}
      </div>

      {/* Weekly hours */}
      {sortedHours.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Clock style={{ width: 12, height: 12, color: '#a855f7' }} />
            <p style={{ ...labelStyle, margin: 0 }}>Orari</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {sortedHours.map(h => (
              <div key={h.day_of_week} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: h.is_open ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)', width: 28 }}>
                  {DAY_LABELS[h.day_of_week] ?? h.day_of_week.slice(0, 3)}
                </span>
                <span style={{ fontSize: '0.7rem', color: h.is_open ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)' }}>
                  {h.is_open ? 'Aperto' : 'Chiuso'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ──────────────────────────────────────────────────────────────────────────
//  STEP 3 — FRONT: Conferma
// ──────────────────────────────────────────────────────────────────────────
// ============================================================================

interface Step3FrontProps {
  business:     BookingBusiness;
  staff:        BookingStaff[];
  bookingState: BookingState;
  onUpdate:     (patch: Partial<BookingState>) => void;
  onBack:       () => void;
  onConfirm:    () => void;
  onFlip:       () => void;
  isSubmitting: boolean;
}

export function Step3Front({ business, staff: _staff, bookingState, onUpdate, onBack, onConfirm, onFlip, isSubmitting }: Step3FrontProps) {
  const { selectedService, selectedStaff, selectedDate, selectedTime, autoAssignedStaff } = bookingState;

  // Shown staff: explicit selection → autoAssigned → null
  const displayStaff = selectedStaff ?? autoAssignedStaff;

  const dateLabel = selectedDate?.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) ?? '—';

  const endTimeLabel = (() => {
    if (!selectedTime || !selectedService) return '';
    const [h, m] = selectedTime.split(':').map(Number);
    const end = new Date(0, 0, 0, h, m + selectedService.duration_minutes);
    return `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;
  })();

  const initials = displayStaff?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '';

  return (
    <div style={{ ...cardPad, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>Conferma</h3>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle} aria-label="Info">
          <HelpCircle style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      {/* Staff display — always a specific person when available */}
      {displayStaff ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
          {displayStaff.avatar_url ? (
            <img src={displayStaff.avatar_url} alt={displayStaff.full_name}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(168,85,247,0.4)', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              border: '2px solid rgba(168,85,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 800, color: '#fff',
            }}>{initials}</div>
          )}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{displayStaff.full_name}</div>
            {displayStaff.specializations?.[0] && (
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{displayStaff.specializations[0]}</div>
            )}
          </div>
        </div>
      ) : null}

      <div style={{ ...dividerStyle, margin: '7px 0' }} />

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: '3px 0' }}>
        {[
          { icon: <Scissors style={{ width: 12, height: 12, color: '#a855f7' }} />, value: selectedService?.name ?? '—' },
          { icon: <Calendar style={{ width: 12, height: 12, color: '#a855f7' }} />, value: dateLabel },
          { icon: <Clock    style={{ width: 12, height: 12, color: '#a855f7' }} />, value: selectedTime ? `${formatTime(selectedTime)}${endTimeLabel ? ` → ${endTimeLabel}` : ''}` : '—' },
          { icon: <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 800 }}>€</span>,
            value: selectedService ? (selectedService.price_from ? `Da €${selectedService.price.toFixed(0)}` : `€${selectedService.price.toFixed(0)}`) : '—' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
              background: 'rgba(168,85,247,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{row.icon}</div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.3 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ ...dividerStyle, margin: '7px 0' }} />

      {/* Notes */}
      <textarea
        value={bookingState.customerNotes}
        onChange={e => onUpdate({ customerNotes: e.target.value })}
        onClick={e => e.stopPropagation()}
        placeholder="Note per il professionista (opzionale)"
        maxLength={1000}
        rows={2}
        style={{
          width: '100%', borderRadius: 10, padding: '8px 11px', marginTop: 3,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#fff', fontSize: '0.76rem', resize: 'none',
          outline: 'none', boxSizing: 'border-box',
          fontFamily: 'inherit', lineHeight: 1.5,
        } as React.CSSProperties}
      />
      <div style={{ textAlign: 'right', fontSize: '0.68rem', marginTop: 3, color: (bookingState.customerNotes?.length ?? 0) >= 1000 ? '#ef4444' : 'rgba(255,255,255,0.35)' }}>
        {bookingState.customerNotes?.length ?? 0}/1000
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 7 }}>
        <PrimaryButton disabled={isSubmitting} onClick={onConfirm}>
          {isSubmitting ? (
            <>
              <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
              Prenotazione in corso…
            </>
          ) : (
            <>
              <CheckCircle style={{ width: 14, height: 14 }} />
              Conferma prenotazione
            </>
          )}
        </PrimaryButton>
        <motion.button
          onClick={e => { e.stopPropagation(); onBack(); }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(168,85,247,0.35)', color: 'rgba(255,255,255,0.85)' }}
          whileTap={{ scale: 0.96 }}
          style={{ ...btnSecondary, position: 'relative', overflow: 'hidden' }}
        >
          <motion.span
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '55%', zIndex: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              pointerEvents: 'none',
            }}
            animate={{ x: ['-120%', '280%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
          />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
            Indietro
          </span>
        </motion.button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================================
//  STEP 3 — BACK
// ============================================================================

export function Step3Back({ onFlip }: { onFlip: () => void }) {
  return (
    <div style={{ ...cardPad, height: '100%', boxSizing: 'border-box', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(76,29,149,0.25), rgba(30,10,60,0.2))' }}>
      <div style={backHeaderStyle}>
        <button onClick={e => { e.stopPropagation(); onFlip(); }} style={flipBtnStyle}>
          <ArrowLeft style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
        </button>
        <h3 style={backTitleStyle}>Cosa succede dopo?</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          {
            icon: <Bell style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Conferma immediata',
            desc: 'Ricevi una notifica di conferma non appena la prenotazione viene creata.',
          },
          {
            icon: <Clock style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Promemoria 24h prima',
            desc: 'Ti ricordiamo il giorno prima così non dimentichi il tuo appuntamento.',
          },
          {
            icon: <User style={{ width: 15, height: 15, color: '#a855f7' }} />,
            title: 'Gestisci dalla tua area',
            desc: 'Puoi cancellare o modificare in qualsiasi momento dalla sezione Account.',
          },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.title}</div>
              <div style={bodyTextStyle}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...dividerStyle, margin: '16px 0 12px' }} />
      <p style={{ ...bodyTextStyle, margin: 0, fontSize: '0.76rem', lineHeight: 1.6 }}>
        Puoi cancellare o modificare l&apos;appuntamento in qualsiasi momento dalla sezione <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Account</strong>.
      </p>
    </div>
  );
}
