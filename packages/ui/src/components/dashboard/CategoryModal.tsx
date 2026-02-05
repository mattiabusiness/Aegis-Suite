// ============================================================================
// AEGIS SUITE - CATEGORY MODAL COMPONENT
// File: packages/ui/src/components/dashboard/CategoryModal.tsx
// Reusable modal for adding/editing service categories
// ============================================================================

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryFormData {
  name: string;
  icon?: string;
}

export interface CategoryModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Submit callback */
  onSubmit: (data: CategoryFormData) => Promise<void>;
  /** Initial data for editing (null for new category) */
  initialData?: Partial<CategoryFormData> | null;
  /** Modal title */
  title?: string;
  /** Submit button text */
  submitText?: string;
  /** Error message */
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
  submitText,
  error,
}: CategoryModalProps) {
  const isEditing = !!initialData?.name;
  const modalTitle = title || (isEditing ? 'Modifica categoria' : 'Nuova categoria');
  const buttonText = submitText || (isEditing ? 'Salva modifiche' : 'Aggiungi categoria');

  // Form state
  const [name, setName] = React.useState(initialData?.name || '');
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name.trim()) {
      setFormError('Inserisci il nome della categoria');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim() });
      onClose();
    } catch (err) {
      setFormError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
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
                label="Nome categoria"
                placeholder="es. Taglio, Colore, Trattamenti..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
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