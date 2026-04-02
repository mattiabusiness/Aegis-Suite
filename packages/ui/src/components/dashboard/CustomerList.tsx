// ============================================================================
// AEGIS SUITE - CUSTOMER LIST COMPONENT (Perfected v2)
// File: packages/ui/src/components/dashboard/CustomerList.tsx
// Same design pattern as StaffList/ServiceList.
// ============================================================================

'use client';

import * as React from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, Edit2, Mail, Phone,
  Calendar, TrendingUp, Download, Upload, UserPlus,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type CustomerFilter = 'all' | 'active' | 'new' | 'inactive';

export interface CustomerListItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt?: string;
  createdAt: string;
  isActive: boolean;
  // Import status fields (optional — only set for imported customers)
  userId?: string | null;
  source?: string | null;
  invitedAt?: string | null;
}

export interface CustomerListProps {
  customers: CustomerListItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  activeFilter: CustomerFilter;
  searchQuery: string;
  currency?: string;
  onFilterChange: (filter: CustomerFilter) => void;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onViewCustomer: (customer: CustomerListItem) => void;
  onEditCustomer?: (customer: CustomerListItem) => void;
  onInviteSingle?: (customerId: string) => Promise<void>;
  onAddCustomer?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  filterCounts?: Record<CustomerFilter, number>;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2).replace('.00', '')}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================================================
// FILTER TABS
// ============================================================================

const FILTERS: { key: CustomerFilter; label: string }[] = [
  { key: 'all', label: 'Tutti' },
  { key: 'active', label: 'Attivi' },
  { key: 'inactive', label: 'Inattivi' },
  { key: 'new', label: 'Nuovi' },
];

// ============================================================================
// CUSTOMER ROW
// ============================================================================

