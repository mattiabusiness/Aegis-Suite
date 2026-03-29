// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT
// File: apps/aegis-beauty/app/(dashboard)/layout.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser, getCurrentStaffPermissions, resolveStaffPermissions } from '@aegis/core';
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
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Ottieni business member — solo owner/admin/staff, mai customer
  // Usa limit(2) + client-side priority per evitare errore .single() se l'utente ha ruoli multipli
  const { data: staffMembers } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('role', ['owner', 'admin', 'staff']) as { data: Array<{ business_id: string; role: string }> | null };

  // Priorità: owner > admin > staff
  let businessMember = staffMembers?.find((m) => m.role === 'owner')
    ?? staffMembers?.find((m) => m.role === 'admin')
    ?? staffMembers?.find((m) => m.role === 'staff')
    ?? null;

  // Se non trovato, prova il setup automatico via API route (che ha accesso al service role)
  if (!businessMember) {
    console.log('[Layout] nessun business_member per user:', user.id, '— chiamo setup API');
    try {
      const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const setupRes = await fetch(`${baseUrl}/api/staff/setup`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
      });

      const setupBody = await setupRes.text();
      console.log('[Layout] setup API status:', setupRes.status, '| body:', setupBody);

      if (setupRes.ok) {
        const parsed = JSON.parse(setupBody) as { businessId: string; role: string };
        businessMember = { business_id: parsed.businessId, role: parsed.role } as unknown as typeof businessMember;
      }
    } catch (e) {
      console.error('[Layout] setup API error:', e);
    }

    if (!businessMember) {
      console.log('[Layout] setup fallito → redirect /login?reason=no_access');
      redirect('/login?reason=no_access');
    }
  }

  // Ottieni dati business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, logo_url, onboarding_completed')
    .eq('id', (businessMember as { business_id: string }).business_id)
    .single() as { data: BusinessData | null };

  if (!business) {
    redirect('/login?reason=no_access');
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

  // Calcola permessi staff server-side
  const businessId = (businessMember as { business_id: string }).business_id;
  const permissions = await getCurrentStaffPermissions(supabase, user.id, businessId)
    ?? resolveStaffPermissions(
        { role: 'owner', can_see_business_calendar: true, can_see_business_stats: true, can_manage_team_bookings: true, team_booking_staff_ids: [], can_manage_settings: true },
        null
      );

  return (
    <DashboardLayoutClient data={dashboardData} permissions={permissions}>
      {children}
    </DashboardLayoutClient>
  );
}
