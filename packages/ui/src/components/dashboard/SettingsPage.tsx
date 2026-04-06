// ============================================================================
// AEGIS SUITE - SETTINGS PAGE COMPONENT (v3 — Pixel-perfect Onboarding Style)
// File: packages/ui/src/components/dashboard/SettingsPage.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  Store, Clock, CalendarCheck, UserCog,
  Save, X, Copy, Check, Plus, Trash2,
  Eye, EyeOff, RefreshCw, Users, Layers, Info,
  ChevronLeft, ChevronRight, Calendar,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatedSelect } from '../ui/AnimatedList';

// ============================================================================
// TYPES (unchanged)
// ============================================================================

export interface SettingsTab { id: string; label: string; icon: LucideIcon; }

export interface BusinessGeneralData {
  name: string; slug: string; email: string; phone: string; website: string;
  addressStreet: string; addressCity: string; addressProvince: string;
  addressPostalCode: string; description: string; logoUrl: string; workstations: number;
}

export interface BusinessHoursRow {
  dayOfWeek: string; dayLabel: string; isOpen: boolean;
  openTime1: string; closeTime1: string; openTime2: string; closeTime2: string;
}

export interface ClosureItem {
  id: string; title: string; startDate: string; endDate: string; isRecurringYearly: boolean;
}

export interface BookingSettings {
  bookingAdvanceMin: number; bookingAdvanceMax: number;
  cancellationPolicyHours: number; bufferMinutes: number;
  allowNoStaffPreference: boolean; allowMultipleServices: boolean;
}

export interface AccountData { fullName: string; email: string; phone: string; }

export interface SettingsPageProps {
  generalData: BusinessGeneralData;
  businessHours: BusinessHoursRow[];
  closures: ClosureItem[];
  bookingSettings: BookingSettings;
  accountData: AccountData;
  publicUrlBase: string;
  businessType?: string;
  onSaveGeneral: (data: BusinessGeneralData) => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  onRemoveLogo: () => Promise<void>;
  onSaveHours: (hours: BusinessHoursRow[]) => Promise<void>;
  onSaveWorkstations: (count: number) => Promise<void>;
  onAddClosure: (closure: Omit<ClosureItem, 'id'>) => Promise<void>;
  onDeleteClosure: (id: string) => Promise<void>;
  onSaveBookings: (settings: BookingSettings) => Promise<void>;
  onSaveAccount: (data: { fullName: string; phone: string }) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Se presente, mostra solo i tab con questi id (es. ['account'] per lo staff) */
  allowedTabs?: string[];
  /** Contenuto aggiuntivo da mostrare in fondo al tab Prenotazioni */
  extraBookingContent?: React.ReactNode;
  className?: string;
}

// ============================================================================
// KEYFRAMES — from onboarding steps
// ============================================================================

const KEYFRAMES = `
@keyframes stFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes stShimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
@keyframes stRipple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
@keyframes stCheck { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
@keyframes stBounceUp { 0%{transform:translateY(0)} 40%{transform:translateY(-8px)} 70%{transform:translateY(2px)} 100%{transform:translateY(0)} }
@keyframes stBounceDown { 0%{transform:translateY(0)} 40%{transform:translateY(8px)} 70%{transform:translateY(-2px)} 100%{transform:translateY(0)} }
@keyframes stDotIn { from { opacity:0; transform:scale(0); } to { opacity:1; transform:scale(1); } }
@keyframes stPulse { 0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.18); } 100% { box-shadow: 0 0 0 14px rgba(168,85,247,0); } }
@keyframes stBreath { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
@keyframes stShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
@keyframes stFadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
`;

// ============================================================================
// HELPERS
// ============================================================================

function getBizLabel(bt?: string) { return bt === 'hair_salon' ? 'salone' : bt === 'beauty_center' ? 'centro estetico' : 'salone'; }
function getWsLabel(bt?: string) { return bt === 'hair_salon' ? { s: 'poltrona', p: 'poltrone' } : bt === 'beauty_center' ? { s: 'cabina', p: 'cabine' } : { s: 'postazione', p: 'postazioni' }; }

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);

// ============================================================================
// GLASS INPUT — exact copy from Step2 GlassInput
// ============================================================================

function GlassInput({ label, type = 'text', placeholder, value, onChange, error, maxLength, hint, disabled }: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; maxLength?: number; hint?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const id = React.useId();
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} maxLength={maxLength}
        disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        style={{
          background: disabled ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: error ? '1.5px solid #ef4444' : focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && (
        <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </span>
      )}
    </div>
  );
}

