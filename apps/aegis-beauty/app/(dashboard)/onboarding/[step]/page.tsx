// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP PAGE
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/page.tsx
// ============================================================================

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { ProgressBar } from '@aegis/ui';

// Import degli step components
import { Step1BusinessType } from './steps/Step1BusinessType';
import { Step2BasicInfo } from './steps/Step2BasicInfo';
import { Step3Logo } from './steps/Step3Logo';
import { Step4Hours } from './steps/Step4Hours';
import { Step5Workstations } from './steps/Step5Workstations';
import { Step6Services } from './steps/Step6Services';
import { Step7Staff } from './steps/Step7Staff';
import { Step8ROI } from './steps/Step8ROI';

interface PageProps {
  params: Promise<{ step: string }>;
}

const STEP_LABELS = [
  'Tipo attività',
  'Informazioni',
  'Logo',
  'Orari',
  'Postazioni',
  'Servizi',
  'Staff',
  'Risparmio',
];

export default async function OnboardingStepPage({ params }: PageProps) {
  const { step } = await params;
  const stepNumber = parseInt(step);

  // Validazione step
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 8) {
    redirect('/onboarding/1');
  }

  // Next.js 15: cookies() è async
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Ottieni il business dell'utente
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .single() as { data: { business_id: string; role: string } | null };

  if (!businessMember) {
    redirect('/login');
  }

  // Ottieni dati business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessMember.business_id)
    .single() as { data: any };

  if (!business) {
    redirect('/login');
  }

  // Se onboarding completato, vai a dashboard
  // if (business.onboarding_completed) {
  //   redirect('/dashboard');
  // }

  // Ottieni profilo utente per lo Step 7 (nome, email, telefono)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single() as { data: { full_name: string; phone: string | null } | null };

  // Conta i giorni di apertura per lo Step 8
  const { data: businessHours } = await supabase
    .from('business_hours')
    .select('is_open')
    .eq('business_id', business.id) as { data: { is_open: boolean }[] | null };

  const openDaysPerWeek = businessHours?.filter(h => h.is_open).length || 6;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progress */}
      <div className="bg-white border border-gray-200 rounded-2xl mx-4 mt-4">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ProgressBar
            currentStep={stepNumber}
            totalSteps={8}
            stepLabels={STEP_LABELS}
            showStepNumber={true}
            showPercentage={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {stepNumber === 1 && (
          <Step1BusinessType 
            businessId={business.id}
            initialValue={business.business_type}
          />
        )}

        {stepNumber === 2 && (
          <Step2BasicInfo 
            businessId={business.id}
            businessType={business.business_type}
            initialData={{
              name: business.name || '',
              address_street: business.address_street || '',
              address_city: business.address_city || '',
              address_postal_code: business.address_postal_code || '',
              phone: business.phone || '',
              email: business.email || '',
            }}
            currentSlug={business.slug || ''}
          />
        )}

        {stepNumber === 3 && (
          <Step3Logo 
            businessId={business.id}
            businessType={business.business_type}
            initialLogoUrl={business.logo_url || ''}
          />
        )}

        {stepNumber === 4 && (
          <Step4Hours 
            businessId={business.id}
            businessType={business.business_type}
          />
        )}

        {stepNumber === 5 && (
          <Step5Workstations 
            businessId={business.id}
            businessType={business.business_type}
            initialValue={business.workstations || 3}
          />
        )}

        {stepNumber === 6 && (
          <Step6Services 
            businessId={business.id}
            businessType={business.business_type}
          />
        )}

        {stepNumber === 7 && (
          <Step7Staff 
            businessId={business.id}
            businessType={business.business_type}
            userFullName={profile?.full_name || ''}
            userId={user.id}
            userEmail={user.email || ''}
            userPhone={profile?.phone || null}
          />
        )}

        {stepNumber === 8 && (
          <Step8ROI 
            businessId={business.id}
            businessType={business.business_type}
            businessSlug={business.slug || ''}
            businessName={business.name || 'La tua attività'}
            openDaysPerWeek={openDaysPerWeek}
          />
        )}
      </div>
    </div>
  );
}