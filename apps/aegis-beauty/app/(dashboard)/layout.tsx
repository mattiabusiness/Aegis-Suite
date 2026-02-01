// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT
// File: apps/aegis-beauty/app/(dashboard)/layout.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { DashboardLayoutClient } from './dashboardlayoutclient';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface BusinessData {
  id: string;
  name: string;
  logo_url: string | null;
  onboarding_completed: boolean;
}

interface ProfileData {
  full_name: string;
  email: string;
}

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Next.js 15: cookies() è async
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  // Se non autenticato, redirect a login
  if (!user) {
    redirect('/login');
  }

  // Ottieni business member
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  // Se non è membro di un business, redirect a login
  if (!businessMember) {
    redirect('/login');
  }

  // Ottieni dati business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, logo_url, onboarding_completed')
    .eq('id', (businessMember as { business_id: string }).business_id)
    .single() as { data: BusinessData | null };

  if (!business) {
    redirect('/login');
  }

  // Ottieni profilo utente
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  if (profileError) {
  console.error('Profile error message:', profileError.message);
  }

  // Prepara dati per il client component
  const dashboardData = {
    business: {
      id: business.id,
      name: business.name || 'Il tuo salone',
      logoUrl: business.logo_url,
      onboardingCompleted: business.onboarding_completed,
    },
    user: {
      id: user.id,
      name: (profile as ProfileData | null)?.full_name || 'Utente',
      email: (profile as ProfileData | null)?.email || user.email || '',
    },
  };

  return (
    <DashboardLayoutClient data={dashboardData}>
      {children}
    </DashboardLayoutClient>
  );
}