// ============================================================================
// AEGIS BEAUTY - BUSINESS CONTENT (Client Component)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/BusinessContent.tsx
// Hero · Servizi · Staff · Chi siamo · Footer — Skill 1: Ultra-Futuristic
// ============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring, useInView, useTransform } from 'framer-motion';
import { MapPin, Phone, Clock, ChevronRight, ChevronLeft, Zap, BellRing, CalendarCheck } from 'lucide-react';
import { ServiceCard, StaffCard, beautyTheme } from '@aegis/ui';
import type { Business, Service, Staff, BusinessHours, DayOfWeek, ServiceCategory } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

interface BusinessContentProps {
  business: Business;
  services: Service[];
  staff: Staff[];
  hours: BusinessHours[];
  categories: ServiceCategory[];
}

// ============================================================================
// HELPERS
// ============================================================================

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday:    'Lunedì',
  tuesday:   'Martedì',
  wednesday: 'Mercoledì',
  thursday:  'Giovedì',
  friday:    'Venerdì',
  saturday:  'Sabato',
  sunday:    'Domenica',
};

const DAY_ORDER: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

function formatTime(t: string | null): string {
  if (!t) return '';
  return t.slice(0, 5);
}

function getAddress(b: Business): string | null {
  const parts = [b.address_street, b.address_city, b.address_province].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function getGoogleMapsUrl(b: Business): string {
  const addr = getAddress(b);
  if (!addr) return '#';
  return `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
}

function staffGridColumns(count: number, isMobile: boolean): string {
  if (count === 1) return '1fr';
  if (isMobile) return 'repeat(auto-fill, minmax(140px, 1fr))';
  if (count === 2) return 'repeat(2, minmax(0, 220px))';
  if (count === 3) return 'repeat(3, minmax(0, 220px))';
  return 'repeat(auto-fill, minmax(180px, 220px))';
}

// ============================================================================
// SCROLL PROGRESS BAR
// ============================================================================

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #9333ea, #a855f7, #7c3aed)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 9999,
      }}
    />
  );
}

// ============================================================================
// SECTION HEADER — barra animata su scroll
// ============================================================================

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ marginBottom: 36, textAlign: 'center' }}
    >
      {badge && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 100, padding: '4px 14px', marginBottom: 12,
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {badge}
          </span>
        </div>
      )}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '0.88rem', color: '#9ca3af', margin: '0 0 12px' }}>{subtitle}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? 40 : 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          style={{
            height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg, #9333ea, #7c3aed)',
          }}
        />
      </div>
    </motion.div>
  );
}

// ============================================================================
// SHIMMER BUTTON — identico bottoni dashboard
// ============================================================================

function BookButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <style>{`
        @keyframes book-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-flex', zIndex: 2 }}>
        {/* Pulse ring */}
        <span style={{
          position: 'absolute', inset: -4, borderRadius: 18,
          border: '2px solid rgba(255,255,255,0.5)',
          animation: 'pulse-ring 2.2s ease-out infinite',
          pointerEvents: 'none',
        }} />

        <motion.button
          variants={{
            rest:  { scale: 1,    boxShadow: '0 0 30px rgba(124,58,237,0.45), 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' },
            hover: { scale: 1.04, boxShadow: '0 0 50px rgba(124,58,237,0.65), 0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' },
            tap:   { scale: 0.97 },
          }}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={onClick}
          style={{
            position: 'relative',
            padding: '17px 54px',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            overflow: 'hidden',
            letterSpacing: '0.02em',
          }}
        >
          {/* Shimmer sempre attivo */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
            animation: 'book-shimmer 2.5s ease-in-out infinite',
          }} />
          {/* Top glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12), transparent 60%)',
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>Prenota ora</span>
        </motion.button>
      </div>
    </>
  );
}

// ============================================================================
// SCROLL REVEAL — wrapper per stagger su scroll
// ============================================================================

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BusinessContent({ business, services, staff, hours, categories }: BusinessContentProps) {
  const router = useRouter();
  const slug   = business.slug;
  const pillsScrollRef = useRef<HTMLDivElement>(null);
  const [pillsCanScrollLeft, setPillsCanScrollLeft]   = useState(false);
  const [pillsCanScrollRight, setPillsCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  function updatePillsScroll() {
    const el = pillsScrollRef.current;
    if (!el) return;
    setPillsCanScrollLeft(el.scrollLeft > 4);
    setPillsCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scrollPills(direction: 'left' | 'right') {
    const el = pillsScrollRef.current;
    if (!el) return;
    const arrowW = 40; // space occupied by arrow button overlay
    const children = Array.from(el.children) as HTMLElement[];
    if (direction === 'right') {
      // Find first pill not fully visible on the right
      const next = children.find(c => c.offsetLeft + c.offsetWidth > el.scrollLeft + el.clientWidth - 4);
      if (next) {
        // Scroll so the pill appears fully, leaving room for the left arrow that will appear
        el.scrollTo({ left: next.offsetLeft - arrowW, behavior: 'smooth' });
      }
    } else {
      // Find last pill not fully visible on the left
      const prev = [...children].reverse().find(c => c.offsetLeft < el.scrollLeft + 4);
      if (prev) {
        // Scroll so the pill appears fully, leaving room for the right arrow that may be present
        const targetLeft = prev.offsetLeft + prev.offsetWidth + arrowW - el.clientWidth;
        el.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }
    }
  }

  // Categories with at least one service
  const visibleCategories = categories.filter(cat => services.some(s => s.category_id === cat.id));
  const uncategorized     = services.filter(s => !s.category_id || !categories.some(c => c.id === s.category_id));
  const hasCategories     = visibleCategories.length > 0;
  const pills = [
    ...visibleCategories.map(c => ({ id: c.id, name: c.name })),
    ...(uncategorized.length > 0 && hasCategories ? [{ id: '__other__', name: 'Altro' }] : []),
  ];

  const [activeCat, setActiveCat] = useState<string | null>(pills[0]?.id ?? null);

  const filteredServices = !hasCategories
    ? services
    : activeCat === '__other__'
      ? uncategorized
      : services.filter(s => s.category_id === activeCat);

  // Parallax hero
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 500], [0, -70]);

  // Floating CTA mobile
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { margin: '0px' });
  const footerRef = useRef<HTMLElement>(null);
  const footerInView = useInView(footerRef, { margin: '0px' });

  const heroGradient = business.primary_color && business.primary_color !== '#9333ea'
    ? `linear-gradient(135deg, ${business.primary_color}dd, ${business.primary_color}99)`
    : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 60%, #4c1d95 100%)';

  const initials = business.name.slice(0, 2).toUpperCase();
  const openDays = hours.filter(h => h.is_open);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
  const todayHours = hours.find(h => h.day_of_week === today);
  const isOpenToday = todayHours?.is_open ?? false;

  return (
    <>
      <style>{`
        @keyframes orb-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.06); }
          66%       { transform: translate(-25px, 20px) scale(0.94); }
        }
        @keyframes orb-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(-35px, 25px) scale(1.08); }
          66%       { transform: translate(30px, -20px) scale(0.96); }
        }
        @keyframes orb-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(20px, 30px) scale(1.05); }
        }
      `}</style>

      <ScrollProgressBar />

      <div style={{ minHeight: '100vh' }}>

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section ref={heroRef} style={{
          minHeight: '65vh',
          background: heroGradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: isMobile ? '48px 20px 44px' : '72px 24px 56px',
          textAlign: 'center',
          overflow: 'hidden',
        }}>

          {/* Orbs animati CSS — leggeri, GPU only */}
          <div style={{
            position: 'absolute', width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.48) 0%, transparent 70%)',
            top: '-20%', left: '-10%', pointerEvents: 'none',
            animation: 'orb-1 12s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 450, height: 450, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.42) 0%, transparent 70%)',
            bottom: '-15%', right: '-8%', pointerEvents: 'none',
            animation: 'orb-2 16s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,167,255,0.32) 0%, transparent 70%)',
            top: '40%', right: '20%', pointerEvents: 'none',
            animation: 'orb-3 10s ease-in-out infinite',
          }} />

          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Radial glow top */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.12), transparent)',
          }} />

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))',
          }} />

          {/* Parallax wrapper — solo transform/opacity, GPU only */}
          <motion.div style={{ y: heroParallaxY, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

          {/* Logo con glow pulsante */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ position: 'relative', zIndex: 2, marginBottom: 24 }}
          >
            {business.logo_url ? (
              <div style={{ position: 'relative' }}>
                {/* Glow pulsante */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', inset: -8, borderRadius: 34,
                    background: 'rgba(255,255,255,0.15)',
                    filter: 'blur(14px)',
                  }}
                />
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  width={148}
                  height={148}
                  style={{
                    borderRadius: 32,
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 16px 50px rgba(0,0,0,0.35)',
                    position: 'relative',
                  }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', inset: -8, borderRadius: 34,
                    background: 'rgba(255,255,255,0.12)',
                    filter: 'blur(14px)',
                  }}
                />
                <div style={{
                  position: 'relative',
                  width: 148, height: 148, borderRadius: 32,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                  border: '3px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.8rem', fontWeight: 800, color: '#fff',
                  boxShadow: '0 16px 50px rgba(0,0,0,0.28)',
                  backdropFilter: 'blur(8px)',
                }}>
                  {initials}
                </div>
              </div>
            )}
          </motion.div>

          {/* Business name */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.4rem)',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 10px',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
              letterSpacing: '-0.03em',
              position: 'relative', zIndex: 2,
            }}
          >
            {business.name}
          </motion.h1>

          {/* Description */}
          {(business.short_description || business.description) && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              style={{
                fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 500,
                margin: '0 0 36px',
                lineHeight: 1.65,
                position: 'relative', zIndex: 2,
              }}
            >
              {business.short_description ?? business.description}
            </motion.p>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <BookButton onClick={() => router.push(`/${slug}/prenota`)} />
          </motion.div>

          {/* Open status + days */}
          {openDays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: 22, zIndex: 2, position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              {/* Oggi aperto / chiuso badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 12px', borderRadius: 100,
                background: isOpenToday ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                border: `1px solid ${isOpenToday ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: isOpenToday ? '#10b981' : '#ef4444',
                  boxShadow: isOpenToday ? '0 0 6px rgba(16,185,129,0.8)' : '0 0 6px rgba(239,68,68,0.8)',
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isOpenToday ? '#6ee7b7' : '#fca5a5' }}>
                  {isOpenToday
                    ? `Oggi ${formatTime(todayHours?.open_time_1 ?? null)}–${formatTime(todayHours?.close_time_1 ?? null)}`
                    : 'Oggi chiuso'
                  }
                </span>
              </span>
              {/* Giorni totali */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500,
              }}>
                <Clock style={{ width: 11, height: 11 }} />
                {openDays.length === 7 ? 'Tutti i giorni' : `${openDays.length} giorni su 7`}
              </span>
            </motion.div>
          )}

          {/* Chiude parallax wrapper */}
          </motion.div>
        </section>

        {/* Floating CTA — mobile only, appare quando hero esce dal viewport */}
        <AnimatePresence>
          {!heroInView && !footerInView && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="lg:hidden flex justify-center"
              style={{
                position: 'fixed',
                bottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)',
                left: 0, right: 0,
                padding: '0 24px',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
              <div style={{ pointerEvents: 'all' }}>
                <BookButton onClick={() => router.push(`/${slug}/prenota`)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════ */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '36px 16px 0' : '56px 20px 0' }}>

          {/* ══ PERCHÉ PRENOTARE ONLINE — copy statico per tutti i business ══ */}
          <div style={{ marginBottom: 56 }}>
            <ScrollReveal>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 14px', borderRadius: 100,
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.22)',
                  color: '#9333ea', fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  marginBottom: 16,
                }}>
                  Perché sceglierci
                </span>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.55rem)', fontWeight: 800,
                  color: '#1a1a2e', margin: '0 0 10px', letterSpacing: '-0.02em',
                }}>
                  Il tuo appuntamento, a modo tuo.
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  Niente telefonate, niente attese. Solo pochi tap e sei a posto.
                </p>
              </div>
            </ScrollReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}>
              {([
                {
                  icon: Zap,
                  title: 'Prenota in 30 secondi',
                  desc: 'Scegli servizio, giorno e ora. Conferma immediata, zero stress.',
                  delay: 0,
                },
                {
                  icon: BellRing,
                  title: 'Promemoria automatico',
                  desc: 'Ti avvisiamo il giorno prima. Non dimentichi più nessun appuntamento.',
                  delay: 0.1,
                },
                {
                  icon: CalendarCheck,
                  title: 'Tutto in un posto',
                  desc: 'Storico, prossimi appuntamenti e disdette — sempre con te.',
                  delay: 0.2,
                },
              ] as const).map((item) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={item.delay}>
                    <div
                      style={{
                        padding: 28,
                        borderRadius: 20,
                        background: 'rgba(124,58,237,0.04)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(124,58,237,0.12)',
                        boxShadow: '0 0 0 1px rgba(124,58,237,0.06), 0 8px 24px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
                        cursor: 'default',
                        height: '100%',
                        boxSizing: 'border-box' as const,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 1px rgba(124,58,237,0.22), 0 20px 48px rgba(124,58,237,0.1), 0 8px 24px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 1px rgba(124,58,237,0.06), 0 8px 24px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(124,58,237,0.12)',
                        border: '1px solid rgba(168,85,247,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 18,
                      }}>
                        <Icon style={{ width: 22, height: 22, color: '#a855f7' }} />
                      </div>
                      <h4 style={{
                        fontSize: '1rem', fontWeight: 700, color: '#1a1a2e',
                        margin: '0 0 10px', letterSpacing: '-0.01em', lineHeight: 1.3,
                      }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* SERVIZI */}
          {services.length > 0 && (
            <section style={{ marginBottom: 64 }}>
              <SectionHeader
                badge="I nostri servizi"
                title="Cosa offriamo"
                subtitle={`${services.length} trattament${services.length === 1 ? 'o' : 'i'} disponibil${services.length === 1 ? 'e' : 'i'}`}
              />

              {/* Category pills */}
              {hasCategories && pills.length > 1 && (
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <div
                    ref={pillsScrollRef}
                    onScroll={updatePillsScroll}
                    style={{
                      display: 'flex', gap: 8, overflowX: 'auto',
                      paddingBottom: 4,
                      scrollbarWidth: 'none', msOverflowStyle: 'none',
                    }}
                  >
                    {pills.map(pill => {
                      const isActive = activeCat === pill.id;
                      return (
                        <motion.button
                          key={pill.id}
                          onClick={() => setActiveCat(pill.id)}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            flexShrink: 0, padding: '8px 20px', borderRadius: 100, border: 'none',
                            cursor: 'pointer', fontWeight: isActive ? 700 : 500, fontSize: '0.82rem',
                            background: isActive ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'rgba(0,0,0,0.05)',
                            color: isActive ? '#fff' : '#6b7280',
                            transition: 'background 0.2s, color 0.2s',
                          }}
                        >
                          {pill.name}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Freccia sinistra — visibile solo se si può scrollare a sinistra */}
                  <AnimatePresence>
                    {pillsCanScrollLeft && (
                      <motion.div
                        key="scroll-left"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', left: 0, top: 0, bottom: 4, width: 52,
                          background: 'linear-gradient(to left, transparent, #f9f8fd 55%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                          pointerEvents: 'none',
                        }}
                      >
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => scrollPills('left')}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                            background: 'rgba(147,51,234,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'all',
                          }}
                        >
                          <ChevronLeft style={{ width: 14, height: 14, color: '#9333ea' }} />
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Freccia destra — visibile solo se si può scrollare a destra */}
                  <AnimatePresence>
                    {pillsCanScrollRight && (
                      <motion.div
                        key="scroll-right"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', right: 0, top: 0, bottom: 4, width: 52,
                          background: 'linear-gradient(to right, transparent, #f9f8fd 55%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          pointerEvents: 'none',
                        }}
                      >
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => scrollPills('right')}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                            background: 'rgba(147,51,234,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'all',
                          }}
                        >
                          <ChevronRight style={{ width: 14, height: 14, color: '#9333ea' }} />
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Services list card */}
              <ScrollReveal>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCat ?? 'all'}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                    style={{
                      background: '#fff',
                      borderRadius: 20,
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
                      padding: '0 22px',
                    }}
                  >
                    {filteredServices.map((s, i) => (
                      <ServiceCard
                        key={s.id}
                        service={s}
                        theme={beautyTheme}
                        onBook={(id) => router.push(`/${slug}/prenota?service=${id}`)}
                        index={i}
                        isLast={i === filteredServices.length - 1}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </ScrollReveal>
            </section>
          )}

          {/* TEAM — nascosto se è solo una persona (il titolare) */}
          {staff.length > 1 && (
            <section style={{ marginBottom: 64 }}>
              <SectionHeader
                badge="Il nostro team"
                title="I tuoi esperti"
                subtitle={staff.length === 1 ? 'Il tuo esperto di fiducia' : `${staff.length} professionisti a tua disposizione`}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: staffGridColumns(staff.length, isMobile),
                gap: 16,
                justifyContent: 'center',
              }}>
                {staff.map((m, i) => (
                  <ScrollReveal key={m.id} delay={Math.min(i * 0.08, 0.3)}>
                    <StaffCard
                      staff={m}
                      theme={beautyTheme}
                      onBook={(id) => router.push(`/${slug}/prenota?staff=${id}`)}
                      index={i}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {/* CHI SIAMO */}
          <section style={{ marginBottom: 64 }}>
            <SectionHeader badge="Chi siamo" title="La nostra storia" />

            <ScrollReveal>
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03), 0 8px 32px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}>
                {/* Accent top bar */}
                <div style={{
                  height: 4,
                  background: 'linear-gradient(90deg, #9333ea, #7c3aed, #6d28d9)',
                }} />

                <div style={{ padding: isMobile ? '20px 16px 20px' : '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* Description */}
                  {business.description && (
                    <ScrollReveal delay={0.05}>
                      <div style={{
                        position: 'relative',
                        paddingLeft: 20,
                        borderLeft: '3px solid rgba(147,51,234,0.2)',
                      }}>
                        <p style={{
                          fontSize: '1rem',
                          color: '#374151',
                          lineHeight: 1.8,
                          margin: 0,
                          fontStyle: 'italic',
                        }}>
                          &ldquo;{business.description}&rdquo;
                        </p>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Info grid */}
                  {(getAddress(business) || business.phone) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 12,
                    }}>
                      {getAddress(business) && (
                        <ScrollReveal delay={0.1}>
                          <a href={getGoogleMapsUrl(business)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <motion.div
                              whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(147,51,234,0.1)' }}
                              transition={{ duration: 0.2 }}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                padding: '14px 16px', borderRadius: 14,
                                background: 'rgba(147,51,234,0.04)',
                                border: '1px solid rgba(147,51,234,0.08)',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: 'rgba(147,51,234,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <MapPin style={{ width: 18, height: 18, color: '#9333ea' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', marginBottom: 2 }}>INDIRIZZO</div>
                                <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.4 }}>{getAddress(business)}</div>
                              </div>
                            </motion.div>
                          </a>
                        </ScrollReveal>
                      )}

                      {business.phone && (
                        <ScrollReveal delay={0.15}>
                          <a href={`tel:${business.phone}`} style={{ textDecoration: 'none' }}>
                            <motion.div
                              whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(147,51,234,0.1)' }}
                              transition={{ duration: 0.2 }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '14px 16px', borderRadius: 14,
                                background: 'rgba(147,51,234,0.04)',
                                border: '1px solid rgba(147,51,234,0.08)',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: 'rgba(147,51,234,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Phone style={{ width: 18, height: 18, color: '#9333ea' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', marginBottom: 2 }}>TELEFONO</div>
                                <div style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600 }}>{business.phone}</div>
                              </div>
                            </motion.div>
                          </a>
                        </ScrollReveal>
                      )}
                    </div>
                  )}

                  {/* Business hours */}
                  {hours.length > 0 && (
                    <ScrollReveal delay={0.1}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            background: 'rgba(147,51,234,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Clock style={{ width: 16, height: 16, color: '#9333ea' }} />
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151' }}>Orari di apertura</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 0 }}>
                          {DAY_ORDER.map((day, i) => {
                            const h = hours.find((r) => r.day_of_week === day);
                            if (!h) return null;
                            const isToday = day === today;
                            return (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, x: -6 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.25, delay: i * 0.035 }}
                                style={{
                                  display: 'contents',
                                }}
                              >
                                <div style={{
                                  display: 'flex', alignItems: 'center',
                                  padding: '9px 10px 9px 10px',
                                  borderRadius: isToday ? '8px 0 0 8px' : 0,
                                  background: isToday ? 'rgba(147,51,234,0.04)' : 'transparent',
                                  borderBottom: i < DAY_ORDER.length - 1 ? '1px solid rgba(0,0,0,0.045)' : 'none',
                                }}>
                                  <span style={{
                                    fontSize: '0.83rem',
                                    fontWeight: isToday ? 700 : 500,
                                    color: isToday ? '#7c3aed' : h.is_open ? '#374151' : '#c4c4c4',
                                  }}>
                                    {DAY_LABELS[day]}{isToday && <span style={{ fontSize: '0.68rem', marginLeft: 5, opacity: 0.7 }}>oggi</span>}
                                  </span>
                                </div>
                                <div style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  padding: '9px 10px 9px 8px',
                                  borderRadius: isToday ? '0 8px 8px 0' : 0,
                                  background: isToday ? 'rgba(147,51,234,0.04)' : 'transparent',
                                  borderBottom: i < DAY_ORDER.length - 1 ? '1px solid rgba(0,0,0,0.045)' : 'none',
                                }}>
                                  {h.is_open ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.83rem', whiteSpace: 'nowrap' }}>
                                      <span style={{
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                      }}>
                                        {formatTime(h.open_time_1)} – {formatTime(h.close_time_1)}
                                      </span>
                                      {h.open_time_2 && h.close_time_2 && (
                                        <span style={{
                                          background: 'linear-gradient(135deg, #059669, #10b981)',
                                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                        }}>· {formatTime(h.open_time_2)} – {formatTime(h.close_time_2)}</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#d1d5db', fontSize: '0.83rem', fontWeight: 400 }}>Chiuso</span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer ref={footerRef} style={{
          textAlign: 'center',
          padding: '14px 24px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>
            Powered by{' '}
            <span style={{ color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }} onClick={() => router.push('/')}>Aegis Group</span>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }} onClick={() => router.push('/legal#privacy-customer')}>Privacy Policy</span>
            <span style={{ color: '#e5e7eb' }}>·</span>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }} onClick={() => router.push('/legal#terms-customer')}>Termini e Condizioni</span>
          </div>
        </footer>

      </div>
    </>
  );
}
