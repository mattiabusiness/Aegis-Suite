// ============================================================================
// AEGIS SUITE - CUSTOMER LIST COMPONENT
// File: packages/ui/src/components/dashboard/CustomerList.tsx
// Reusable customer management component for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Download,
  UserPlus,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/button';

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
}

export interface CustomerListProps {
  /** List of customers */
  customers: CustomerListItem[];
  /** Total customer count (for pagination, may differ from customers.length) */
  totalCount: number;
  /** Current page (1-indexed) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Current active filter */
  activeFilter: CustomerFilter;
  /** Current search query */
  searchQuery: string;
  /** Currency symbol */
  currency?: string;
  /** Callback when filter changes */
  onFilterChange: (filter: CustomerFilter) => void;
  /** Callback when search changes */
  onSearchChange: (query: string) => void;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when view is clicked */
  onViewCustomer: (customer: CustomerListItem) => void;
  /** Callback when edit is clicked */
  onEditCustomer?: (customer: CustomerListItem) => void;
  /** Callback when add customer is clicked */
  onAddCustomer?: () => void;
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Filter counts */
  filterCounts?: {
    all: number;
    active: number;
    new: number;
    inactive: number;
  };
}

// ============================================================================
// FILTER CONFIG
// ============================================================================

const FILTER_CONFIG: { key: CustomerFilter; label: string }[] = [
  { key: 'all', label: 'Tutti' },
  { key: 'active', label: 'Attivi' },
  { key: 'new', label: 'Nuovi' },
  { key: 'inactive', label: 'Inattivi' },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2)}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-accent-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ============================================================================
// CUSTOMER ROW
// ============================================================================

interface CustomerRowProps {
  customer: CustomerListItem;
  currency: string;
  onView: () => void;
  onEdit?: () => void;
}

function CustomerRow({ customer, currency, onView, onEdit }: CustomerRowProps) {
  return (
    <tr
      className="group hover:bg-accent-50/50 transition-colors cursor-pointer"
      onClick={onView}
    >
      {/* Name + Avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(customer.fullName)}`}>
            {getInitials(customer.fullName)}
          </div>
          <p className="text-sm font-medium text-gray-900 truncate min-w-0">
            {customer.fullName}
          </p>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-gray-600 truncate block max-w-[200px]">
          {customer.email || '—'}
        </span>
      </td>

      {/* Phone */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-gray-600">
          {customer.phone || '—'}
        </span>
      </td>

      {/* Last visit */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-gray-600">
          {formatDate(customer.lastVisitAt)}
        </span>
      </td>

      {/* Total visits */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm font-medium text-gray-900">
          {customer.totalVisits}
        </span>
      </td>

      {/* Total spent */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm font-semibold text-accent-600">
          {formatCurrency(customer.totalSpent, currency)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
            title="Visualizza"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
              title="Modifica"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CustomerList({
  customers,
  totalCount,
  currentPage,
  pageSize,
  activeFilter,
  searchQuery,
  currency = '€',
  onFilterChange,
  onSearchChange,
  onPageChange,
  onViewCustomer,
  onEditCustomer,
  onAddCustomer,
  onExport,
  loading = false,
  emptyState,
  className = '',
  filterCounts,
}: CustomerListProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top row: Search + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, email o telefono..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Esporta</span>
              </button>
            )}
            {onAddCustomer && (
              <Button onClick={onAddCustomer} className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuovo cliente</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {FILTER_CONFIG.map(({ key, label }) => {
            const count = filterCounts?.[key];
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeFilter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                {count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === key
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {customers.length === 0 && !loading ? (
        emptyState || (
          <div className="text-center py-16">
            <p className="text-gray-500">Nessun cliente trovato</p>
          </div>
        )
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Telefono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Ultima visita
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Visite
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Speso
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map(customer => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      currency={currency}
                      onView={() => onViewCustomer(customer)}
                      onEdit={onEditCustomer ? () => onEditCustomer(customer) : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-gray-500">
                {startItem}–{endItem} di {totalCount} clienti
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-accent-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}