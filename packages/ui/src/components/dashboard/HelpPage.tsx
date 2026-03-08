// ============================================================================
// AEGIS SUITE - HELP PAGE COMPONENT (Perfected v2 — Glass/Portal/Animations)
// File: packages/ui/src/components/dashboard/HelpPage.tsx
// Reusable help/support page for all verticals
// Matches: ServiceList search, QRCodeModal portal, AnimatedSelect dropdown
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  X,
  Send,
  CheckCircle,
  Search,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Bug,
  Sparkles,
  Key,
  CircleHelp,
  CreditCard,
  RefreshCw,
  User,
  Mail,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES (unchanged exports)
// ============================================================================

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon?: LucideIcon;
  category?: string;
}

export interface GuideStep {
  title: string;
  description: string;
}

export interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  colorClasses: string;
  steps: GuideStep[];
}

export interface SupportCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface HelpPageProps {
  faqItems: FAQItem[];
  guides: GuideItem[];
  supportCategories?: SupportCategory[];
  userName: string;
  userEmail: string;
  businessName?: string;
  onSubmitSupport?: (data: { category: string; message: string; userName: string; userEmail: string; businessName: string }) => Promise<void>;
  className?: string;
}

// ============================================================================
// KEYFRAMES
// ============================================================================

const KEYFRAMES = `
@keyframes hp-fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes hp-shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
@keyframes hp-ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(4);opacity:0} }
@keyframes hp-check { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
@keyframes hp-expand { from { max-height: 0; opacity: 0; } to { max-height: 400px; opacity: 1; } }
@keyframes hp-collapse { from { max-height: 400px; opacity: 1; } to { max-height: 0; opacity: 0; } }
`;

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'bug', label: 'Problema tecnico', icon: Bug },
  { id: 'feature', label: 'Richiesta funzionalità', icon: Sparkles },
  { id: 'billing', label: 'Abbonamento e pagamenti', icon: CreditCard },
  { id: 'account', label: 'Account e accesso', icon: Key },
  { id: 'other', label: 'Altro', icon: CircleHelp },
];

// ============================================================================
// FAQ ACCORDION ITEM — Glass card, smooth expand, gradient icon
// ============================================================================

