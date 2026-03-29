// ============================================================================
// AEGIS BEAUTY - STAFF CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/staff/StaffContent.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  StaffList,
  StaffModal,
  StaffServicesModal,
  StaffHoursModal,
  QRCodeModal,
  EmptyStaff,
  type StaffMember,
  type StaffFormData,
  type ServiceOption,
  type DayHours,
} from '@aegis/ui';
import { createClient } from '@aegis/core';

// ============================================================================
// TYPES
// ============================================================================

interface StaffData {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: 'owner' | 'employee' | null;
  color: string | null;
  is_active: boolean | null;
  staff_services?: { service_id: string }[];
}

interface ServiceData {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category?: { name: string } | null;
}

interface BusinessHoursData {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

interface StaffHoursData {
  day_of_week: string;
  is_working: boolean;
  start_time_1: string | null;
  end_time_1: string | null;
  start_time_2: string | null;
  end_time_2: string | null;
}

interface StaffContentProps {
  initialStaff: StaffData[];
  initialServices: ServiceData[];
  initialBusinessHours: BusinessHoursData[];
  businessId: string;
  businessSlug: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function StaffContent({
  initialStaff,
  initialServices,
  initialBusinessHours,
  businessId,
  businessSlug,
}: StaffContentProps) {
  const supabase = createClient();

  // State
  const [staff, setStaff] = useState<StaffData[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<StaffData | null>(null);
  
  // QR Code state
  const [qrCodeData, setQrCodeData] = useState<{
    isOpen: boolean;
    staffName: string;
    inviteUrl: string;
  }>({ isOpen: false, staffName: '', inviteUrl: '' });

  // Services modal state
  const [servicesModal, setServicesModal] = useState<{
    isOpen: boolean;
    staffId: string;
    staffName: string;
    assignedServiceIds: string[];
  }>({ isOpen: false, staffId: '', staffName: '', assignedServiceIds: [] });

  // Hours modal state
  const [hoursModal, setHoursModal] = useState<{
    isOpen: boolean;
    staffId: string;
    staffName: string;
    useBusinessHours: boolean;
    currentHours: DayHours[];
  }>({ isOpen: false, staffId: '', staffName: '', useBusinessHours: true, currentHours: [] });

  // Transform services for modal
  const serviceOptions: ServiceOption[] = initialServices.map(s => ({
    id: s.id,
    name: s.name,
    categoryName: s.category?.name,
    duration: s.duration_minutes,
    price: s.price,
  }));

  // Transform business hours for modal
  const businessHoursForModal: DayHours[] = initialBusinessHours.map(h => ({
    dayOfWeek: h.day_of_week,
    dayLabel: DAY_LABELS[h.day_of_week] || h.day_of_week,
    isOpen: h.is_open,
    openTime1: h.open_time_1 || undefined,
    closeTime1: h.close_time_1 || undefined,
    openTime2: h.open_time_2 || undefined,
    closeTime2: h.close_time_2 || undefined,
  }));

  // Transform data for StaffList component
  const staffMembers: StaffMember[] = staff.map(s => {
    const isIncomplete = !s.email || !s.user_id;
    
    return {
      id: s.id,
      fullName: s.full_name,
      email: s.email || undefined,
      phone: s.phone || undefined,
      role: s.role || 'employee',
      color: s.color || undefined,
      isActive: s.is_active ?? true,
      servicesCount: s.staff_services?.length,
      isIncomplete,
    };
  });

  const hasOwner = staff.some(s => s.role === 'owner');

  // Handlers
  const handleAddStaff = () => {
    setEditingStaff(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    const fullStaff = staff.find(s => s.id === member.id);
    if (fullStaff) {
      setEditingStaff(fullStaff);
      setError('');
      setIsModalOpen(true);
    }
  };

  const handleDeleteStaff = (member: StaffMember) => {
    const fullStaff = staff.find(s => s.id === member.id);
    if (fullStaff) {
      setDeleteConfirm(fullStaff);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .eq('id', deleteConfirm.id);

      if (deleteError) throw deleteError;

      setStaff(prev => prev.filter(s => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Errore durante l\'eliminazione del membro');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (member: StaffMember, active: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('staff')
        .update({ is_active: active } as never)
        .eq('id', member.id);

      if (updateError) throw updateError;

      setStaff(prev => prev.map(s => 
        s.id === member.id ? { ...s, is_active: active } : s
      ));
    } catch (err) {
      console.error('Error toggling staff:', err);
    }
  };

  const handleSubmit = async (data: StaffFormData) => {
    setError('');

    try {
      if (editingStaff) {
        const wasIncomplete = !editingStaff.email || !editingStaff.user_id;
        const isNowComplete = !!data.email;
        const shouldSendInvite = wasIncomplete && isNowComplete && !editingStaff.user_id;

        const { error: updateError } = await supabase
          .from('staff')
          .update({
            full_name: data.fullName,
            email: data.email || null,
            phone: data.phone || null,
            role: data.role,
            color: data.color,
            is_active: data.isActive,
          } as never)
          .eq('id', editingStaff.id);

        if (updateError) throw updateError;

        setStaff(prev => prev.map(s => 
          s.id === editingStaff.id 
            ? {
                ...s,
                full_name: data.fullName,
                email: data.email || null,
                phone: data.phone || null,
                role: data.role,
                color: data.color,
                is_active: data.isActive,
              }
            : s
        ));

        if (shouldSendInvite) {
          const response = await fetch('/api/staff/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              staffId: editingStaff.id,
              email: data.email,
              fullName: data.fullName,
              phone: data.phone,
              businessId,
              businessSlug,
              role: data.role,
            }),
          });

          const result = await response.json();

          if (response.ok) {
            if (result.alreadyExists) {
              toast('Utente già registrato — il QR porta alla pagina di login');
            } else {
              toast.success('Invito inviato con successo');
            }
            setIsModalOpen(false);
            setEditingStaff(null);
            setQrCodeData({
              isOpen: true,
              staffName: data.fullName,
              inviteUrl: result.inviteUrl,
            });
            return;
          } else {
            toast.error(result.error || 'Errore nell\'invio dell\'invito');
            return; // Lascia il modal aperto per correggere
          }
        }

        setIsModalOpen(false);
        setEditingStaff(null);
      } else {
        const { data: newStaff, error: insertError } = await supabase
          .from('staff')
          .insert({
            business_id: businessId,
            full_name: data.fullName,
            email: data.email || null,
            phone: data.phone || null,
            role: data.role,
            color: data.color,
            is_active: true,
          } as never)
          .select('id, user_id, full_name, email, phone, role, color, is_active')
          .single() as { data: StaffData | null; error: unknown };

        if (insertError) throw insertError;

        if (newStaff) {
          // Assign all active services to new staff by default
          const activeServiceIds = initialServices.map(s => s.id);
          if (activeServiceIds.length > 0) {
            await supabase.from('staff_services').insert(
              activeServiceIds.map(serviceId => ({
                staff_id: newStaff.id,
                service_id: serviceId,
              })) as never
            );
          }

          setStaff(prev => [...prev, newStaff]);
          setIsModalOpen(false);

          // Only generate QR if email was provided
          if (data.email) {
            const response = await fetch('/api/staff/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                staffId: newStaff.id,
                email: data.email,
                fullName: data.fullName,
                phone: data.phone,
                businessId,
                businessSlug,
                role: data.role,
              }),
            });

            const result = await response.json();

            if (!response.ok) {
              toast.error(result.error || 'Staff salvato ma QR non generato');
            } else {
              setQrCodeData({
                isOpen: true,
                staffName: data.fullName,
                inviteUrl: result.inviteUrl || `${window.location.origin}/register?staff_invite=true&staff_id=${newStaff.id}`,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio';
      toast.error(msg);
      throw err instanceof Error ? err : new Error(msg);
    }
  };

  const handleManageServices = async (member: StaffMember) => {
    // Fetch current staff services
    const { data: staffServices } = await supabase
      .from('staff_services')
      .select('service_id')
      .eq('staff_id', member.id) as { data: { service_id: string }[] | null };

    const assignedIds = staffServices?.map(ss => ss.service_id) || [];

    setServicesModal({
      isOpen: true,
      staffId: member.id,
      staffName: member.fullName,
      assignedServiceIds: assignedIds,
    });
  };

  const handleSaveServices = async (serviceIds: string[]) => {
    const staffId = servicesModal.staffId;

    // Delete existing assignments
    await supabase
      .from('staff_services')
      .delete()
      .eq('staff_id', staffId);

    // Insert new assignments
    if (serviceIds.length > 0) {
      const inserts = serviceIds.map(serviceId => ({
        staff_id: staffId,
        service_id: serviceId,
      }));

      await supabase
        .from('staff_services')
        .insert(inserts as never);
    }

    // Update local state
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, staff_services: serviceIds.map(id => ({ service_id: id })) }
        : s
    ));

    setServicesModal({ isOpen: false, staffId: '', staffName: '', assignedServiceIds: [] });
  };

  const handleManageHours = async (member: StaffMember) => {
    // Fetch current staff hours
    const { data: staffHours } = await supabase
      .from('staff_hours')
      .select('*')
      .eq('staff_id', member.id) as { data: StaffHoursData[] | null };

    const useBusinessHours = !staffHours || staffHours.length === 0;

    const currentHours: DayHours[] = useBusinessHours
      ? businessHoursForModal
      : staffHours.map(h => ({
          dayOfWeek: h.day_of_week,
          dayLabel: DAY_LABELS[h.day_of_week] || h.day_of_week,
          isOpen: h.is_working,
          openTime1: h.start_time_1 || undefined,
          closeTime1: h.end_time_1 || undefined,
          openTime2: h.start_time_2 || undefined,
          closeTime2: h.end_time_2 || undefined,
        }));

    setHoursModal({
      isOpen: true,
      staffId: member.id,
      staffName: member.fullName,
      useBusinessHours,
      currentHours,
    });
  };

  const handleSaveHours = async (useBusinessHours: boolean, customHours?: DayHours[]) => {
    const staffId = hoursModal.staffId;

    const { error: deleteError } = await supabase
      .from('staff_hours')
      .delete()
      .eq('staff_id', staffId);

    if (deleteError) {
      toast.error('Errore durante il salvataggio degli orari');
      return;
    }

    if (!useBusinessHours && customHours) {
      const inserts = customHours.map(h => ({
        staff_id: staffId,
        day_of_week: h.dayOfWeek,
        is_working: h.isOpen,
        start_time_1: h.openTime1 || null,
        end_time_1: h.closeTime1 || null,
        start_time_2: h.openTime2 || null,
        end_time_2: h.closeTime2 || null,
      }));

      const { error: insertError } = await supabase
        .from('staff_hours')
        .insert(inserts as never);

      if (insertError) {
        toast.error('Errore durante il salvataggio degli orari');
        return;
      }
    }

    toast.success('Orari salvati correttamente');
    setHoursModal({ isOpen: false, staffId: '', staffName: '', useBusinessHours: true, currentHours: [] });
  };

  return (
    <>
      <div className="min-h-[calc(100vh-7rem)]">
        <div className="mb-6" style={{ animation: 'stl-fade-in 0.4s ease-out both' }}>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff</h1>
          <p className="text-gray-500 mt-1">Gestisci i membri del tuo team</p>
          <style>{`@keyframes stl-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        <div className="mt-6 pb-6">
          <StaffList
            staff={staffMembers}
            onAddStaff={handleAddStaff}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteStaff}
            onToggleActive={handleToggleActive}
            onManageServices={handleManageServices}
            onManageHours={handleManageHours}
            emptyState={
              <EmptyStaff
                onAction={handleAddStaff}
                actionLabel="Aggiungi il primo membro"
              />
            }
          />
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStaff(null); }}
        onSubmit={handleSubmit}
        initialData={editingStaff ? {
          fullName: editingStaff.full_name,
          email: editingStaff.email || '',
          phone: editingStaff.phone || '',
          role: editingStaff.role || 'employee',
          color: editingStaff.color || '#9333ea',
          isActive: editingStaff.is_active ?? true,
        } : null}
        hideOwnerRole={hasOwner && editingStaff?.role !== 'owner'}
        isIncomplete={editingStaff ? (!editingStaff.email || !editingStaff.user_id) : false}
        error={error}
      />

      {/* Staff Services Modal */}
      <StaffServicesModal
        isOpen={servicesModal.isOpen}
        onClose={() => setServicesModal({ isOpen: false, staffId: '', staffName: '', assignedServiceIds: [] })}
        onSave={handleSaveServices}
        staffName={servicesModal.staffName}
        services={serviceOptions}
        assignedServiceIds={servicesModal.assignedServiceIds}
      />

      {/* Staff Hours Modal */}
      <StaffHoursModal
        isOpen={hoursModal.isOpen}
        onClose={() => setHoursModal({ isOpen: false, staffId: '', staffName: '', useBusinessHours: true, currentHours: [] })}
        onSave={handleSaveHours}
        staffName={hoursModal.staffName}
        businessHours={businessHoursForModal}
        currentHours={hoursModal.currentHours}
        useBusinessHours={hoursModal.useBusinessHours}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrCodeData.isOpen}
        onClose={() => setQrCodeData({ isOpen: false, staffName: '', inviteUrl: '' })}
        value={qrCodeData.inviteUrl}
        title={`Invito per ${qrCodeData.staffName}`}
        description="Fai scansionare questo QR code al collaboratore per completare la registrazione"
        downloadFilename={`invito-${qrCodeData.staffName.toLowerCase().replace(/\s+/g, '-')}`}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elimina membro
              </h3>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare <strong>{deleteConfirm.full_name}</strong>? 
                Questa azione non può essere annullata.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}