// ============================================================================
// AEGIS SUITE - CUSTOMER DETAIL MODAL COMPONENT
// File: packages/ui/src/components/dashboard/CustomerDetailModal.tsx
// Reusable customer detail view for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  FileText,
  User,
  Scissors,
  CreditCard,
  Plus,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';

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
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Customer data */
  customer: CustomerDetail | null;
  /** Customer appointments history */
  appointments: CustomerAppointment[];
  /** Customer stats */
  stats: CustomerStats | null;
  /** Currency symbol */
  currency?: string;
  /** Callback to save notes */
  onSaveNotes?: (customerId: string, notes: string) => Promise<void>;
  /** Callback to save preferences */
  onSavePreferences?: (customerId: string, preferences: string) => Promise<void>;
  /** Callback to book appointment */
  onBookAppointment?: (customerId: string) => void;
  /** Loading state */
  loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2)}`;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  confirmed: { label: 'Confermato', bg: 'bg-green-50', text: 'text-green-700' },
  completed: { label: 'Completato', bg: 'bg-gray-50', text: 'text-gray-600' },
  cancelled: { label: 'Cancellato', bg: 'bg-red-50', text: 'text-red-700' },
  no_show: { label: 'No-show', bg: 'bg-purple-50', text: 'text-purple-700' },
  pending: { label: 'In attesa', bg: 'bg-amber-50', text: 'text-amber-700' },
};

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ============================================================================
// STAT CARD (inline)
// ============================================================================

function MiniStat({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// TABS
// ============================================================================

type TabKey = 'overview' | 'history' | 'notes';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Panoramica' },
  { key: 'history', label: 'Storico' },
  { key: 'notes', label: 'Note' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  appointments,
  stats,
  currency = '€',
  onSaveNotes,
  onSavePreferences,
  onBookAppointment,
  loading = false,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>('overview');
  const [notes, setNotes] = React.useState('');
  const [preferences, setPreferences] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [showAllAppointments, setShowAllAppointments] = React.useState(false);

  // Reset state when customer changes
  React.useEffect(() => {
    if (customer) {
      setNotes(customer.notes || '');
      setPreferences(customer.preferences || '');
      setActiveTab('overview');
      setShowAllAppointments(false);
    }
  }, [customer]);

  const handleSaveNotes = async () => {
    if (!customer || !onSaveNotes) return;
    setSavingNotes(true);
    try {
      await onSaveNotes(customer.id, notes);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!customer || !onSavePreferences) return;
    setSavingPrefs(true);
    try {
      await onSavePreferences(customer.id, preferences);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!isOpen || !customer) return null;

  const displayedAppointments = showAllAppointments
    ? appointments
    : appointments.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl max-h-[94vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(customer.fullName)}`}>
                {getInitials(customer.fullName)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{customer.fullName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onBookAppointment && (
                <button
                  onClick={() => onBookAppointment(customer.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Prenota
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-gray-100 flex-shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : activeTab === 'overview' ? (
              /* ============ OVERVIEW TAB ============ */
              <div className="space-y-4">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    icon={Calendar}
                    label="Visite totali"
                    value={stats?.totalVisits ?? customer.totalVisits}
                    accent
                  />
                  <MiniStat
                    icon={CreditCard}
                    label="Speso totale"
                    value={formatCurrency(stats?.totalSpent ?? customer.totalSpent, currency)}
                    accent
                  />
                  <MiniStat
                    icon={TrendingUp}
                    label="Media per visita"
                    value={formatCurrency(stats?.averageSpent ?? 0, currency)}
                  />
                  <MiniStat
                    icon={Clock}
                    label="Ultima visita"
                    value={formatDate(stats?.lastVisit ?? customer.lastVisitAt)}
                  />
                </div>

                {/* Favorites */}
                {(stats?.favoriteService || stats?.favoriteStaff) && (
                  <div className="p-4 bg-purple-50 rounded-xl space-y-2">
                    <h4 className="text-sm font-semibold text-purple-900">Preferenze rilevate</h4>
                    {stats.favoriteService && (
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <Scissors className="w-4 h-4" />
                        <span>Servizio preferito: <strong>{stats.favoriteService}</strong></span>
                      </div>
                    )}
                    {stats.favoriteStaff && (
                      <div className="flex items-center gap-2 text-sm text-purple-700">
                        <User className="w-4 h-4" />
                        <span>Operatore preferito: <strong>{stats.favoriteStaff}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Info personali */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Informazioni</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Registrato il</span>
                      <p className="font-medium text-gray-900 mt-0.5">{formatDate(customer.createdAt)}</p>
                    </div>
                    {customer.birthDate && (
                      <div>
                        <span className="text-gray-500">Data di nascita</span>
                        <p className="font-medium text-gray-900 mt-0.5">{formatDate(customer.birthDate)}</p>
                      </div>
                    )}
                    {customer.source && (
                      <div>
                        <span className="text-gray-500">Origine</span>
                        <p className="font-medium text-gray-900 mt-0.5 capitalize">{customer.source}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Stato</span>
                      <p className="mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {customer.isActive ? 'Attivo' : 'Inattivo'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent appointments preview */}
                {appointments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">Ultimi appuntamenti</h4>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs text-purple-600 font-medium hover:underline"
                      >
                        Vedi tutti →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {appointments.slice(0, 3).map(apt => {
                        const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={apt.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{apt.serviceName}</p>
                              <p className="text-xs text-gray-500">{formatShortDate(apt.date)} · {apt.time} · {apt.staffName}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-900">{formatCurrency(apt.price, currency)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'history' ? (
              /* ============ HISTORY TAB ============ */
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nessun appuntamento registrato</p>
                  </div>
                ) : (
                  <>
                    {displayedAppointments.map(apt => {
                      const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={apt.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{apt.serviceName}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatShortDate(apt.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {apt.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {apt.staffName}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-purple-600 flex-shrink-0 ml-3">
                            {formatCurrency(apt.price, currency)}
                          </span>
                        </div>
                      );
                    })}

                    {appointments.length > 5 && (
                      <button
                        onClick={() => setShowAllAppointments(!showAllAppointments)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                      >
                        {showAllAppointments ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Mostra meno
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Mostra tutti ({appointments.length})
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* ============ NOTES TAB ============ */
              <div className="space-y-6">
                {/* Notes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FileText className="w-4 h-4" />
                    Note sul cliente
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Aggiungi note su questo cliente (es. preferenze, allergie, informazioni utili...)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                  />
                  {onSaveNotes && notes !== (customer.notes || '') && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveNotes}
                        loading={savingNotes}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salva note
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Star className="w-4 h-4" />
                    Preferenze
                  </label>
                  <textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Orari preferiti, staff preferito, allergie, prodotti usati..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                  {onSavePreferences && preferences !== (customer.preferences || '') && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSavePreferences}
                        loading={savingPrefs}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salva preferenze
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {customer.tags && customer.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Tag</h4>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}