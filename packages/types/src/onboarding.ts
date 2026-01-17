// ============================================================================
// AEGIS SUITE - ONBOARDING TYPES
// File: packages/types/src/onboarding.ts
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type BusinessType = 'hair_salon' | 'beauty_center' | 'mixed';

// ============================================================================
// STEP DATA TYPES
// ============================================================================

/** Step 1: Tipo di attività */
export interface OnboardingStep1Data {
  business_type: BusinessType;
}

/** Step 2: Dati base salone */
export interface OnboardingStep2Data {
  name: string;
  address_street?: string;
  address_city: string;
  address_postal_code: string;
  phone: string;
  email?: string;
}

/** Step 3: Logo (opzionale) */
export interface OnboardingStep3Data {
  logo_url?: string;
}

/** Step 4: Orari apertura */
export interface BusinessHourInput {
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  is_open: boolean;
  open_time_1?: string; // formato "HH:MM"
  close_time_1?: string;
  open_time_2?: string; // per pausa pranzo
  close_time_2?: string;
}

export interface OnboardingStep4Data {
  business_hours: BusinessHourInput[];
}

/** Step 5: Postazioni di lavoro */
export interface OnboardingStep5Data {
  workstations: number;
}

/** Step 6: Servizi */
export interface ServiceInput {
  category_name: string;
  category_icon?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface OnboardingStep6Data {
  services: ServiceInput[];
}

/** Step 7: Profilo staff (owner) */
export interface OnboardingStep7Data {
  display_name: string;
  service_ids: string[]; // UUID dei servizi che può eseguire
  use_business_hours: boolean;
  custom_hours?: BusinessHourInput[]; // solo se use_business_hours = false
}

/** Step 8: Calcolo ROI (opzionale) */
export interface ROIData {
  type: 'user_provided' | 'estimated';
  daily_phone_time?: number; // minuti
  daily_phone_bookings?: number;
  monthly_no_shows?: number;
  provided_at?: string; // ISO date
}

export interface OnboardingStep8Data {
  roi_data: ROIData;
}

// ============================================================================
// COMPLETE ONBOARDING STATE
// ============================================================================

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  data: {
    step1?: OnboardingStep1Data;
    step2?: OnboardingStep2Data;
    step3?: OnboardingStep3Data;
    step4?: OnboardingStep4Data;
    step5?: OnboardingStep5Data;
    step6?: OnboardingStep6Data;
    step7?: OnboardingStep7Data;
    step8?: OnboardingStep8Data;
  };
}

// ============================================================================
// DEFAULT SERVICES STRUCTURE
// ============================================================================

export interface DefaultService {
  name: string;
  price: number;
  duration: number; // minuti
  description?: string;
}

export interface DefaultCategory {
  name: string;
  icon: string;
  services: DefaultService[];
}

export interface DefaultServicesByType {
  hair_salon: DefaultCategory[];
  beauty_center: DefaultCategory[];
  mixed: DefaultCategory[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface OnboardingStepResult {
  success: boolean;
  error?: string;
  nextStep?: number;
}

export interface OnboardingCompleteResult {
  success: boolean;
  error?: string;
  businessSlug?: string;
  bookingUrl?: string;
}