// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 6: SERVICES
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step6Services.tsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition, AnimatedSelect } from '@aegis/ui';
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

function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const svgPath = getCategoryIconSvg(iconName);
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: svgPath }} />;
}

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 120].map(d => ({
  value: String(d),
  label: d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}` : `${d} min`,
}));

export function Step6Services({ businessId, businessType }: Step6Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();

  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [counterBounce, setCounterBounce] = useState(false);
  const [lastToggledId, setLastToggledId] = useState<string | null>(null);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);
  const triggerShake = useCallback(() => { setShaking(true); setTimeout(() => setShaking(false), 500); }, []);

  useEffect(() => {
    async function loadServices() {
      if (!businessType) { setLoading(false); return; }

      const dc = getDefaultCategories(businessType);
      const ds = getDefaultServices(businessType);

      // Fetch categories and services in parallel
      const [{ data: savedCategories }, { data: savedServices }] = await Promise.all([
        supabase
          .from('service_categories')
          .select('id, name, icon, display_order')
          .eq('business_id', businessId)
          .order('display_order'),
        supabase
          .from('services')
          .select('id, name, duration_minutes, price, category_id, is_active, display_order')
          .eq('business_id', businessId)
          .order('display_order'),
      ]);

      if (savedCategories && savedCategories.length > 0) {
        const savedSvcList = (savedServices || []) as { id: string; name: string; duration_minutes: number; price: number; category_id: string; is_active: boolean }[];
        const savedCatList = (savedCategories as { id: string; name: string; icon: string }[]);

        // Build a set of saved service names per category name for matching
        const savedNamesByCat = new Map<string, Set<string>>();
        const savedDataByCat = new Map<string, typeof savedSvcList>();
        for (const sc of savedCatList) {
          const svcsInCat = savedSvcList.filter(s => s.category_id === sc.id);
          savedNamesByCat.set(sc.name, new Set(svcsInCat.map(s => s.name)));
          savedDataByCat.set(sc.name, svcsInCat);
        }

        // Merge: use default categories as base, overlay saved data
        const merged: CategoryWithServices[] = dc.map(defCat => {
          const savedNames = savedNamesByCat.get(defCat.name);
          const savedData = savedDataByCat.get(defCat.name);
          const defServices = ds.filter(s => s.categoryId === defCat.id);

          if (savedNames && savedData) {
            // Category was saved — merge services
            const services: ServiceSelection[] = defServices.map(defSvc => {
              const saved = savedData.find(s => s.name === defSvc.name);
              if (saved) {
                return { id: defSvc.id, name: defSvc.name, duration: saved.duration_minutes, price: saved.price, selected: true, categoryId: defCat.id };
              }
              // Service existed in defaults but wasn't selected
              return { id: defSvc.id, name: defSvc.name, duration: defSvc.duration, price: defSvc.price, selected: false, categoryId: defCat.id };
            });
            return { id: defCat.id, name: defCat.name, icon: defCat.icon, expanded: true, services };
          }
          // Category wasn't saved at all — all deselected
          return {
            id: defCat.id, name: defCat.name, icon: defCat.icon, expanded: true,
            services: defServices.map(s => ({ id: s.id, name: s.name, duration: s.duration, price: s.price, selected: false, categoryId: s.categoryId })),
          };
        });

        setCategories(merged);
      } else {
        // No saved data, use defaults (all selected)
        setCategories(dc.map(cat => ({
          id: cat.id, name: cat.name, icon: cat.icon, expanded: true,
          services: ds.filter(s => s.categoryId === cat.id).map(s => ({
            id: s.id, name: s.name, duration: s.duration, price: s.price, selected: true, categoryId: s.categoryId,
          })),
        })));
      }
      setLoading(false);
    }
    loadServices();
  }, [businessType, businessId, supabase]);

  const toggleCategory = (id: string) => setCategories(p => p.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  const toggleService = (catId: string, svcId: string) => {
    setCategories(p => p.map(c => c.id !== catId ? c : { ...c, services: c.services.map(s => s.id === svcId ? { ...s, selected: !s.selected } : s) }));
    setCounterBounce(true);
    setTimeout(() => setCounterBounce(false), 300);
    // Flash green if selecting, nothing if deselecting
    const svc = categories.find(c => c.id === catId)?.services.find(s => s.id === svcId);
    if (svc && !svc.selected) {
      setLastToggledId(svcId);
      setTimeout(() => setLastToggledId(null), 500);
    }
  };
  const toggleAll = (catId: string, sel: boolean) => {
    setCategories(p => p.map(c => c.id !== catId ? c : { ...c, services: c.services.map(s => ({ ...s, selected: sel })) }));
    setCounterBounce(true);
    setTimeout(() => setCounterBounce(false), 300);
  };
  const updatePrice = (catId: string, svcId: string, price: number) => setCategories(p => p.map(c => c.id !== catId ? c : { ...c, services: c.services.map(s => s.id === svcId ? { ...s, price } : s) }));
  const updateDuration = (catId: string, svcId: string, dur: number) => setCategories(p => p.map(c => c.id !== catId ? c : { ...c, services: c.services.map(s => s.id === svcId ? { ...s, duration: dur } : s) }));
  const totalSelected = categories.reduce((a, c) => a + c.services.filter(s => s.selected).length, 0);

  const handleBack = () => router.push('/onboarding/5');

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    const selected = categories.flatMap(c => c.services.filter(s => s.selected));
    if (selected.length === 0) { setError('Seleziona almeno un servizio'); triggerShake(); return; }
    if (e) triggerRipple(e);
    setSaving(true); setError('');
    try {
      await supabase.from('services').delete().eq('business_id', businessId);
      await supabase.from('service_categories').delete().eq('business_id', businessId);
      const cws = categories.filter(c => c.services.some(s => s.selected));
      for (let i = 0; i < cws.length; i++) {
        const cat = cws[i];
        const { data: cd, error: ce } = await supabase.from('service_categories').insert({ business_id: businessId, name: cat.name, icon: cat.icon, display_order: i, is_active: true } as never).select('id').single();
        if (ce) throw ce;
        const svcs = cat.services.filter(s => s.selected).map((s, j) => ({
          business_id: businessId, category_id: (cd as { id: string }).id, name: s.name, duration_minutes: s.duration, price: s.price, display_order: j, is_active: true, buffer_minutes: 0, price_from: false, requires_deposit: false, is_addon: false,
        }));
        const { error: se } = await supabase.from('services').insert(svcs as never[]);
        if (se) throw se;
      }
      await supabase.from('businesses').update({ onboarding_step: 7 } as never).eq('id', businessId);
      showTransition('Servizi configurati ✓', () => router.push('/onboarding/7'));
    } catch (err) {
      console.error('Error saving services:', err); setError('Errore durante il salvataggio. Riprova.'); triggerShake();
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 p-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ animation: shaking ? 's6Shake 0.5s ease-in-out' : undefined }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>

        {/* Header — fixed */}
        <div className="pt-6 pb-2 px-6 flex-shrink-0">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">I tuoi servizi</h2>
              <p className="text-gray-500 text-sm mt-0.5">Seleziona e personalizza i servizi che offri</p>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Counter */}
          <div className="flex items-center justify-center gap-2 mt-3 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300" style={{
              background: totalSelected > 0 ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(0,0,0,0.06)',
              animation: counterBounce ? 's6CounterBounce 0.3s ease-out' : undefined,
            }}>
              <span className="text-xs font-bold" style={{ color: totalSelected > 0 ? 'white' : '#9ca3af' }}>{totalSelected}</span>
            </div>
            <span className="text-sm text-gray-500">{totalSelected === 1 ? 'servizio selezionato' : 'servizi selezionati'}</span>
          </div>
        </div>

        {/* Scrollable services area */}
        <div className="flex-1 overflow-y-auto px-6 pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}>
          <div className="space-y-3">
            {categories.map((cat, catIdx) => {
              const selCount = cat.services.filter(s => s.selected).length;
              return (
                <div key={cat.id} className="rounded-xl" style={{
                  background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)',
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  animation: `s6FadeUp 0.3s ease-out ${catIdx * 0.08}s both`,
                }}>
                  {/* Category header */}
                  <button type="button" onClick={() => toggleCategory(cat.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-50/30 transition-colors rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)' }}>
                        <CategoryIcon iconName={cat.icon} className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: selCount > 0 ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)',
                        color: selCount > 0 ? '#7c3aed' : '#9ca3af',
                      }}>{selCount}/{cat.services.length}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 transition-transform duration-200" style={{ transform: cat.expanded ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {cat.expanded && (
                    <div className="px-4 pb-3">
                      <div className="flex gap-3 mb-2 pb-2 border-b border-gray-100/60">
                        <button type="button" onClick={() => toggleAll(cat.id, true)} className="text-[11px] text-purple-600 hover:text-purple-700 font-medium">Seleziona tutti</button>
                        <span className="text-gray-200">|</span>
                        <button type="button" onClick={() => toggleAll(cat.id, false)} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">Deseleziona tutti</button>
                      </div>
                      <div className="space-y-1.5">
                        {cat.services.map((svc, si) => (
                          <div key={svc.id}
                            className="p-2.5 rounded-xl cursor-pointer"
                            style={{
                              background: lastToggledId === svc.id ? 'rgba(16,185,129,0.06)' : svc.selected ? 'rgba(168,85,247,0.04)' : 'rgba(255,255,255,0.4)',
                              border: lastToggledId === svc.id ? '1.5px solid rgba(16,185,129,0.2)' : svc.selected ? '1.5px solid rgba(168,85,247,0.15)' : '1.5px solid transparent',
                              backdropFilter: 'blur(4px)',
                              transition: 'all 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease',
                              animation: `s6FadeUp 0.2s ease-out ${si * 0.03}s both`,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.06)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            onClick={() => toggleService(cat.id, svc.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200" style={{
                                background: svc.selected ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                                border: svc.selected ? 'none' : '2px solid #d1d5db',
                                boxShadow: svc.selected ? '0 2px 6px rgba(168,85,247,0.3)' : 'none',
                              }}>
                                {svc.selected && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's6Check 0.25s ease-out' }} />
                                  </svg>
                                )}
                              </div>
                              <span className={`flex-1 text-sm font-medium transition-colors ${svc.selected ? 'text-gray-900' : 'text-gray-400'}`}>{svc.name}</span>
                            </div>

                            {svc.selected && (
                              <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-2 ml-8" onClick={(e) => e.stopPropagation()} style={{ animation: 's6FadeUp 0.15s ease-out' }}>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <AnimatedSelect
                                    value={String(svc.duration)}
                                    onChange={(v) => updateDuration(cat.id, svc.id, parseInt(v))}
                                    options={DURATION_OPTIONS}
                                    compact
                                    maxVisible={6}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">€</span>
                                    <input type="number" value={svc.price} min={0} step={1}
                                      onChange={(e) => updatePrice(cat.id, svc.id, parseFloat(e.target.value) || 0)}
                                      className="w-16 text-xs pl-5 pr-2 py-1.5 rounded-xl outline-none transition-all duration-200"
                                      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.08)' }}
                                      onFocus={(e) => { e.currentTarget.style.border = '1.5px solid #a855f7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.12)'; }}
                                      onBlur={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer buttons — fixed */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-gray-100/50">
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} disabled={saving}
              className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 transition-all duration-300 outline-none hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Indietro
            </button>
            <button type="button" onClick={handleContinue} disabled={saving}
              className="relative flex-1 h-12 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              {!saving && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's6Shimmer 2.5s ease-in-out infinite' }} />}
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's6Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Continua<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>)}
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Potrai aggiungere o modificare i servizi dalla dashboard
          </p>
        </div>
      </div>

      <style>{`
        @keyframes s6FadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s6Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s6Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s6Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes s6Check { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
        @keyframes s6CounterBounce { 0%{transform:scale(1)} 40%{transform:scale(1.25)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
}