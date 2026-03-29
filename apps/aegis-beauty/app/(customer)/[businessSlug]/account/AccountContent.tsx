// ============================================================================
// AEGIS BEAUTY - ACCOUNT CONTENT (Client Component)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/account/AccountContent.tsx
// 3 tab: Appuntamenti · Profilo · Altro — Skill 1: Ultra-Futuristic UI
// ============================================================================

'use client';

import React, { useState, useId } from 'react';
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
  Clock,
} from 'lucide-react';
import { createClient } from '@aegis/core';
import { AppointmentCard, beautyTheme } from '@aegis/ui';
import type { Business, Customer, Profile } from '@aegis/types';
import type { AppointmentCardData } from '@aegis/ui';

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

function GlassTextarea({ label, placeholder, value, onChange, rows = 4 }: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
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
// COMPONENT
// ============================================================================

export function AccountContent({
  business, customer, profile, upcoming, past, userId, userEmail,
}: AccountContentProps) {
  const router   = useRouter();
  const supabase = createClient();
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

  const displayName = profile?.full_name ?? customer?.full_name ?? '';

  // ── Appointment actions ──────────────────────────────────────────────────

  async function handleCancel(appointmentId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('appointments')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', appointmentId);
    if (error) toast.error("Impossibile cancellare l'appuntamento.");
    else { toast.success('Appuntamento cancellato.'); router.refresh(); }
  }

  function handleRebook(appointment: AppointmentCardData) {
    const serviceId = appointment.appointment_services?.[0];
    router.push(serviceId ? `/${slug}/prenota?service=${serviceId}` : `/${slug}/prenota`);
  }

  // ── Profile save ─────────────────────────────────────────────────────────

  async function handleSaveProfile() {
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
  }

  // ── Password update ───────────────────────────────────────────────────────

  async function handleUpdatePassword() {
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
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${slug}`);
  }

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
                <motion.div key={apt.id} variants={itemVariants}>
                  <AppointmentCard appointment={apt} theme={beautyTheme} onCancel={handleCancel} index={0} />
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
                  <AppointmentCard appointment={apt} theme={beautyTheme} onRebook={handleRebook} index={0} />
                </motion.div>
              ))}
            </motion.div>
          </SectionCard>
        )}

        {/* Nuovo appuntamento — se ci sono già appuntamenti futuri */}
        {upcoming.length > 0 && (
          <motion.div variants={itemVariants} style={{ textAlign: 'center', paddingBottom: 8 }}>
            <BookButton onClick={() => router.push(`/${slug}/prenota`)} />
          </motion.div>
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
                style={{ overflow: 'hidden' }}
              >
                <motion.div
                  variants={fieldContainerVariants} initial="hidden" animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 20 }}
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
        action: () => toast.info('Prossimamente disponibile.'),
      },
    ];

    const legalItems = [
      { icon: Shield,   label: 'Privacy Policy',       sub: 'Come trattiamo i tuoi dati' },
      { icon: FileText, label: 'Termini e Condizioni',  sub: 'Regole di utilizzo del servizio' },
    ];

    return (
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
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
                whileHover={{ backgroundColor: 'rgba(147,51,234,0.025)', x: 2 }}
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
                onClick={() => toast.info('Prossimamente disponibile.')}
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

      </motion.div>
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
                      background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
            Powered by <span style={{ color: '#7c3aed', fontWeight: 600 }}>Aegis Group</span>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ color: '#e5e7eb' }}>·</span>
            <span style={{ color: '#d1d5db', fontSize: '0.68rem', cursor: 'pointer' }}>Termini e Condizioni</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
