// ============================================================================
// AEGIS SUITE - STAFF LIST COMPONENT (Perfected v2)
// File: packages/ui/src/components/dashboard/StaffList.tsx
// Same design pattern as ServiceList: glass, hover, stagger, pulse.
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
  AlertCircle,
} from 'lucide-react';

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
  isIncomplete?: boolean;
}

export interface StaffListProps {
  staff: StaffMember[];
  onAddStaff?: () => void;
  onEditStaff?: (member: StaffMember) => void;
  onDeleteStaff?: (member: StaffMember) => void;
  onToggleActive?: (member: StaffMember, active: boolean) => void;
  onManageServices?: (member: StaffMember) => void;
  onManageHours?: (member: StaffMember) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getRoleLabel(role: string): string {
  return role === 'owner' ? 'Titolare' : 'Collaboratore';
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================================================
// MENU ITEM (shared hover with icon animation)
// ============================================================================

function MenuItem({
  icon: Icon, label, onClick, variant = 'default',
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const isDefault = variant === 'default';
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${isDefault ? 'text-gray-700' : 'text-red-600'}`}
      style={{ transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDefault ? 'rgba(168,85,247,0.06)' : 'rgba(239,68,68,0.06)';
        e.currentTarget.style.paddingLeft = '20px';
        const icon = e.currentTarget.querySelector('svg');
        if (icon) {
          (icon as unknown as HTMLElement).style.transform = isDefault ? 'rotate(-12deg) scale(1.15)' : 'rotate(12deg) scale(1.15)';
          (icon as unknown as HTMLElement).style.color = isDefault ? '#9333ea' : '#dc2626';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.paddingLeft = '16px';
        const icon = e.currentTarget.querySelector('svg');
        if (icon) {
          (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)';
          (icon as unknown as HTMLElement).style.color = '';
        }
      }}
    >
      <Icon className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
      {label}
    </button>
  );
}

// ============================================================================
// STAFF CARD
// ============================================================================

function StaffCard({
  member, onEdit, onDelete, onToggleActive, onManageServices, onManageHours, delay,
}: {
  member: StaffMember;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
  onManageServices?: () => void;
  onManageHours?: () => void;
  delay: number;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="group relative flex items-center gap-4 p-4 rounded-xl"
      style={{
        background: member.isIncomplete ? 'rgba(245,158,11,0.06)' : '#fff',
        border: `1px solid ${member.isIncomplete ? 'rgba(245,158,11,0.35)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        opacity: member.isActive ? 1 : 0.6,
        animation: `stl-card-in 0.35s ease-out ${delay}s both`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = member.isIncomplete ? 'rgba(245,158,11,0.35)' : 'rgba(168,85,247,0.2)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(147,51,234,0.08), 0 0 0 1px rgba(168,85,247,0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = member.isIncomplete ? 'rgba(245,158,11,0.2)' : 'rgba(0,0,0,0.04)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.01)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{
          backgroundColor: member.color || '#9333ea',
          boxShadow: `0 2px 8px ${member.color || '#9333ea'}30`,
        }}
      >
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(member.fullName)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{member.fullName}</h4>
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-full"
            style={{
              background: member.role === 'owner' ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.04)',
              color: member.role === 'owner' ? '#7c3aed' : '#6b7280',
            }}
          >
            {getRoleLabel(member.role)}
          </span>

          {/* Incomplete pulse */}
          {member.isIncomplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <div className="relative flex-shrink-0 w-3.5 h-3.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 relative z-10" />
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(245,158,11,0.4)', animationDuration: '1.8s' }}
                />
              </div>
              <span className="text-xs font-semibold text-amber-700">Da completare</span>
            </div>
          )}

