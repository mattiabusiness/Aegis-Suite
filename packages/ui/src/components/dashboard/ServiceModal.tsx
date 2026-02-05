// ============================================================================
// AEGIS SUITE - SERVICE MODAL COMPONENT
// File: packages/ui/src/components/dashboard/ServiceModal.tsx
// Reusable modal for adding/editing services
// ============================================================================

'use client';

import * as React from 'react';
import { X, ChevronDown, Clock, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  categoryId: string;
  isActive: boolean;
}

export interface ServiceModalCategory {
  id: string;
  name: string;
}

export interface ServiceModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Submit callback */
  onSubmit: (data: ServiceFormData) => Promise<void>;
  /** Available categories */
  categories: ServiceModalCategory[];
  /** Initial data for editing (null for new service) */
  initialData?: Partial<ServiceFormData> | null;
  /** Modal title */
  title?: string;
  /** Submit button text */
  submitText?: string;
  /** Currency symbol for price input */
  currency?: string;
  /** Error message */
  error?: string;
}

// ============================================================================
// DURATION OPTIONS
// ============================================================================

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 ora' },
  { value: 75, label: '1h 15min' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 ore' },
  { value: 150, label: '2h 30min' },
  { value: 180, label: '3 ore' },
];

// ============================================================================
// HELPER
// ============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData = null,
  title,
  submitText,
  currency = '€',
  error,
}: ServiceModalProps) {
  const isEditing = !!initialData?.name;
  const modalTitle = title || (isEditing ? 'Modifica servizio' : 'Nuovo servizio');
  const buttonText = submitText || (isEditing ? 'Salva modifiche' : 'Aggiungi servizio');

  // Form state
  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 30,
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = React.useState(false);
  
  // Refs for click outside
  const categoryRef = React.useRef<HTMLDivElement>(null);
  const durationRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (durationRef.current && !durationRef.current.contains(event.target as Node)) {
        setShowDurationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        description: initialData?.description || '',
        duration: initialData?.duration || 30,
        price: initialData?.price || 0,
        categoryId: initialData?.categoryId || (categories[0]?.id || ''),
        isActive: initialData?.isActive ?? true,
      });
      setFormError('');
      setShowCategoryDropdown(false);
      setShowDurationDropdown(false);
    }
  }, [isOpen, initialData, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Inserisci il nome del servizio');
      return;
    }
    if (formData.duration <= 0) {
      setFormError('Seleziona una durata valida');
      return;
    }
    if (formData.price < 0) {
      setFormError('Il prezzo non può essere negativo');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setFormError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected category name
  const selectedCategory = categories.find(c => c.id === formData.categoryId);

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

              {/* Name */}
              <Input
                label="Nome servizio"
                placeholder="es. Taglio donna"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione (opzionale)
                </label>
                <textarea
                  placeholder="Descrivi brevemente il servizio..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category - Modern Dropdown */}
              <div ref={categoryRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowDurationDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <span className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedCategory?.name || 'Seleziona categoria'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { handleChange('categoryId', cat.id); setShowCategoryDropdown(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-purple-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span className="text-sm text-gray-900">{cat.name}</span>
                        {formData.categoryId === cat.id && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration and Price row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Duration - Modern Dropdown */}
                <div ref={durationRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowDurationDropdown(!showDurationDropdown); setShowCategoryDropdown(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <span className="flex items-center gap-2 text-gray-900">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDuration(formData.duration)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDurationDropdown && (
                    <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                      {DURATION_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { handleChange('duration', opt.value); setShowDurationDropdown(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-purple-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <span className="text-sm text-gray-900">{opt.label}</span>
                          {formData.duration === opt.value && (
                            <Check className="w-4 h-4 text-purple-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prezzo ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price === 0 ? '' : formData.price}
                      onChange={(e) => handleChange('price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      onBlur={(e) => { if (e.target.value === '') handleChange('price', 0); }}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Servizio attivo</p>
                  <p className="text-sm text-gray-500">
                    I servizi disattivati non sono prenotabili
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