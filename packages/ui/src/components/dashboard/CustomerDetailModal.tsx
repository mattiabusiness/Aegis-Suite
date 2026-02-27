// ============================================================================
// AEGIS SUITE - CUSTOMER DETAIL MODAL (Perfected v2)
// File: packages/ui/src/components/dashboard/CustomerDetailModal.tsx
// Portal/glass/glow pattern matching all other modals.
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mail, Phone, Calendar, Clock, TrendingUp, Star,
  FileText, User, CreditCard, Plus, ChevronDown, ChevronUp,
  Save, AlertCircle, Scissors, CheckCircle2, XCircle, Ban,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerAppointment {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  staffName: string;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending';
}

export interface CustomerDetail {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  notes?: string;
  preferences?: string;
  tags?: string[];
  totalVisits: number;
  totalSpent: number;
  lastVisitAt?: string;
  createdAt: string;
  isActive: boolean;
  source?: string;
  acceptsMarketing: boolean;
}

export interface CustomerStats {
  totalVisits: number;
  totalSpent: number;
  averageSpent: number;
  favoriteService?: string;
  favoriteStaff?: string;
  lastVisit?: string;
  cancelRate: number;
  noShowRate: number;
}

export interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetail | null;
  appointments: CustomerAppointment[];
  stats: CustomerStats | null;
  currency?: string;
  onSaveNotes?: (customerId: string, notes: string) => Promise<void>;
  onSavePreferences?: (customerId: string, preferences: string) => Promise<void>;
  onBookAppointment?: (customerId: string) => void;
  loading?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  completed: { label: 'Completato', bg: 'rgba(16,185,129,0.08)', text: '#059669', icon: CheckCircle2 },
  confirmed: { label: 'Confermato', bg: 'rgba(168,85,247,0.08)', text: '#7c3aed', icon: Calendar },
  pending: { label: 'In attesa', bg: 'rgba(245,158,11,0.08)', text: '#d97706', icon: Clock },
  cancelled: { label: 'Cancellato', bg: 'rgba(239,68,68,0.08)', text: '#dc2626', icon: XCircle },
  no_show: { label: 'No show', bg: 'rgba(107,114,128,0.08)', text: '#4b5563', icon: Ban },
};

type TabKey = 'overview' | 'history' | 'notes';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Panoramica', icon: User },
  { key: 'history', label: 'Storico', icon: Calendar },
  { key: 'notes', label: 'Note', icon: FileText },
];

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2).replace('.00', '')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ icon: Icon, label, value, accent = false, delay }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean; delay: number;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-xl"
      style={{
        background: accent ? 'rgba(168,85,247,0.04)' : 'rgba(0,0,0,0.015)',
        border: `1px solid ${accent ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)'}`,
        animation: `cdm-card-in 0.35s ease-out ${delay}s both`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(147,51,234,0.1)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = accent ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)',
          color: accent ? '#9333ea' : '#6b7280',
        }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// APPOINTMENT ROW
// ============================================================================

