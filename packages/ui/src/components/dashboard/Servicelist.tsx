// ============================================================================
// AEGIS SUITE - SERVICE LIST COMPONENT (Perfected v2)
// File: packages/ui/src/components/dashboard/ServiceList.tsx
// Glass cards, hover glow, stagger entrance, consistent dashboard design.
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
  categoryId?: string;
  categoryName?: string;
  displayOrder?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  displayOrder?: number;
  servicesCount?: number;
}

export interface ServiceListProps {
  services: ServiceItem[];
  categories: ServiceCategory[];
  currency?: string;
  onAddService?: () => void;
  onAddServiceToCategory?: (categoryId: string) => void;
  onEditService?: (service: ServiceItem) => void;
  onDeleteService?: (service: ServiceItem) => void;
  onToggleActive?: (service: ServiceItem, active: boolean) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: ServiceCategory) => void;
  onDeleteCategory?: (category: ServiceCategory) => void;
  showCategoryManagement?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function formatPrice(price: number, currency: string): string {
  return `${currency}${price.toFixed(2).replace('.00', '')}`;
}

// ============================================================================
// SERVICE CARD
// ============================================================================

function ServiceCard({
  service, currency, onEdit, onDelete, onToggleActive, delay,
}: {
  service: ServiceItem;
  currency: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
  delay: number;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const readOnly = !onEdit && !onDelete && !onToggleActive;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="group relative flex items-center justify-between p-4 rounded-xl cursor-default"
      style={{
        background: service.isActive ? '#fff' : 'rgba(0,0,0,0.015)',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        opacity: service.isActive ? 1 : 0.6,
        animation: `sl-card-in 0.35s ease-out ${delay}s both`,
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
      {/* Left: Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Toggle — solo in modalità edit */}
        {!readOnly && (
          <div
            className="w-9 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 cursor-pointer"
            style={{
              background: service.isActive ? '#10b981' : '#d1d5db',
              transition: 'background 0.2s ease',
            }}
            onClick={() => onToggleActive?.(!service.isActive)}
          >
            <div
              className="w-4 h-4 rounded-full bg-white"
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                transform: service.isActive ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        )}

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{service.name}</p>
          {service.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{service.description}</p>
          )}
        </div>
      </div>

      {/* Right: Meta + Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
          {/* Duration */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(service.duration)}
          </div>

          {/* Price */}
          <div
            className="text-sm font-bold px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(168,85,247,0.06)',
              color: '#7c3aed',
            }}
          >
            {formatPrice(service.price, currency)}
          </div>

          {/* Context menu — solo in modalità edit */}
          {!readOnly && <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg"
              style={{
                color: 'rgba(0,0,0,0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = 'rgba(0,0,0,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,0,0,0.25)'; }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 bottom-full mb-1 w-40 py-1 z-[100] rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(168,85,247,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(168,85,247,0.05)',
                }}
              >
                <button
                  onClick={() => { onEdit?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700"
                  style={{ transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                    e.currentTarget.style.paddingLeft = '20px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(-12deg) scale(1.15)'; (icon as unknown as HTMLElement).style.color = '#9333ea'; }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)'; (icon as unknown as HTMLElement).style.color = ''; }
                  }}
                >
                  <Edit2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                  Modifica
                </button>
                <button
                  onClick={() => { onDelete?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600"
                  style={{ transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                    e.currentTarget.style.paddingLeft = '20px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(12deg) scale(1.15)'; (icon as unknown as HTMLElement).style.color = '#dc2626'; }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)'; (icon as unknown as HTMLElement).style.color = ''; }
                  }}
                >
                  <Trash2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                  Elimina
                </button>
              </div>
            )}
          </div>}
        </div>
    </div>
  );
}

// ============================================================================
// CATEGORY SECTION
// ============================================================================

