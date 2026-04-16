// ============================================================================
// AEGIS BEAUTY - SETTINGS CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/impostazioni/SettingsContent.tsx
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  SettingsPage,
  type BusinessGeneralData,
  type BusinessHoursRow,
  type ClosureItem,
  type BookingSettings,
} from '@aegis/ui';
import { createClient, updatePassword } from '@aegis/core';
import { Users, Eye, BarChart2, CalendarDays } from 'lucide-react';
import { useStaffPermissions } from '@/lib/staff-permissions-context';

interface SettingsContentProps {
  businessId: string;
  businessType: string;
  generalData: BusinessGeneralData;
  businessHours: BusinessHoursRow[];
  closures: ClosureItem[];
  bookingSettings: BookingSettings;
  accountData: { fullName: string; email: string; phone: string };
}

interface StaffPermRecord {
  user_id: string;
  full_name: string;
  color: string | null;
}

export function SettingsContent({
  businessId, businessType, generalData, businessHours,
  closures: initialClosures, bookingSettings, accountData,
}: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const permissions = useStaffPermissions();

  // Staff permissions state (solo per owner/admin)
  const [staffPermsLoading, setStaffPermsLoading] = useState(false);
  const [savingPerm, setSavingPerm] = useState<string | null>(null);
  const [hasStaff, setHasStaff] = useState(false);
  const [canSeeCalendar, setCanSeeCalendar] = useState(false);
  const [canSeeStats, setCanSeeStats] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const [teamManagers, setTeamManagers] = useState<string[]>([]);
  const [staffRecords, setStaffRecords] = useState<StaffPermRecord[]>([]);

  useEffect(() => {
    if (!permissions.isOwnerOrAdmin) return;
    setStaffPermsLoading(true);
    fetch('/api/staff/permissions')
      .then(r => r.json())
      .then(data => {
        setHasStaff(data.hasStaff);
        setCanSeeCalendar(data.globalPermissions?.can_see_business_calendar ?? false);
        setCanSeeStats(data.globalPermissions?.can_see_business_stats ?? false);
        setCanManageTeam(data.teamManagerUserIds?.length > 0);
        setTeamManagers(data.teamManagerUserIds || []);
        setStaffRecords(data.staffRecords || []);
      })
      .catch(console.error)
      .finally(() => setStaffPermsLoading(false));
  }, [permissions.isOwnerOrAdmin]);

  const savePermissions = async (
    key: string,
    calendar: boolean,
    stats: boolean,
    managers: string[],
  ) => {
    setSavingPerm(key);
    try {
      const res = await fetch('/api/staff/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          can_see_business_calendar: calendar,
          can_see_business_stats: stats,
          team_manager_user_ids: managers,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error('Errore nel salvataggio dei permessi');
    } finally {
      setSavingPerm(null);
    }
  };

  const handleToggleCalendar = () => {
    const nv = !canSeeCalendar;
    setCanSeeCalendar(nv);
    savePermissions('calendar', nv, canSeeStats, canManageTeam ? teamManagers : []);
  };

  const handleToggleStats = () => {
    const nv = !canSeeStats;
    setCanSeeStats(nv);
    savePermissions('stats', canSeeCalendar, nv, canManageTeam ? teamManagers : []);
  };

  const handleToggleTeam = () => {
    const nv = !canManageTeam;
    setCanManageTeam(nv);
    savePermissions('team', canSeeCalendar, canSeeStats, nv ? teamManagers : []);
  };

  const handleToggleManager = (userId: string, checked: boolean) => {
    const nv = checked
      ? [...teamManagers, userId]
      : teamManagers.filter(id => id !== userId);
    setTeamManagers(nv);
    savePermissions(`mgr-${userId}`, canSeeCalendar, canSeeStats, nv);
  };

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
    const { error } = await supabase.from('business_closures').delete().eq('id', id).eq('business_id', businessId);
    if (error) throw error;
    router.refresh();
  };

  const handleSaveBookings = async (settings: BookingSettings) => {
    const { error } = await supabase.from('businesses').update({
      booking_advance_min: settings.bookingAdvanceMin,
      booking_advance_max: settings.bookingAdvanceMax,
      cancellation_policy_hours: settings.cancellationPolicyHours,
      is_public: settings.isPublic,
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

  const staffPermissionsSection = permissions.isOwnerOrAdmin ? (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden" style={{ animation: 'stFadeUp 0.5s ease-out 160ms both' }}>
        {/* Header */}
        <div className="pt-5 pb-2 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Permessi Staff</h3>
              <p className="text-gray-500 text-sm mt-0.5">Configura cosa possono vedere e fare i membri del tuo team.</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 pt-3">

        {staffPermsLoading ? (
          <div className="text-sm text-gray-400 py-4 text-center">Caricamento...</div>
        ) : !hasStaff ? (
          <div className="text-sm text-gray-400 py-4 text-center">Non hai ancora membri staff nel tuo team.</div>
        ) : (
          <>
            <div className="space-y-1">
              <PermissionToggle
                icon={<Eye className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                title="Visibilità agenda completa"
                description="Lo staff può vedere gli appuntamenti di tutto il salone, non solo i propri."
                checked={canSeeCalendar}
                saving={savingPerm === 'calendar'}
                onToggle={handleToggleCalendar}
              />
              <PermissionToggle
                icon={<BarChart2 className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                title="Visibilità statistiche business"
                description="Lo staff può vedere fatturato e statistiche complete del salone."
                checked={canSeeStats}
                saving={savingPerm === 'stats'}
                onToggle={handleToggleStats}
              />
              <PermissionToggle
                icon={<CalendarDays className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                title="Gestione agenda team"
                description="Seleziona chi può creare appuntamenti per altri membri del team."
                checked={canManageTeam}
                saving={savingPerm === 'team'}
                onToggle={handleToggleTeam}
              />

              {canManageTeam && staffRecords.length > 0 && (
                <div className="ml-4 mt-2 space-y-1.5 border-l-2 pl-4" style={{ borderColor: 'rgba(168,85,247,0.2)' }}>
                  <p className="text-xs text-gray-400 mb-2">Seleziona i membri abilitati:</p>
                  {staffRecords.map(s => {
                    const isChecked = teamManagers.includes(s.user_id);
                    const isSaving = savingPerm === `mgr-${s.user_id}`;
                    return (
                      <div
                        key={s.user_id}
                        className="flex items-center gap-2.5 cursor-pointer"
                        style={{ opacity: isSaving ? 0.5 : 1, transition: 'opacity 0.2s' }}
                        onClick={() => !isSaving && handleToggleManager(s.user_id, !isChecked)}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isChecked ? '#7c3aed' : 'transparent',
                            border: isChecked ? 'none' : '1.5px solid rgba(168,85,247,0.35)',
                            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: isChecked ? 'scale(1.05)' : 'scale(0.85)',
                          }}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                          style={{ background: s.color || '#9333ea' }}
                        >
                          {s.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{s.full_name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

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
      allowedTabs={permissions.isOwnerOrAdmin ? undefined : ['account']}
      extraBookingContent={staffPermissionsSection}
    />
  );
}

// ============================================================================
// ANIMATED TOGGLE (replica identica a quella in SettingsPage)
// ============================================================================

function AnimatedToggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle()}
      disabled={disabled}
      className={`relative flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        width: 38, height: 21, borderRadius: 999,
        background: enabled ? '#a855f7' : '#d1d5db',
        boxShadow: enabled ? '0 2px 8px rgba(168,85,247,0.3)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <span
        className="absolute bg-white rounded-full shadow-sm flex items-center justify-center"
        style={{
          width: 17, height: 17, top: 2, left: 2,
          transform: enabled ? 'translateX(17px)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {enabled ? (
          <svg className="text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ============================================================================
// PERMISSION TOGGLE COMPONENT (stile identico alle card Opzioni)
// ============================================================================

function PermissionToggle({
  icon,
  title,
  description,
  checked,
  saving,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  saving?: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
      style={{
        background: checked ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.015)',
        borderLeft: checked ? '3px solid #a855f7' : '3px solid #e5e7eb',
        backdropFilter: 'blur(4px)',
      }}
    >
      <AnimatedToggle enabled={checked} onToggle={onToggle} disabled={saving} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 ml-6">{description}</p>
      </div>
    </div>
  );
}