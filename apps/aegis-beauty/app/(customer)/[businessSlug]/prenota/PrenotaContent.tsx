// ============================================================================
// AEGIS BEAUTY - PRENOTA CONTENT (Client)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/prenota/PrenotaContent.tsx
// Dark premium background + BookingCarousel + SuccessScreen
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingParticles, BookingCarousel } from '@aegis/ui';
import type { BookingState, BookingClosure, FetchSlotsFn } from '@aegis/ui';
import { NotificationEnablePrompt } from '@/components/NotificationEnablePrompt';
import type { Business, Service, Staff, BusinessHours, Customer, ServiceCategory } from '@aegis/types';

// Re-export so page.tsx / other files can still import from here if needed
export type { BookingState };

// ============================================================================
// TYPES
// ============================================================================

interface PrenotaContentProps {
  business:   Business;
  services:   Service[];
  staff:      Staff[];
  hours:      BusinessHours[];
  closures:   BookingClosure[];
  customer:   Customer | null;
  categories: ServiceCategory[];
}

interface BookedSummary {
  serviceName:  string;
  staffName:    string;
  date:         Date;
  time:         string;
  appointmentId: string;
  businessName: string;
  durationMinutes: number;
}

// ============================================================================
// SUCCESS SCREEN
// ============================================================================

