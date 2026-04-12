// ============================================================================
// AEGIS BEAUTY - IMPOSTAZIONI PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/impostazioni/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser, getCurrentProfile } from '@aegis/core';
import { SettingsContent } from './SettingsContent';

// ============================================================================
// DAY CONFIG
// ============================================================================

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunedì', tuesday: 'Martedì', wednesday: 'Mercoledì',
  thursday: 'Giovedì', friday: 'Venerdì', saturday: 'Sabato', sunday: 'Domenica',
};

// ============================================================================
// Helper: strip seconds from time strings (e.g. "09:00:00" -> "09:00")
// ============================================================================

function stripSeconds(time: string | null): string {
  if (!time) return '';
  // Handle "HH:MM:SS" -> "HH:MM"
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

// ============================================================================
// PAGE
// ============================================================================

export default async function ImpostazioniPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) redirect('/login');

  // Get business member
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string } | null };

  if (!businessMember) redirect('/login');

  const businessId = businessMember.business_id;

  // Fetch profile, business e business hours in parallelo
  const [profile, businessResult, hoursResult] = await Promise.all([
    getCurrentProfile(supabase),
    supabase.from('businesses')
      .select('id, name, slug, email, phone, website, address_street, address_city, address_province, address_postal_code, description, logo_url, workstations, booking_advance_min, booking_advance_max, cancellation_policy_hours, auto_confirm_bookings, business_type')
      .eq('id', businessId)
      .single(),
    supabase.from('business_hours')
      .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', businessId),
  ]);

  const business = businessResult.data as {
    id: string; name: string; slug: string; email: string;
    phone: string | null; website: string | null;
    address_street: string | null; address_city: string | null;
    address_province: string | null; address_postal_code: string | null;
    description: string | null; logo_url: string | null;
    workstations: number; booking_advance_min: number;
    booking_advance_max: number; cancellation_policy_hours: number;
    auto_confirm_bookings: boolean; business_type: string | null;
  } | null;

  if (!business) redirect('/login');

  const hoursData = hoursResult.data as Array<{
    day_of_week: string; is_open: boolean;
    open_time_1: string | null; close_time_1: string | null;
    open_time_2: string | null; close_time_2: string | null;
  }> | null;

  // Map hours by day, fill defaults for missing days
  const hoursMap = new Map((hoursData || []).map(h => [h.day_of_week, h]));
  const businessHours = DAY_ORDER.map(day => {
    const h = hoursMap.get(day);
    if (h) {
      return {
        dayOfWeek: day,
        dayLabel: DAY_LABELS[day],
        isOpen: h.is_open,
        openTime1: stripSeconds(h.open_time_1) || '09:00',
        closeTime1: stripSeconds(h.close_time_1) || '18:00',
        openTime2: stripSeconds(h.open_time_2),
        closeTime2: stripSeconds(h.close_time_2),
      };
    }
    // Day not in DB -> default closed
    return {
      dayOfWeek: day,
      dayLabel: DAY_LABELS[day],
      isOpen: false,
      openTime1: '09:00',
      closeTime1: '18:00',
      openTime2: '',
      closeTime2: '',
    };
  });

  // Fetch closures
  const { data: closuresData } = await supabase
    .from('business_closures')
    .select('id, title, start_date, end_date, is_recurring_yearly')
    .eq('business_id', businessId)
    .order('start_date', { ascending: true }) as { data: Array<{
      id: string; title: string; start_date: string; end_date: string; is_recurring_yearly: boolean;
    }> | null };

  const closures = (closuresData || []).map(c => ({
    id: c.id,
    title: c.title,
    startDate: c.start_date,
    endDate: c.end_date,
    isRecurringYearly: c.is_recurring_yearly,
  }));

  return (
    <SettingsContent
      businessId={businessId}
      businessType={business.business_type || 'mixed'}
      generalData={{
        name: business.name,
        slug: business.slug,
        email: business.email,
        phone: business.phone || '',
        website: business.website || '',
        addressStreet: business.address_street || '',
        addressCity: business.address_city || '',
        addressProvince: business.address_province || '',
        addressPostalCode: business.address_postal_code || '',
        description: business.description || '',
        logoUrl: business.logo_url || '',
        workstations: business.workstations,
      }}
      businessHours={businessHours}
      closures={closures}
      bookingSettings={{
        bookingAdvanceMin: business.booking_advance_min,
        bookingAdvanceMax: business.booking_advance_max,
        cancellationPolicyHours: business.cancellation_policy_hours,
        bufferMinutes: 0,
        allowNoStaffPreference: true,
        allowMultipleServices: false,
      }}
      accountData={{
        fullName: profile?.full_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
      }}
    />
  );
}