// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 3: LOGO
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step3Logo.tsx
// ============================================================================

'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step3Props {
  businessId: string;
  businessType: BusinessType | null;
  initialLogoUrl: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    default: return 'salone';
  }
}

export function Step3Logo({ businessId, businessType, initialLogoUrl }: Step3Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label = getBusinessLabel(businessType);

  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const processFile = (file: File) => {
    setError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato non supportato. Usa PNG, JPG o WebP.');
      triggerShake();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Il file è troppo grande. Massimo 2MB.');
      triggerShake();
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveLogo = async () => {
    if (logoUrl) {
      const fileName = logoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('Logos').remove([`${businessId}/${fileName}`]);
      }
    }
    setLogoFile(null);
    setPreviewUrl(null);
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoUrl || null;
    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${businessId}/${fileName}`;
      if (logoUrl) {
        const oldFileName = logoUrl.split('/').pop();
        if (oldFileName) await supabase.storage.from('Logos').remove([`${businessId}/${oldFileName}`]);
      }
      const { error: uploadError } = await supabase.storage.from('Logos').upload(filePath, logoFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('Logos').getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => router.push('/onboarding/2');

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRipple(e);
    setLoading(true);
    setError('');
    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) finalLogoUrl = await uploadLogo() || '';
      const updateData: BusinessUpdate = { logo_url: finalLogoUrl || undefined, onboarding_step: 4 };
      const { error: updateError } = await supabase.from('businesses').update(updateData as never).eq('id', businessId);
      if (updateError) throw updateError;
      showTransition('Logo inserito ✓', () => router.push('/onboarding/4'));
    } catch (err) {
      console.error('Error saving logo:', err);
      setError('Errore durante il salvataggio. Riprova.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRipple(e);
    setLoading(true);
    try {
      await supabase.from('businesses').update({ onboarding_step: 4 } as never).eq('id', businessId);
      showTransition('Step saltato — puoi caricare il logo dalla dashboard', () => router.push('/onboarding/4'));
    } catch (err) {
      console.error('Error skipping:', err);
      setError('Errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-xl mx-auto"
      style={{ animation: shaking ? 's3Shake 0.5s ease-in-out' : undefined }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden">

        {/* Header — icon inline */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}
            >
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Logo del {label}</h2>
              <p className="text-gray-500 text-sm mt-0.5">Personalizza la tua app con il tuo logo</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-7 pt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex flex-col items-center" style={{ animation: 's3FadeUp 0.4s ease-out both' }}>
            {/* Drop zone / Preview */}
            {previewUrl ? (
              <div className="relative mb-5">
                <div
                  className="w-36 h-36 rounded-2xl overflow-hidden"
                  style={{
                    border: '3px solid #a855f7',
                    boxShadow: '0 8px 30px rgba(168,85,247,0.2)',
                  }}
                >
                  <img src={previewUrl} alt="Logo preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs mb-5 cursor-pointer transition-all duration-300"
              >
                <div
                  className="flex flex-col items-center justify-center py-8 rounded-2xl"
                  style={{
                    border: dragOver ? '2px solid #a855f7' : '2px dashed rgba(168,85,247,0.3)',
                    background: dragOver ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: dragOver ? '0 0 0 4px rgba(168,85,247,0.1)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: dragOver ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(168,85,247,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <svg
                      className="w-7 h-7 transition-colors duration-300"
                      style={{ color: dragOver ? 'white' : '#a855f7' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {dragOver ? 'Rilascia qui!' : 'Trascina o clicca per caricare'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG o WebP · Max 2MB</p>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="hidden" />

            {/* Change image button if preview */}
            {previewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Cambia immagine
              </button>
            )}

            {/* Info pills */}
            <div className="flex gap-3 mb-5 w-full max-w-xs" style={{ animation: 's3FadeUp 0.4s ease-out 0.1s both' }}>
              <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/60 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Formato</p>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WebP</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/60 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Consigliato</p>
                  <p className="text-[11px] text-gray-400">200×200 px min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3" style={{ animation: 's3FadeUp 0.4s ease-out 0.15s both' }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading || uploading}
              className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600
                transition-all duration-300 outline-none
                hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50
                focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Indietro
            </button>

            <button
              type="button"
              onClick={previewUrl ? handleContinue : handleSkip}
              disabled={loading || uploading}
              className="relative flex-1 h-12 rounded-xl font-semibold text-white text-sm
                transition-all duration-300 outline-none overflow-hidden
                focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
              }}
              onMouseEnter={(e) => { if (!loading && !uploading) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!loading && !uploading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {!loading && !uploading && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's3Shimmer 2.5s ease-in-out infinite' }} />
              )}
              {ripple && (
                <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's3Ripple 0.6s ease-out forwards' }} />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {loading || uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {previewUrl ? (uploading ? 'Caricamento...' : 'Continua') : 'Salta per ora'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai modificare il logo dalle impostazioni
          </p>
        </div>
      </div>

      <style>{`
        @keyframes s3FadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s3Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s3Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s3Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
      `}</style>
    </div>
  );
}