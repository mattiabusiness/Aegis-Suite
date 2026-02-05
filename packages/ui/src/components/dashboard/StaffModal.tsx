// ============================================================================
// AEGIS SUITE - STAFF MODAL COMPONENTS
// File: packages/ui/src/components/dashboard/StaffModal.tsx
// Reusable modals for staff management: add/edit, services, hours
// ============================================================================

'use client';

import * as React from 'react';
import { X, ChevronDown, Check, Search, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';

// ============================================================================
// TYPES
// ============================================================================

export type StaffRole = 'owner' | 'employee';

export interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  color: string;
  isActive: boolean;
}

export interface StaffModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Submit callback */
  onSubmit: (data: StaffFormData) => Promise<void>;
  /** Initial data for editing (null for new staff) */
  initialData?: Partial<StaffFormData> | null;
  /** Modal title */
  title?: string;
  /** Submit button text */
  submitText?: string;
  /** Error message */
  error?: string;
  /** Hide owner role option (when owner already exists) */
  hideOwnerRole?: boolean;
  /** Staff is incomplete (no user_id yet) - will show QR code flow */
  isIncomplete?: boolean;
}

// Staff Services Modal Types
export interface ServiceOption {
  id: string;
  name: string;
  categoryName?: string;
  duration: number;
  price: number;
}

export interface StaffServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceIds: string[]) => Promise<void>;
  staffName: string;
  services: ServiceOption[];
  assignedServiceIds: string[];
  error?: string;
}

// Staff Hours Modal Types
export interface DayHours {
  dayOfWeek: string;
  dayLabel: string;
  isOpen: boolean;
  openTime1?: string;
  closeTime1?: string;
  openTime2?: string;
  closeTime2?: string;
}

export interface StaffHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (useBusinessHours: boolean, customHours?: DayHours[]) => Promise<void>;
  staffName: string;
  businessHours: DayHours[];
  currentHours?: DayHours[];
  useBusinessHours: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_OPTIONS: { value: StaffRole; label: string; description: string }[] = [
  { value: 'owner', label: 'Titolare', description: 'Accesso completo a tutte le funzionalità' },
  { value: 'employee', label: 'Collaboratore', description: 'Vede solo i propri appuntamenti' },
];

