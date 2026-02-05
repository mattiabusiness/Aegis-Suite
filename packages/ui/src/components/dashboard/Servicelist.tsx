// ============================================================================
// AEGIS SUITE - SERVICE LIST COMPONENT
// File: packages/ui/src/components/dashboard/ServiceList.tsx
// Reusable service management component for all verticals
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
  GripVertical,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
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
  /** List of services */
  services: ServiceItem[];
  /** List of categories */
  categories: ServiceCategory[];
  /** Currency symbol */
  currency?: string;
  /** Callback when add service is clicked */
  onAddService?: () => void;
  /** Callback when add service to specific category is clicked */
  onAddServiceToCategory?: (categoryId: string) => void;
  /** Callback when edit service is clicked */
  onEditService?: (service: ServiceItem) => void;
  /** Callback when delete service is clicked */
  onDeleteService?: (service: ServiceItem) => void;
  /** Callback when service active state is toggled */
  onToggleActive?: (service: ServiceItem, active: boolean) => void;
  /** Callback when add category is clicked */
  onAddCategory?: () => void;
  /** Callback when edit category is clicked */
  onEditCategory?: (category: ServiceCategory) => void;
  /** Callback when delete category is clicked */
  onDeleteCategory?: (category: ServiceCategory) => void;
  /** Show category management */
  showCategoryManagement?: boolean;
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
// SUB-COMPONENTS
// ============================================================================

interface ServiceCardProps {
  service: ServiceItem;
  currency: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
}

function ServiceCard({ service, currency, onEdit, onDelete, onToggleActive }: ServiceCardProps) {
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
        group relative flex items-center justify-between p-4 
        bg-white border border-gray-200 rounded-xl
        hover:border-purple-200 hover:shadow-sm transition-all
        ${!service.isActive ? 'opacity-60' : ''}
      `}
    >
      {/* Drag handle - for future drag & drop */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Service info */}
      <div className="flex-1 ml-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{service.name}</h4>
          {!service.isActive && (
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              Disattivo
            </span>
          )}
        </div>
        {service.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {formatDuration(service.duration)}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right mr-4">
        <span className="text-lg font-semibold text-gray-900">
          {formatPrice(service.price, currency)}
        </span>
      </div>

      {/* Actions menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => { onToggleActive?.(!service.isActive); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {service.isActive ? (
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
            {service.isActive && (
              <>
                <button
                  onClick={() => { onEdit?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifica
                </button>
                <button
                  onClick={() => { onDelete?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
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
}

function CategorySection({
  category,
  services,
  currency,
  defaultExpanded = true,
  onEditService,
  onDeleteService,
  onToggleActive,
  onEditCategory,
  onDeleteCategory,
  onAddService,
  showCategoryManagement,
}: CategorySectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [showCategoryMenu, setShowCategoryMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <div className="mb-6">
      {/* Category header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left group"
        >
          <div className="p-1 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <span className="text-sm text-gray-500">
            ({activeCount}/{services.length})
          </span>
        </button>

        {showCategoryManagement && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showCategoryMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => { onEditCategory?.(); setShowCategoryMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifica
                </button>
                <button
                  onClick={() => { onDeleteCategory?.(); setShowCategoryMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services list */}
      {expanded && (
        <div className="space-y-2 pl-2">
          {services.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Nessun servizio in questa categoria
              </p>
              {onAddService && (
                <button
                  onClick={onAddService}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi servizio
                </button>
              )}
            </div>
          ) : (
            services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                currency={currency}
                onEdit={() => onEditService?.(service)}
                onDelete={() => onDeleteService?.(service)}
                onToggleActive={(active) => onToggleActive?.(service, active)}
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

  // Filter services
  const filteredServices = React.useMemo(() => {
    let result = services;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.categoryName?.toLowerCase().includes(query)
      );
    }

    // Filter by active status
    if (showActiveOnly) {
      result = result.filter(s => s.isActive);
    }

    return result;
  }, [services, searchQuery, showActiveOnly]);

  // Group services by category
  const servicesByCategory = React.useMemo(() => {
    const grouped = new Map<string, ServiceItem[]>();
    
    // Initialize with all categories
    categories.forEach(cat => {
      grouped.set(cat.id, []);
    });
    
    // Add "uncategorized" for services without category
    grouped.set('uncategorized', []);

    // Group services
    filteredServices.forEach(service => {
      const catId = service.categoryId || 'uncategorized';
      const list = grouped.get(catId) || [];
      list.push(service);
      grouped.set(catId, list);
    });

    return grouped;
  }, [filteredServices, categories]);

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (services.length === 0 && emptyState) {
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
            placeholder="Cerca servizi..."
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
            {activeServices}/{totalServices} attivi
          </span>

          {/* Add button */}
          {onAddService && (
            <Button onClick={onAddService} className="gap-2">
              <Plus className="w-4 h-4" />
              Aggiungi servizio
            </Button>
          )}
        </div>
      </div>

      {/* Service list by category */}
      <div>
        {categories.map(category => {
          const categoryServices = servicesByCategory.get(category.id) || [];
          
          // Skip empty categories when searching
          if (searchQuery && categoryServices.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              services={categoryServices}
              currency={currency}
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

        {/* Uncategorized services */}
        {(servicesByCategory.get('uncategorized')?.length || 0) > 0 && (
          <CategorySection
            category={{ id: 'uncategorized', name: 'Senza categoria' }}
            services={servicesByCategory.get('uncategorized') || []}
            currency={currency}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
            onToggleActive={onToggleActive}
            showCategoryManagement={false}
          />
        )}

        {/* No results */}
        {filteredServices.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun servizio trovato per "{searchQuery}"</p>
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