// ============================================================================
// AEGIS SUITE - CATEGORY MODAL COMPONENT (Perfected v3)
// File: packages/ui/src/components/dashboard/CategoryModal.tsx
// Same portal/glass/animation pattern as QRCodeModal.
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryFormData {
  name: string;
  icon?: string;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Partial<CategoryFormData> | null;
  title?: string;
  submitText?: string;
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
  submitText,
  error,
}: CategoryModalProps) {
  const isEditing = !!initialData?.name;
  const modalTitle = title || (isEditing ? 'Modifica categoria' : 'Nuova categoria');
  const buttonText = submitText || (isEditing ? 'Salva modifiche' : 'Aggiungi categoria');

  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setFormError('');
      setClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMounted(true);
          setTimeout(() => inputRef.current?.focus(), 280);
        });
      });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialData]);

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
    if (!name.trim()) { setFormError('Inserisci il nome della categoria *'); setShake(true); setTimeout(() => setShake(false), 500); return; }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim() });
    } catch {
      setFormError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !closing) return null;

  const displayError = error || formError;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — identical to QRCodeModal */}
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

      {/* Modal card — identical glass style to QRCodeModal */}
      <div
        className={`relative w-full max-w-sm ${shake ? 'cm-shake' : ''}`}
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
        }}
      >
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
            {isEditing ? 'Modifica il nome della categoria' : 'Le categorie aiutano a organizzare i servizi'}
          </p>
        </div>

        {/* Gradient divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {displayError && (
            <div
              className="mb-4 p-3 rounded-xl text-sm text-red-700 flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
            >
              <span className="text-red-500 font-bold flex-shrink-0">*</span>
              {displayError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome categoria <span className="text-red-400">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Trattamenti viso, Taglio, Colorazione..."
              className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08), 0 0 20px rgba(168,85,247,0.04)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
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
                  animation: 'cmRipple 0.6s ease-out forwards', pointerEvents: 'none',
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
                animation: 'cmShimmer 2.5s ease-in-out infinite',
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
          .cm-shake { animation: cmShake 0.45s ease-in-out; }
          @keyframes cmShake {
            0%,100% { transform: scale(1) translateX(0); }
            15%,55%,85% { transform: scale(1) translateX(-5px); }
            35%,75% { transform: scale(1) translateX(5px); }
          }
          @keyframes cmShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes cmRipple {
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