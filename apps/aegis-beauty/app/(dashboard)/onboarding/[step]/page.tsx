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

  // Fetch business, profile and hours in parallel
  const [businessResult, profileResult, hoursResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, business_type, name, address_street, address_city, address_postal_code, phone, email, logo_url, slug, workstations')
      .eq('id', businessMember.business_id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single(),
    supabase
      .from('business_hours')
      .select('is_open')
      .eq('business_id', businessMember.business_id),
  ]);

  const business = businessResult.data as {
    id: string; business_type: string; name: string;
    address_street: string | null; address_city: string | null; address_postal_code: string | null;
    phone: string | null; email: string | null; logo_url: string | null; slug: string | null; workstations: number | null;
  } | null;

  if (!business) {
    redirect('/login');
  }

  const profile = profileResult.data as { full_name: string; phone: string | null } | null;
  const businessHours = hoursResult.data as { is_open: boolean }[] | null;

  const openDaysPerWeek = businessHours?.filter(h => h.is_open).length || 6;

  return (
    <>
      {/* Progress bar */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-4 shadow-sm">
        <ProgressBar
          currentStep={stepNumber}
          totalSteps={8}
          stepLabels={STEP_LABELS}
          showStepNumber={true}
          showPercentage={true}
        />
      </div>

      {/* Step content */}
      <div className="mt-6">
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
    </>
  );
}