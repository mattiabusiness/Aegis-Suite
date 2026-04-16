// ============================================================================
// AEGIS BEAUTY - SERVIZI CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/servizi/ServiziContent.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ServiceList,
  ServiceModal,
  CategoryModal,
  EmptyServices,
  type ServiceItem,
  type ServiceCategory,
  type ServiceFormData,
  type CategoryFormData,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import { useStaffPermissions } from '@/lib/staff-permissions-context';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  category_id: string | null;
  display_order: number;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
}

interface ServiziContentProps {
  initialServices: ServiceData[];
  initialCategories: CategoryData[];
  businessId: string;
  shampooPrice: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ServiziContent({
  initialServices,
  initialCategories,
  businessId,
  shampooPrice: initialShampooPrice,
}: ServiziContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isStaff } = useStaffPermissions();

  // Shampoo price state
  const [shampooPrice, setShampooPrice] = useState(initialShampooPrice);
  const [shampooEditing, setShampooEditing] = useState(false);
  const [shampooInput, setShampooInput] = useState(String(initialShampooPrice));
  const [shampooSaving, setShampooSaving] = useState(false);

  // State
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceData | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<CategoryData | null>(null);

  // Transform data for ServiceList component
  const serviceItems: ServiceItem[] = services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    duration: s.duration_minutes,
    price: s.price,
    isActive: s.is_active,
    categoryId: s.category_id || undefined,
    categoryName: s.category?.name,
    displayOrder: s.display_order,
  }));

  const categoryItems: ServiceCategory[] = categories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon || undefined,
    displayOrder: c.display_order,
  }));

  const modalCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
  }));

  // Handlers
  const handleAddService = () => {
    setEditingService(null);
    setPreselectedCategoryId(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleAddServiceToCategory = (categoryId: string) => {
    setEditingService(null);
    setPreselectedCategoryId(categoryId);
    setError('');
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceItem) => {
    const fullService = services.find(s => s.id === service.id);
    if (fullService) {
      setEditingService(fullService);
      setError('');
      setIsModalOpen(true);
    }
  };

  const handleDeleteService = (service: ServiceItem) => {
    const fullService = services.find(s => s.id === service.id);
    if (fullService) {
      setDeleteConfirm(fullService);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteConfirm.id)
        .eq('business_id', businessId);

      if (deleteError) throw deleteError;

      // Update local state
      setServices(prev => prev.filter(s => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Errore durante l\'eliminazione del servizio');
    } finally {
      setIsDeleting(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    const fullCategory = categories.find(c => c.id === category.id);
    if (fullCategory) {
      setEditingCategory(fullCategory);
      setIsCategoryModalOpen(true);
    }
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    const fullCategory = categories.find(c => c.id === category.id);
    if (fullCategory) {
      setDeleteCategoryConfirm(fullCategory);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', deleteCategoryConfirm.id)
        .eq('business_id', businessId);

      if (deleteError) throw deleteError;

      // Update local state
      setCategories(prev => prev.filter(c => c.id !== deleteCategoryConfirm.id));
      // Update services that had this category
      setServices(prev => prev.map(s => 
        s.category_id === deleteCategoryConfirm.id 
          ? { ...s, category_id: null, category: null }
          : s
      ));
      setDeleteCategoryConfirm(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Errore durante l\'eliminazione della categoria');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        // Update existing category
        const { error: updateError } = await supabase
          .from('service_categories')
          .update({ name: data.name } as never)
          .eq('id', editingCategory.id)
          .eq('business_id', businessId);

        if (updateError) throw updateError;

        // Update local state
        setCategories(prev => prev.map(c => 
          c.id === editingCategory.id ? { ...c, name: data.name } : c
        ));
        // Update services with this category
        setServices(prev => prev.map(s => 
          s.category_id === editingCategory.id 
            ? { ...s, category: { id: editingCategory.id, name: data.name } }
            : s
        ));
      } else {
        // Create new category
        const { data: newCategory, error: insertError } = await supabase
          .from('service_categories')
          .insert({
            business_id: businessId,
            name: data.name,
            display_order: categories.length,
            is_active: true,
          } as never)
          .select('id, name, icon, display_order')
          .single();

        if (insertError) throw insertError;

        if (newCategory) {
          setCategories(prev => [...prev, newCategory as CategoryData]);
        }
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
      throw new Error('Errore durante il salvataggio');
    }
  };

  const handleSaveShampooPrice = async () => {
    const parsed = parseFloat(shampooInput.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) return;
    setShampooSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ shampoo_price: parsed } as never)
        .eq('id', businessId);
      if (!error) {
        setShampooPrice(parsed);
        setShampooEditing(false);
        router.refresh();
      }
    } finally {
      setShampooSaving(false);
    }
  };

  const handleToggleActive = async (service: ServiceItem, active: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({ is_active: active } as never)
        .eq('id', service.id)
        .eq('business_id', businessId);

      if (updateError) throw updateError;

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === service.id ? { ...s, is_active: active } : s
      ));
    } catch (err) {
      console.error('Error toggling service:', err);
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    setError('');

    try {
      if (editingService) {
        // Update existing service
        const { error: updateError } = await supabase
          .from('services')
          .update({
            name: data.name,
            description: data.description || null,
            duration_minutes: data.duration,
            price: data.price,
            category_id: data.categoryId || null,
            is_active: data.isActive,
          } as never)
          .eq('id', editingService.id)
          .eq('business_id', businessId);

        if (updateError) throw updateError;

        // Update local state
        setServices(prev => prev.map(s => 
          s.id === editingService.id 
            ? {
                ...s,
                name: data.name,
                description: data.description || null,
                duration_minutes: data.duration,
                price: data.price,
                category_id: data.categoryId || null,
                is_active: data.isActive,
                category: categories.find(c => c.id === data.categoryId) 
                  ? { id: data.categoryId, name: categories.find(c => c.id === data.categoryId)!.name }
                  : null,
              }
            : s
        ));
      } else {
        // Create new service
        const { data: newService, error: insertError } = await supabase
          .from('services')
          .insert({
            business_id: businessId,
            name: data.name,
            description: data.description || null,
            duration_minutes: data.duration,
            price: data.price,
            category_id: data.categoryId || null,
            is_active: data.isActive,
            display_order: services.length,
          } as never)
          .select(`
            id, name, description, duration_minutes, price, 
            is_active, category_id, display_order,
            category:service_categories(id, name)
          `)
          .single();

        if (insertError) throw insertError;

        // Auto-assign new service to all staff who have explicit service restrictions.
        // (staff with no entries already cover all services implicitly)
        if (newService) {
          const { data: allStaff } = await supabase
            .from('staff')
            .select('id')
            .eq('business_id', businessId)
            .eq('is_active', true) as { data: Array<{ id: string }> | null };

          if (allStaff && allStaff.length > 0) {
            const allStaffIds = allStaff.map(s => s.id);
            const { data: existingLinks } = await supabase
              .from('staff_services')
              .select('staff_id')
              .in('staff_id', allStaffIds) as { data: Array<{ staff_id: string }> | null };

            const staffWithRestrictions = [...new Set((existingLinks || []).map(r => r.staff_id))];
            if (staffWithRestrictions.length > 0) {
              await supabase.from('staff_services').insert(
                staffWithRestrictions.map(staffId => ({
                  staff_id: staffId,
                  service_id: (newService as { id: string }).id,
                })) as never
              );
            }
          }

          setServices(prev => [...prev, newService as ServiceData]);
        }
      }

      setIsModalOpen(false);
      setEditingService(null);
    } catch (err) {
      console.error('Error saving service:', err);
      throw new Error('Errore durante il salvataggio');
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="mb-6" style={{ animation: 'sl-fade-in 0.4s ease-out both' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Servizi</h1>
              <p className="text-gray-500 mt-1">{isStaff ? 'I trattamenti affidati a te' : 'Gestisci i servizi offerti dal tuo salone'}</p>
            </div>
            {!isStaff && (
              <button
                onClick={handleAddCategory}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  color: '#9333ea',
                  background: 'rgba(168,85,247,0.06)',
                  border: '1px solid rgba(168,85,247,0.12)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.12)'; }}
              >
                + Nuova categoria
              </button>
            )}
          </div>
          <style>{`@keyframes sl-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        {/* Shampoo service — sempre visibile, prezzo modificabile dal titolare */}
        {!isStaff && (
          <div
            className="mb-6 rounded-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(124,58,237,0.04) 100%)',
              border: '1px solid rgba(168,85,247,0.18)',
              boxShadow: '0 4px 16px rgba(168,85,247,0.08)',
              animation: 'sl-fade-in 0.45s ease-out 80ms both',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
                >
                  🚿
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Shampoo</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.1)', color: '#7c3aed', border: '1px solid rgba(168,85,247,0.2)' }}
                    >
                      Sempre incluso
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Lavaggio shampoo opzionale — il cliente sceglie in fase di prenotazione</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {shampooEditing ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={shampooInput}
                        onChange={e => setShampooInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveShampooPrice(); if (e.key === 'Escape') { setShampooEditing(false); setShampooInput(String(shampooPrice)); } }}
                        autoFocus
                        className="outline-none text-sm font-bold text-gray-900 text-right"
                        style={{
                          width: 60, borderRadius: 8, padding: '4px 8px',
                          border: '1px solid rgba(168,85,247,0.35)',
                          boxShadow: '0 0 0 3px rgba(168,85,247,0.08)',
                          background: '#fff',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSaveShampooPrice}
                      disabled={shampooSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{
                        background: shampooSaving ? '#c4b5fd' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                        boxShadow: shampooSaving ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
                      }}
                    >
                      {shampooSaving ? '...' : 'Salva'}
                    </button>
                    <button
                      onClick={() => { setShampooEditing(false); setShampooInput(String(shampooPrice)); }}
                      className="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500"
                      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-base font-bold text-gray-900">
                      €{shampooPrice.toFixed(2).replace('.00', '')}
                    </span>
                    <button
                      onClick={() => { setShampooEditing(true); setShampooInput(String(shampooPrice)); }}
                      className="p-2 rounded-lg text-gray-400 transition-all"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#9333ea'; e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
                      title="Modifica prezzo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-6 pb-8">
          <ServiceList
            services={serviceItems}
            categories={categoryItems}
            currency="€"
            onAddService={isStaff ? undefined : handleAddService}
            onAddServiceToCategory={isStaff ? undefined : handleAddServiceToCategory}
            onEditService={isStaff ? undefined : handleEditService}
            onDeleteService={isStaff ? undefined : handleDeleteService}
            onToggleActive={isStaff ? undefined : handleToggleActive}
            onEditCategory={isStaff ? undefined : handleEditCategory}
            onDeleteCategory={isStaff ? undefined : handleDeleteCategory}
            showCategoryManagement={!isStaff}
            emptyState={
              isStaff ? undefined : (
                <EmptyServices
                  onAction={handleAddService}
                  actionLabel="Aggiungi il primo servizio"
                />
              )
            }
          />
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingService(null); setPreselectedCategoryId(null); }}
        onSubmit={handleSubmit}
        categories={modalCategories}
        initialData={editingService ? {
          name: editingService.name,
          description: editingService.description || '',
          duration: editingService.duration_minutes,
          price: editingService.price,
          categoryId: editingService.category_id || '',
          isActive: editingService.is_active,
        } : preselectedCategoryId ? {
          categoryId: preselectedCategoryId,
        } : null}
        error={error}
      />

      {/* Add/Edit Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleCategorySubmit}
        initialData={editingCategory ? {
          name: editingCategory.name,
        } : null}
      />

      {/* Delete Service Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elimina servizio
              </h3>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare <strong>{deleteConfirm.name}</strong>? 
                Questa azione non può essere annullata.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setDeleteCategoryConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elimina categoria
              </h3>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare la categoria <strong>{deleteCategoryConfirm.name}</strong>? 
                I servizi associati non verranno eliminati ma perderanno la categoria.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteCategoryConfirm(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}