function FAQAccordionItem({ item, isOpen, onToggle, delay }: {
  item: FAQItem; isOpen: boolean; onToggle: () => void; delay: number;
}) {
  const Icon = item.icon || HelpCircle;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (isOpen && contentRef.current) setHeight(contentRef.current.scrollHeight);
    else setHeight(0);
  }, [isOpen, item.answer]);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: isOpen ? '1.5px solid rgba(168,85,247,0.2)' : '1.5px solid rgba(0,0,0,0.06)',
        boxShadow: isOpen ? '0 8px 32px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
        animation: `hp-fadeUp 0.4s ease-out ${delay}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.12), 0 4px 16px rgba(147,51,234,0.08)';
          e.currentTarget.style.transform = 'translateY(-3px)';
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
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left outline-none">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{
          background: isOpen ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(0,0,0,0.04)',
          boxShadow: isOpen ? '0 4px 12px rgba(124,58,237,0.2)' : 'none',
        }}>
          <Icon className="w-4 h-4 transition-colors duration-200" style={{ color: isOpen ? '#fff' : '#9ca3af' }} />
        </div>
        <span className="flex-1 text-sm font-medium text-gray-900">{item.question}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-300" style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
        }} />
      </button>
      <div ref={contentRef} className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: height }}>
        <div className="px-4 pb-4 pl-[60px]">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GUIDE CARD — Glass hover with gradient icon
// ============================================================================

function GuideCard({ guide, onClick, delay }: { guide: GuideItem; onClick: () => void; delay: number }) {
  const Icon = guide.icon;

  return (
    <button onClick={onClick}
      className="text-left w-full p-4 rounded-2xl transition-all duration-300 outline-none group"
      style={{
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(0,0,0,0.06)', animation: `hp-fadeUp 0.4s ease-out ${delay}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.12), 0 4px 16px rgba(147,51,234,0.08)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{guide.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{guide.description}</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors duration-200"
            style={{ color: '#9333ea' }}>
            {guide.steps.length} passaggi
            <ChevronDown className="w-3 h-3 -rotate-90" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// GUIDE MODAL — Portal glass like QRCodeModal/AppointmentModal
// ============================================================================

function GuideModal({ guide, isOpen, onClose }: {
  guide: GuideItem | null; isOpen: boolean; onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => { requestAnimationFrame(() => setMounted(true)); });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true); setMounted(false);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  if ((!isOpen && !closing) || !guide) return null;

  const Icon = guide.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={handleClose} style={{
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease',
      }} />
      {/* Modal card */}
      <div className="relative w-full max-w-lg" style={{
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 24, border: '1px solid rgba(168,85,247,0.35)',
        boxShadow: mounted
          ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18), 0 0 80px rgba(147,51,234,0.08)'
          : '0 8px 32px rgba(0,0,0,0.08)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto', scrollbarWidth: 'none',
      }}>
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none" style={{
          width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)',
        }} />
        {/* Close */}
        <button onClick={handleClose} className="absolute right-4 top-4 p-2 rounded-xl z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        ><X className="w-5 h-5" /></button>

        {/* Header */}
        <div className="px-6 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{guide.title}</h2>
              <p className="text-xs text-gray-500">{guide.steps.length} passaggi</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 pb-6">
          <div className="space-y-1">
            {guide.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3" style={{ animation: `hp-fadeUp 0.3s ease-out ${idx * 60}ms both` }}>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
                    {idx + 1}
                  </div>
                  {idx < guide.steps.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'linear-gradient(to bottom, rgba(168,85,247,0.2), transparent)' }} />
                  )}
                </div>
                <div className="pb-4">
                  <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const container = e.currentTarget.querySelector('[data-ripple-guide]');
              if (container) {
                const span = document.createElement('span');
                Object.assign(span.style, {
                  position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.35)',
                  animation: 'hp-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                });
                container.appendChild(span);
                setTimeout(() => span.remove(), 600);
              }
              handleClose();
            }}
            className="relative w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              boxShadow: '0 2px 8px rgba(147,51,234,0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              animation: 'hp-shimmer 2.5s ease-in-out infinite',
            }} />
            <div data-ripple-guide="" className="absolute inset-0 pointer-events-none" />
            <span className="relative z-10">Ho capito, grazie!</span>
          </button>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-6 right-6 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)',
        }} />
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// SUPPORT FORM — Glass card, AnimatedSelect-style category, gradient button
// ============================================================================

