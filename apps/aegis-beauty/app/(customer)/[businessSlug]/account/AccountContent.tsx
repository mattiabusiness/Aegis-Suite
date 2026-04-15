// ============================================================================
// AEGIS BEAUTY - ACCOUNT CONTENT (Client Component)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/account/AccountContent.tsx
// 3 tab: Appuntamenti · Profilo · Altro — Skill 1: Ultra-Futuristic UI
// ============================================================================

'use client';

import React, { useState, useId, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarDays,
  User,
  MoreHorizontal,
  Bell,
  HelpCircle,
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Shield,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Clock,
  Trash2,
  Phone,
  Mail,
  RefreshCw,
  X,
  Key,
  Users,
} from 'lucide-react';
import { createClient } from '@aegis/core';
import { AppointmentCard, beautyTheme } from '@aegis/ui';
import type { Business, Customer, Profile } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

interface AccountContentProps {
  business: Business;
  customer: Customer | null;
  profile: Profile | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upcoming: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  past: any[];
  userId: string;
  userEmail: string;
}

type Tab = 'appointments' | 'profile' | 'other';

// ============================================================================
// TABS CONFIG
// ============================================================================

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
  { id: 'profile',      label: 'Profilo',       icon: User },
  { id: 'other',        label: 'Altro',          icon: MoreHorizontal },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 18 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
};

const fieldContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ============================================================================
// CSS KEYFRAMES
// ============================================================================

const KEYFRAMES = `
@keyframes book-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes pulse-ring {
  0%   { transform: scale(1);    opacity: 0.5; }
  100% { transform: scale(1.4);  opacity: 0; }
}
@keyframes acct-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(12px, -16px) scale(1.05); }
}
@keyframes hp-fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ============================================================================
// AVATAR INITIALS
// ============================================================================

function Avatar({ name, size = 54 }: { name: string; size?: number }) {
  const initials = name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #9333ea, #7e22ce)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0,
      boxShadow: '0 4px 20px rgba(147,51,234,0.35)',
    }}>
      {initials}
    </div>
  );
}

// ============================================================================
// GLASS INPUT — stile identico a SettingsPage dashboard
// ============================================================================

function GlassInput({ label, type = 'text', placeholder, value, onChange, hint, disabled }: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  return (
    <div style={{ width: '100%' }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '0.69rem', fontWeight: 600,
        color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: '0.88rem',
          color: '#1a1a2e', outline: 'none', boxSizing: 'border-box',
          background: disabled ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          cursor: disabled ? 'not-allowed' : undefined, opacity: disabled ? 0.6 : 1,
        }}
      />
      {hint && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.71rem', color: '#9ca3af', marginTop: 4 }}>
          <Info style={{ width: 11, height: 11, flexShrink: 0 }} />{hint}
        </span>
      )}
    </div>
  );
}

function GlassTextarea({ label, placeholder, value, onChange, rows = 4, maxLength }: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  return (
    <div style={{ width: '100%' }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '0.69rem', fontWeight: 600,
        color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</label>
      <textarea
        id={id} placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        maxLength={maxLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: '0.88rem',
          color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
          border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
      {maxLength && (
        <div style={{ textAlign: 'right', fontSize: '0.70rem', marginTop: 4, color: value.length >= maxLength ? '#ef4444' : '#9ca3af' }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

function GlassPasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div style={{ width: '100%' }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '0.69rem', fontWeight: 600,
        color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '11px 40px 11px 14px', borderRadius: 12, fontSize: '0.88rem',
            color: '#1a1a2e', outline: 'none', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
        <button type="button" onClick={() => setShow((v) => !v)} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          {show ? <EyeOff style={{ width: 15, height: 15, color: '#9ca3af' }} /> : <Eye style={{ width: 15, height: 15, color: '#9ca3af' }} />}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// BOOK BUTTON — identico a BusinessContent
// ============================================================================

function BookButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', zIndex: 2 }}>
      <span style={{
        position: 'absolute', inset: -4, borderRadius: 18,
        border: '2px solid rgba(147,51,234,0.35)',
        animation: 'pulse-ring 2.2s ease-out infinite', pointerEvents: 'none',
      }} />
      <motion.button
        variants={{
          rest:  { scale: 1,    boxShadow: '0 4px 20px rgba(147,51,234,0.4)' },
          hover: { scale: 1.04, boxShadow: '0 0 36px rgba(147,51,234,0.65), 0 8px 24px rgba(0,0,0,0.18)' },
          tap:   { scale: 0.97 },
        }}
        initial="rest" animate="rest" whileHover="hover" whileTap="tap"
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={onClick}
        style={{
          position: 'relative', padding: '14px 40px',
          background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
          color: '#fff', fontWeight: 700, fontSize: '0.95rem',
          borderRadius: 14, border: 'none', cursor: 'pointer', overflow: 'hidden', letterSpacing: '0.02em',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          animation: 'book-shimmer 2.5s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12), transparent 60%)',
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>Prenota ora</span>
      </motion.button>
    </div>
  );
}

// ============================================================================
// SECTION CARD
// ============================================================================

function SectionCard({ title, subtitle, children }: {
  title?: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={itemVariants}
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)',
        padding: '22px 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.9) inset',
      }}
    >
      {title && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.93rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '0.74rem', color: '#9ca3af', margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
}

// ============================================================================
// ICON TILE — gradient icon container stile dashboard settings
// ============================================================================

function IconTile({ icon: Icon, color = '#9333ea', bg = 'rgba(147,51,234,0.1)', border = 'rgba(147,51,234,0.18)' }: {
  icon: React.ElementType; color?: string; bg?: string; border?: string;
}) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
      background: `linear-gradient(135deg, ${bg}, ${bg.replace('0.1', '0.06')})`,
      border: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 2px 8px ${bg.replace('0.1', '0.12')}`,
    }}>
      <Icon style={{ width: 18, height: 18, color }} />
    </div>
  );
}

