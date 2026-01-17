// ============================================================================
// AEGIS BEAUTY - ONBOARDING WIZARD
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/OnboardingWizard.tsx
// ============================================================================

'use client';

import { ProgressBar } from '@aegis/ui';
import type { BusinessType } from '@aegis/types';

// Step components
import { Step1BusinessType } from './steps/Step1BusinessType';
import { Step2BasicInfo } from './steps/Step2BasicInfo';
import { Step3Logo } from './steps/Step3Logo';
import { Step4Hours } from './steps/Step4Hours';
import { Step5Workstations } from './steps/Step5Workstations';
import { Step6Services } from './steps/Step6Services';
import { Step7Staff } from './steps/Step7Staff';
import { Step8ROI } from './steps/Step8ROI';

// ============================================================================
// TYPES
// ============================================================================

export interface BusinessData {
  business_type: BusinessType | null;
  name: string;
  slug: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  phone: string;
  email: string;
  logo_url: string;
  workstations: number;
  onboarding_step: number;
}

interface OnboardingWizardProps {
  currentStep: number;
  totalSteps: number;
  businessId: string;
  businessData: BusinessData;
  userFullName: string;
}

// ============================================================================
// HELPER - Get labels based on business type
// ============================================================================

function getLabels(businessType: BusinessType | null) {
  switch (businessType) {
    case 'hair_salon':
      return {
        businessName: 'salone',
        workstations: 'poltrone',
        staff: 'parrucchieri',
      };
    case 'beauty_center':
      return {
        businessName: 'centro',
        workstations: 'cabine',
        staff: 'estetiste',
      };
    case 'mixed':
    default:
      return {
        businessName: 'attività',
        workstations: 'postazioni',
        staff: 'operatori',
      };
  }
}

function getStepLabels(businessType: BusinessType | null) {
  const labels = getLabels(businessType);
  return [
    'Tipo attività',
    `Dati ${labels.businessName}`,
    'Logo',
    'Orari',
    labels.workstations.charAt(0).toUpperCase() + labels.workstations.slice(1),
    'Servizi',
    'Staff',
    'Riepilogo',
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingWizard({
  currentStep,
  totalSteps,
  businessId,
  businessData,
  userFullName,
}: OnboardingWizardProps) {
  const labels = getLabels(businessData.business_type);
  const stepLabels = getStepLabels(businessData.business_type);

  // Renderizza lo step corretto
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BusinessType
            businessId={businessId}
            initialValue={businessData.business_type}
          />
        );
      case 2:
        return (
          <Step2BasicInfo
            businessId={businessId}
            businessType={businessData.business_type}
            initialData={{
              name: businessData.name,
              address_street: businessData.address_street,
              address_city: businessData.address_city,
              address_postal_code: businessData.address_postal_code,
              phone: businessData.phone,
              email: businessData.email,
            }}
            currentSlug={businessData.slug}
          />
        );
      case 3:
        return (
          <Step3Logo
            businessId={businessId}
            businessType={businessData.business_type}
            initialLogoUrl={businessData.logo_url}
          />
        );
      case 4:
        return (
          <Step4Hours
            businessId={businessId}
            businessType={businessData.business_type}
          />
        );
      case 5:
        return (
          <Step5Workstations
            businessId={businessId}
            businessType={businessData.business_type}
            initialValue={businessData.workstations}
          />
        );
      case 6:
        return (
          <Step6Services
            businessId={businessId}
            businessType={businessData.business_type}
          />
        );
      case 7:
        return (
          <Step7Staff
            businessId={businessId}
            businessType={businessData.business_type}
            userFullName={userFullName}
          />
        );
      //case 8:
        //return (
         // <Step8ROI
          //  businessId={businessId}
          //  businessType={businessData.business_type}
          //  businessSlug={businessData.slug}
          //  businessName={businessData.name}
          //   openDaysPerWeek={openDaysPerWeek}
         // />
       // );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
        showPercentage
      />

      {/* Step Content */}
      {renderStep()}
    </div>
  );
}
