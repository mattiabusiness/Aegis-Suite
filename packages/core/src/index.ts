// ============================================================================
// AEGIS SUITE - CORE PACKAGE
// File: packages/core/src/index.ts
// ============================================================================

// Supabase client
export { createClient, createServerSupabaseClient } from './lib/supabase';

// Auth functions
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentUser,
  getCurrentProfile,
  isAuthenticated,
  hasRole,
  isBusinessAdmin,
  isBusinessOwner,
  getUserPermissions,
  getBusinessAccess,
  isValidEmail,
  isValidPassword,
  isValidItalianPhone,
  formatPhone,
} from './lib/auth';

// Business functions
export {
  generateSlug,
  isSlugAvailable,
  generateUniqueSlug,
  createBusiness,
  registerBusiness,
  getCurrentUserBusiness,
  getBusinessBySlug,
} from './lib/business';

// Auth Types
export type { 
  AuthUser, 
  BusinessAccess,
  AuthResult,
  SignUpData,
  SignInData,
} from './lib/auth';

// Business Types
export type {
  CreateBusinessData,
  BusinessResult,
  RegisterBusinessData,
  RegisterBusinessResult,
} from './lib/business';

// Availability Engine
export {
  getAvailableSlots,
  checkSlotAvailability,
  isDateClosed,
  getOccupiedWorkstations,
  getDayOccupancy,
  computeEventColumns,
  timeToMinutes,
  minutesToTime,
} from './lib/availability';

// Availability Types
export type {
  AvailabilityConfig,
  DayHours as AvailabilityDayHours,
  StaffDayHours,
  ExistingAppointment,
  ClosureInfo,
  StaffTimeOff,
  AvailableSlot,
  SlotCheckResult,
} from './lib/availability';