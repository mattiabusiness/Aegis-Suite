// ============================================================================
// AEGIS SUITE - STAFF PERMISSIONS
// File: packages/core/src/lib/staff-permissions.ts
// Resolves what a business_member can see/do based on role + permission flags
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessMember, UserRole } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

export interface StaffPermissions {
  role: UserRole;
  isOwnerOrAdmin: boolean;
  isStaff: boolean;

  // Staff record id (staff.id, NOT user.id) — null if member has no staff record
  currentStaffId: string | null;

  // Calendario
  canSeeBusinessCalendar: boolean;

  // Statistiche
  canSeeBusinessStats: boolean;

  // Prenotazioni team
  canManageTeamBookings: boolean;
  teamBookingStaffIds: string[];

  // Clienti
  canAddClients: boolean;
  canExportClients: boolean;
  canImportClients: boolean;
  canDeleteClients: boolean;

  // Staff page
  canSeeStaffPage: boolean;

  // Impostazioni
  canManageSettings: boolean;
}

// ============================================================================
// RESOLVE — logica pura, nessuna DB call
// ============================================================================

export function resolveStaffPermissions(
  member: Pick<
    BusinessMember,
    | 'role'
    | 'can_see_business_calendar'
    | 'can_see_business_stats'
    | 'can_manage_team_bookings'
    | 'team_booking_staff_ids'
    | 'can_manage_settings'
  >,
  currentStaffId: string | null
): StaffPermissions {
  const isOwnerOrAdmin = member.role === 'owner' || member.role === 'admin';
  const isStaff = member.role === 'staff';

  if (isOwnerOrAdmin) {
    return {
      role: member.role,
      isOwnerOrAdmin: true,
      isStaff: false,
      currentStaffId,
      canSeeBusinessCalendar: true,
      canSeeBusinessStats: true,
      canManageTeamBookings: true,
      teamBookingStaffIds: [],
      canAddClients: true,
      canExportClients: true,
      canImportClients: true,
      canDeleteClients: true,
      canSeeStaffPage: true,
      canManageSettings: true,
    };
  }

  return {
    role: member.role,
    isOwnerOrAdmin: false,
    isStaff,
    currentStaffId,
    canSeeBusinessCalendar: member.can_see_business_calendar,
    canSeeBusinessStats: member.can_see_business_stats,
    canManageTeamBookings: member.can_manage_team_bookings,
    teamBookingStaffIds: member.team_booking_staff_ids ?? [],
    canAddClients: false,
    canExportClients: false,
    canImportClients: false,
    canDeleteClients: false,
    canSeeStaffPage: false,
    canManageSettings: false,
  };
}

// ============================================================================
// SERVER HELPER — legge DB e risolve
// ============================================================================

export async function getCurrentStaffPermissions(
  supabase: SupabaseClient,
  userId: string,
  businessId: string
): Promise<StaffPermissions | null> {
  // Leggi business_member con i nuovi campi permessi
  const { data: member } = await supabase
    .from('business_members')
    .select(
      'role, can_see_business_calendar, can_see_business_stats, can_manage_team_bookings, team_booking_staff_ids, can_manage_settings'
    )
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single();

  if (!member) return null;

  // Trova lo staff.id corrispondente all'utente (per filtrare gli appuntamenti)
  const { data: staffRecord } = await supabase
    .from('staff')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .single();

  return resolveStaffPermissions(member, staffRecord?.id ?? null);
}
