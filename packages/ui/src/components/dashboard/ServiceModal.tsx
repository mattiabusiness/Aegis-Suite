// ============================================================================
// AEGIS SUITE - SERVICE MODAL COMPONENT (Perfected v3)
// File: packages/ui/src/components/dashboard/ServiceModal.tsx
// Same portal/glass/animation pattern as QRCodeModal.
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock } from 'lucide-react';
import { AnimatedSelect } from '../ui/AnimatedList';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  categoryId: string;
  isActive: boolean;
}

export interface ServiceModalCategory {
  id: string;
  name: string;
}

export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  categories: ServiceModalCategory[];
  initialData?: Partial<ServiceFormData> | null;
  title?: string;
  submitText?: string;
  currency?: string;
  error?: string;
}

// ============================================================================
// DURATION OPTIONS
// ============================================================================

const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 ora' },
  { value: '75', label: '1h 15min' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 ore' },
  { value: '150', label: '2h 30min' },
  { value: '180', label: '3 ore' },
];

// ============================================================================
// FOCUS GLOW INPUT STYLES
// ============================================================================

const inputBaseStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const inputFocusHandlers = {
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
// COMPONENT
// ============================================================================

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData = null,
  title,
  submitText,
  currency = '€',
  error,
}: ServiceModalProps) {
  const isEditing = !!initialData?.name;
  const modalTitle = title || (isEditing ? 'Modifica servizio' : 'Nuovo servizio');
  const buttonText = submitText || (isEditing ? 'Salva modifiche' : 'Aggiungi servizio');

  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: '', description: '', duration: 30, price: 0, categoryId: '', isActive: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Reset & animate
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        description: initialData?.description || '',
        duration: initialData?.duration || 30,
        price: initialData?.price || 0,
        categoryId: initialData?.categoryId || '',
        isActive: initialData?.isActive ?? true,
      });
      setFormError('');
      setClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMounted(true);
          setTimeout(() => nameRef.current?.focus(), 280);
        });
      });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialData, categories]);

  // Escape
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError('Inserisci il nome del servizio *'); setShake(true); setTimeout(() => setShake(false), 500); return; }
    if (formData.duration <= 0) { setFormError('Seleziona una durata valida *'); setShake(true); setTimeout(() => setShake(false), 500); return; }
    if (formData.price < 0) { setFormError('Il prezzo non può essere negativo *'); setShake(true); setTimeout(() => setShake(false), 500); return; }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch {
      setFormError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof ServiceFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen && !closing) return null;

  const displayError = error || formError;

  const categoryOptions = [
    { value: '', label: 'Nessuna categoria' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ];

  const modalContent = (
    <div className={`fixed inset-0 z-[9999] flex ${isMobile ? 'items-end' : 'items-center justify-center p-4'}`}>
      {/* Backdrop */}
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

      {/* Modal card */}
      <div
        className={`relative w-full ${isMobile ? '' : 'max-w-md'} ${shake ? 'sm-shake' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: isMobile ? '20px 20px 0 0' : 24,
          border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: mounted
            ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18), 0 0 80px rgba(147,51,234,0.08)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          opacity: mounted ? 1 : 0,
          transform: isMobile
            ? (mounted ? 'translateY(0)' : 'translateY(100%)')
            : (mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)'),
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: isMobile ? '92dvh' : 'calc(100dvh - 2rem)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {isMobile && (
          <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'rgba(0,0,0,0.15)' }} />
        )}
        {/* Ambient glow — identical to QRCodeModal */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 200,
            height: 100,
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Close button — identical to QRCodeModal */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-xl z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(0,0,0,0.3)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-4">
          <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
          <p className="text-xs text-gray-400 mt-1">
            {isEditing ? 'Modifica i dettagli del servizio' : 'Compila i campi per aggiungere un nuovo servizio'}
          </p>
        </div>

        {/* Gradient divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {displayError && (
            <div
              className="p-3 rounded-xl text-sm text-red-700 flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
            >
              <span className="text-red-500 font-bold flex-shrink-0">*</span>
              {displayError}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome servizio <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="es. Taglio uomo, Piega, Manicure..."
              className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
              style={inputBaseStyle}
              {...inputFocusHandlers}
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Breve descrizione del servizio (opzionale)"
              rows={2}
              className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none"
              style={inputBaseStyle}
              {...inputFocusHandlers}
            />
          </div>

          {/* Durata + Prezzo (2 colonne) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Durata
              </label>
              <AnimatedSelect
                value={String(formData.duration)}
                onChange={(val) => update('duration', Number(val))}
                options={DURATION_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prezzo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">{currency}</span>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => update('price', Number(e.target.value) || 0)}
                  placeholder="0.00"
                  step="1"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  style={inputBaseStyle}
                  {...inputFocusHandlers}
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
              <AnimatedSelect
                value={formData.categoryId}
                onChange={(val) => update('categoryId', val)}
                options={categoryOptions}
                placeholder="Seleziona categoria"
              />
            </div>
          )}

          {/* Toggle Attivo */}
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
              <p className="text-sm font-medium text-gray-900">Servizio attivo</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formData.isActive ? 'Visibile e prenotabile dai clienti' : 'Nascosto ai clienti'}
              </p>
            </div>
            <div
              className="w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0"
              style={{
                background: formData.isActive ? '#10b981' : '#d1d5db',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transform: formData.isActive ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        </form>

        {/* Footer divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />

        {/* Footer */}
        <div className="px-6 py-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600"
            style={{
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
          >
            Annulla
          </button>
          <button
            type="submit"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const rippleEl = e.currentTarget.querySelector('[data-ripple-container]');
              if (rippleEl) {
                const span = document.createElement('span');
                Object.assign(span.style, {
                  position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.35)',
                  animation: 'smRipple 0.6s ease-out forwards', pointerEvents: 'none',
                });
                rippleEl.appendChild(span);
                setTimeout(() => span.remove(), 600);
              }
              handleSubmit(e);
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
                animation: 'smShimmer 2.5s ease-in-out infinite',
              }} />
            )}
            <div data-ripple-container="" className="absolute inset-0 pointer-events-none" />
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvataggio...
                </span>
              ) : buttonText}
            </span>
          </button>
        </div>

        <style>{`
          .sm-shake { animation: smShake 0.45s ease-in-out; }
          @keyframes smShake {
            0%,100% { transform: scale(1) translateX(0); }
            15%,55%,85% { transform: scale(1) translateX(-5px); }
            35%,75% { transform: scale(1) translateX(5px); }
          }
          @keyframes smShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes smRipple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
        `}</style>
        <div
          className="absolute bottom-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)', borderRadius: '0 0 24px 24px' }}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}