// ============================================================================
// AEGIS BEAUTY - PRENOTA CONTENT (Client)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/prenota/PrenotaContent.tsx
// Dark premium background + BookingCarousel + SuccessScreen
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingParticles, BookingCarousel } from '@aegis/ui';
import type { BookingState, FetchSlotsFn } from '@aegis/ui';
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
  customer:   Customer | null;
  categories: ServiceCategory[];
}

interface BookedSummary {
  serviceName: string;
  staffName:   string;
  date:        Date;
  time:        string;
  appointmentId: string;
}

// ============================================================================
// SUCCESS SCREEN
// ============================================================================

function SuccessScreen({ summary, slug }: { summary: BookedSummary; slug: string }) {
  const router = useRouter();

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
        justifyContent: 'center', textAlign: 'center', padding: '40px 24px',
        maxWidth: 420, margin: '0 auto',
      }}
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          width: 96, height: 96, borderRadius: '50%', marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(76,29,149,0.2))',
          border: '2px solid rgba(168,85,247,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(168,85,247,0.3)',
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <CheckCircle style={{ width: 48, height: 48, color: '#a855f7' }} />
        </motion.div>
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(168,85,247,0.3)', pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{
          fontSize: '1.6rem', fontWeight: 800, color: '#fff',
          margin: '0 0 8px', letterSpacing: '-0.02em',
        }}
      >
        Prenotazione confermata!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 32px' }}
      >
        Ti aspettiamo presto
      </motion.p>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        style={{
          width: '100%', borderRadius: 20, padding: '20px 24px', marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.1))',
          border: '1px solid rgba(139,92,246,0.3)',
          backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar style={{ width: 15, height: 15, color: '#a855f7' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
            {dateLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock style={{ width: 15, height: 15, color: '#a855f7' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
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
        transition={{ delay: 0.55, duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}
      >
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(168,85,247,0.45)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/${slug}/account`)}
          style={{
            padding: '14px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          Vedi i miei appuntamenti
          <ArrowRight style={{ width: 16, height: 16 }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/${slug}`)}
          style={{
            padding: '13px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.9rem',
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

export function PrenotaContent({ business, services, staff, hours, customer: _customer, categories }: PrenotaContentProps) {
  const [booked, setBooked] = useState<BookedSummary | null>(null);

  const fetchSlots: FetchSlotsFn = async ({ businessId, serviceId, staffId, date }) => {
    const params = new URLSearchParams({ businessId, serviceId, date });
    if (staffId) params.set('staffId', staffId);
    const r = await fetch(`/api/bookings/slots?${params}`);
    const d = await r.json() as { slots?: { time: string }[] };
    return d.slots ?? [];
  };

  async function handleConfirm(state: BookingState): Promise<void> {
    if (!state.selectedService || !state.selectedDate || !state.selectedTime) return;

    const dateStr = state.selectedDate.toISOString().split('T')[0];

    // If no preference selected, use the pre-assigned staff id (if any) to ensure consistency
    const resolvedStaffId = state.selectedStaff?.id ?? state.autoAssignedStaff?.id ?? null;

    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId:    business.id,
        serviceId:     state.selectedService.id,
        staffId:       resolvedStaffId,
        date:          dateStr,
        time:          state.selectedTime,
        customerNotes: state.customerNotes || undefined,
      }),
    });

    const data = await res.json() as { success?: boolean; appointmentId?: string; error?: string };

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? 'Errore nella prenotazione');
    }

    setBooked({
      serviceName:   state.selectedService.name,
      staffName:     state.selectedStaff?.full_name ?? '',
      date:          state.selectedDate,
      time:          state.selectedTime,
      appointmentId: data.appointmentId!,
    });

    toast.success('Prenotazione confermata!');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background particles (reduced opacity for dark theme) */}
      <div style={{ opacity: 0.45, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FloatingParticles />
      </div>

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
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 16px' }}>
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
                categories={categories}
                fetchSlots={fetchSlots}
                onConfirm={handleConfirm}
                onError={msg => toast.error(msg)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
