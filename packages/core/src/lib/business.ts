// ============================================================================
// AEGIS SUITE - BUSINESS HELPERS
// File: packages/core/src/lib/business.ts
// ============================================================================

import type { Business, PlatformVertical } from '@aegis/types';

// Tipo semplificato per il client Supabase (evita problemi di generics)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

// ============================================================================
// TYPES
// ============================================================================

export interface CreateBusinessData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  vertical: PlatformVertical;
  ownerId: string;
}

export interface BusinessResult {
  success: boolean;
  error?: string;
  business?: Business;
}

export interface RegisterBusinessData {
  // Dati owner
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  password: string;
  // Dati business
  businessName: string;
  businessPhone?: string;
}

export interface RegisterBusinessResult {
  success: boolean;
  error?: string;
  userId?: string;
  businessId?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Genera uno slug URL-friendly dal nome
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Verifica se uno slug è già in uso
 */
export async function isSlugAvailable(
  supabase: AnySupabaseClient,
  slug: string
): Promise<boolean> {
  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();
  
  return !data;
}

/**
 * Genera uno slug unico (aggiunge numero se già esiste)
 */
export async function generateUniqueSlug(
  supabase: AnySupabaseClient,
  name: string
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugAvailable(supabase, slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ============================================================================
// BUSINESS FUNCTIONS
// ============================================================================

/**
 * Crea un nuovo business
 */
export async function createBusiness(
  supabase: AnySupabaseClient,
  data: CreateBusinessData
): Promise<BusinessResult> {
  try {
    // Verifica slug disponibile
    const isAvailable = await isSlugAvailable(supabase, data.slug);
    if (!isAvailable) {
      return { success: false, error: 'Questo indirizzo è già in uso. Scegline un altro.' };
    }

    // Crea il business
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone || null,
        vertical: data.vertical,
        owner_id: data.ownerId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating business:', error);
      return { success: false, error: 'Errore durante la creazione. Riprova.' };
    }

    // Aggiungi owner come membro del business
    const { error: memberError } = await supabase
      .from('business_members')
      .insert({
        business_id: business.id,
        user_id: data.ownerId,
        role: 'owner',
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding business member:', memberError);
    }

    return { success: true, business: business as Business };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Registra un nuovo business owner con il suo business
 * Flusso completo: crea utente → crea business → collega
 */
export async function registerBusiness(
  supabase: AnySupabaseClient,
  data: RegisterBusinessData,
  vertical: PlatformVertical
): Promise<RegisterBusinessResult> {
  try {
    // 1. Registra l'utente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.ownerEmail,
      password: data.password,
      options: {
        data: {
          full_name: data.ownerName,
          phone: data.ownerPhone,
        },
      },
    });

    if (authError) {
      return { success: false, error: translateError(authError.message) };
    }

    if (!authData.user) {
      return { success: false, error: 'Errore durante la registrazione' };
    }

    const userId = authData.user.id;

    // 2. Crea il profilo utente
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: data.ownerEmail,
        full_name: data.ownerName,
        phone: data.ownerPhone || null,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Non blocchiamo, l'utente è stato creato
    }

    // 3. Genera slug unico
    const slug = await generateUniqueSlug(supabase, data.businessName);

    // 4. Crea il business
    const businessResult = await createBusiness(supabase, {
      name: data.businessName,
      slug,
      email: data.ownerEmail,
      phone: data.businessPhone,
      vertical,
      ownerId: userId,
    });

    if (!businessResult.success) {
      return { success: false, error: businessResult.error, userId };
    }

    return {
      success: true,
      userId,
      businessId: businessResult.business?.id,
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Errore di connessione. Riprova.' };
  }
}

/**
 * Ottiene il business dell'utente corrente
 */
export async function getCurrentUserBusiness(
  supabase: AnySupabaseClient
): Promise<Business | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!data) return null;

    const { data: business } = await supabase
      .from('businesses')
      .select('id, slug, name, vertical, email, phone, website, address_street, address_city, address_province, address_postal_code, address_country, latitude, longitude, logo_url, cover_image_url, primary_color, secondary_color, timezone, currency, booking_advance_min, booking_advance_max, cancellation_policy_hours, auto_confirm_bookings, description, short_description, owner_id, is_active, is_verified, created_at, updated_at, business_type, onboarding_completed, onboarding_step, workstations, roi_data, terms_accepted_at, articles_1341_accepted_at, is_public')
      .eq('id', data.business_id)
      .single();

    return business as Business | null;
  } catch {
    return null;
  }
}

/**
 * Ottiene un business tramite slug
 */
export async function getBusinessBySlug(
  supabase: AnySupabaseClient,
  slug: string
): Promise<Business | null> {
  try {
    const { data } = await supabase
      .from('businesses')
      .select('id, slug, name, vertical, email, phone, website, address_street, address_city, address_province, address_postal_code, address_country, latitude, longitude, logo_url, cover_image_url, primary_color, secondary_color, timezone, currency, booking_advance_min, booking_advance_max, cancellation_policy_hours, auto_confirm_bookings, description, short_description, owner_id, is_active, is_verified, created_at, updated_at, business_type, onboarding_completed, onboarding_step, workstations, roi_data, terms_accepted_at, articles_1341_accepted_at, is_public')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    return data as Business | null;
  } catch {
    return null;
  }
}

/**
 * Ottiene un cliente tramite user_id e business_id
 */
export async function getCustomerByUserId(
  supabase: AnySupabaseClient,
  userId: string,
  businessId: string
) {
  const { data, error } = await supabase
    .from('customers')
    .select('id, user_id, business_id, full_name, email, phone, is_active, created_at, last_visit_at, total_spent, notes, tags, preferences')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) console.error('[getCustomerByUserId] error:', JSON.stringify(error));
  return data ?? null;
}

// ============================================================================
// ERROR TRANSLATION
// ============================================================================

function translateError(message: string): string {
  const errors: Record<string, string> = {
    'User already registered': 'Questa email è già registrata',
    'Password should be at least 6 characters': 'La password deve avere almeno 8 caratteri',
    'Unable to validate email address: invalid format': 'Formato email non valido',
  };

  return errors[message] || message;
}