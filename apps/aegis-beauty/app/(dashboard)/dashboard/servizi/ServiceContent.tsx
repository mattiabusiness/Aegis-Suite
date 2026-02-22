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
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ServiziContent({
  initialServices,
  initialCategories,
  businessId,
}: ServiziContentProps) {
  const router = useRouter();
  const supabase = createClient();

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
        .eq('id', deleteConfirm.id);

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
        .eq('id', deleteCategoryConfirm.id);

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
          .eq('id', editingCategory.id);

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

  const handleToggleActive = async (service: ServiceItem, active: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({ is_active: active } as never)
        .eq('id', service.id);

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
          .eq('id', editingService.id);

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

        // Update local state
        if (newService) {
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
              <p className="text-gray-500 mt-1">Gestisci i servizi offerti dal tuo salone</p>
            </div>
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
          </div>
          <style>{`@keyframes sl-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        {/* Content */}
        <div className="mt-6 pb-8">
          <ServiceList
            services={serviceItems}
            categories={categoryItems}
            currency="€"
            onAddService={handleAddService}
            onAddServiceToCategory={handleAddServiceToCategory}
            onEditService={handleEditService}
            onDeleteService={handleDeleteService}
            onToggleActive={handleToggleActive}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            showCategoryManagement={true}
            emptyState={
              <EmptyServices
                onAction={handleAddService}
                actionLabel="Aggiungi il primo servizio"
              />
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