          {!member.isActive && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: 'rgba(0,0,0,0.04)', color: '#9ca3af' }}>
              Disattivo
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
          {member.email && (
            <span className="flex items-center gap-1 min-w-0 max-w-[160px] truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </span>
          )}
          {member.phone && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Phone className="w-3 h-3" />
              {member.phone}
            </span>
          )}
          {typeof member.servicesCount === 'number' && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Briefcase className="w-3 h-3" />
              {member.servicesCount} servizi
            </span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div
        className="w-9 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 cursor-pointer"
        style={{
          background: member.isActive ? '#10b981' : '#d1d5db',
          transition: 'background 0.2s ease',
        }}
        onClick={() => onToggleActive?.(!member.isActive)}
      >
        <div
          className="w-4 h-4 rounded-full bg-white"
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            transform: member.isActive ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Context menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg"
          style={{ color: 'rgba(0,0,0,0.25)', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = 'rgba(0,0,0,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,0,0,0.25)'; }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 bottom-full mb-1 w-44 py-1 z-[100] rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(168,85,247,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(168,85,247,0.05)',
            }}
          >
            {member.isActive ? (
              <MenuItem icon={ToggleLeft} label="Disattiva" onClick={() => { onToggleActive?.(false); setShowMenu(false); }} />
            ) : (
              <MenuItem icon={ToggleRight} label="Attiva" onClick={() => { onToggleActive?.(true); setShowMenu(false); }} />
            )}

            {member.isActive && (
              <>
                <MenuItem icon={Edit2} label="Modifica" onClick={() => { onEdit?.(); setShowMenu(false); }} />
                {onManageServices && (
                  <MenuItem icon={Briefcase} label="Gestisci servizi" onClick={() => { onManageServices(); setShowMenu(false); }} />
                )}
                {onManageHours && (
                  <MenuItem icon={Clock} label="Gestisci orari" onClick={() => { onManageHours(); setShowMenu(false); }} />
                )}
                {member.role !== 'owner' && (
                  <MenuItem icon={Trash2} label="Elimina" variant="danger" onClick={() => { onDelete?.(); setShowMenu(false); }} />
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

  const filteredStaff = React.useMemo(() => {
    let result = staff;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.fullName.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
      );
    }
    if (showActiveOnly) result = result.filter(m => m.isActive);
    return result;
  }, [staff, searchQuery, showActiveOnly]);

  const totalStaff = staff.length;
  const activeStaff = staff.filter(m => m.isActive).length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (staff.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl"
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
          animation: 'stl-card-in 0.35s ease-out both',
        }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cerca staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className="px-3.5 py-2 rounded-xl text-sm font-medium"
            style={{
              background: showActiveOnly ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.03)',
              color: showActiveOnly ? '#7c3aed' : '#6b7280',
              border: showActiveOnly ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            {showActiveOnly ? 'Solo attivi' : 'Tutti'}
          </button>

          <span className="text-xs text-gray-400">{activeStaff}/{totalStaff} attivi</span>

          {onAddStaff && (
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
                    animation: 'stl-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                  });
                  container.appendChild(span);
                  setTimeout(() => span.remove(), 600);
                }
                onAddStaff();
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
                animation: 'stl-shimmer 2.5s ease-in-out infinite',
              }} />
              <div data-ripple="" className="absolute inset-0 pointer-events-none" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Aggiungi membro</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff list */}
      <div className="space-y-2">
        {filteredStaff.map((member, i) => (
          <StaffCard
            key={member.id}
            member={member}
            delay={0.05 + i * 0.05}
            onEdit={() => onEditStaff?.(member)}
            onDelete={() => onDeleteStaff?.(member)}
            onToggleActive={(active) => onToggleActive?.(member, active)}
            onManageServices={() => onManageServices?.(member)}
            onManageHours={() => onManageHours?.(member)}
          />
        ))}

        {/* Search empty state */}
        {filteredStaff.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
            <p className="text-sm font-medium text-gray-500">Nessun membro trovato</p>
            <p className="text-xs text-gray-400 mt-1">Prova con una ricerca diversa</p>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes stl-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stl-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes stl-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}