function AppointmentRow({ apt, currency, delay }: {
  apt: CustomerAppointment; currency: string; delay: number;
}) {
  const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <div
      className="flex items-center justify-between p-3.5 rounded-xl"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        animation: `cdm-card-in 0.35s ease-out ${delay}s both`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(147,51,234,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{apt.serviceName}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
          <span>{formatShortDate(apt.date)}</span>
          <span>·</span>
          <span>{apt.time}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Scissors className="w-3 h-3" />{apt.staffName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-gray-900">{formatCurrency(apt.price, currency)}</span>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
          style={{ background: status.bg, color: status.text }}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CustomerDetailModal({
  isOpen, onClose, customer, appointments, stats, currency = '€',
  onSaveNotes, onSavePreferences, onBookAppointment, loading = false,
}: CustomerDetailModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>('overview');
  const [notes, setNotes] = React.useState('');
  const [preferences, setPreferences] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [showAllAppointments, setShowAllAppointments] = React.useState(false);

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
    if (customer) {
      setNotes(customer.notes || '');
      setPreferences(customer.preferences || '');
      setActiveTab('overview');
      setShowAllAppointments(false);
    }
  }, [customer]);

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

  const handleSaveNotes = async () => {
    if (!customer || !onSaveNotes) return;
    setSavingNotes(true);
    try { await onSaveNotes(customer.id, notes); } finally { setSavingNotes(false); }
  };

  const handleSavePreferences = async () => {
    if (!customer || !onSavePreferences) return;
    setSavingPrefs(true);
    try { await onSavePreferences(customer.id, preferences); } finally { setSavingPrefs(false); }
  };

  if ((!isOpen && !closing) || !customer) return null;

  const displayedAppointments = showAllAppointments ? appointments : appointments.slice(0, 5);

  const inputStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl flex flex-col"
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
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        {/* ═══ HEADER ═══ */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          {/* Close button top-right */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 rounded-xl z-10"
            style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                boxShadow: '0 4px 12px rgba(147,51,234,0.25)',
              }}
            >
              {getInitials(customer.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 truncate">{customer.fullName}</h2>
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-full"
                  style={{
                    background: customer.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.04)',
                    color: customer.isActive ? '#059669' : '#9ca3af',
                  }}
                >
                  {customer.isActive ? 'Attivo' : 'Inattivo'}
                </span>
                {onBookAppointment && (
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const container = e.currentTarget.querySelector('[data-ripple-book]');
                      if (container) {
                        const span = document.createElement('span');
                        Object.assign(span.style, {
                          position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                          width: '100px', height: '100px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.35)',
                          animation: 'cdm-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                        });
                        container.appendChild(span);
                        setTimeout(() => span.remove(), 600);
                      }
                      onBookAppointment(customer.id);
                    }}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                      boxShadow: '0 2px 6px rgba(147,51,234,0.2)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(147,51,234,0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      animation: 'cdm-shimmer 2.5s ease-in-out infinite',
                    }} />
                    <div data-ripple-book="" className="absolute inset-0 pointer-events-none" />
                    <Plus className="w-3 h-3 relative z-10" />
                    <span className="relative z-10">Prenota</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                {customer.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
                )}
          </div>
        </div>

            {onBookAppointment && (
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const container = e.currentTarget.querySelector('[data-ripple-book]');
                  if (container) {
                    const span = document.createElement('span');
                    Object.assign(span.style, {
                      position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.35)',
                      animation: 'cdm-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                    });
                    container.appendChild(span);
                    setTimeout(() => span.remove(), 600);
                  }
                  onBookAppointment(customer.id);
                }}
                className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden flex-shrink-0"
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
                  animation: 'cdm-shimmer 2.5s ease-in-out infinite',
                }} />
                <div data-ripple-book="" className="absolute inset-0 pointer-events-none" />
                <Plus className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Prenota</span>
              </button>
            )}
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex items-center gap-1 px-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium -mb-px"
                style={{
                  color: isActive ? '#9333ea' : '#9ca3af',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#6b7280'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#9ca3af'; }}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #9333ea, #7c3aed)',
                      animation: 'cdm-tab-in 0.2s ease-out',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ═══ CONTENT ═══ */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5"
          style={{ scrollbarWidth: 'none' as const }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : activeTab === 'overview' ? (
            /* ═══ OVERVIEW TAB ═══ */
            <div className="space-y-5">
              {/* Stats grid */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard icon={Calendar} label="Visite totali" value={String(stats.totalVisits)} accent delay={0.05} />
                  <StatCard icon={CreditCard} label="Totale speso" value={formatCurrency(stats.totalSpent, currency)} accent delay={0.08} />
                  <StatCard icon={TrendingUp} label="Media per visita" value={formatCurrency(stats.averageSpent, currency)} delay={0.11} />
                  <StatCard icon={Clock} label="Ultima visita" value={stats.lastVisit ? formatDate(stats.lastVisit) : 'Mai'} delay={0.14} />
                </div>
              )}

              {/* Favorites */}
              {stats && (stats.favoriteService || stats.favoriteStaff) && (
                <div className="grid grid-cols-2 gap-3">
                  {stats.favoriteService && (
                    <StatCard icon={Scissors} label="Servizio preferito" value={stats.favoriteService} accent delay={0.17} />
                  )}
                  {stats.favoriteStaff && (
                    <StatCard icon={Star} label="Operatore preferito" value={stats.favoriteStaff} delay={0.2} />
                  )}
                </div>
              )}

              {/* Rates */}
              {stats && (stats.cancelRate > 0 || stats.noShowRate > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {stats.cancelRate > 0 && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)' }}
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs text-gray-400">Tasso cancellazione</p>
                        <p className="text-sm font-bold text-red-600">{stats.cancelRate.toFixed(0)}%</p>
                      </div>
                    </div>
                  )}
                  {stats.noShowRate > 0 && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.08)' }}
                    >
                      <Ban className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Tasso no-show</p>
                        <p className="text-sm font-bold text-gray-600">{stats.noShowRate.toFixed(0)}%</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer details */}
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Dettagli cliente</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {customer.birthDate && (
                    <div><span className="text-gray-400">Data nascita:</span> <span className="text-gray-900 font-medium">{formatDate(customer.birthDate)}</span></div>
                  )}
                  {customer.gender && (
                    <div><span className="text-gray-400">Genere:</span> <span className="text-gray-900 font-medium">{customer.gender === 'M' ? 'Maschio' : customer.gender === 'F' ? 'Femmina' : customer.gender}</span></div>
                  )}
                  {customer.source && (
                    <div><span className="text-gray-400">Fonte:</span> <span className="text-gray-900 font-medium">{customer.source}</span></div>
                  )}
                  <div><span className="text-gray-400">Registrato il:</span> <span className="text-gray-900 font-medium">{formatDate(customer.createdAt)}</span></div>
                  <div><span className="text-gray-400">Marketing:</span> <span className="text-gray-900 font-medium">{customer.acceptsMarketing ? 'Accettato' : 'Rifiutato'}</span></div>
                </div>
              </div>

              {/* Recent appointments preview */}
              {appointments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Ultimi appuntamenti</h4>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-medium"
                      style={{ color: '#9333ea', transition: 'opacity 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Vedi tutti →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {appointments.slice(0, 3).map((apt, i) => (
                      <AppointmentRow key={apt.id} apt={apt} currency={currency} delay={0.22 + i * 0.03} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            /* ═══ HISTORY TAB ═══ */
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
                  <p className="text-sm font-medium text-gray-500">Nessun appuntamento</p>
                  <p className="text-xs text-gray-400 mt-1">Lo storico apparirà qui</p>
                </div>
              ) : (
                <>
                  {displayedAppointments.map((apt, i) => (
                    <AppointmentRow key={apt.id} apt={apt} currency={currency} delay={0.03 * i} />
                  ))}
                  {appointments.length > 5 && (
                    <button
                      onClick={() => setShowAllAppointments(!showAllAppointments)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
                      style={{
                        color: '#9333ea',
                        background: 'rgba(168,85,247,0.04)',
                        border: '1px solid rgba(168,85,247,0.1)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; }}
                    >
                      {showAllAppointments ? (
                        <><ChevronUp className="w-4 h-4" /> Mostra meno</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> Mostra tutti ({appointments.length})</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ═══ NOTES TAB ═══ */
            <div className="space-y-6">
              {/* Notes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FileText className="w-4 h-4" style={{ color: '#9333ea' }} />
                  Note sul cliente
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Aggiungi note su questo cliente..."
                  className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none"
                  style={{ ...inputStyle, animation: 'cdm-draw 0.4s ease-out 0.1s both' }}
                  rows={4}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08), 0 0 20px rgba(168,85,247,0.04)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {onSaveNotes && notes !== (customer.notes || '') && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white overflow-hidden"
                      style={{
                        background: savingNotes ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                        boxShadow: savingNotes ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {!savingNotes && (
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                          animation: 'cdm-shimmer 2.5s ease-in-out infinite',
                        }} />
                      )}
                      <Save className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{savingNotes ? 'Salvataggio...' : 'Salva note'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Star className="w-4 h-4" style={{ color: '#f59e0b' }} />
                  Preferenze
                </label>
                <textarea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="Orari preferiti, staff preferito, allergie, prodotti..."
                  className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none"
                  style={{ ...inputStyle, animation: 'cdm-draw 0.4s ease-out 0.2s both' }}
                  rows={3}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08), 0 0 20px rgba(168,85,247,0.04)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {onSavePreferences && preferences !== (customer.preferences || '') && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePreferences}
                      disabled={savingPrefs}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white overflow-hidden"
                      style={{
                        background: savingPrefs ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                        boxShadow: savingPrefs ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {!savingPrefs && (
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                          animation: 'cdm-shimmer 2.5s ease-in-out infinite',
                        }} />
                      )}
                      <Save className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{savingPrefs ? 'Salvataggio...' : 'Salva preferenze'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Tag</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg"
                        style={{
                          background: 'rgba(168,85,247,0.06)',
                          color: '#7c3aed',
                          border: '1px solid rgba(168,85,247,0.1)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* Keyframes */}
        <style>{`
          @keyframes cdm-card-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes cdm-ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes cdm-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes cdm-draw {
            0% { opacity: 0; border-color: transparent; transform: scaleX(0.95) scaleY(0.95); }
            50% { opacity: 1; border-color: rgba(168,85,247,0.3); }
            100% { opacity: 1; border-color: rgba(0,0,0,0.08); transform: scaleX(1) scaleY(1); }
          }
            from { opacity: 0; transform: scaleX(0); }
            to { opacity: 1; transform: scaleX(1); }
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}