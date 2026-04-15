// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT
// File: apps/aegis-beauty/app/(dashboard)/layout.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser, resolveStaffPermissions } from '@aegis/core';
import { DashboardLayoutClient } from './dashboardlayoutclient';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface BusinessMemberData {
  business_id: string;
  role: string;
  can_see_business_calendar: boolean;
  can_see_business_stats: boolean;
  can_manage_team_bookings: boolean;
  team_booking_staff_ids: string[];
  can_manage_settings: boolean;
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

  // Ottieni business member con tutte le colonne permessi in un'unica query
  const { data: staffMembers } = await supabase
    .from('business_members')
    .select('business_id, role, can_see_business_calendar, can_see_business_stats, can_manage_team_bookings, team_booking_staff_ids, can_manage_settings')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('role', ['owner', 'admin', 'staff']) as { data: BusinessMemberData[] | null };

  // Priorità: owner > admin > staff
  let businessMember = staffMembers?.find((m) => m.role === 'owner')
    ?? staffMembers?.find((m) => m.role === 'admin')
    ?? staffMembers?.find((m) => m.role === 'staff')
    ?? null;

  // Se non trovato, prova il setup automatico via API route (che ha accesso al service role)
  if (!businessMember) {
    try {
      const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const setupRes = await fetch(`${baseUrl}/api/staff/setup`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
      });

      const setupBody = await setupRes.text();

      if (setupRes.ok) {
        const parsed = JSON.parse(setupBody) as { businessId: string; role: string };
        // Owner default permissions per i nuovi setup
        businessMember = {
          business_id: parsed.businessId,
          role: parsed.role,
          can_see_business_calendar: true,
          can_see_business_stats: true,
          can_manage_team_bookings: true,
          team_booking_staff_ids: [],
          can_manage_settings: true,
        };
      }
    } catch (e) {
      console.error('[Layout] setup API error:', e);
    }

    if (!businessMember) {
      console.log('[Layout] setup fallito → redirect /login?reason=no_access');
      redirect('/login?reason=no_access');
    }
  }

  const businessId = businessMember.business_id;

  // Parallelizza: business + profilo utente + staff record (per permissions)
  const [businessResult, profileResult, staffResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, logo_url, onboarding_completed')
      .eq('id', businessId)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single(),
    supabase
      .from('staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle(),
  ]);

  const business = businessResult.data as BusinessData | null;
  if (!business) {
    redirect('/login?reason=no_access');
  }

  const profile = profileResult.data as ProfileData | null;
  if (profileResult.error) {
    console.error('Profile error message:', profileResult.error.message);
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
      name: profile?.full_name || 'Utente',
      email: profile?.email || user.email || '',
    },
  };

  // Calcola permessi staff server-side (inline, senza query extra)
  const currentStaffId = (staffResult.data as { id: string } | null)?.id ?? null;
  const permissions = resolveStaffPermissions(
    {
      role: businessMember.role as 'owner' | 'admin' | 'staff',
      can_see_business_calendar: businessMember.can_see_business_calendar,
      can_see_business_stats: businessMember.can_see_business_stats,
      can_manage_team_bookings: businessMember.can_manage_team_bookings,
      team_booking_staff_ids: businessMember.team_booking_staff_ids,
      can_manage_settings: businessMember.can_manage_settings,
    },
    currentStaffId
  );

  return (
    <DashboardLayoutClient data={dashboardData} permissions={permissions}>
      {children}
    </DashboardLayoutClient>
  );
}
