// ============================================================================
// AEGIS BEAUTY - STAFF PERMISSIONS CONTEXT
// File: apps/aegis-beauty/lib/staff-permissions-context.tsx
// Rende i permessi staff disponibili a tutti i componenti della dashboard
// senza prop drilling.
// ============================================================================

'use client';

import { createContext, useContext } from 'react';
import type { StaffPermissions } from '@aegis/core';

// ============================================================================
// CONTEXT
// ============================================================================

// Fallback owner-like: se per qualsiasi motivo il context non è disponibile,
// l'utente vede tutto (safe default — il check reale è server-side nel layout)
const ownerFallback: StaffPermissions = {
  role: 'owner',
  isOwnerOrAdmin: true,
  isStaff: false,
  currentStaffId: null,
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

const StaffPermissionsContext = createContext<StaffPermissions>(ownerFallback);

// ============================================================================
// PROVIDER
// ============================================================================

interface StaffPermissionsProviderProps {
  permissions: StaffPermissions;
  children: React.ReactNode;
}

export function StaffPermissionsProvider({
  permissions,
  children,
}: StaffPermissionsProviderProps) {
  return (
    <StaffPermissionsContext.Provider value={permissions}>
      {children}
    </StaffPermissionsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useStaffPermissions(): StaffPermissions {
  return useContext(StaffPermissionsContext);
}
