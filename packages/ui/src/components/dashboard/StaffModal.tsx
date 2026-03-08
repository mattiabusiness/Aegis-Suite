// ============================================================================
// AEGIS SUITE - STAFF MODAL COMPONENTS (Perfected v2)
// File: packages/ui/src/components/dashboard/StaffModal.tsx
// Portal/glass/glow pattern matching ServiceModal & CategoryModal.
// Contains: StaffModal, StaffServicesModal, StaffHoursModal
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Search, Clock, Users } from 'lucide-react';
import { AnimatedSelect } from '../ui/AnimatedList';

// ============================================================================
// TYPES
// ============================================================================

export type StaffRole = 'owner' | 'employee';

export interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  color: string;
  isActive: boolean;
}

export interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
  initialData?: Partial<StaffFormData> | null;
  title?: string;
  submitText?: string;
  error?: string;
  hideOwnerRole?: boolean;
  isIncomplete?: boolean;
}

export interface ServiceOption {
  id: string;
  name: string;
  categoryName?: string;
  duration: number;
  price: number;
}

export interface StaffServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceIds: string[]) => Promise<void>;
  staffName: string;
  services: ServiceOption[];
  assignedServiceIds: string[];
  error?: string;
}

export interface DayHours {
  dayOfWeek: string;
  dayLabel: string;
  isOpen: boolean;
  openTime1?: string;
  closeTime1?: string;
  openTime2?: string;
  closeTime2?: string;
}

export interface StaffHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (useBusinessHours: boolean, customHours?: DayHours[]) => Promise<void>;
  staffName: string;
  businessHours: DayHours[];
  currentHours?: DayHours[];
  useBusinessHours: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Titolare' },
  { value: 'employee', label: 'Collaboratore' },
];