// ============================================================================
// SAVE BUTTON
// ============================================================================

function SaveButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <motion.button
      onClick={onClick} disabled={loading}
      whileHover={loading ? {} : { scale: 1.02, boxShadow: '0 6px 20px rgba(147,51,234,0.35)' }}
      whileTap={loading ? {} : { scale: 0.98 }}
      style={{
        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: '0.88rem', transition: 'background 0.2s',
        background: loading ? 'rgba(0,0,0,0.07)' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
        color: loading ? '#9ca3af' : '#fff',
        boxShadow: loading ? 'none' : '0 4px 14px rgba(147,51,234,0.3)',
      }}
    >
      {label}
    </motion.button>
  );
}

// ============================================================================
// CUSTOMER FAQ ACCORDION ITEM — matches dashboard HelpPage style
// ============================================================================

function CustomerFAQItem({ question, answer, icon: Icon, isOpen, onToggle, delay }: {
  question: string; answer: string; icon: React.ElementType;
  isOpen: boolean; onToggle: () => void; delay: number;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (isOpen && contentRef.current) setHeight(contentRef.current.scrollHeight);
    else setHeight(0);
  }, [isOpen, answer]);

  return (
    <div
      style={{
        background: isOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: isOpen ? '1.5px solid rgba(168,85,247,0.2)' : '1.5px solid rgba(0,0,0,0.06)',
        boxShadow: isOpen ? '0 8px 32px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.25s',
        animation: `hp-fadeUp 0.4s ease-out ${delay}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.12), 0 4px 16px rgba(147,51,234,0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
        }
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', outline: 'none',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isOpen ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(0,0,0,0.04)',
          boxShadow: isOpen ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}>
          <Icon style={{ width: 16, height: 16, color: isOpen ? '#fff' : '#9ca3af', transition: 'color 0.2s' }} />
        </div>
        <span style={{ flex: 1, fontSize: '0.86rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.35 }}>
          {question}
        </span>
        <ChevronDown style={{
          width: 16, height: 16, color: '#d1d5db', flexShrink: 0,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>
      <div
        ref={contentRef}
        style={{ overflow: 'hidden', maxHeight: height, transition: 'max-height 0.3s ease-out' }}
      >
        <p style={{ margin: 0, padding: '0 16px 14px 62px', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.65 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AccountContent({
  business, customer, profile, upcoming, past, userId, userEmail,
}: AccountContentProps) {
  const router   = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const slug     = business.slug;

  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [fullName, setFullName]   = useState(profile?.full_name ?? '');
  const [email,    setEmail]      = useState(profile?.email ?? userEmail ?? '');
  const [phone,    setPhone]      = useState(profile?.phone ?? '');
  const [prefs,    setPrefs]      = useState(customer?.preferences ?? '');
  const [saving,   setSaving]     = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw,  setSavingPw]  = useState(false);
  const [showHelp,     setShowHelp]     = useState(false);
  const [expandedFaq,  setExpandedFaq]  = useState<string | null>(null);

  const displayName = profile?.full_name ?? customer?.full_name ?? '';

  // ── Appointment actions ──────────────────────────────────────────────────

  const handleCancel = useCallback(async (appointmentId: string) => {
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      toast.error(data.error ?? "Impossibile cancellare l'appuntamento.");
    } else {
      toast.success('Appuntamento cancellato.');
      router.refresh();
    }
  }, [router]);

  const handleReschedule = useCallback((appointment: { id: string; appointment_services?: Array<{ service_id?: string | null; service_name: string }> }) => {
    const serviceId = appointment.appointment_services?.[0]?.service_id;
    const params = new URLSearchParams({ reschedule: appointment.id });
    if (serviceId) params.set('service', serviceId);
    router.push(`/${slug}/prenota?${params.toString()}`);
  }, [router, slug]);

  // ── Profile save ─────────────────────────────────────────────────────────

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const updates: Promise<unknown>[] = [
        sb.from('profiles').upsert({ id: userId, full_name: fullName, phone: phone || null, email }),
      ];
      if (email !== (profile?.email ?? userEmail)) {
        updates.push(supabase.auth.updateUser({ email }));
        toast.info('Controlla la tua nuova email per confermare il cambio.');
      }
      if (customer && prefs !== (customer as { preferences?: string }).preferences) {
        updates.push(sb.from('customers').update({ preferences: prefs }).eq('id', customer.id));
      }
      await Promise.all(updates);
      toast.success('Profilo aggiornato.');
    } catch { toast.error('Errore durante il salvataggio. Riprova.'); }
    finally { setSaving(false); }
  }, [supabase, userId, fullName, phone, email, profile, userEmail, customer, prefs]);

  // ── Password update ───────────────────────────────────────────────────────

  const handleUpdatePassword = useCallback(async () => {
    if (newPw !== confirmPw) { toast.error('Le password non corrispondono.'); return; }
    if (newPw.length < 8)    { toast.error('La password deve avere almeno 8 caratteri.'); return; }
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) toast.error('Errore aggiornamento password.');
      else {
        toast.success('Password aggiornata con successo.');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setShowPwSection(false);
      }
    } finally { setSavingPw(false); }
  }, [supabase, newPw, confirmPw]);

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push(`/${slug}`);
  }, [supabase, router, slug]);

  // ── Tab renderers ─────────────────────────────────────────────────────────

  function renderAppointments() {
    return (
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {/* Prossimi */}
        <SectionCard title="Prossimi appuntamenti">
          {upcoming.length === 0 ? (
            <motion.div
              variants={fieldContainerVariants}
              style={{ textAlign: 'center', padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
            >
              <motion.div variants={itemVariants} style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(124,58,237,0.06))',
                border: '1px solid rgba(168,85,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CalendarDays style={{ width: 24, height: 24, color: '#c084fc' }} />
              </motion.div>
              <motion.p variants={itemVariants} style={{ color: '#9ca3af', fontSize: '0.88rem', margin: '0 0 20px' }}>
                Nessun appuntamento in programma
              </motion.p>
              <motion.div variants={itemVariants}>
                <BookButton onClick={() => router.push(`/${slug}/prenota`)} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={fieldContainerVariants} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((apt) => (
                <motion.div key={apt.id} variants={itemVariants} style={{
                  borderRadius: 16,
                  borderLeft: '3px solid rgba(168,85,247,0.65)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.1), 0 1px 4px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>
                  <AppointmentCard appointment={apt} theme={beautyTheme} onCancel={handleCancel} onReschedule={handleReschedule} index={0} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </SectionCard>

        {/* Storico — solo se ci sono appuntamenti passati */}
        {past.length > 0 && (
          <SectionCard title="Storico" subtitle="I tuoi appuntamenti passati">
            <motion.div variants={fieldContainerVariants} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {past.map((apt) => (
                <motion.div key={apt.id} variants={itemVariants}>
                  <AppointmentCard appointment={apt} theme={beautyTheme} index={0} />
                </motion.div>
              ))}
            </motion.div>
          </SectionCard>
        )}

      </motion.div>
    );
  }

  function renderProfile() {
    return (
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        {/* Dati personali */}
        <SectionCard title="Dati personali">
          <motion.div variants={fieldContainerVariants} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <motion.div variants={itemVariants}>
              <GlassInput label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mario Rossi" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <GlassInput
                label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="mario@example.com"
                hint={email !== (profile?.email ?? userEmail) ? 'Il cambio email richiede conferma al nuovo indirizzo.' : undefined}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <GlassInput label="Telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 333 123 4567" />
            </motion.div>
            <motion.div variants={itemVariants} style={{ marginTop: 6 }}>
              <SaveButton onClick={handleSaveProfile} loading={saving} label={saving ? 'Salvataggio...' : 'Salva modifiche'} />
            </motion.div>
          </motion.div>
        </SectionCard>

        {/* Preferenze */}
        <SectionCard title="Le mie preferenze" subtitle="Visibili al tuo salone per personalizzare il servizio.">
          <motion.div variants={fieldContainerVariants} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <motion.div variants={itemVariants}>
              <GlassTextarea
                label="Preferenze e note" value={prefs} onChange={(e) => setPrefs(e.target.value)}
                placeholder="Es. Allergia al nichel, preferisco sempre Mario, taglio medio con frangia..." rows={4}
                maxLength={500}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SaveButton onClick={handleSaveProfile} loading={saving} label={saving ? 'Salvataggio...' : 'Salva preferenze'} />
            </motion.div>
          </motion.div>
        </SectionCard>

        {/* Cambio password */}
        <SectionCard>
          <button
            onClick={() => setShowPwSection((v) => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ fontSize: '0.93rem', fontWeight: 700, color: '#1a1a2e' }}>Cambia password</span>
            <motion.span
              animate={{ rotate: showPwSection ? 180 : 0 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', color: '#9ca3af' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.span>
          </button>

          <AnimatePresence>
            {showPwSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ overflow: 'hidden', marginInline: -4 }}
              >
                <motion.div
                  variants={fieldContainerVariants} initial="hidden" animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 20, paddingInline: 4 }}
                >
                  <motion.div variants={itemVariants}>
                    <GlassPasswordInput label="Password attuale" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <GlassPasswordInput label="Nuova password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 caratteri" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <GlassPasswordInput label="Conferma nuova password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </motion.div>
                  <motion.div variants={itemVariants} style={{ marginTop: 4 }}>
                    <SaveButton onClick={handleUpdatePassword} loading={savingPw} label={savingPw ? 'Aggiornamento...' : 'Aggiorna password'} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>
      </motion.div>
    );
  }

  function renderHelp() {
    const FAQS = [
      { id: 'p1', icon: CalendarDays, q: 'Come prenoto un appuntamento?',     a: 'Vai nel tab Prenota, scegli il servizio, poi la data e l\'orario che preferisci. Conferma e il gioco è fatto.' },
      { id: 'p2', icon: RefreshCw,    q: 'Posso spostare un appuntamento?',   a: 'Sì. Nel tab Appuntamenti, premi "Sposta" sulla card del tuo appuntamento e scegli un nuovo orario. Il vecchio verrà annullato automaticamente.' },
      { id: 'p3', icon: X,            q: 'Come cancello un appuntamento?',    a: 'Premi "Disdici" sulla card. Ogni salone ha una propria politica: il sistema ti avviserà se la cancellazione non è più possibile a causa della finestra temporale.' },
      { id: 'a1', icon: Key,          q: 'Come cambio la password?',          a: 'Nel tab Profilo, scorri fino alla sezione "Modifica Password" e inserisci la nuova password (minimo 8 caratteri).' },
      { id: 'a2', icon: User,         q: 'Come aggiorno nome e telefono?',    a: 'Nel tab Profilo puoi modificare tutti i tuoi dati. Premi "Salva modifiche" in fondo alla pagina per confermare.' },
      { id: 'a3', icon: Trash2,       q: 'Come cancello il mio account?',     a: 'Scorri in fondo al tab Altro e premi "Cancella account". Invierai una richiesta via email che verrà elaborata entro 30 giorni.' },
      { id: 's1', icon: Clock,        q: 'Qual è la politica di cancellazione?', a: 'Le regole variano da salone a salone. Il sistema ti avviserà automaticamente se la cancellazione non è più possibile per il tuo appuntamento.' },
      { id: 's2', icon: Users,        q: 'Posso prenotare per conto di altri?',  a: 'Per ora ogni account gestisce solo i propri appuntamenti. Per prenotazioni a nome di altri, contatta il salone direttamente.' },
    ];

    return (
      <motion.div
        key="help"
        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => { setShowHelp(false); setExpandedFaq(null); }}
          whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 0', width: 'fit-content',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft style={{ width: 15, height: 15, color: '#059669' }} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>Torna ad Altro</span>
        </motion.button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.06))',
            border: '1px solid rgba(5,150,105,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HelpCircle style={{ width: 18, height: 18, color: '#059669' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e' }}>Aiuto e supporto</h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>Domande frequenti</p>
          </div>
        </div>

        {/* FAQ list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((item, i) => (
            <CustomerFAQItem
              key={item.id}
              question={item.q}
              answer={item.a}
              icon={item.icon}
              isOpen={expandedFaq === item.id}
              onToggle={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
              delay={i * 40}
            />
          ))}
        </div>

        {/* Contatta il salone */}
        {business.phone && (
          <div>
            <p style={{ margin: '0 0 8px 2px', fontSize: '0.69rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contatta il salone
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
              borderRadius: 18, border: '1px solid rgba(255,255,255,0.9)', overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            }}>
              <motion.a
                href={`tel:${business.phone}`}
                whileHover={{ backgroundColor: 'rgba(5,150,105,0.04)', x: 2 }}
                whileTap={{ scale: 0.99 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', textDecoration: 'none' }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Phone style={{ width: 18, height: 18, color: '#059669' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e' }}>Chiama {business.name}</div>
                  <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 1 }}>{business.phone}</div>
                </div>
                <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db', flexShrink: 0 }} />
              </motion.a>
              {business.email && (
                <motion.a
                  href={`mailto:${business.email}`}
                  whileHover={{ backgroundColor: 'rgba(5,150,105,0.04)', x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px',
                    textDecoration: 'none', borderTop: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Mail style={{ width: 18, height: 18, color: '#0891b2' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e' }}>Scrivi al salone</div>
                    <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 1 }}>{business.email}</div>
                  </div>
                  <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db', flexShrink: 0 }} />
                </motion.a>
              )}
            </div>
          </div>
        )}

      </motion.div>
    );
  }

  function renderOther() {
    const primaryItems = [
      {
        icon: Bell,
        label: 'Notifiche',
        sub: 'Gestisci promemoria e avvisi',
        iconColor: '#9333ea',
        iconBg: 'rgba(147,51,234,0.1)',
        iconBorder: 'rgba(147,51,234,0.2)',
        action: () => toast.info('Prossimamente disponibile.'),
      },
      {
        icon: Clock,
        label: 'Storico completo',
        sub: 'Tutti i tuoi appuntamenti',
        iconColor: '#0891b2',
        iconBg: 'rgba(8,145,178,0.1)',
        iconBorder: 'rgba(8,145,178,0.2)',
        action: () => setActiveTab('appointments'),
      },
      {
        icon: HelpCircle,
        label: 'Aiuto e supporto',
        sub: 'FAQ e contatta il salone',
        iconColor: '#059669',
        iconBg: 'rgba(5,150,105,0.1)',
        iconBorder: 'rgba(5,150,105,0.2)',
        action: () => setShowHelp(true),
      },
    ];

    const legalItems = [
      { icon: Shield,   label: 'Privacy Policy',       sub: 'Come trattiamo i tuoi dati',         href: 'https://aegisbeauty.app/legal#privacy-customer' },
      { icon: FileText, label: 'Termini e Condizioni',  sub: 'Regole di utilizzo del servizio',    href: 'https://aegisbeauty.app/legal#terms-customer' },
    ];

    return (
      <AnimatePresence mode="wait">
        {showHelp ? renderHelp() : (
      <motion.div
        key="other-main"
        variants={containerVariants} initial="hidden" animate="visible"
        exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >

        {/* Menu principale */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          {primaryItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                onClick={item.action}
                whileHover={{ backgroundColor: 'rgba(124,58,237,0.07)', x: 2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '100%', padding: '15px 18px', display: 'flex', alignItems: 'center',
                  gap: 14, background: 'transparent', border: 'none',
                  borderBottom: i < primaryItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <IconTile icon={Icon} color={item.iconColor} bg={item.iconBg} border={item.iconBorder} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e' }}>{item.label}</div>
                  <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 1 }}>{item.sub}</div>
                </div>
                <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db', flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Legal */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          {legalItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                onClick={() => window.open(item.href, '_blank', 'noopener,noreferrer')}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)', x: 2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center',
                  gap: 14, background: 'transparent', border: 'none',
                  borderBottom: i === 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <IconTile
                  icon={Icon} color="#6b7280"
                  bg="rgba(107,114,128,0.08)" border="rgba(107,114,128,0.15)"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>{item.label}</div>
                  <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 1 }}>{item.sub}</div>
                </div>
                <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db', flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Logout */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.03)', x: 2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '100%', padding: '15px 18px', display: 'flex', alignItems: 'center',
              gap: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <IconTile
              icon={LogOut} color="#dc2626"
              bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.2)"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#dc2626' }}>Esci</div>
              <div style={{ fontSize: '0.73rem', color: '#f87171', marginTop: 1 }}>Disconnetti il tuo account</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Cancellazione account */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          <motion.button
            onClick={() => {
              const subject = encodeURIComponent('Richiesta cancellazione account');
              const body = encodeURIComponent(`Ciao,\n\nVorrei richiedere la cancellazione del mio account.\n\nEmail: ${userEmail}\n\nGrazie.`);
              window.location.href = `mailto:support@aegisbeauty.app?subject=${subject}&body=${body}`;
            }}
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.03)', x: 2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '100%', padding: '15px 18px', display: 'flex', alignItems: 'center',
              gap: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <IconTile
              icon={Trash2} color="#9ca3af"
              bg="rgba(156,163,175,0.08)" border="rgba(156,163,175,0.18)"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6b7280' }}>Cancella account</div>
              <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 1 }}>Invia richiesta — elaborata entro 30 giorni</div>
            </div>
            <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db', flexShrink: 0 }} />
          </motion.button>
        </motion.div>

      </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 0', position: 'relative', minHeight: 'calc(100% - 96px)' }}>
      <style>{KEYFRAMES}</style>

      {/* Subtle bg orbs */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
          top: -80, right: -60, animation: 'acct-orb 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)',
          bottom: 100, left: -40, animation: 'acct-orb 18s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100% - 24px)' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, padding: '18px 20px',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 0 0 1px rgba(168,85,247,0.04)',
          }}
        >
          <Avatar name={displayName || 'U'} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 2px' }}>{business.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
                {displayName ? `Ciao, ${displayName.split(' ')[0]}` : 'Il mio account'}
              </h1>
              <Sparkles style={{ width: 15, height: 15, color: '#a855f7', flexShrink: 0 }} />
            </div>
          </div>
        </motion.div>

        {/* Tab bar con sliding pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          style={{
            position: 'relative', display: 'flex', padding: '4px',
            background: 'rgba(0,0,0,0.05)', borderRadius: 16, marginBottom: 20,
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, position: 'relative', padding: '9px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'transparent', borderRadius: 12, border: 'none', cursor: 'pointer', zIndex: 1,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 12,
                      background: '#fff',
                      boxShadow: '0 0 16px rgba(124,58,237,0.28), 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(168,85,247,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon style={{ width: 17, height: 17, position: 'relative', zIndex: 1, color: isActive ? '#9333ea' : '#9ca3af', transition: 'color 0.2s' }} />
                <span style={{ fontSize: '0.67rem', fontWeight: isActive ? 700 : 400, color: isActive ? '#9333ea' : '#9ca3af', position: 'relative', zIndex: 1, transition: 'color 0.2s' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'profile'      && renderProfile()}
            {activeTab === 'other'        && renderOther()}
          </motion.div>
        </AnimatePresence>

        {/* Footer — identico a BusinessContent */}
        <footer style={{
          textAlign: 'center',
          padding: '14px 24px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          marginTop: 'auto',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>
            Powered by{' '}
            <span style={{ color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }} onClick={() => router.push('/')}>Aegis Group</span>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }} onClick={() => window.open('https://aegisbeauty.app/legal#privacy-customer', '_blank', 'noopener,noreferrer')}>Privacy Policy</span>
            <span style={{ color: '#e5e7eb' }}>·</span>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }} onClick={() => window.open('https://aegisbeauty.app/legal#terms-customer', '_blank', 'noopener,noreferrer')}>Termini e Condizioni</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
