// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 3: LOGO
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step3Logo.tsx
// ============================================================================

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step3Props {
  businessId: string;
  businessType: BusinessType | null;
  initialLogoUrl: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon':
      return 'salone';
    case 'beauty_center':
      return 'centro';
    case 'mixed':
    default:
      return 'salone';
  }
}

export function Step3Logo({ businessId, businessType, initialLogoUrl }: Step3Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label = getBusinessLabel(businessType);

  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato non supportato. Usa PNG, JPG o WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Il file è troppo grande. Massimo 2MB.');
      return;
    }

    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (logoUrl) {
      const fileName = logoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('Logos')
          .remove([`${businessId}/${fileName}`]);
      }
    }

    setLogoFile(null);
    setPreviewUrl(null);
    setLogoUrl('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        if (oldFileName) {
          await supabase.storage
            .from('Logos')
            .remove([`${businessId}/${oldFileName}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('Logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/2');
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        finalLogoUrl = await uploadLogo() || '';
      }

      const updateData: BusinessUpdate = {
        logo_url: finalLogoUrl || undefined,
        onboarding_step: 4,
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      if (updateError) {
        throw updateError;
      }

      router.push('/onboarding/4');
    } catch (err) {
      console.error('Error saving logo:', err);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);

    try {
      const updateData: BusinessUpdate = {
        onboarding_step: 4,
      };

      await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      router.push('/onboarding/4');
    } catch (err) {
      console.error('Error skipping:', err);
      setError('Errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Logo del {label}</CardTitle>
        <CardDescription className="text-base mt-2">
          Carica il logo del tuo {label} per personalizzare la tua app
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

        <div className="flex flex-col items-center">
          {/* Preview Area */}
          {previewUrl ? (
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-lg">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                title="Rimuovi logo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors mb-6"
            >
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">Clicca per caricare</span>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload/Change button */}
          {!previewUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Seleziona immagine
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Cambia immagine
            </Button>
          )}

          {/* Info box migliorato */}
          <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Formati supportati</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dimensione massima</p>
                <p className="text-xs text-gray-500">2 MB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Consigliato</p>
                <p className="text-xs text-gray-500">Immagine quadrata, almeno 200×200 px</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading || uploading}
            className="flex-1"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </Button>
          
          {previewUrl ? (
            <Button
              type="button"
              onClick={handleContinue}
              loading={loading || uploading}
              className="flex-1"
            >
              {uploading ? 'Caricamento...' : 'Continua'}
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSkip}
              loading={loading}
              className="flex-1"
            >
              Salta per ora
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Potrai modificare il logo dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}