const COLOR_OPTIONS = [
  { value: '#9333ea', label: 'Viola' },
  { value: '#3b82f6', label: 'Blu' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Arancione' },
  { value: '#ef4444', label: 'Rosso' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6366f1', label: 'Indaco' },
  { value: '#14b8a6', label: 'Teal' },
];

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
};

// ============================================================================
// STAFF MODAL (Add/Edit)
// ============================================================================

export function StaffModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
  submitText,
  error,
  hideOwnerRole = false,
  isIncomplete = false,
}: StaffModalProps) {
  const isEditing = !!initialData?.fullName;
  const isCompletingProfile = isEditing && isIncomplete;
  
  // Determine title
  const modalTitle = title || (
    isCompletingProfile 
      ? 'Completa profilo' 
      : isEditing 
        ? 'Modifica membro' 
        : 'Nuovo membro dello staff'
  );
  
  // Determine button text
  const buttonText = submitText || (
    isCompletingProfile
      ? 'Salva e genera QR'
      : isEditing 
        ? 'Salva modifiche' 
        : 'Crea e genera QR'
  );
  
  // Show QR info for new staff OR completing incomplete profile
  const showQRInfo = !isEditing || isCompletingProfile;

  // Form state
  const [formData, setFormData] = React.useState<StaffFormData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'employee',
    color: initialData?.color || '#9333ea',
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  // Dropdown states
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [showColorDropdown, setShowColorDropdown] = React.useState(false);
  
  // Refs for click outside
  const roleRef = React.useRef<HTMLDivElement>(null);
  const colorRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (colorRef.current && !colorRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData?.fullName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'employee',
        color: initialData?.color || '#9333ea',
        isActive: initialData?.isActive ?? true,
      });
      setFormError('');
      setShowRoleDropdown(false);
      setShowColorDropdown(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Inserisci il nome completo');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Inserisci l\'email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Email non valida');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Inserisci il numero di telefono');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StaffFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected role
  const selectedRole = ROLE_OPTIONS.find(r => r.value === formData.role);
  
  // Get selected color
  const selectedColor = COLOR_OPTIONS.find(c => c.value === formData.color);

  // Filter roles if hideOwnerRole
  const availableRoles = hideOwnerRole 
    ? ROLE_OPTIONS.filter(r => r.value !== 'owner')
    : ROLE_OPTIONS;

  if (!isOpen) return null;

  const displayError = error || formError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {displayError && (
                <Alert variant="error">{displayError}</Alert>
              )}

              {/* Info box for new staff or completing profile */}
              {showQRInfo && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-700">
                    {isCompletingProfile 
                      ? <>Completando il profilo, verrà generato un <strong>QR code</strong> che il collaboratore può scansionare per completare la registrazione e accedere alla dashboard.</>
                      : <>Dopo la creazione, verrà generato un <strong>QR code</strong> che il collaboratore può scansionare per completare la registrazione e accedere alla dashboard.</>
                    }
                  </p>
                </div>
              )}

              {/* Full Name */}
              <Input
                label="Nome completo"
                placeholder="es. Mario Rossi"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />

              {/* Email */}
              <Input
                type="email"
                label="Email"
                placeholder="mario@esempio.it"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />

              {/* Phone */}
              <Input
                type="tel"
                label="Telefono"
                placeholder="+39 333 1234567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />

              {/* Role and Color row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Role - Modern Dropdown */}
                <div ref={roleRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruolo
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowColorDropdown(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <span className="text-gray-900">
                      {selectedRole?.label || 'Seleziona ruolo'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                      {availableRoles.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => { handleChange('role', role.value); setShowRoleDropdown(false); }}
                          className="w-full flex flex-col items-start px-4 py-2.5 text-left hover:bg-purple-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium text-gray-900">{role.label}</span>
                            {formData.role === role.value && (
                              <Check className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{role.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color - Modern Dropdown */}
                <div ref={colorRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colore
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowColorDropdown(!showColorDropdown); setShowRoleDropdown(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <span className="flex items-center gap-2 text-gray-900">
                      <span 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: formData.color }}
                      />
                      {selectedColor?.label || 'Seleziona'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showColorDropdown && (
                    <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => { handleChange('color', color.value); setShowColorDropdown(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-purple-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <span className="flex items-center gap-2 text-sm text-gray-900">
                            <span 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </span>
                          {formData.color === color.value && (
                            <Check className="w-4 h-4 text-purple-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active toggle - only for editing */}
              {isEditing && (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">Membro attivo</p>
                    <p className="text-sm text-gray-500">
                      I membri disattivati non possono ricevere prenotazioni
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('isActive', !formData.isActive)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${formData.isActive ? 'bg-purple-600' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                        ${formData.isActive ? 'left-7' : 'left-1'}
                      `}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" loading={loading}>
                {buttonText}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAFF SERVICES MODAL
// ============================================================================

export function StaffServicesModal({
  isOpen,
  onClose,
  onSave,
  staffName,
  services,
  assignedServiceIds,
  error,
}: StaffServicesModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(assignedServiceIds));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(assignedServiceIds));
      setSearchQuery('');
    }
  }, [isOpen, assignedServiceIds]);

  // Filter services by search
  const filteredServices = React.useMemo(() => {
    if (!searchQuery) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.categoryName?.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  // Group by category
  const groupedServices = React.useMemo(() => {
    const groups: Record<string, ServiceOption[]> = {};
    filteredServices.forEach(service => {
      const category = service.categoryName || 'Altri';
      if (!groups[category]) groups[category] = [];
      groups[category].push(service);
    });
    return groups;
  }, [filteredServices]);

  const toggleService = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(services.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(Array.from(selectedIds));
      onClose();
    } catch (err) {
      console.error('Error saving services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestisci servizi</h2>
              <p className="text-sm text-gray-500">{staffName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {/* Search + Select all */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca servizi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={selectedIds.size === services.length ? deselectAll : selectAll}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
              >
                {selectedIds.size === services.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>

            {/* Services list */}
            <div className="max-h-80 overflow-y-auto space-y-4">
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {categoryServices.map(service => (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">
                            {service.duration} min • €{service.price}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {filteredServices.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nessun servizio trovato</p>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-purple-600">{selectedIds.size}</span> di {services.length} servizi selezionati
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annulla
            </Button>
            <Button onClick={handleSave} loading={loading}>
              Salva
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAFF HOURS MODAL
// ============================================================================

export function StaffHoursModal({
  isOpen,
  onClose,
  onSave,
  staffName,
  businessHours,
  currentHours,
  useBusinessHours: initialUseBusinessHours,
  error,
}: StaffHoursModalProps) {
  const [useBusinessHours, setUseBusinessHours] = React.useState(initialUseBusinessHours);
  const [customHours, setCustomHours] = React.useState<DayHours[]>(
    currentHours || businessHours.map(h => ({ ...h }))
  );
  const [loading, setLoading] = React.useState(false);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUseBusinessHours(initialUseBusinessHours);
      setCustomHours(currentHours || businessHours.map(h => ({ ...h })));
    }
  }, [isOpen, initialUseBusinessHours, currentHours, businessHours]);

  const updateDayHours = (dayOfWeek: string, field: keyof DayHours, value: string | boolean) => {
    setCustomHours(prev => prev.map(h => 
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(useBusinessHours, useBusinessHours ? undefined : customHours);
      onClose();
    } catch (err) {
      console.error('Error saving hours:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestisci orari</h2>
              <p className="text-sm text-gray-500">{staffName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {/* Toggle business hours */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p className="font-medium text-gray-900">Usa orari del salone</p>
                <p className="text-sm text-gray-500">Stessi orari di apertura dell'attività</p>
              </div>
              <button
                type="button"
                onClick={() => setUseBusinessHours(!useBusinessHours)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  useBusinessHours ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  useBusinessHours ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Custom hours */}
            {!useBusinessHours && (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {customHours.map(day => (
                  <div key={day.dayOfWeek} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    {/* Day toggle */}
                    <button
                      type="button"
                      onClick={() => updateDayHours(day.dayOfWeek, 'isOpen', !day.isOpen)}
                      className={`w-24 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        day.isOpen 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {DAY_LABELS[day.dayOfWeek] || day.dayOfWeek}
                    </button>

                    {/* Time inputs */}
                    {day.isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={day.openTime1 || '09:00'}
                          onChange={(e) => updateDayHours(day.dayOfWeek, 'openTime1', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="time"
                          value={day.closeTime1 || '18:00'}
                          onChange={(e) => updateDayHours(day.dayOfWeek, 'closeTime1', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 flex-1">Chiuso</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {useBusinessHours && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Questo membro seguirà gli orari del salone</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annulla
            </Button>
            <Button onClick={handleSave} loading={loading}>
              Salva
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}