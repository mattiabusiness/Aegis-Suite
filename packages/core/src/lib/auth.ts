// ============================================================================
// AEGIS SUITE - AUTHENTICATION HELPERS
// File: packages/core/src/lib/auth.ts
// ============================================================================

import type { User, AuthError } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, BusinessMember, UserRole, Database } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  user: User;
  profile: Profile | null;
}

export interface BusinessAccess {
  businessId: string;
  role: UserRole;
  permissions: {
    canManageBookings: boolean;
    canManageServices: boolean;
    canManageStaff: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
  };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  redirectTo?: string;
  termsAcceptedAt?: string;
  /** Slug del business da cui si registra il cliente (auto-crea record customers nel callback) */
  businessSlug?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ============================================================================
// AUTH FUNCTIONS (usate da tutti i verticali)
// ============================================================================

/**
 * Registra un nuovo utente
 */
export async function signUp(
  supabase: SupabaseClient<Database>,
  data: SignUpData
): Promise<AuthResult> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: data.redirectTo,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          ...(data.termsAcceptedAt ? { terms_accepted_at: data.termsAcceptedAt } : {}),
          ...(data.businessSlug ? { business_slug: data.businessSlug } : {}),
        },
      },
    });

    if (error) {
      return { success: false, error: translateAuthError(error) };
    }

    if (!authData.user) {
      return { success: false, error: 'Errore durante la registrazione' };
    }

    return { success: true, user: authData.user };
  } catch {
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Login utente esistente
 */
export async function signIn(
  supabase: SupabaseClient<Database>,
  data: SignInData
): Promise<AuthResult> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: translateAuthError(error) };
    }

    if (!authData.user) {
      return { success: false, error: 'Credenziali non valide' };
    }

    return { success: true, user: authData.user };
  } catch {
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Logout utente
 */
export async function signOut(
  supabase: SupabaseClient<Database>
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: translateAuthError(error) };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Errore durante il logout' };
  }
}

/**
 * Recupera password via email
 */
export async function resetPassword(
  supabase: SupabaseClient<Database>,
  email: string,
  redirectUrl?: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: translateAuthError(error) };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Aggiorna password
 */
export async function updatePassword(
  supabase: SupabaseClient<Database>,
  newPassword: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: translateAuthError(error) };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Ottiene l'utente corrente
 */
export async function getCurrentUser(
  supabase: SupabaseClient<Database>
): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Ottiene il profilo dell'utente corrente
 */
export async function getCurrentProfile(
  supabase: SupabaseClient<Database>
): Promise<Profile | null> {
  try {
    const user = await getCurrentUser(supabase);
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, created_at, updated_at')
      .eq('id', user.id)
      .single();

    return data;
  } catch {
    return null;
  }
}

// ============================================================================
// ROLE & PERMISSION HELPERS
// ============================================================================

/**
 * Verifica se l'utente è autenticato
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

/**
 * Verifica se l'utente ha un ruolo specifico in un business
 */
export function hasRole(
  members: BusinessMember[],
  userId: string,
  roles: UserRole[]
): boolean {
  const member = members.find((m) => m.user_id === userId && m.is_active);
  return member ? roles.includes(member.role) : false;
}

/**
 * Verifica se l'utente è owner o admin di un business
 */
export function isBusinessAdmin(
  members: BusinessMember[],
  userId: string
): boolean {
  return hasRole(members, userId, ['owner', 'admin']);
}

/**
 * Verifica se l'utente è owner di un business
 */
export function isBusinessOwner(
  members: BusinessMember[],
  userId: string
): boolean {
  return hasRole(members, userId, ['owner']);
}

/**
 * Ottiene i permessi dell'utente per un business
 */
export function getUserPermissions(
  members: BusinessMember[],
  userId: string
): BusinessAccess['permissions'] | null {
  const member = members.find((m) => m.user_id === userId && m.is_active);
  
  if (!member) return null;

  // Owner e Admin hanno tutti i permessi
  if (member.role === 'owner' || member.role === 'admin') {
    return {
      canManageBookings: true,
      canManageServices: true,
      canManageStaff: true,
      canViewAnalytics: true,
      canManageSettings: member.role === 'owner',
    };
  }

  // Staff usa i permessi granulari
  return {
    canManageBookings: member.can_manage_bookings,
    canManageServices: member.can_manage_services,
    canManageStaff: member.can_manage_staff,
    canViewAnalytics: member.can_view_analytics,
    canManageSettings: member.can_manage_settings,
  };
}

/**
 * Ottiene l'accesso dell'utente a un business specifico
 */
export function getBusinessAccess(
  members: BusinessMember[],
  userId: string,
  businessId: string
): BusinessAccess | null {
  const member = members.find(
    (m) => m.user_id === userId && m.business_id === businessId && m.is_active
  );

  if (!member) return null;

  const permissions = getUserPermissions(members, userId);
  if (!permissions) return null;

  return {
    businessId,
    role: member.role,
    permissions,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida formato email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida password (minimo 8 caratteri)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Valida formato telefono italiano
 */
export function isValidItalianPhone(phone: string): boolean {
  const phoneRegex = /^(\+39)?\s?3\d{2}\s?\d{6,7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Formatta telefono in formato standard
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('39')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  return `+39 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}

// ============================================================================
// ERROR TRANSLATION
// ============================================================================

/**
 * Traduce errori Supabase in italiano
 */
function translateAuthError(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email o password non corretti',
    'Email not confirmed': 'Conferma la tua email prima di accedere',
    'User already registered': 'Questa email è già registrata',
    'Password should be at least 6 characters': 'La password deve avere almeno 8 caratteri',
    'Unable to validate email address: invalid format': 'Formato email non valido',
    'Email rate limit exceeded': 'Troppi tentativi. Riprova tra qualche minuto',
    'For security purposes, you can only request this once every 60 seconds': 'Attendi 60 secondi prima di riprovare',
  };

  return errorMessages[error.message] || error.message;
}