function SupportForm({ categories, userName, userEmail, businessName = '', onSubmit }: {
  categories: SupportCategory[];
  userName: string; userEmail: string; businessName: string;
  onSubmit?: (data: { category: string; message: string; userName: string; userEmail: string; businessName: string }) => Promise<void>;
}) {
  const [category, setCategory] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [catOpen, setCatOpen] = React.useState(false);
  const [hoveredCat, setHoveredCat] = React.useState<string | null>(null);
  const catRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 });

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!catOpen) return;
    const h = (e: MouseEvent) => {
      if (catRef.current?.contains(e.target as Node)) return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setCatOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [catOpen]);

  const toggleCat = () => {
    if (catOpen) { setCatOpen(false); return; }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setHoveredCat(category || null);
    setCatOpen(true);
  };

  const handleSubmit = async () => {
    if (!message.trim() || !category || !onSubmit) return;
    setSending(true);
    try {
      await onSubmit({ category, message, userName, userEmail, businessName });
      setSent(true);
    } catch { /* handled by caller */ }
    finally { setSending(false); }
  };

  const selectedCat = categories.find(c => c.id === category);
  const SelectedIcon = selectedCat?.icon || CircleHelp;

  if (sent) return (
    <div className="text-center py-8" style={{ animation: 'hp-fadeUp 0.4s ease-out' }}>
      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 8px 24px rgba(5,150,105,0.25)' }}>
        <CheckCircle className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Richiesta inviata!</h3>
      <p className="text-sm text-gray-500 mt-1">Ti risponderemo al più presto a {userEmail}</p>
      <button onClick={() => { setSent(false); setMessage(''); setCategory(''); }}
        className="mt-4 text-sm font-medium transition-colors" style={{ color: '#7c3aed' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#6d28d9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#7c3aed'; }}
      >Invia un'altra richiesta</button>
    </div>
  );

  // Portal dropdown for categories
  const catDropdown = catOpen ? createPortal(
    <div ref={catRef} className="rounded-xl overflow-hidden py-1" style={{
      position: 'fixed', zIndex: 9999, top: dropPos.top, left: dropPos.left,
      minWidth: dropPos.width, maxWidth: dropPos.width,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1.5px solid rgba(168,85,247,0.12)',
      boxShadow: '0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
      animation: 's_asel_enter 0.2s ease-out',
    }}>
      {categories.map((cat) => {
        const CatIcon = cat.icon || CircleHelp;
        const isSelected = category === cat.id;
        const isHovered = hoveredCat === cat.id;
        return (
          <button key={cat.id} type="button"
            onClick={() => { setCategory(cat.id); setCatOpen(false); }}
            onMouseEnter={() => setHoveredCat(cat.id)}
            className="w-full text-left outline-none" style={{ height: 40, padding: '0 4px' }}>
            <div className="flex items-center justify-between rounded-lg px-3 h-full" style={{
              background: isSelected ? 'rgba(168,85,247,0.1)' : isHovered ? 'rgba(168,85,247,0.05)' : 'transparent',
              transform: isHovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: isHovered ? '0 4px 14px rgba(168,85,247,0.12)' : 'none',
              borderLeft: isSelected ? '2.5px solid #a855f7' : isHovered ? '2.5px solid rgba(168,85,247,0.4)' : '2.5px solid transparent',
              transition: 'all 0.15s ease-out',
            }}>
              <span className="flex items-center gap-2.5">
                <CatIcon className="w-4 h-4" style={{ color: isSelected ? '#7c3aed' : isHovered ? '#9333ea' : '#9ca3af', transition: 'color 0.15s' }} />
                <span className="text-sm" style={{
                  color: isSelected ? '#7c3aed' : isHovered ? '#6d28d9' : '#4b5563',
                  fontWeight: isSelected ? 600 : isHovered ? 500 : 400,
                  transition: 'all 0.15s',
                }}>{cat.label}</span>
              </span>
              {isSelected && <svg className="w-4 h-4" style={{ color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
        );
      })}
      <style>{`@keyframes s_asel_enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div className="space-y-4" style={{ animation: 'hp-fadeUp 0.4s ease-out both' }}>
      {/* User info — read-only glass cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{userName}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{userEmail}</span>
        </div>
      </div>

      {/* Category select — AnimatedSelect style */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Categoria</label>
        <button ref={triggerRef} type="button" onClick={toggleCat}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
            border: catOpen ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: catOpen ? '0 0 0 3px rgba(168,85,247,0.12), 0 4px 12px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          }}>
          <span className="flex items-center gap-2 truncate">
            {selectedCat ? (
              <>
                <SelectedIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
                <span className="text-gray-900 font-medium">{selectedCat.label}</span>
              </>
            ) : (
              <span className="text-gray-400">Seleziona categoria</span>
            )}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200"
            style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {catDropdown}
      </div>

      {/* Message textarea — glass focus */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Descrivi il problema</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Descrivi il problema o la tua richiesta in dettaglio..."
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(0,0,0,0.08)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)';
            e.currentTarget.style.background = '#fff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
          }}
        />
      </div>

      {/* Submit — gradient button with shimmer + ripple */}
      <button onClick={handleSubmit} disabled={sending || !message.trim() || !category}
        className="relative w-full h-11 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          boxShadow: (sending || !message.trim() || !category) ? 'none' : '0 6px 20px rgba(124,58,237,0.3)',
        }}
        onMouseEnter={(e) => { if (!sending && message.trim() && category) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {!sending && message.trim() && category && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'hp-shimmer 2.5s ease-in-out infinite' }} />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Invia richiesta
        </span>
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HelpPage({
  faqItems,
  guides,
  supportCategories,
  userName,
  userEmail,
  businessName = '',
  onSubmitSupport,
  className = '',
}: HelpPageProps) {
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(null);
  const [faqSearch, setFaqSearch] = React.useState('');
  const [activeGuide, setActiveGuide] = React.useState<GuideItem | null>(null);

  const categories = supportCategories || DEFAULT_SUPPORT_CATEGORIES;

  const filteredFaq = React.useMemo(() => {
    if (!faqSearch.trim()) return faqItems;
    const s = faqSearch.toLowerCase();
    return faqItems.filter(item => item.question.toLowerCase().includes(s) || item.answer.toLowerCase().includes(s));
  }, [faqItems, faqSearch]);

  const toggleFaq = (id: string) => setOpenFaqId(prev => prev === id ? null : id);

  return (
    <div className={className}>
      <style>{KEYFRAMES}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: FAQ + Guides */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ */}
          <section>
            <div className="flex items-center justify-between mb-4" style={{ animation: 'hp-fadeUp 0.35s ease-out both' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
                }}>
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Domande frequenti</h2>
              </div>
              <span className="text-xs text-gray-400">{filteredFaq.length} risultati</span>
            </div>

            {/* Search — ServiceList style */}
            <div className="relative mb-4" style={{ animation: 'hp-fadeUp 0.35s ease-out 50ms both' }}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Cerca nelle FAQ..." value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none"
                style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.06)';
                  e.currentTarget.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                }}
              />
            </div>

            {/* FAQ list */}
            <div className="space-y-2">
              {filteredFaq.length > 0 ? (
                filteredFaq.map((item, i) => (
                  <FAQAccordionItem key={item.id} item={item} isOpen={openFaqId === item.id} onToggle={() => toggleFaq(item.id)} delay={80 + i * 30} />
                ))
              ) : (
                <div className="text-center py-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.04)', animation: 'hp-fadeUp 0.3s ease-out' }}>
                  <HelpCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(0,0,0,0.1)' }} />
                  <p className="text-sm text-gray-500">Nessun risultato per &quot;{faqSearch}&quot;</p>
                </div>
              )}
            </div>
          </section>

          {/* Guides */}
          <section>
            <div className="flex items-center gap-2.5 mb-4" style={{ animation: 'hp-fadeUp 0.35s ease-out both' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
              }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Guide rapide</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guides.map((guide, i) => (
                <GuideCard key={guide.id} guide={guide} onClick={() => setActiveGuide(guide)} delay={80 + i * 60} />
              ))}
            </div>
          </section>
        </div>

        {/* Right: Support */}
        <div className="lg:col-span-1">
          <div className="sticky" style={{ top: '4.5rem', maxHeight: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column' }}>
            <div className="rounded-2xl overflow-hidden flex-1" style={{
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              overflowY: 'auto', scrollbarWidth: 'none',
              animation: 'hp-fadeUp 0.4s ease-out 100ms both',
            }}>
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
                  }}>
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Contatta il supporto</h2>
                </div>
                <SupportForm
                  categories={categories}
                  userName={userName}
                  userEmail={userEmail}
                  businessName={businessName}
                  onSubmit={onSubmitSupport}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <GuideModal guide={activeGuide} isOpen={!!activeGuide} onClose={() => setActiveGuide(null)} />
    </div>
  );
}