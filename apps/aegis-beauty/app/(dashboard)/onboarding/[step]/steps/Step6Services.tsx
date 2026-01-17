// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 6: SERVICES
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step6Services.tsx
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';
import { getDefaultServices, getDefaultCategories, getCategoryIconSvg } from '@/lib/default-services';

interface Step6Props {
  businessId: string;
  businessType: BusinessType | null;
}

interface ServiceSelection {
  id: string;
  name: string;
  duration: number;
  price: number;
  selected: boolean;
  categoryId: string;
}

interface CategoryWithServices {
  id: string;
  name: string;
  icon: string;
  services: ServiceSelection[];
  expanded: boolean;
}

// Componente per renderizzare le icone SVG delle categorie
function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const svgPath = getCategoryIconSvg(iconName);
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      dangerouslySetInnerHTML={{ __html: svgPath }}
    />
  );
}

export function Step6Services({ businessId, businessType }: Step6Props) {
  const router = useRouter();
  const supabase = createClient();
  
  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Carica servizi predefiniti
  useEffect(() => {
    if (businessType) {
      const defaultCategories = getDefaultCategories(businessType);
      const defaultServices = getDefaultServices(businessType);

      const categoriesWithServices: CategoryWithServices[] = defaultCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        expanded: true,
        services: defaultServices
          .filter(s => s.categoryId === cat.id)
          .map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration,
            price: s.price,
            selected: true,
            categoryId: s.categoryId,
          })),
      }));

      setCategories(categoriesWithServices);
    }
    setLoading(false);
  }, [businessType]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const toggleService = (categoryId: string, serviceId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        services: cat.services.map(s => 
          s.id === serviceId ? { ...s, selected: !s.selected } : s
        ),
      };
    }));
  };

  const toggleAllInCategory = (categoryId: string, selected: boolean) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        services: cat.services.map(s => ({ ...s, selected })),
      };
    }));
  };

  const updateServicePrice = (categoryId: string, serviceId: string, price: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        services: cat.services.map(s => 
          s.id === serviceId ? { ...s, price } : s
        ),
      };
    }));
  };

  const updateServiceDuration = (categoryId: string, serviceId: string, duration: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        services: cat.services.map(s => 
          s.id === serviceId ? { ...s, duration } : s
        ),
      };
    }));
  };

  const getSelectedCount = () => {
    return categories.reduce((acc, cat) => 
      acc + cat.services.filter(s => s.selected).length, 0
    );
  };

  const handleBack = () => {
    router.push('/onboarding/5');
  };

  const handleContinue = async () => {
    const selectedServices = categories.flatMap(cat => 
      cat.services.filter(s => s.selected)
    );

    if (selectedServices.length === 0) {
      setError('Seleziona almeno un servizio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Elimina categorie e servizi esistenti
      await supabase
        .from('services')
        .delete()
        .eq('business_id', businessId);
      
      await supabase
        .from('service_categories')
        .delete()
        .eq('business_id', businessId);

      // Crea le categorie che hanno servizi selezionati
      const categoriesWithSelected = categories.filter(cat => 
        cat.services.some(s => s.selected)
      );

      for (let i = 0; i < categoriesWithSelected.length; i++) {
        const cat = categoriesWithSelected[i];
        
        // Inserisci categoria
        const { data: categoryData, error: catError } = await supabase
          .from('service_categories')
          .insert({
            business_id: businessId,
            name: cat.name,
            icon: cat.icon,
            display_order: i,
            is_active: true,
          } as never)
          .select('id')
          .single();

        if (catError) throw catError;

        // Inserisci servizi della categoria
        const selectedInCategory = cat.services.filter(s => s.selected);
        const servicesToInsert = selectedInCategory.map((s, j) => ({
          business_id: businessId,
          category_id: (categoryData as any).id,
          name: s.name,
          duration_minutes: s.duration,
          price: s.price,
          display_order: j,
          is_active: true,
          buffer_minutes: 0,
          price_from: false,
          requires_deposit: false,
          is_addon: false,
        }));

        const { error: servError } = await supabase
          .from('services')
          .insert(servicesToInsert as never[]);

        if (servError) throw servError;
      }

      // Aggiorna step
      const updateData: BusinessUpdate = {
        onboarding_step: 7,
      };

      await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      router.push('/onboarding/7');
    } catch (err) {
      console.error('Error saving services:', err);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full" padding="lg">
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Servizi offerti</CardTitle>
        <CardDescription className="text-base mt-2">
          Seleziona i servizi che offri e personalizza i prezzi
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Selected count */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-sm text-purple-700">
              <span className="font-semibold">{getSelectedCount()}</span> servizi selezionati
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {categories.map(category => (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon iconName={category.icon} className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    ({category.services.filter(s => s.selected).length}/{category.services.length})
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${category.expanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Services */}
              {category.expanded && (
                <div className="p-3 space-y-2">
                  {/* Select all / deselect all */}
                  <div className="flex gap-2 mb-3 pb-3 border-b border-gray-100">
                    <button
                      type="button"
                      onClick={() => toggleAllInCategory(category.id, true)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Seleziona tutti
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => toggleAllInCategory(category.id, false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Deseleziona tutti
                    </button>
                  </div>

                  {category.services.map(service => (
                    <div 
                      key={service.id}
                      className={`p-3 rounded-lg border ${
                        service.selected ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={service.selected}
                          onChange={() => toggleService(category.id, service.id)}
                          className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className={`flex-1 font-medium ${service.selected ? 'text-gray-900' : 'text-gray-500'}`}>
                          {service.name}
                        </span>
                      </div>
                      
                      {service.selected && (
                        <div className="mt-3 ml-8 flex gap-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <select
                              value={service.duration}
                              onChange={(e) => updateServiceDuration(category.id, service.id, parseInt(e.target.value))}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            >
                              {[15, 20, 30, 45, 60, 75, 90, 120].map(d => (
                                <option key={d} value={d}>{d} min</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="relative">
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => updateServicePrice(category.id, service.id, parseFloat(e.target.value) || 0)}
                                className="w-20 pl-2 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                min="0"
                                step="0.5"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="button" variant="outline" onClick={handleBack} disabled={saving} className="flex-1">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </Button>
          <Button type="button" onClick={handleContinue} loading={saving} className="flex-1">
            Continua
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Potrai aggiungere altri servizi dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}