function formatIcsDate(date: Date, timeStr: string, offsetMinutes = 0): string {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m + offsetMinutes, 0, 0);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildGoogleCalUrl(summary: BookedSummary): string {
  const start = formatIcsDate(summary.date, summary.time);
  const end   = formatIcsDate(summary.date, summary.time, summary.durationMinutes);
  const text  = encodeURIComponent(`${summary.serviceName} — ${summary.businessName}`);
  const details = encodeURIComponent(summary.staffName ? `con ${summary.staffName}` : '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
}

// Link all'endpoint /api/ics: serve il file con i promemoria incorporati e apre
// il calendario nativo preimpostato su iPhone, Android e desktop (responsive ovunque).
function buildIcsUrl(summary: BookedSummary): string {
  const params = new URLSearchParams({
    title:   `${summary.serviceName} — ${summary.businessName}`,
    start:   formatIcsDate(summary.date, summary.time),
    end:     formatIcsDate(summary.date, summary.time, summary.durationMinutes),
    details: summary.staffName ? `con ${summary.staffName}` : '',
    uid:     `${summary.appointmentId}@aegisbeauty.app`,
  });
  return `/api/ics?${params.toString()}`;
}

function SuccessScreen({ summary, slug }: { summary: BookedSummary; slug: string }) {
  const router = useRouter();
  // Dopo la prenotazione mostriamo SOLO il banner notifiche.
  // L'install PWA arriva dopo, su home/account (gestito da CustomerLayoutWrapper),
  // così non si accavalla con l'attivazione notifiche.
  return (
    <>
      <NotificationEnablePrompt />
      <SuccessScreenContent summary={summary} slug={slug} router={router} />
    </>
  );
}

function SuccessScreenContent({ summary, slug, router }: { summary: BookedSummary; slug: string; router: ReturnType<typeof useRouter> }) {

  const dateLabel = summary.date.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '20px 20px',
        maxWidth: 420, margin: '0 auto',
      }}
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          width: 72, height: 72, borderRadius: '50%', marginBottom: 14,
          background: 'linear-gradient(145deg, rgba(16,185,129,0.88), rgba(5,150,105,0.80))',
          border: '2px solid rgba(16,185,129,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(16,185,129,0.45), 0 8px 32px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          position: 'relative',
        }}
      >
        {/* Inner shimmer */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <CheckCircle style={{ width: 36, height: 36, color: '#fff' }} />
        </motion.div>
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(16,185,129,0.4)', pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{
          fontSize: '1.3rem', fontWeight: 800, color: '#fff',
          margin: '0 0 6px', letterSpacing: '-0.02em',
        }}
      >
        Prenotazione confermata!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 14px' }}
      >
        Ti aspettiamo presto
      </motion.p>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        style={{
          width: '100%', borderRadius: 16, padding: '14px 18px', marginBottom: 12,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.1))',
          border: '1px solid rgba(139,92,246,0.3)',
          backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar style={{ width: 14, height: 14, color: '#a855f7' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600 }}>
            {dateLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock style={{ width: 14, height: 14, color: '#a855f7' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600 }}>
            {summary.time} · {summary.serviceName}
          </span>
        </div>
        {summary.staffName && (
          <div style={{
            paddingTop: 8, marginTop: 4,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem',
          }}>
            con {summary.staffName}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
      >
        {/* AZIONE PRINCIPALE: aggiungi al calendario — il promemoria arriva da lì */}
        <a
          href={buildIcsUrl(summary)}
          style={{
            padding: '15px 20px', borderRadius: 14, textDecoration: 'none',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 22px rgba(124,58,237,0.45)',
          }}
        >
          <Calendar style={{ width: 17, height: 17, flexShrink: 0 }} />
          Aggiungi al calendario
        </a>
        <p style={{ margin: '2px 4px 4px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.45 }}>
          Ricevi il promemoria e non te lo dimentichi. Funziona su iPhone, Android e PC.
        </p>

        {/* Alternativa Google Calendar (per chi lo preferisce) */}
        <a
          href={buildGoogleCalUrl(summary)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '10px 20px', borderRadius: 14, textDecoration: 'none',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', fontSize: '0.83rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Calendar style={{ width: 14, height: 14, flexShrink: 0 }} />
          Usi Google Calendar? Aggiungi qui
        </a>

        {/* Secondaria: vai agli appuntamenti */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/${slug}/account`)}
          style={{
            padding: '11px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Vedi i miei appuntamenti
          <ArrowRight style={{ width: 15, height: 15 }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/${slug}`)}
          style={{
            padding: '10px 20px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          Torna alla home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PrenotaContent({ business, services, staff, hours, closures, customer: _customer, categories }: PrenotaContentProps) {
  const [booked, setBooked]  = useState<BookedSummary | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams         = useSearchParams();
  const isReschedule         = !!searchParams.get('reschedule');
  const rescheduleServiceId  = searchParams.get('service');
  const initialService       = rescheduleServiceId ? (services.find(s => s.id === rescheduleServiceId) ?? null) : null;
  const initialStep          = isReschedule && initialService ? 1 : 0;

  // Detect mobile viewport (< 1024px = layout shows mobile header + bottom nav)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // Always lock page scroll — prenota and SuccessScreen are both self-contained containers
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, []);

  const fetchSlots = useCallback<FetchSlotsFn>(async ({ businessId, serviceId, staffId, date }) => {
    const params = new URLSearchParams({ businessId, serviceId, date });
    if (staffId) params.set('staffId', staffId);
    const r = await fetch(`/api/bookings/slots?${params}`);
    const d = await r.json() as { slots?: { time: string }[] };
    return d.slots ?? [];
  }, []);

  const handleConfirm = useCallback(async function(state: BookingState): Promise<void> {
    if (!state.selectedService || !state.selectedDate || !state.selectedTime) {
      toast.error('Seleziona servizio, data e orario prima di confermare.');
      return;
    }

    // Use local date parts to avoid UTC offset shifting the date (e.g. UTC+2 midnight → previous day in ISO)
    const d = state.selectedDate;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Explicit operator → send it. "Qualsiasi" → send null so the SERVER picks a
    // free operator at confirm time (robust if the pre-shown one got booked meanwhile).
    const resolvedStaffId = state.selectedStaff?.id ?? null;

    // Reschedule: the original appointment id (will be cancelled atomically by the API)
    const rescheduleId = searchParams.get('reschedule') || undefined;

    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId:     business.id,
        serviceId:      state.selectedService.id,
        staffId:        resolvedStaffId,
        date:           dateStr,
        time:           state.selectedTime,
        customerNotes:  state.customerNotes || undefined,
        includeShampoo: state.includeShampoo,
        rescheduleId,
      }),
    });

    const data = await res.json() as { success?: boolean; appointmentId?: string; error?: string };

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? 'Errore nella prenotazione');
    }

    setBooked({
      serviceName:     state.selectedService.name,
      staffName:       state.selectedStaff?.full_name ?? '',
      date:            state.selectedDate,
      time:            state.selectedTime,
      appointmentId:   data.appointmentId!,
      businessName:    business.name,
      durationMinutes: state.selectedService.duration_minutes,
    });

    // Sblocca il prompt install PWA su home/account (gestito da CustomerLayoutWrapper).
    try { localStorage.setItem('aegis_has_booked', 'true'); } catch { /* ignore */ }

    toast.success(isReschedule ? 'Appuntamento spostato!' : 'Prenotazione confermata!');
  }, [business, searchParams, isReschedule]);

  // Fixed height = viewport minus bottom nav on mobile.
  // overflow: auto when booked lets SuccessScreen scroll inside the dark container (no light bg strip).
  const outerHeight = isMobile
    ? 'calc(100dvh - 60px - env(safe-area-inset-bottom, 0px))'
    : '100dvh';

  return (
    <div style={{
      height: outerHeight,
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* FloatingParticles a opacity piena — identico al marketing Hero */}
      <FloatingParticles />

      {/* Extra glow orbs — più intensi per il tema dark */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        top: '-15%', left: '-10%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
        bottom: '-10%', right: '-8%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 16px 0' : '0 16px 40px' }}>
        <AnimatePresence mode="wait">
          {booked ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SuccessScreen summary={booked} slug={business.slug} />
            </motion.div>
          ) : (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
            >
              <BookingCarousel
                business={business}
                services={services}
                staff={staff}
                hours={hours}
                closures={closures}
                categories={categories}
                fetchSlots={fetchSlots}
                onConfirm={handleConfirm}
                onError={msg => toast.error(msg)}
                initialStep={initialStep}
                initialService={initialService}
                isReschedule={isReschedule}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