function CategorySection({
  category, services, currency, defaultExpanded = true,
  onEditService, onDeleteService, onToggleActive,
  onEditCategory, onDeleteCategory, onAddService, showCategoryManagement, sectionDelay,
}: {
  category: ServiceCategory;
  services: ServiceItem[];
  currency: string;
  defaultExpanded?: boolean;
  onEditService?: (service: ServiceItem) => void;
  onDeleteService?: (service: ServiceItem) => void;
  onToggleActive?: (service: ServiceItem, active: boolean) => void;
  onEditCategory?: () => void;
  onDeleteCategory?: () => void;
  onAddService?: () => void;
  showCategoryManagement?: boolean;
  sectionDelay: number;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <div
      className="mb-6"
      style={{ animation: `sl-card-in 0.35s ease-out ${sectionDelay}s both` }}
    >
      {/* Category header */}
      <div
        className="flex items-center justify-between mb-3 p-3 rounded-xl"
        style={{
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.12)',
          transition: 'all 0.15s ease',
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.08)' }}
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9333ea' }} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" style={{ color: '#9333ea' }} />
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{category.name}</h3>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {activeCount}/{services.length}
          </span>
        </button>

        {showCategoryManagement && (
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
                className="absolute right-0 top-full mt-1 w-40 py-1 z-50 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(168,85,247,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(168,85,247,0.05)',
                }}
              >
                <button
                  onClick={() => { onEditCategory?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700"
                  style={{ transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                    e.currentTarget.style.paddingLeft = '20px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(-12deg) scale(1.15)'; (icon as unknown as HTMLElement).style.color = '#9333ea'; }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)'; (icon as unknown as HTMLElement).style.color = ''; }
                  }}
                >
                  <Edit2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                  Modifica
                </button>
                <button
                  onClick={() => { onDeleteCategory?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600"
                  style={{ transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                    e.currentTarget.style.paddingLeft = '20px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(12deg) scale(1.15)'; (icon as unknown as HTMLElement).style.color = '#dc2626'; }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) { (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)'; (icon as unknown as HTMLElement).style.color = ''; }
                  }}
                >
                  <Trash2 className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                  Elimina
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services */}
      {expanded && (
        <div className="space-y-2 pl-2">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Nessun servizio in questa categoria</p>
              {onAddService && (
                <button
                  onClick={onAddService}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
                  style={{
                    color: '#9333ea',
                    background: 'rgba(168,85,247,0.06)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi servizio
                </button>
              )}
            </div>
          ) : (
            services.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                currency={currency}
                delay={sectionDelay + 0.03 * (i + 1)}
                onEdit={onEditService ? () => onEditService(service) : undefined}
                onDelete={onDeleteService ? () => onDeleteService(service) : undefined}
                onToggleActive={onToggleActive ? (active) => onToggleActive(service, active) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ServiceList({
  services,
  categories,
  currency = '€',
  onAddService,
  onAddServiceToCategory,
  onEditService,
  onDeleteService,
  onToggleActive,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  showCategoryManagement = false,
  loading = false,
  emptyState,
  className = '',
}: ServiceListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showActiveOnly, setShowActiveOnly] = React.useState(false);
  const readOnly = !onEditService && !onDeleteService && !onToggleActive;

  const filteredServices = React.useMemo(() => {
    let result = services;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.categoryName?.toLowerCase().includes(query)
      );
    }
    if (showActiveOnly) result = result.filter(s => s.isActive);
    return result;
  }, [services, searchQuery, showActiveOnly]);

  const servicesByCategory = React.useMemo(() => {
    const grouped = new Map<string, ServiceItem[]>();
    categories.forEach(cat => grouped.set(cat.id, []));
    grouped.set('uncategorized', []);
    filteredServices.forEach(service => {
      const catId = service.categoryId || 'uncategorized';
      const list = grouped.get(catId) || [];
      list.push(service);
      grouped.set(catId, list);
    });
    return grouped;
  }, [filteredServices, categories]);

  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (services.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={className}>
      {/* ═══ Toolbar ═══ */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl"
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
          animation: 'sl-card-in 0.35s ease-out both',
        }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca servizi..."
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
          {/* Toggle filter — solo in modalità edit */}
          {!readOnly && (
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
          )}

          {/* Stats */}
          <span className="text-sm font-semibold text-gray-700">
            <span className="text-base">{activeServices}</span>
            <span className="text-gray-300 mx-0.5">/</span>
            <span className="text-gray-400 font-normal">{totalServices}</span>
            <span className="text-xs text-gray-400 font-normal ml-1">attivi</span>
          </span>

          {/* Add button */}
          {onAddService && (
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
                    animation: 'sl-ripple 0.6s ease-out forwards', pointerEvents: 'none',
                  });
                  container.appendChild(span);
                  setTimeout(() => span.remove(), 600);
                }
                onAddService();
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
                animation: 'sl-shimmer 2.5s ease-in-out infinite',
              }} />
              <div data-ripple="" className="absolute inset-0 pointer-events-none" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Aggiungi servizio</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ Categories & Services ═══ */}
      <div>
        {categories.map((category, ci) => {
          const categoryServices = servicesByCategory.get(category.id) || [];
          if (searchQuery && categoryServices.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              services={categoryServices}
              currency={currency}
              sectionDelay={0.05 + ci * 0.08}
              onEditService={onEditService}
              onDeleteService={onDeleteService}
              onToggleActive={onToggleActive}
              onEditCategory={() => onEditCategory?.(category)}
              onDeleteCategory={() => onDeleteCategory?.(category)}
              onAddService={() => onAddServiceToCategory?.(category.id)}
              showCategoryManagement={showCategoryManagement}
            />
          );
        })}

        {/* Uncategorized */}
        {(() => {
          const uncategorized = servicesByCategory.get('uncategorized') || [];
          if (uncategorized.length === 0) return null;

          return (
            <CategorySection
              key="uncategorized"
              category={{ id: 'uncategorized', name: 'Senza categoria' }}
              services={uncategorized}
              currency={currency}
              sectionDelay={0.05 + categories.length * 0.08}
              onEditService={onEditService}
              onDeleteService={onDeleteService}
              onToggleActive={onToggleActive}
              showCategoryManagement={false}
            />
          );
        })()}
      </div>

      {/* Search empty state */}
      {searchQuery && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
          <p className="text-sm font-medium text-gray-500">Nessun servizio trovato</p>
          <p className="text-xs text-gray-400 mt-1">Prova con una ricerca diversa</p>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes sl-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes sl-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes sl-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}