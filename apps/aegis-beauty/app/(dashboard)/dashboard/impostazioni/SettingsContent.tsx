// ============================================================================
// AEGIS BEAUTY - SETTINGS CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/impostazioni/SettingsContent.tsx
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import {
  SettingsPage,
  type BusinessGeneralData,
  type BusinessHoursRow,
  type ClosureItem,
  type BookingSettings,
} from '@aegis/ui';
import { createClient, updatePassword } from '@aegis/core';

interface SettingsContentProps {
  businessId: string;
  businessType: string;
  generalData: BusinessGeneralData;
  businessHours: BusinessHoursRow[];
  closures: ClosureItem[];
  bookingSettings: BookingSettings;
  accountData: { fullName: string; email: string; phone: string };
}

export function SettingsContent({
  businessId, businessType, generalData, businessHours,
  closures: initialClosures, bookingSettings, accountData,
}: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSaveGeneral = async (data: BusinessGeneralData) => {
    const { error } = await supabase.from('businesses').update({
      name: data.name, email: data.email, phone: data.phone || null,
      website: data.website || null, address_street: data.addressStreet || null,
      address_city: data.addressCity || null, address_province: data.addressProvince || null,
      address_postal_code: data.addressPostalCode || null, description: data.description || null,
    } as never).eq('id', businessId);
    if (error) throw error;
    router.refresh();
  };

  const handleUploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${businessId}/logo-${Date.now()}.${fileExt}`;
    // Rimuovi il vecchio logo se presente (ignora errori di rimozione)
    const { data: currentBusiness } = await supabase
      .from('businesses').select('logo_url').eq('id', businessId).single() as { data: { logo_url: string | null } | null };
    if (currentBusiness?.logo_url) {
      const oldPath = currentBusiness.logo_url.split('/Logos/')[1]?.split('?')[0];
      if (oldPath) await supabase.storage.from('Logos').remove([oldPath]);
    }
    const { error: uploadError } = await supabase.storage.from('Logos').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('Logos').getPublicUrl(fileName);
    const logoUrl = `${publicUrl}?v=${Date.now()}`;
    await supabase.from('businesses').update({ logo_url: logoUrl } as never).eq('id', businessId);
    router.refresh();
    return logoUrl;
  };

  const handleRemoveLogo = async () => {
    await supabase.from('businesses').update({ logo_url: null } as never).eq('id', businessId);
    router.refresh();
  };

  const handleSaveHours = async (hours: BusinessHoursRow[]) => {
    for (const h of hours) {
      const { error } = await supabase.from('business_hours').update({
        is_open: h.isOpen, open_time_1: h.openTime1 || null, close_time_1: h.closeTime1 || null,
        open_time_2: h.openTime2 || null, close_time_2: h.closeTime2 || null,
      } as never).eq('business_id', businessId).eq('day_of_week', h.dayOfWeek);
      if (error) throw error;
    }
    router.refresh();
  };

  const handleSaveWorkstations = async (count: number) => {
    const { error } = await supabase.from('businesses').update({ workstations: count } as never).eq('id', businessId);
    if (error) throw error;
    router.refresh();
  };

  const handleAddClosure = async (closure: Omit<ClosureItem, 'id'>) => {
    const { error } = await supabase.from('business_closures').insert({
      business_id: businessId, title: closure.title, start_date: closure.startDate,
      end_date: closure.endDate, is_full_day: true, is_recurring_yearly: closure.isRecurringYearly,
    } as never);
    if (error) throw error;
    router.refresh();
  };

  const handleDeleteClosure = async (id: string) => {
    const { error } = await supabase.from('business_closures').delete().eq('id', id);
    if (error) throw error;
    router.refresh();
  };

  const handleSaveBookings = async (settings: BookingSettings) => {
    const { error } = await supabase.from('businesses').update({
      booking_advance_min: settings.bookingAdvanceMin,
      booking_advance_max: settings.bookingAdvanceMax,
      cancellation_policy_hours: settings.cancellationPolicyHours,
    } as never).eq('id', businessId);
    if (error) throw error;
    router.refresh();
  };

  const handleSaveAccount = async (data: { fullName: string; phone: string }) => {
    const { error } = await supabase.from('profiles').update({
      full_name: data.fullName, phone: data.phone || null,
    } as never).eq('id', (await supabase.auth.getUser()).data.user?.id || '');
    if (error) throw error;
    router.refresh();
  };

  const handleChangePassword = async (_currentPassword: string, newPassword: string) => {
    const result = await updatePassword(supabase, newPassword);
    if (!result.success) throw new Error(result.error || 'Errore nel cambio password');
  };

  return (
    <SettingsPage
      generalData={generalData}
      businessHours={businessHours}
      closures={initialClosures}
      bookingSettings={bookingSettings}
      accountData={accountData}
      publicUrlBase="aegisbeauty.aegis.app"
      businessType={businessType}
      onSaveGeneral={handleSaveGeneral}
      onUploadLogo={handleUploadLogo}
      onRemoveLogo={handleRemoveLogo}
      onSaveHours={handleSaveHours}
      onSaveWorkstations={handleSaveWorkstations}
      onAddClosure={handleAddClosure}
      onDeleteClosure={handleDeleteClosure}
      onSaveBookings={handleSaveBookings}
      onSaveAccount={handleSaveAccount}
      onChangePassword={handleChangePassword}
    />
  );
}