const COLOR_OPTIONS = [
  { value: '#9333ea', label: 'Viola' },
  { value: '#3b82f6', label: 'Blu' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Arancione' },
  { value: '#ef4444', label: 'Rosso' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6366f1', label: 'Indaco' },
  { value: '#14b8a6', label: 'Teal' },
];

// ============================================================================
// SHARED STYLES
// ============================================================================

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08), 0 0 20px rgba(168,85,247,0.04)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

// ============================================================================
// SHARED MODAL WRAPPER
// ============================================================================

function ModalShell({
  isOpen, onClose, title, subtitle, maxWidth = 'max-w-lg', children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode | ((args: { handleClose: () => void; doShake: () => void }) => React.ReactNode);
}) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMounted(true));
      });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setMounted(false);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  if (!isOpen && !closing) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={handleClose}
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      <div
        className={`relative w-full ${maxWidth} ${shake ? 'stm-shake' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: mounted
            ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18), 0 0 80px rgba(147,51,234,0.08)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          scrollbarWidth: 'none' as const,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-xl z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {typeof children === 'function' ? (children as (args: { handleClose: () => void; doShake: () => void }) => React.ReactNode)({ handleClose, doShake }) : children}

        <style>{`
          .stm-shake { animation: stmShake 0.45s ease-in-out; }
          @keyframes stmShake {
            0%,100% { transform: scale(1) translateX(0); }
            15%,55%,85% { transform: scale(1) translateX(-5px); }
            35%,75% { transform: scale(1) translateX(5px); }
          }
          @keyframes stmShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes stmBounce {
            0% { transform: scale(0.5); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes stmCheckIn {
            0% { opacity: 0; transform: scale(0) rotate(-45deg); }
            100% { opacity: 1; transform: scale(1) rotate(0); }
          }
          @keyframes stmCardIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes stmRipple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
        `}</style>

        <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)', borderRadius: '0 0 24px 24px' }} />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ============================================================================
// SUBMIT BUTTON (shared)
// ============================================================================

function SubmitButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const container = e.currentTarget.querySelector('[data-ripple]');
        if (container) {
          const span = document.createElement('span');
          Object.assign(span.style, {
            position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.35)',
            animation: 'stmRipple 0.6s ease-out forwards', pointerEvents: 'none',
          });
          container.appendChild(span);
          setTimeout(() => span.remove(), 600);
        }
        onClick(e);
      }}
      disabled={loading}
      className="relative flex-1 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
      style={{
        background: loading ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
        boxShadow: loading ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = loading ? 'none' : '0 2px 8px rgba(147,51,234,0.25)'; }}
    >
      {!loading && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          animation: 'stmShimmer 2.5s ease-in-out infinite',
        }} />
      )}
      <div data-ripple="" className="absolute inset-0 pointer-events-none" />
      <span className="relative z-10">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Salvataggio...
          </span>
        ) : label}
      </span>
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600"
      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
    >
      Annulla
    </button>
  );
}

// ============================================================================
// STAFF MODAL (Add/Edit)
// ============================================================================

export function StaffModal({
  isOpen, onClose, onSubmit, initialData = null, title, submitText, error, hideOwnerRole = false, isIncomplete = false,
}: StaffModalProps) {
  const isEditing = !!initialData?.fullName;
  const isCompletingProfile = isEditing && isIncomplete;
  const modalTitle = title || (isCompletingProfile ? 'Completa profilo' : isEditing ? 'Modifica membro' : 'Nuovo membro dello staff');
  const buttonText = submitText || (isCompletingProfile ? 'Salva e genera QR' : isEditing ? 'Salva modifiche' : 'Crea e genera QR');
  const showQRInfo = !isEditing || isCompletingProfile;

  const [formData, setFormData] = React.useState<StaffFormData>({
    fullName: '', email: '', phone: '', role: 'employee', color: '#9333ea', isActive: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData?.fullName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'employee',
        color: initialData?.color || '#9333ea',
        isActive: initialData?.isActive ?? true,
      });
      setFormError('');
      setTimeout(() => nameRef.current?.focus(), 280);
    }
  }, [isOpen, initialData]);

  const update = (field: keyof StaffFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableRoles = hideOwnerRole ? ROLE_OPTIONS.filter(r => r.value !== 'owner') : ROLE_OPTIONS;
  const displayError = error || formError;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={isCompletingProfile ? 'Completa i dati per attivare il profilo' : isEditing ? 'Modifica i dettagli del membro' : 'Aggiungi un nuovo membro al tuo team'}
    >
      {({ handleClose, doShake }: { handleClose: () => void; doShake: () => void }) => {
        const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
          e.preventDefault();
          setFormError('');
          if (!formData.fullName.trim()) { setFormError('Inserisci il nome completo *'); doShake(); return; }
          if (!formData.email.trim()) { setFormError('Inserisci l\'email *'); doShake(); return; }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setFormError('Email non valida *'); doShake(); return; }
          if (!formData.phone.trim()) { setFormError('Inserisci il telefono *'); doShake(); return; }

          setLoading(true);
          try { await onSubmit(formData); } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Errore durante il salvataggio.');
            doShake();
          } finally { setLoading(false); }
        };

        return (
          <>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {displayError && (
                <div className="p-3 rounded-xl text-sm text-red-700 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                  <span className="text-red-500 font-bold flex-shrink-0">*</span>
                  {displayError}
                </div>
              )}

              {showQRInfo && (
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)', color: '#7c3aed' }}>
                  {isCompletingProfile
                    ? 'Completando il profilo verrà generato un QR code per la registrazione.'
                    : 'Dopo la creazione verrà generato un QR code che il collaboratore può scansionare.'}
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo <span className="text-red-400">*</span></label>
                <input ref={nameRef} type="text" value={formData.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="es. Mario Rossi" className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none" style={inputStyle} {...focusHandlers} />
              </div>

              {/* Email + Telefono */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="email@esempio.it" className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none" style={inputStyle} {...focusHandlers} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono <span className="text-red-400">*</span></label>
                  <input type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+39 333 1234567" className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none" style={inputStyle} {...focusHandlers} />
                </div>
              </div>

              {/* Ruolo + Colore */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ruolo</label>
                  <AnimatedSelect
                    value={formData.role}
                    onChange={(val) => update('role', val)}
                    options={availableRoles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Colore</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => update('color', c.value)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: c.value,
                          border: formData.color === c.value ? '2px solid #1f2937' : '2px solid transparent',
                          boxShadow: formData.color === c.value ? '0 0 0 2px rgba(255,255,255,0.8), 0 0 8px rgba(147,51,234,0.2)' : 'none',
                          transition: 'all 0.15s ease',
                          transform: formData.color === c.value ? 'scale(1.15)' : 'scale(1)',
                        }}
                        title={c.label}
                      >
                        {formData.color === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggle Attivo */}
              {isEditing && (
                <div
                  className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
                  style={{
                    background: formData.isActive ? 'rgba(16,185,129,0.04)' : 'rgba(0,0,0,0.015)',
                    border: `1px solid ${formData.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.06)'}`,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => update('isActive', !formData.isActive)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">Membro attivo</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formData.isActive ? 'Può ricevere appuntamenti' : 'Non visibile ai clienti'}</p>
                  </div>
                  <div className="w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0" style={{ background: formData.isActive ? '#10b981' : '#d1d5db', transition: 'background 0.2s ease' }}>
                    <div className="w-5 h-5 rounded-full bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transform: formData.isActive ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>
              )}
            </form>

            <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />
            <div className="px-6 py-5 flex items-center gap-3">
              <CancelButton onClick={handleClose} />
              <SubmitButton loading={loading} label={buttonText} onClick={handleSubmit} />
            </div>
          </>
        );
      }}
    </ModalShell>
  );
}

