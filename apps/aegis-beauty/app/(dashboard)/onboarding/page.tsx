// ============================================================================
// AEGIS BEAUTY - ONBOARDING INDEX PAGE
// File: apps/aegis-beauty/app/(dashboard)/onboarding/page.tsx
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@aegis/core';

export default function OnboardingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAndRedirect() {
      const supabase = createClient();
      
      // Ottieni user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Ottieni business member
      const { data: businessMember } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!businessMember) {
        router.push('/login');
        return;
      }

      // Ottieni step corrente del business
      const { data: business } = await supabase
        .from('businesses')
        .select('onboarding_step, onboarding_completed')
        .eq('id', (businessMember as any).business_id)
        .single();

      // Se onboarding completato, vai alla dashboard
        if ((business as any)?.onboarding_completed) {
         router.push('/dashboard'); 
         return;
        }

      // Redirect allo step corrente (default 1)
      const currentStep = (business as any)?.onboarding_step || 1;
      router.push(`/onboarding/${currentStep}`);
    }

    checkAndRedirect();
  }, [router]);

  // Loading state mentre controlla
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Caricamento...</p>
      </div>
    </div>
  );
}