function CustomerRow({
  customer, currency, onView, onEdit, onInviteSingle, delay,
}: {
  customer: CustomerListItem;
  currency: string;
  onView: () => void;
  onEdit?: () => void;
  onInviteSingle?: (customerId: string) => Promise<void>;
  delay: number;
}) {
  const [inviting, setInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState(false);

  const handleInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onInviteSingle || inviting) return;
    if (!customer.email) {
      setInviteError(true);
      setTimeout(() => setInviteError(false), 3000);
      return;
    }
    setInviting(true);
    try { await onInviteSingle(customer.id); } finally { setInviting(false); }
  };

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl cursor-pointer"
      onClick={onView}
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        animation: `cl-card-in 0.35s ease-out ${delay}s both`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(147,51,234,0.08), 0 0 0 1px rgba(168,85,247,0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.01)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{
          background: `hsl(${customer.fullName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 65%, 55%)`,
          boxShadow: `0 2px 8px hsla(${customer.fullName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 65%, 55%, 0.25)`,
        }}
      >
        {getInitials(customer.fullName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{customer.fullName}</p>
          {/* Import status badge */}
          {customer.source === 'import' && !customer.userId && (
            customer.invitedAt ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Mail className="w-2.5 h-2.5" />Invitato
              </span>
            ) : inviteError ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', animation: 'cl-card-in 0.15s ease-out both' }}>
                Email mancante
              </span>
            ) : (
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{
                  background: 'rgba(100,116,139,0.1)',
                  color: '#64748b',
                  border: '1px solid rgba(100,116,139,0.15)',
                  cursor: inviting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!inviting) { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.border = '1px solid rgba(168,85,247,0.2)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(100,116,139,0.1)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.border = '1px solid rgba(100,116,139,0.15)'; }}
                title={customer.email ? 'Clicca per inviare invito email' : 'Aggiungi un\'email al cliente prima di inviare l\'invito'}
              >
                {inviting
                  ? <span className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                  : <Upload className="w-2.5 h-2.5" />
                }
                Non registrato
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
          {customer.email && (
            <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
          )}
          {customer.phone && (
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-400">Visite</p>
          <p className="text-sm font-bold text-gray-900">{customer.totalVisits}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Speso</p>
          <p
            className="text-sm font-bold"
            style={{ color: '#7c3aed' }}
          >
            {formatCurrency(customer.totalSpent, currency)}
          </p>
        </div>
        {customer.lastVisitAt && (
          <div className="text-center">
            <p className="text-xs text-gray-400">Ultima visita</p>
            <p className="text-sm font-medium text-gray-600">{formatDate(customer.lastVisitAt)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1" style={{ transition: 'opacity 0.15s ease' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="p-2 rounded-lg"
          style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#9333ea'; e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          title="Visualizza"
        >
          <Eye className="w-4 h-4" />
        </button>
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg"
            style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#9333ea';
              e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.transform = 'rotate(-12deg) scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(0,0,0,0.3)';
              e.currentTarget.style.background = 'transparent';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)';
            }}
            title="Modifica"
          >
            <Edit2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CustomerList({
  customers, totalCount, currentPage, pageSize, activeFilter, searchQuery,
  currency = '€', onFilterChange, onSearchChange, onPageChange, onViewCustomer,
  onEditCustomer, onInviteSingle, onAddCustomer, onExport, onImport, loading = false, emptyState, className = '',
  filterCounts,
}: CustomerListProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* ═══ Toolbar ═══ */}
      <div
        className="mb-6 p-4 rounded-2xl"
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
          animation: 'cl-card-in 0.35s ease-out both',
        }}
      >
        {/* Top row: search + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca clienti..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none"
              style={{
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.06)',
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

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filter tabs */}
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => onFilterChange(f.key)}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: isActive ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.03)',
                    color: isActive ? '#7c3aed' : '#6b7280',
                    border: isActive ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
            <div className="w-px h-6 mx-1" style={{ background: 'rgba(0,0,0,0.06)' }} />
            {onExport && (
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const container = e.currentTarget.querySelector('[data-ripple-exp]');
                  if (container) {
                    const span = document.createElement('span');
                    Object.assign(span.style, {
                      position: 'absolute', left: `${x - 50}px`, top: `${y - 50}px`,
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.35)',
                      animation: 'cl-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                    });
                    container.appendChild(span);
                    setTimeout(() => span.remove(), 600);
                  }
                  onExport();
                }}
                className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
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
                  animation: 'cl-shimmer 2.5s ease-in-out infinite',
                }} />
                <div data-ripple-exp="" className="absolute inset-0 pointer-events-none" />
                <Download className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Esporta</span>
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium overflow-hidden"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: '#059669',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.14)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importa</span>
              </button>
            )}
            {onAddCustomer && (
              <button
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
                      animation: 'cl-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                    });
                    container.appendChild(span);
                    setTimeout(() => span.remove(), 600);
                  }
                  onAddCustomer();
                }}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white overflow-hidden"
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
                  animation: 'cl-shimmer 2.5s ease-in-out infinite',
                }} />
                <div data-ripple="" className="absolute inset-0 pointer-events-none" />
                <UserPlus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Aggiungi cliente</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Customer list ═══ */}
      {customers.length === 0 && emptyState ? (
        emptyState
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
          <p className="text-sm font-medium text-gray-500">Nessun cliente trovato</p>
          <p className="text-xs text-gray-400 mt-1">Prova con una ricerca diversa</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {customers.map((customer, i) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                currency={currency}
                delay={0.05 + i * 0.03}
                onView={() => onViewCustomer(customer)}
                onEdit={onEditCustomer ? () => onEditCustomer(customer) : undefined}
                onInviteSingle={onInviteSingle}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between mt-3 px-2"
              style={{ animation: 'cl-card-in 0.35s ease-out 0.3s both' }}
            >
              <p className="text-xs text-gray-400">
                {startItem}–{endItem} di {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg disabled:opacity-30"
                  style={{ color: '#6b7280', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => { if (currentPage > 1) e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  const isCurrent = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className="w-8 h-8 rounded-lg text-sm font-medium"
                      style={{
                        background: isCurrent ? 'rgba(168,85,247,0.1)' : 'transparent',
                        color: isCurrent ? '#7c3aed' : '#9ca3af',
                        border: isCurrent ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = isCurrent ? 'rgba(168,85,247,0.1)' : 'transparent'; }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg disabled:opacity-30"
                  style={{ color: '#6b7280', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes cl-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cl-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes cl-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}