// ============================================================================
// STAFF SERVICES MODAL
// ============================================================================

export function StaffServicesModal({
  isOpen, onClose, onSave, staffName, services, assignedServiceIds, error,
}: StaffServicesModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(assignedServiceIds));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(assignedServiceIds));
      setSearchQuery('');
    }
  }, [isOpen, assignedServiceIds]);

  const filtered = React.useMemo(() => {
    if (!searchQuery) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q) || s.categoryName?.toLowerCase().includes(q));
  }, [services, searchQuery]);

  const grouped = React.useMemo(() => {
    const g: Record<string, ServiceOption[]> = {};
    filtered.forEach(s => {
      const cat = s.categoryName || 'Altri';
      if (!g[cat]) g[cat] = [];
      g[cat].push(s);
    });
    return g;
  }, [filtered]);

  const [lastToggled, setLastToggled] = React.useState<string | null>(null);

  const toggle = (id: string) => {
    setLastToggled(id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setTimeout(() => setLastToggled(null), 300);
  };

  const handleSave = async () => {
    setLoading(true);
    try { await onSave(Array.from(selectedIds)); onClose(); }
    catch { /* error handled by parent */ }
    finally { setLoading(false); }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={`Servizi di ${staffName}`}
      subtitle={`${selectedIds.size} servizi selezionati`}
    >
      {({ handleClose }: { handleClose: () => void }) => (
        <>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-3 p-3 rounded-xl text-sm text-red-700 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <span className="text-red-500 font-bold">*</span> {error}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca servizi..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none"
                style={{
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12,
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.06)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => { setLastToggled('all'); setSelectedIds(new Set(services.map(s => s.id))); setTimeout(() => setLastToggled(null), 300); }} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#9333ea', background: 'rgba(168,85,247,0.06)', transition: 'background 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}>
                Seleziona tutti
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#6b7280', background: 'rgba(0,0,0,0.03)', transition: 'background 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}>
                Deseleziona tutti
              </button>
            </div>

            {/* Service list */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' as const }}>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{cat}</p>
                  <div className="space-y-1">
                    {items.map((s, si) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-left"
                        style={{
                          background: selectedIds.has(s.id) ? 'rgba(168,85,247,0.06)' : 'transparent',
                          border: `1px solid ${selectedIds.has(s.id) ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.04)'}`,
                          transition: 'all 0.15s ease',
                          animation: `stmCardIn 0.35s ease-out ${0.03 * si}s both`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
                          e.currentTarget.style.background = selectedIds.has(s.id) ? 'rgba(168,85,247,0.09)' : 'rgba(168,85,247,0.03)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = selectedIds.has(s.id) ? 'rgba(168,85,247,0.06)' : 'transparent';
                          e.currentTarget.style.borderColor = selectedIds.has(s.id) ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.04)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.duration} min · €{s.price}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            background: selectedIds.has(s.id) ? '#9333ea' : 'transparent',
                            border: selectedIds.has(s.id) ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
                            transition: 'all 0.25s ease-out',
                            transform: selectedIds.has(s.id) && (lastToggled === s.id || lastToggled === 'all') ? 'scale(1.1)' : selectedIds.has(s.id) ? 'scale(1)' : 'scale(0.9)',
                          }}
                        >
                          {selectedIds.has(s.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />
          <div className="px-6 py-5 flex items-center gap-3">
            <CancelButton onClick={handleClose} />
            <SubmitButton loading={loading} label="Salva servizi" onClick={handleSave} />
          </div>
        </>
      )}
    </ModalShell>
  );
}

// ============================================================================
// STAFF HOURS MODAL
// ============================================================================

export function StaffHoursModal({
  isOpen, onClose, onSave, staffName, businessHours, currentHours, useBusinessHours: initialUseBusinessHours, error,
}: StaffHoursModalProps) {
  const [useBusinessHrs, setUseBusinessHrs] = React.useState(initialUseBusinessHours);
  const [hours, setHours] = React.useState<DayHours[]>(currentHours || businessHours);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setUseBusinessHrs(initialUseBusinessHours);
      setHours(currentHours?.length ? currentHours : businessHours);
    }
  }, [isOpen, initialUseBusinessHours, currentHours, businessHours]);

  const updateDay = (index: number, field: keyof DayHours, value: string | boolean) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setLoading(true);
    try { await onSave(useBusinessHrs, useBusinessHrs ? undefined : hours); }
    catch { /* error handled by parent */ }
    finally { setLoading(false); }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={`Orari di ${staffName}`}
      subtitle="Configura la disponibilità settimanale"
      maxWidth="max-w-xl"
    >
      {({ handleClose }: { handleClose: () => void }) => (
        <>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-3 p-3 rounded-xl text-sm text-red-700 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <span className="text-red-500 font-bold">*</span> {error}
              </div>
            )}

            {/* Toggle business hours */}
            <div
              className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer mb-4"
              style={{
                background: useBusinessHrs ? 'rgba(168,85,247,0.04)' : 'rgba(0,0,0,0.015)',
                border: `1px solid ${useBusinessHrs ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.2s ease',
              }}
              onClick={() => setUseBusinessHrs(!useBusinessHrs)}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Usa orari del negozio</p>
                <p className="text-xs text-gray-400 mt-0.5">{useBusinessHrs ? 'Stesso orario del business' : 'Orari personalizzati'}</p>
              </div>
              <div className="w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0" style={{ background: useBusinessHrs ? '#9333ea' : '#d1d5db', transition: 'background 0.2s ease' }}>
                <div className="w-5 h-5 rounded-full bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transform: useBusinessHrs ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </div>
            </div>

            {/* Custom hours */}
            {!useBusinessHrs && (
              <div className="space-y-2">
                {hours.map((day, i) => (
                  <div
                    key={day.dayOfWeek}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: day.isOpen ? 'rgba(0,0,0,0.015)' : 'rgba(0,0,0,0.01)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      opacity: day.isOpen ? 1 : 0.5,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
                      e.currentTarget.style.background = day.isOpen ? 'rgba(168,85,247,0.06)' : 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                      e.currentTarget.style.background = day.isOpen ? 'rgba(0,0,0,0.015)' : 'rgba(0,0,0,0.01)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Day toggle */}
                    <div
                      className="w-9 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 cursor-pointer"
                      style={{ background: day.isOpen ? '#10b981' : '#d1d5db', transition: 'background 0.2s ease' }}
                      onClick={() => updateDay(i, 'isOpen', !day.isOpen)}
                    >
                      <div className="w-4 h-4 rounded-full bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transform: day.isOpen ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    </div>

                    {/* Day label */}
                    <span className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">{day.dayLabel}</span>

                    {/* Times */}
                    {day.isOpen && (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={day.openTime1 || '09:00'} onChange={(e) => updateDay(i, 'openTime1', e.target.value)} className="px-2.5 py-1.5 text-xs text-gray-900 outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }} />
                        <span className="text-xs text-gray-400">—</span>
                        <input type="time" value={day.closeTime1 || '18:00'} onChange={(e) => updateDay(i, 'closeTime1', e.target.value)} className="px-2.5 py-1.5 text-xs text-gray-900 outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />
          <div className="px-6 py-5 flex items-center gap-3">
            <CancelButton onClick={handleClose} />
            <SubmitButton loading={loading} label="Salva orari" onClick={handleSave} />
          </div>
        </>
      )}
    </ModalShell>
  );
}