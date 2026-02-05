// ============================================================================
// AEGIS SUITE - STAFF LIST COMPONENT
// File: packages/ui/src/components/dashboard/StaffList.tsx
// Reusable staff management component for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import { Button } from '../ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface StaffMember {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'employee';
  color?: string;
  isActive: boolean;
  servicesCount?: number;
  avatarUrl?: string;
  /** Profile is incomplete (missing required fields) */
  isIncomplete?: boolean;
}

export interface StaffListProps {
  /** List of staff members */
  staff: StaffMember[];
  /** Callback when add staff is clicked */
  onAddStaff?: () => void;
  /** Callback when edit staff is clicked */
  onEditStaff?: (member: StaffMember) => void;
  /** Callback when delete staff is clicked */
  onDeleteStaff?: (member: StaffMember) => void;
  /** Callback when staff active state is toggled */
  onToggleActive?: (member: StaffMember, active: boolean) => void;
  /** Callback when manage services is clicked */
  onManageServices?: (member: StaffMember) => void;
  /** Callback when manage hours is clicked */
  onManageHours?: (member: StaffMember) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleLabel(role: StaffMember['role']): string {
  switch (role) {
    case 'owner': return 'Titolare';
    case 'employee': return 'Collaboratore';
    default: return role;
  }
}

function getRoleColor(role: StaffMember['role']): string {
  switch (role) {
    case 'owner': return 'bg-purple-100 text-purple-700';
    case 'employee': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// STAFF CARD COMPONENT
// ============================================================================

interface StaffCardProps {
  member: StaffMember;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
  onManageServices?: () => void;
  onManageHours?: () => void;
}

function StaffCard({ 
  member, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onManageServices,
  onManageHours,
}: StaffCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`
        group relative flex items-center gap-4 p-4 
        bg-white border rounded-xl
        hover:shadow-sm transition-all
        ${member.isIncomplete ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 hover:border-purple-200'}
        ${!member.isActive ? 'opacity-60' : ''}
      `}
    >
      {/* Avatar */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{ backgroundColor: member.color || '#9333ea' }}
      >
        {member.avatarUrl ? (
          <img 
            src={member.avatarUrl} 
            alt={member.fullName} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(member.fullName)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-medium text-gray-900 truncate">{member.fullName}</h4>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
            {getRoleLabel(member.role)}
          </span>
          {member.isIncomplete && (
            <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
              Da completare
            </span>
          )}
          {!member.isActive && (
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              Disattivo
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {member.email ? (
            <span className="flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5" />
              {member.email}
            </span>
          ) : member.isIncomplete ? (
            <span className="flex items-center gap-1 text-amber-600">
              <Mail className="w-3.5 h-3.5" />
              Email mancante
            </span>
          ) : null}
          {member.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {member.phone}
            </span>
          )}
        </div>

        {member.servicesCount !== undefined && member.servicesCount > 0 && (
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <Briefcase className="w-3.5 h-3.5" />
            {member.servicesCount} {member.servicesCount === 1 ? 'servizio' : 'servizi'} assegnati
          </div>
        )}
      </div>

      {/* Complete profile button for incomplete members */}
      {member.isIncomplete && onEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
        >
          Completa
        </button>
      )}

      {/* Actions menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            {/* Toggle active - always visible */}
            <button
              onClick={() => { onToggleActive?.(!member.isActive); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {member.isActive ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Disattiva
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Attiva
                </>
              )}
            </button>

            {/* Other options only when active */}
            {member.isActive && (
              <>
                <button
                  onClick={() => { onEdit?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifica
                </button>
                {onManageServices && (
                  <button
                    onClick={() => { onManageServices(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Briefcase className="w-4 h-4" />
                    Gestisci servizi
                  </button>
                )}
                {onManageHours && (
                  <button
                    onClick={() => { onManageHours(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="w-4 h-4" />
                    Gestisci orari
                  </button>
                )}
                {member.role !== 'owner' && (
                  <button
                    onClick={() => { onDelete?.(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StaffList({
  staff,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onToggleActive,
  onManageServices,
  onManageHours,
  loading = false,
  emptyState,
  className = '',
}: StaffListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showActiveOnly, setShowActiveOnly] = React.useState(false);

  // Filter staff
  const filteredStaff = React.useMemo(() => {
    let result = staff;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.fullName.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.phone?.includes(query)
      );
    }

    // Filter by active status
    if (showActiveOnly) {
      result = result.filter(m => m.isActive);
    }

    return result;
  }, [staff, searchQuery, showActiveOnly]);

  // Stats
  const totalStaff = staff.length;
  const activeStaff = staff.filter(m => m.isActive).length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (staff.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3">
          {/* Active filter toggle */}
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${showActiveOnly 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {showActiveOnly ? 'Solo attivi' : 'Tutti'}
          </button>

          {/* Stats badge */}
          <span className="text-sm text-gray-500">
            {activeStaff}/{totalStaff} attivi
          </span>

          {/* Add button */}
          {onAddStaff && (
            <Button onClick={onAddStaff} className="gap-2">
              <Plus className="w-4 h-4" />
              Aggiungi membro
            </Button>
          )}
        </div>
      </div>

      {/* Staff list */}
      <div className="space-y-3">
        {filteredStaff.map(member => (
          <StaffCard
            key={member.id}
            member={member}
            onEdit={() => onEditStaff?.(member)}
            onDelete={() => onDeleteStaff?.(member)}
            onToggleActive={(active) => onToggleActive?.(member, active)}
            onManageServices={() => onManageServices?.(member)}
            onManageHours={() => onManageHours?.(member)}
          />
        ))}

        {/* No results */}
        {filteredStaff.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun membro trovato per "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Cancella ricerca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}