/** Textarea version of GlassInput */
function GlassTextarea({ label, placeholder, value, onChange, hint, rows = 3 }: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string; rows?: number;
}) {
  const [focused, setFocused] = React.useState(false);
  const id = React.useId();
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">{label}</label>
      <textarea
        id={id} placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 resize-none"
        style={{
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
      {hint && <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1"><Info className="w-3 h-3 flex-shrink-0" />{hint}</span>}
    </div>
  );
}

/** Password input with glass focus style matching GlassInput */
function PasswordInput({ value, onChange, show, onToggle }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; show: boolean; onToggle: () => void;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </>
  );
}

// ============================================================================
// ANIMATED TOGGLE — exact copy from Step4
// ============================================================================

function AnimatedToggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={() => !disabled && onToggle()} disabled={disabled}
      className={`relative flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        width: 38, height: 21, borderRadius: 999,
        background: enabled ? '#a855f7' : '#d1d5db',
        boxShadow: enabled ? '0 2px 8px rgba(168,85,247,0.3)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <span className="absolute bg-white rounded-full shadow-sm flex items-center justify-center"
        style={{
          width: 17, height: 17, top: 2, left: 2,
          transform: enabled ? 'translateX(17px)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {enabled ? (
          <svg className="text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
              style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 'stCheck 0.25s ease-out' }} />
          </svg>
        ) : (
          <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 9, height: 9 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ============================================================================
// SECTION — onboarding card style with gradient icon
// ============================================================================

function Section({ title, description, icon: Icon, iconSvg, children, delay = 0, compact = false, stretch = false }: {
  title: string; description?: string; icon?: LucideIcon; iconSvg?: React.ReactNode; children: React.ReactNode; delay?: number; compact?: boolean; stretch?: boolean;
}) {
  return (
   <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden${stretch ? ' flex flex-col' : ''}`}
      style={{ animation: `stFadeUp 0.5s ease-out ${delay}ms both`, ...(stretch ? { height: '100%' } : {}) }}>
      <div className={compact ? 'pt-4 pb-1 px-5' : 'pt-5 pb-2 px-6'}>
        <div className="flex items-center gap-3">
          {(iconSvg || Icon) && (
            <div className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl flex items-center justify-center flex-shrink-0`}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              {iconSvg || (Icon && <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />)}
            </div>
          )}
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>{title}</h3>
            {description && <p className="text-gray-500 text-sm mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className={`${compact ? 'px-5 pb-4 pt-3' : 'px-6 pb-5 pt-3'}${stretch ? ' flex flex-col flex-1' : ''}`}>{children}</div>
    </div>
  );
}

// ============================================================================
// SAVE BUTTON — gradient purple with shimmer + ripple (exact onboarding Continua)
// ============================================================================

function SaveBtn({ saving, saved, onClick, disabled }: {
  saving: boolean; saved: boolean; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean;
}) {
  const [ripple, setRipple] = React.useState<{ x: number; y: number; id: number } | null>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
    onClick(e);
  };
  const bg = saved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)';
  const shadow = saved ? '0 6px 20px rgba(16,185,129,0.3)' : '0 6px 20px rgba(124,58,237,0.3)';
  const shadowHover = saved ? '0 8px 28px rgba(16,185,129,0.4)' : '0 8px 28px rgba(124,58,237,0.4)';
  return (
    <button onClick={handleClick} disabled={disabled || saving}
      className="relative h-11 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{ background: bg, boxShadow: disabled ? 'none' : shadow }}
      onMouseEnter={(e) => { if (!disabled && !saving) { e.currentTarget.style.boxShadow = shadowHover; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={(e) => { if (!disabled && !saving) { e.currentTarget.style.boxShadow = shadow; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {!saving && !saved && !disabled && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'stShimmer 2.5s ease-in-out infinite' }} />
      )}
      {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 'stRipple 0.6s ease-out forwards' }} />}
      <span className="relative z-10 flex items-center gap-2">
        {saving ? (<><RefreshCw className="w-4 h-4 animate-spin" />Salvataggio...</>) : saved ? (<><Check className="w-4 h-4" />Salvato!</>) : (<><Save className="w-4 h-4" />Salva modifiche</>)}
      </span>
    </button>
  );
}

// ============================================================================
// TAB: GENERAL
// ============================================================================

function GeneralTab({
  form, setForm, baseData, publicUrlBase, businessType,
  onSave, onUploadLogo, onRemoveLogo,
}: {
  form: BusinessGeneralData; setForm: React.Dispatch<React.SetStateAction<BusinessGeneralData>>;
  baseData: BusinessGeneralData; publicUrlBase: string; businessType?: string;
  onSave: (data: BusinessGeneralData) => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  onRemoveLogo: () => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadErr, setUploadErr] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const label = getBizLabel(businessType);
  const hasChanges = JSON.stringify(form) !== JSON.stringify(baseData);
  const publicUrl = `${publicUrlBase}/${form.slug}`;

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSaving(true);
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };
  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const validExt = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    const validType = file.type.startsWith('image/') || validExt;
    if (!validType) { setUploadErr('Formato non supportato. Usa PNG, JPG o WebP.'); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadErr('File troppo grande. Massimo 2MB.'); return; }
    setUploadErr('');
    setUploading(true);
    try {
      const url = await onUploadLogo(file);
      if (url) setForm(p => ({ ...p, logoUrl: url }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore durante il caricamento';
      setUploadErr(msg);
    }
    finally { setUploading(false); }
  };
  const handleRemoveLogo = async (e: React.MouseEvent) => { e.stopPropagation(); await onRemoveLogo(); setForm(p => ({ ...p, logoUrl: '' })); };
  const handleCopy = () => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // FIX: Handler dedicato per evitare doppio click che annulla il file picker
  const triggerFileInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileRef.current) {
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };

  return (
    <div className="space-y-5">
      {/* Link pubblico — compact */}
      <Section title="Link pubblico" description="Il link per i tuoi clienti" delay={0} compact iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}>
        <div className="flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200 cursor-pointer" style={{ background: 'rgba(168,85,247,0.04)', border: '1.5px solid rgba(168,85,247,0.12)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <span className="flex-1 text-sm text-purple-700 font-medium truncate">{publicUrl}</span>
          <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0" style={{
            background: copied ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.2)',
          }}>
            {copied ? '✓ Copiato' : 'Copia'}
          </button>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5"><Info className="w-3 h-3 flex-shrink-0" />Lo slug &quot;{form.slug}&quot; non può essere modificato</span>
      </Section>

      {/* Logo — compact + info cards */}
      <Section title={`Logo del ${label}`} description="Personalizza la tua app" delay={80} compact iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
        <div className="flex flex-col gap-4" style={{ animation: 'stFadeUp 0.4s ease-out both' }}>
          {/* Top: preview + upload */}
          <div className="flex flex-col items-center flex-shrink-0">
            {form.logoUrl && (
              <div className="relative group mb-2">
                <div className="w-28 h-28 rounded-2xl overflow-hidden cursor-pointer" style={{ border: '3px solid #a855f7', boxShadow: '0 8px 30px rgba(168,85,247,0.2)' }}
                 
onClick={triggerFileInput}>
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <button onClick={(e) => handleRemoveLogo(e)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {form.logoUrl ? (
              <button onClick={triggerFileInput} disabled={uploading}
                className="relative w-28 h-9 rounded-xl font-semibold text-white text-xs overflow-hidden outline-none flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
                onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'stShimmer 2.5s ease-in-out infinite' }} />
                <span className="relative z-10 flex items-center gap-1.5">
                  {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                  {uploading ? 'Caricamento...' : 'Cambia logo'}
                </span>
              </button>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                onClick={triggerFileInput}
                className="w-40 cursor-pointer transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center py-6 rounded-xl" style={{
                  border: dragOver ? '2px solid #a855f7' : '2px dashed rgba(168,85,247,0.3)',
                  background: dragOver ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.5)',
                  boxShadow: dragOver ? '0 0 0 4px rgba(168,85,247,0.1)' : 'none', transition: 'all 0.3s ease',
                }}>
                  {uploading ? <RefreshCw className="w-5 h-5 animate-spin text-purple-500" /> : (
                    <svg className="w-5 h-5" style={{ color: dragOver ? '#7c3aed' : '#a855f7', transition: 'color 0.3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  <p className="text-xs font-medium text-gray-600 mt-1">Carica logo</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }} className="hidden" />
            {uploadErr && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 max-w-[140px] text-center leading-tight">
                <X className="w-3 h-3 flex-shrink-0" />{uploadErr}
              </p>
            )}
          </div>
          {/* Bottom: info cards in row */}
          <div className="flex gap-2" style={{ animation: 'stFadeUp 0.35s ease-out 0.1s both' }}>
            <div className="p-3 rounded-xl transition-all duration-200 cursor-default" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-semibold text-purple-700">Formato</span>
              </div>
              <p className="text-xs text-gray-600">PNG, JPG o WebP. Massimo 2MB.</p>
            </div>
            <div className="p-3 rounded-xl transition-all duration-200 cursor-default" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-semibold text-purple-700">Dimensione consigliata</span>
              </div>
              <p className="text-xs text-gray-600">Quadrato, almeno 200×200px. Verrà mostrato ai clienti.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Informazioni — from Step2 GlassInput */}
      <Section title={`Informazioni ${label}`} description={`I dati principali del tuo ${label}`} delay={160} iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
        <div className="space-y-3" style={{ animation: 'stFadeUp 0.35s ease-out both' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassInput label={`Nome ${label}`} value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            <GlassInput label="Telefono" type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} hint="Per i clienti — visibile solo se vuoi" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassInput label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} hint="Per comunicazioni e aggiornamenti" />
            <GlassInput label="Sito web" type="url" placeholder="https://..." value={form.website} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))} />
          </div>
          <GlassInput label="Indirizzo" placeholder="Via e numero civico" value={form.addressStreet} onChange={(e) => setForm(p => ({ ...p, addressStreet: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <GlassInput label="Città" value={form.addressCity} onChange={(e) => setForm(p => ({ ...p, addressCity: e.target.value }))} />
            <GlassInput label="Provincia" placeholder="TO" maxLength={2} value={form.addressProvince} onChange={(e) => setForm(p => ({ ...p, addressProvince: e.target.value }))} />
            <GlassInput label="CAP" placeholder="10100" maxLength={5} value={form.addressPostalCode} onChange={(e) => setForm(p => ({ ...p, addressPostalCode: e.target.value }))} />
          </div>
          <GlassTextarea label="Descrizione" placeholder={`Descrivi brevemente il tuo ${label}...`} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} hint="Questa descrizione sarà visibile ai tuoi clienti" />
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn saving={saving} saved={saved} onClick={handleSave} disabled={!hasChanges} />
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// MINI DATE PICKER — like AppointmentModal calendar but smaller, inline
// ============================================================================

const MONTHS_IT_S = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const DAYS_S = ['Lu','Ma','Me','Gi','Ve','Sa','Do'];

function MiniDatePicker({ value, onChange, label }: { value: string; onChange: (d: string) => void; label: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const today = new Date();
  const sel = value ? new Date(value + 'T00:00:00') : null;
  const [vm, setVm] = React.useState(sel ? sel.getMonth() : today.getMonth());
  const [vy, setVy] = React.useState(sel ? sel.getFullYear() : today.getFullYear());

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const first = new Date(vy, vm, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const prevDays = new Date(vy, vm, 0).getDate();
  const cells: { day: number; month: number; year: number; cur: boolean }[] = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, month: vm - 1, year: vy, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: vm, year: vy, cur: true });
  while (cells.length < 42) cells.push({ day: cells.length - startDay - daysInMonth + 1, month: vm + 1, year: vy, cur: false });

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const fmtDisplay = (v: string) => { const p = v.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

  return (
    <div ref={ref} className="relative w-full">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
          border: open ? '1.5px solid rgba(168,85,247,0.4)' : '1.5px solid rgba(0,0,0,0.1)',
          boxShadow: open ? '0 0 0 3px rgba(168,85,247,0.08)' : 'none',
        }}
      >
        <span style={{ color: value ? '#1f2937' : '#9ca3af', fontWeight: value ? 500 : 400 }}>
          {value ? fmtDisplay(value) : 'Seleziona data'}
        </span>
        <Calendar className="w-3.5 h-3.5" style={{ color: open ? '#9333ea' : '#9ca3af', transition: 'color 0.15s' }} />
      </button>
      {open && (
         <div className="absolute z-50 bottom-full mb-1.5 left-0 right-0" style={{
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(168,85,247,0.12)', borderRadius: 12,
          boxShadow: '0 -8px 30px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
          padding: 10, animation: 'stFadeDown 0.15s ease-out',
        }}>
          <div className="flex items-center justify-between mb-1.5">
            <button type="button" onClick={() => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-gray-500" /></button>
            <span className="text-xs font-semibold text-gray-800">{MONTHS_IT_S[vm]} {vy}</span>
            <button type="button" onClick={() => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-3.5 h-3.5 text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-7 mb-0.5">
            {DAYS_S.map(d => <div key={d} className="text-center" style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', padding: '2px 0' }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const cd = new Date(c.year, c.month, c.day);
              const ds = fmt(cd);
              const isSel = value === ds;
              const isToday = fmt(today) === ds;
              return (
                <button key={i} type="button" onClick={() => { onChange(ds); setOpen(false); }}
                  className="flex items-center justify-center relative"
                  style={{
                    width: '100%', height: 26, borderRadius: 6, fontSize: 11,
                    fontWeight: isSel ? 700 : isToday ? 600 : 400,
                    color: !c.cur ? '#d1d5db' : isSel ? '#fff' : isToday ? '#7c3aed' : '#374151',
                    background: isSel ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                    boxShadow: isSel ? '0 2px 6px rgba(147,51,234,0.3)' : 'none',
                    cursor: 'pointer', transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  {c.day}
                  {isToday && !isSel && <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:'#7c3aed' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB: HOURS — from Step4 + Step5
// ============================================================================

function HoursTab({
  hours, setHours, baseHours,
  closures, workstations, setWorkstations, baseWorkstations,
  businessType, onSaveHours, onSaveWorkstations, onAddClosure, onDeleteClosure,
}: {
  hours: BusinessHoursRow[]; setHours: React.Dispatch<React.SetStateAction<BusinessHoursRow[]>>;
  baseHours: BusinessHoursRow[]; closures: ClosureItem[];
  workstations: number; setWorkstations: React.Dispatch<React.SetStateAction<number>>;
  baseWorkstations: number; businessType?: string;
  onSaveHours: (h: BusinessHoursRow[]) => Promise<void>;
  onSaveWorkstations: (c: number) => Promise<void>;
  onAddClosure: (c: Omit<ClosureItem, 'id'>) => Promise<void>;
  onDeleteClosure: (id: string) => Promise<void>;
}) {
  const [savingH, setSavingH] = React.useState(false);
  const [savedH, setSavedH] = React.useState(false);
  const [savingW, setSavingW] = React.useState(false);
  const [savedW, setSavedW] = React.useState(false);
  const [newCl, setNewCl] = React.useState({ title: '', startDate: '', endDate: '', isRecurringYearly: false });
  const [addingCl, setAddingCl] = React.useState(false);
  const [showClForm, setShowClForm] = React.useState(false);
  const [bounceDir, setBounceDir] = React.useState<'up' | 'down' | null>(null);
  const [pulseBtn, setPulseBtn] = React.useState<'plus' | 'minus' | null>(null);

  const label = getBizLabel(businessType);
  const ws = getWsLabel(businessType);
  const hoursChanged = JSON.stringify(hours) !== JSON.stringify(baseHours);
  const wsChanged = workstations !== baseWorkstations;

  const updateH = (idx: number, field: keyof BusinessHoursRow, value: string | boolean) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };
  const handleSaveH = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSavingH(true);
    try { await onSaveHours(hours); setSavedH(true); setTimeout(() => setSavedH(false), 2000); }
    finally { setSavingH(false); }
  };
  const handleSaveW = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSavingW(true);
    try { await onSaveWorkstations(workstations); setSavedW(true); setTimeout(() => setSavedW(false), 2000); }
    finally { setSavingW(false); }
  };
  const handleInc = () => { if (workstations < 20) { setWorkstations(w => w + 1); setBounceDir('up'); setPulseBtn('plus'); setTimeout(() => setBounceDir(null), 300); setTimeout(() => setPulseBtn(null), 500); } };
  const handleDec = () => { if (workstations > 1) { setWorkstations(w => w - 1); setBounceDir('down'); setPulseBtn('minus'); setTimeout(() => setBounceDir(null), 300); setTimeout(() => setPulseBtn(null), 500); } };
  const handleAddCl = async () => {
    if (!newCl.title || !newCl.startDate) return;
    setAddingCl(true);
    try { await onAddClosure({ title: newCl.title, startDate: newCl.startDate, endDate: newCl.endDate || newCl.startDate, isRecurringYearly: newCl.isRecurringYearly }); setNewCl({ title: '', startDate: '', endDate: '', isRecurringYearly: false }); setShowClForm(false); }
    finally { setAddingCl(false); }
  };

  return (
    <div className="space-y-6">
      {/* Orari — Step4 style rows */}
      <Section title="Orari di apertura" description={`Gli orari settimanali del tuo ${label}`} delay={0} iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
        <div className="space-y-1.5">
          {hours.map((h, idx) => (
            <div key={h.dayOfWeek} className="rounded-xl overflow-hidden" style={{ animation: `stFadeUp 0.3s ease-out ${idx * 40}ms both` }}>
              <div className="flex items-center gap-2.5 px-3 py-2.5 transition-all duration-200" style={{
                background: h.isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.015)',
                borderLeft: h.isOpen ? '3px solid #a855f7' : '3px solid #e5e7eb',
                backdropFilter: 'blur(4px)',
              }}
                onMouseEnter={(e) => { if (h.isOpen) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.06)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <AnimatedToggle enabled={h.isOpen} onToggle={() => updateH(idx, 'isOpen', !h.isOpen)} />
                <span className={`w-10 text-sm font-semibold transition-colors duration-200 ${h.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{h.dayLabel.slice(0, 3)}</span>
                {h.isOpen ? (
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <AnimatedSelect value={h.openTime1} onChange={(v) => updateH(idx, 'openTime1', v)} options={TIME_OPTIONS} compact maxVisible={7} />
                      <span className="text-purple-300 text-xs">→</span>
                      <AnimatedSelect value={h.closeTime1} onChange={(v) => updateH(idx, 'closeTime1', v)} options={TIME_OPTIONS} compact maxVisible={7} />
                      {!h.openTime2 && !h.closeTime2 && (
                        <button onClick={() => { updateH(idx, 'openTime2', '14:00'); updateH(idx, 'closeTime2', '15:00'); }}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all duration-200"
                          style={{ background: 'rgba(0,0,0,0.04)', color: '#9ca3af', border: '1px solid transparent' }}>
                          + Pausa
                        </button>
                      )}
                    </div>
                    {(h.openTime2 || h.closeTime2) && (
                      <div className="flex items-center gap-1.5">
                        <AnimatedSelect value={h.openTime2} onChange={(v) => updateH(idx, 'openTime2', v)} options={TIME_OPTIONS} compact maxVisible={7} />
                        <span className="text-purple-300 text-xs">→</span>
                        <AnimatedSelect value={h.closeTime2} onChange={(v) => updateH(idx, 'closeTime2', v)} options={TIME_OPTIONS} compact maxVisible={7} />
                        <button onClick={() => { updateH(idx, 'openTime2', ''); updateH(idx, 'closeTime2', ''); }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Chiuso</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn saving={savingH} saved={savedH} onClick={handleSaveH} disabled={!hoursChanged} />
        </div>
      </Section>

      {/* Postazioni + Chiusure — side by side */}<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Postazioni — compact */}
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden flex flex-col" style={{ animation: 'stFadeUp 0.5s ease-out 80ms both' }}>
          <div className="pt-4 pb-1 px-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{ws.p.charAt(0).toUpperCase() + ws.p.slice(1)}</h3>
                <p className="text-gray-500 text-sm mt-0.5">Quante {ws.p} hai?</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col" style={{ animation: 'stFadeUp 0.4s ease-out both', flex: '1 1 auto', minHeight: 200 }}>
            {/* Counter — sempre centrato */}
            <div className="flex flex-col items-center justify-center flex-1 px-5 pt-3">
              <div className="flex items-center gap-6">
                <button type="button" onClick={handleDec} disabled={workstations <= 1}
                  className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={(e) => { if (workstations > 1) e.currentTarget.style.border = '1.5px solid #a855f7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; }}
                >
                  {pulseBtn === 'minus' && <span className="absolute inset-0 rounded-2xl pointer-events-none" style={{ animation: 'stPulse 0.5s ease-out forwards' }} />}
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <div className="text-center" style={{ minWidth: 60 }}>
                  <span className="text-5xl font-bold bg-clip-text text-transparent" style={{
                    backgroundImage: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'inline-block',
                    animation: bounceDir === 'up' ? 'stBounceUp 0.3s ease-out' : bounceDir === 'down' ? 'stBounceDown 0.3s ease-out' : 'stBreath 3s ease-in-out infinite',
                  }}>{workstations}</span>
                  <p className="text-gray-500 text-xs mt-1">{workstations === 1 ? ws.s : ws.p}</p>
                </div>
                <button type="button" onClick={handleInc} disabled={workstations >= 20}
                  className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={(e) => { if (workstations < 20) e.currentTarget.style.border = '1.5px solid #a855f7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; }}
                >
                  {pulseBtn === 'plus' && <span className="absolute inset-0 rounded-2xl pointer-events-none" style={{ animation: 'stPulse 0.5s ease-out forwards' }} />}
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-[180px]">
                {Array.from({ length: Math.min(workstations, 20) }).map((_, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full" style={{
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 2px 6px rgba(168,85,247,0.3)',
                    animation: `stDotIn 0.3s ease-out ${i * 30}ms both`,
                  }} />
                ))}
              </div>
            </div>
            {/* Footer fisso — SaveBtn appare senza spostare il counter */}
            <div className="flex justify-center pb-4 px-5" style={{ minHeight: 52 }}>
              {wsChanged && <SaveBtn saving={savingW} saved={savedW} onClick={handleSaveW} />}
            </div>
          </div>
        </div>

        {/* Chiusure — compact, red hover, animated trash, onboarding buttons */}
        <Section title="Chiusure" description="Giorni di chiusura e ferie" delay={160} compact iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
          {closures.length > 0 && (
            <div className="space-y-1.5 mb-3" style={{ maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.12) transparent' }}>
              {closures.map((cl) => (
                <div key={cl.id} className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200" style={{
                  background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(4px)',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{cl.title}</p>
                    <p className="text-[11px] text-gray-500">{cl.startDate}{cl.endDate !== cl.startDate ? ` → ${cl.endDate}` : ''}{cl.isRecurringYearly ? ' · Annuale' : ''}</p>
                  </div>
                  <button onClick={() => onDeleteClosure(cl.id)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#dc2626'; const icon = e.currentTarget.querySelector('svg'); if (icon) (icon as unknown as HTMLElement).style.transform = 'rotate(12deg) scale(1.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,0,0,0.2)'; const icon = e.currentTarget.querySelector('svg'); if (icon) (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)'; }}
                  >
                    <Trash2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {showClForm ? (
            <div className="space-y-2.5 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.04)', border: '1.5px dashed rgba(168,85,247,0.25)', animation: 'stFadeUp 0.3s ease-out' }}>
              <GlassInput label="Nome chiusura" placeholder="Es. Ferie estive..." value={newCl.title} onChange={(e) => setNewCl(p => ({ ...p, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <MiniDatePicker label="Inizio" value={newCl.startDate} onChange={(d) => setNewCl(p => ({ ...p, startDate: d }))} />
                <MiniDatePicker label="Fine" value={newCl.endDate} onChange={(d) => setNewCl(p => ({ ...p, endDate: d }))} />
              </div>
              {/* Purple checkbox like AppointmentModal invite */}
              <label className="flex items-center gap-2.5 cursor-pointer group/chk">
                <div className="relative w-5 h-5 flex-shrink-0">
                  <input type="checkbox" checked={newCl.isRecurringYearly} onChange={(e) => setNewCl(p => ({ ...p, isRecurringYearly: e.target.checked }))} className="peer sr-only" />
                  <div className="w-5 h-5 rounded-md transition-all duration-300 flex items-center justify-center" style={{
                    background: newCl.isRecurringYearly ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.6)',
                    border: newCl.isRecurringYearly ? '1.5px solid #7c3aed' : '1.5px solid rgba(0,0,0,0.15)',
                    boxShadow: newCl.isRecurringYearly ? '0 2px 8px rgba(168,85,247,0.3)' : 'none',
                  }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: newCl.isRecurringYearly ? 1 : 0, transition: 'opacity 0.2s ease' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" style={{ strokeDasharray: 24, strokeDashoffset: newCl.isRecurringYearly ? 0 : 24, transition: 'stroke-dashoffset 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} /></svg>
                  </div>
                </div>
                <span className="text-sm text-gray-700">Ricorrente ogni anno</span>
              </label>
              {/* Onboarding-style buttons: gradient Aggiungi + outline Annulla */}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleAddCl} disabled={addingCl || !newCl.title || !newCl.startDate}
                  className="relative h-10 px-5 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
                  onMouseEnter={(e) => { if (!addingCl) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'stShimmer 2.5s ease-in-out infinite' }} />
                  <span className="relative z-10 flex items-center gap-2">{addingCl ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Aggiungi</span>
                </button>
                <button onClick={() => setShowClForm(false)}
                  className="h-10 px-5 rounded-xl font-semibold text-sm transition-all duration-300 outline-none flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#374151' }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = '1.5px solid #a855f7'; e.currentTarget.style.color = '#7c3aed'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#374151'; }}
                >Annulla</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowClForm(true)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold w-full justify-center rounded-xl transition-all duration-300"
              style={{ color: '#7c3aed', border: '2px dashed rgba(168,85,247,0.3)', background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; }}>
              <Plus className="w-4 h-4" />Aggiungi chiusura
            </button>
          )}
        </Section>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: BOOKINGS
// ============================================================================

function BookingsTab({ form, setForm, baseSettings, onSave }: {
  form: BookingSettings; setForm: React.Dispatch<React.SetStateAction<BookingSettings>>;
  baseSettings: BookingSettings; onSave: (s: BookingSettings) => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [savingToggle, setSavingToggle] = React.useState<string | null>(null);
  const rulesChanged = form.bookingAdvanceMin !== baseSettings.bookingAdvanceMin || form.bookingAdvanceMax !== baseSettings.bookingAdvanceMax || form.cancellationPolicyHours !== baseSettings.cancellationPolicyHours || form.bufferMinutes !== baseSettings.bufferMinutes;

  const handleSaveRules = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSaving(true);
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };
  const handleToggle = async (key: 'allowNoStaffPreference' | 'allowMultipleServices') => {
    const nv = !form[key]; setForm(p => ({ ...p, [key]: nv })); setSavingToggle(key);
    try { await onSave({ ...form, [key]: nv }); }
    catch { setForm(p => ({ ...p, [key]: !nv })); }
    finally { setSavingToggle(null); }
  };
  const opts = [
    { key: 'allowNoStaffPreference' as const, icon: Users, label: 'Nessuna preferenza staff', desc: 'I clienti possono prenotare senza scegliere un operatore specifico' },
    { key: 'allowMultipleServices' as const, icon: Layers, label: 'Più servizi insieme', desc: 'I clienti possono combinare più servizi in un\'unica prenotazione' },
  ];

  return (
    <div className="space-y-6">
      <Section title="Regole prenotazione" description="Configura tempistiche e policy" delay={0} iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ animation: 'stFadeUp 0.35s ease-out both' }}>
          <GlassInput label="Anticipo minimo (ore)" type="number" value={String(form.bookingAdvanceMin)} onChange={(e) => setForm(p => ({ ...p, bookingAdvanceMin: parseInt(e.target.value) || 0 }))} hint="Quanto prima un cliente deve prenotare" />
          <GlassInput label="Anticipo massimo (giorni)" type="number" value={String(form.bookingAdvanceMax)} onChange={(e) => setForm(p => ({ ...p, bookingAdvanceMax: parseInt(e.target.value) || 30 }))} hint="Fino a quanti giorni in anticipo" />
          <GlassInput label="Policy cancellazione (ore)" type="number" value={String(form.cancellationPolicyHours)} onChange={(e) => setForm(p => ({ ...p, cancellationPolicyHours: parseInt(e.target.value) || 0 }))} hint="Entro quante ore si può cancellare" />
          <GlassInput label="Buffer tra appuntamenti (min)" type="number" value={String(form.bufferMinutes)} onChange={(e) => setForm(p => ({ ...p, bufferMinutes: parseInt(e.target.value) || 0 }))} hint="Pausa tra un appuntamento e l'altro" />
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn saving={saving} saved={saved} onClick={handleSaveRules} disabled={!rulesChanged} />
        </div>
      </Section>

      <Section title="Opzioni" description="Personalizza il comportamento" delay={80} iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}>
        <div className="space-y-1">
          {opts.map(opt => {
            const Icon = opt.icon;
            return (
              <div key={opt.key} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200" style={{
                background: form[opt.key] ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.015)',
                borderLeft: form[opt.key] ? '3px solid #a855f7' : '3px solid #e5e7eb',
                backdropFilter: 'blur(4px)',
              }}>
                <AnimatedToggle enabled={form[opt.key]} onToggle={() => handleToggle(opt.key)} disabled={savingToggle === opt.key} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// TAB: ACCOUNT
// ============================================================================

function AccountTab({ form, setForm, baseData, onSave, onChangePassword }: {
  form: { fullName: string; phone: string };
  setForm: React.Dispatch<React.SetStateAction<{ fullName: string; phone: string }>>;
  baseData: AccountData;
  onSave: (data: { fullName: string; phone: string }) => Promise<void>;
  onChangePassword: (current: string, newPw: string) => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [curPw, setCurPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confPw, setConfPw] = React.useState('');
  const [showCur, setShowCur] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [changingPw, setChangingPw] = React.useState(false);
  const [pwErr, setPwErr] = React.useState('');
  const [pwOk, setPwOk] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const hasChanges = form.fullName !== baseData.fullName || form.phone !== baseData.phone;

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSaving(true);
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };
  const handleChangePw = async () => {
    setPwErr(''); setPwOk(false);
    if (newPw.length < 6) { setPwErr('La password deve avere almeno 6 caratteri'); setShake(true); setTimeout(() => setShake(false), 500); return; }
    if (newPw !== confPw) { setPwErr('Le password non corrispondono'); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setChangingPw(true);
    try { await onChangePassword(curPw, newPw); setPwOk(true); setCurPw(''); setNewPw(''); setConfPw(''); setTimeout(() => setPwOk(false), 3000); }
    catch (err) { setPwErr(err instanceof Error ? err.message : 'Errore nel cambio password'); setShake(true); setTimeout(() => setShake(false), 500); }
    finally { setChangingPw(false); }
  };

  return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch" style={{ minHeight: 'calc(100vh - 13rem)' }}>
      {/* Left: Dati personali */}
      <Section title="Dati personali" description="Le tue informazioni account" delay={0} stretch iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
        <div className="flex-1 space-y-3" style={{ animation: 'stFadeUp 0.35s ease-out both' }}>
          <GlassInput label="Nome completo" value={form.fullName} onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} />
          <GlassInput label="Email" type="email" value={baseData.email} disabled onChange={() => {}} hint="L'email non può essere modificata" />
          <GlassInput label="Telefono" type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
        <div className="flex justify-end mt-4">
          <SaveBtn saving={saving} saved={saved} onClick={handleSave} disabled={!hasChanges} />
        </div>
      </Section>

      {/* Right: Sicurezza */}
       <Section title="Sicurezza" description="Cambia la tua password" delay={80} stretch iconSvg={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }} className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
        <div className="flex flex-col flex-1 gap-3" style={{ animation: shake ? 'stShake 0.4s ease-out' : 'stFadeUp 0.35s ease-out both' }}>
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Password attuale</label>
            <div className="relative">
              <PasswordInput value={curPw} onChange={(e) => { setCurPw(e.target.value); setPwErr(''); }} show={showCur} onToggle={() => setShowCur(!showCur)} />
            </div>
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Nuova password</label>
            <div className="relative">
              <PasswordInput value={newPw} onChange={(e) => { setNewPw(e.target.value); setPwErr(''); }} show={showNew} onToggle={() => setShowNew(!showNew)} />
            </div>
          </div>
          <GlassInput label="Conferma nuova password" type="password" value={confPw} onChange={(e) => { setConfPw(e.target.value); setPwErr(''); }} />
          {pwErr && <p className="text-sm text-red-600 flex items-center gap-1.5" style={{ animation: 'stFadeUp 0.3s ease-out' }}>⚠ {pwErr}</p>}
          {pwOk && <p className="text-sm text-emerald-600 flex items-center gap-1.5" style={{ animation: 'stFadeUp 0.3s ease-out' }}>✓ Password modificata con successo!</p>}
          {/* Gradient button like SaveBtn */}
          <button onClick={handleChangePw} disabled={changingPw || !curPw || !newPw || !confPw}
            className="relative mt-auto h-11 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 self-end"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: changingPw || (!curPw || !newPw || !confPw) ? 'none' : '0 6px 20px rgba(124,58,237,0.3)' }}
            onMouseEnter={(e) => { if (!changingPw && curPw && newPw && confPw) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {!changingPw && curPw && newPw && confPw && (
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'stShimmer 2.5s ease-in-out infinite' }} />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {changingPw ? <RefreshCw className="w-4 h-4 animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              Cambia password
            </span>
          </button>
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DEFAULT_TABS: SettingsTab[] = [
  { id: 'general', label: 'Generale', icon: Store },
  { id: 'hours', label: 'Orari', icon: Clock },
  { id: 'bookings', label: 'Prenotazioni', icon: CalendarCheck },
  { id: 'account', label: 'Account', icon: UserCog },
];

export function SettingsPage({
  generalData, businessHours, closures, bookingSettings, accountData,
  publicUrlBase, businessType,
  onSaveGeneral, onUploadLogo, onRemoveLogo, onSaveHours, onSaveWorkstations,
  onAddClosure, onDeleteClosure, onSaveBookings, onSaveAccount, onChangePassword,
  allowedTabs, extraBookingContent,
  className = '',
}: SettingsPageProps) {
  const visibleTabs = allowedTabs
    ? DEFAULT_TABS.filter(t => allowedTabs.includes(t.id))
    : DEFAULT_TABS;
  const [activeTab, setActiveTab] = React.useState(visibleTabs[0]?.id ?? 'general');
  const [generalForm, setGeneralForm] = React.useState(generalData);
  const [generalBase, setGeneralBase] = React.useState(generalData);
  const [hoursForm, setHoursForm] = React.useState(businessHours);
  const [hoursBase, setHoursBase] = React.useState(businessHours);
  const [wsForm, setWsForm] = React.useState(generalData.workstations);
  const [wsBase, setWsBase] = React.useState(generalData.workstations);
  const [bookForm, setBookForm] = React.useState(bookingSettings);
  const [bookBase, setBookBase] = React.useState(bookingSettings);
  const [acctForm, setAcctForm] = React.useState({ fullName: accountData.fullName, phone: accountData.phone });

  const wGen = async (d: BusinessGeneralData) => { await onSaveGeneral(d); setGeneralBase(d); };
  const wHrs = async (h: BusinessHoursRow[]) => { await onSaveHours(h); setHoursBase(h); };
  const wWs = async (c: number) => { await onSaveWorkstations(c); setWsBase(c); };
  const wBk = async (s: BookingSettings) => { await onSaveBookings(s); setBookBase(s); };

  return (
    <div className={className}>
      <style>{KEYFRAMES}</style>

      {/* Header + Tabs — title left, tabs right, no card wrapper */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6" style={{ animation: 'stFadeUp 0.35s ease-out both' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Impostazioni</h1>
          <p className="text-gray-500 mt-1">{allowedTabs ? 'Gestisci il tuo profilo personale' : 'Gestisci le impostazioni della tua attività'}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{
                  background: isActive ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.03)',
                  color: isActive ? '#7c3aed' : '#6b7280',
                  border: isActive ? '1px solid rgba(168,85,247,0.15)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#374151'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#6b7280'; } }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'general' && <GeneralTab form={generalForm} setForm={setGeneralForm} baseData={generalBase} publicUrlBase={publicUrlBase} businessType={businessType} onSave={wGen} onUploadLogo={onUploadLogo} onRemoveLogo={onRemoveLogo} />}
      {activeTab === 'hours' && <HoursTab hours={hoursForm} setHours={setHoursForm} baseHours={hoursBase} closures={closures} workstations={wsForm} setWorkstations={setWsForm} baseWorkstations={wsBase} businessType={businessType} onSaveHours={wHrs} onSaveWorkstations={wWs} onAddClosure={onAddClosure} onDeleteClosure={onDeleteClosure} />}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <BookingsTab form={bookForm} setForm={setBookForm} baseSettings={bookBase} onSave={wBk} />
          {extraBookingContent}
        </div>
      )}
      {activeTab === 'account' && <AccountTab form={acctForm} setForm={setAcctForm} baseData={accountData} onSave={onSaveAccount} onChangePassword={onChangePassword} />}
    </div>
  );
}