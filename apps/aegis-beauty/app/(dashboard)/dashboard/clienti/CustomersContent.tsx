// ============================================================================
// AEGIS BEAUTY - CLIENTI CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/clienti/ClientiContent.tsx
// ============================================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import ExcelJS from 'exceljs';
import { useRouter } from 'next/navigation';
import {
  CustomerList,
  CustomerDetailModal,
  AppointmentModal,
  EmptyCustomers,
  type CustomerListItem,
  type CustomerFilter,
  type CustomerDetail,
  type CustomerAppointment,
  type CustomerStats,
  type AppointmentFormData,
  type Customer as ModalCustomer,
  type Service as ModalService,
  type Staff as ModalStaff,
  type StaffServicesMap,
  type BusinessHoursData,
  type ClosureData,
  type SlotInfo,
  type ImporterModalProps,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import { useStaffPermissions } from '@/lib/staff-permissions-context';
import { toast } from 'sonner';

const ImporterModal = dynamic<ImporterModalProps>(
  () => import('@aegis/ui').then((m) => ({ default: m.ImporterModal })),
  { ssr: false }
);

// ============================================================================
// TYPES
// ============================================================================

interface CustomerData {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  total_appointments: number;
  total_spent: number;
  last_visit_at: string | null;
  is_active: boolean;
  notes: string | null;
  preferences: string | null;
  tags: string[] | null;
  birth_date: string | null;
  gender: string | null;
  source: string | null;
  accepts_marketing: boolean;
  created_at: string;
  user_id: string | null;
  invited_at: string | null;
}

interface StaffData {
  id: string;
  full_name: string;
  color: string | null;
}

interface ServiceData2 {
  id: string;
  name: string;
  duration: number;
  price: number;
  categoryId?: string;
  categoryName?: string;
}

interface StaffServiceData {
  staff_id: string;
  service_id: string;
}

interface BHData {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

interface ClosureItem {
  date: string;
  reason: string;
}

interface ClientiContentProps {
  initialCustomers: CustomerData[];
  totalCount: number;
  filterCounts: {
    all: number;
    active: number;
    new: number;
    inactive: number;
  };
  staffList: StaffData[];
  servicesList: ServiceData2[];
  staffServices: StaffServiceData[];
  businessHours: BHData[];
  closures: ClosureItem[];
  businessId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ClientiContent({
  initialCustomers,
  totalCount: initialTotalCount,
  filterCounts: initialFilterCounts,
  staffList,
  servicesList,
  staffServices,
  businessHours,
  closures,
  businessId,
}: ClientiContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const permissions = useStaffPermissions();

  // State
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [filterCounts, setFilterCounts] = useState(initialFilterCounts);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [importerOpen, setImporterOpen] = useState(false);

  // Detail modal state
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    customer: CustomerDetail | null;
    appointments: CustomerAppointment[];
    stats: CustomerStats | null;
    loading: boolean;
  }>({
    isOpen: false,
    customer: null,
    appointments: [],
    stats: null,
    loading: false,
  });

  const PAGE_SIZE = 20;

  // ============================================================================
  // FETCH CUSTOMERS
  // ============================================================================

  const fetchCustomers = useCallback(async (
    page: number,
    filter: CustomerFilter,
    search: string,
  ) => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('customers')
        .select('id, full_name, email, phone, total_appointments, total_spent, last_visit_at, is_active, notes, preferences, tags, birth_date, gender, source, accepts_marketing, created_at, user_id, invited_at', { count: 'exact' })
        .eq('business_id', businessId);

      // Apply filter
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      if (filter === 'active') {
        query = query.gte('last_visit_at', thirtyDaysAgoStr);
      } else if (filter === 'new') {
        query = query.gte('created_at', sevenDaysAgoStr);
      } else if (filter === 'inactive') {
        query = query.or(`last_visit_at.is.null,last_visit_at.lt.${thirtyDaysAgoStr}`);
      }

      // Apply search
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, count } = await query
        .order('full_name', { ascending: true })
        .range(from, to) as { data: CustomerData[] | null; count: number | null };

      setCustomers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilterChange = (filter: CustomerFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    fetchCustomers(1, filter, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCustomers(1, activeFilter, query);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCustomers(page, activeFilter, searchQuery);
  };

  // ============================================================================
  // VIEW CUSTOMER DETAIL
  // ============================================================================

  const handleViewCustomer = async (listItem: CustomerListItem) => {
    const customerData = customers.find(c => c.id === listItem.id);
    if (!customerData) return;

    // Open modal with basic data immediately
    const detail: CustomerDetail = {
      id: customerData.id,
      fullName: customerData.full_name,
      email: customerData.email || undefined,
      phone: customerData.phone || undefined,
      birthDate: customerData.birth_date || undefined,
      gender: customerData.gender || undefined,
      notes: customerData.notes || undefined,
      preferences: customerData.preferences || undefined,
      tags: customerData.tags || undefined,
      totalVisits: customerData.total_appointments,
      totalSpent: customerData.total_spent,
      lastVisitAt: customerData.last_visit_at || undefined,
      createdAt: customerData.created_at,
      isActive: customerData.is_active,
      source: customerData.source || undefined,
      acceptsMarketing: customerData.accepts_marketing,
      userId: customerData.user_id,
      invitedAt: customerData.invited_at,
    };

    setDetailModal({
      isOpen: true,
      customer: detail,
      appointments: [],
      stats: null,
      loading: true,
    });

    // Fetch appointments + stats in background
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id, start_time, end_time, status, total_price,
          staff:staff(full_name),
          appointment_services(service_name, price)
        `)
        .eq('customer_id', customerData.id)
        .eq('business_id', businessId)
        .order('start_time', { ascending: false })
        .limit(50) as { data: Array<{
          id: string;
          start_time: string;
          end_time: string;
          status: string;
          total_price: number | null;
          staff: { full_name: string } | null;
          appointment_services: Array<{ service_name: string; price: number }>;
        }> | null };

      const mappedAppointments: CustomerAppointment[] = (appointments || []).map(apt => ({
        id: apt.id,
        date: apt.start_time.split('T')[0],
        time: new Date(apt.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        serviceName: apt.appointment_services?.[0]?.service_name || 'Appuntamento',
        staffName: apt.staff?.full_name || 'N/A',
        price: apt.total_price || apt.appointment_services?.reduce((sum, s) => sum + s.price, 0) || 0,
        status: apt.status as CustomerAppointment['status'],
      }));

      // Calculate stats
      const completed = mappedAppointments.filter(a => a.status === 'completed');
      const cancelled = mappedAppointments.filter(a => a.status === 'cancelled');
      const noShows = mappedAppointments.filter(a => a.status === 'no_show');

      // Find favorite service
      const serviceCounts: Record<string, number> = {};
      completed.forEach(a => {
        serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1;
      });
      const favoriteService = Object.entries(serviceCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      // Find favorite staff
      const staffCounts: Record<string, number> = {};
      completed.forEach(a => {
        if (a.staffName !== 'N/A') {
          staffCounts[a.staffName] = (staffCounts[a.staffName] || 0) + 1;
        }
      });
      const favoriteStaff = Object.entries(staffCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      const stats: CustomerStats = {
        totalVisits: customerData.total_appointments,
        totalSpent: customerData.total_spent,
        averageSpent: customerData.total_appointments > 0
          ? customerData.total_spent / customerData.total_appointments
          : 0,
        favoriteService,
        favoriteStaff,
        lastVisit: customerData.last_visit_at || undefined,
        cancelRate: mappedAppointments.length > 0
          ? (cancelled.length / mappedAppointments.length) * 100
          : 0,
        noShowRate: mappedAppointments.length > 0
          ? (noShows.length / mappedAppointments.length) * 100
          : 0,
      };

      setDetailModal(prev => ({
        ...prev,
        appointments: mappedAppointments,
        stats,
        loading: false,
      }));
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setDetailModal(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================================================================
  // SAVE NOTES / PREFERENCES
  // ============================================================================

  const handleSaveNotes = async (customerId: string, notes: string) => {
    const { error } = await supabase
      .from('customers')
      .update({ notes } as never)
      .eq('id', customerId);

    if (error) throw error;

    // Update local state
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, notes } : c
    ));
  };

  const handleSavePreferences = async (customerId: string, preferences: string) => {
    const { error } = await supabase
      .from('customers')
      .update({ preferences } as never)
      .eq('id', customerId);

    if (error) throw error;

    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, preferences } : c
    ));
  };

  // ============================================================================
  // SAVE CONTACT (email / phone)
  // ============================================================================

  const handleSaveContact = async (customerId: string, data: { email?: string; phone?: string }) => {
    const { error } = await supabase
      .from('customers')
      .update(data as never)
      .eq('id', customerId);

    if (error) throw error;

    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? { ...c, ...(data.email !== undefined ? { email: data.email } : {}), ...(data.phone !== undefined ? { phone: data.phone } : {}) }
        : c
    ));
    toast.success(data.email !== undefined ? 'Email aggiornata' : 'Telefono aggiornato');
  };

  // ============================================================================
  // INVITE SINGLE CUSTOMER
  // ============================================================================

  const handleInviteSingle = async (customerId: string) => {
    try {
      const res = await fetch('/api/clients/invite-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: [customerId] }),
      });
      if (!res.ok) throw new Error('Errore invito');
      const invitedAt = new Date().toISOString();
      setCustomers(prev => prev.map(c =>
        c.id === customerId ? { ...c, invited_at: invitedAt } : c
      ));
      // Also update the open detail modal if it's showing this customer
      setDetailModal(prev => {
        if (prev.customer?.id === customerId) {
          return { ...prev, customer: { ...prev.customer, invitedAt } };
        }
        return prev;
      });
      toast.success('Invito inviato');
    } catch {
      toast.error('Errore durante l\'invio dell\'invito');
    }
  };

  // ============================================================================
  // BOOK APPOINTMENT (open modal with pre-selected customer)
  // ============================================================================

  // Appointment modal state
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    preselectedCustomerId: string | null;
  }>({ isOpen: false, preselectedCustomerId: null });
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  // Availability slots
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const slotsAbortRef = useRef<AbortController | null>(null);

  const fetchAvailableSlots = useCallback(async (
    date: string,
    serviceId: string,
    staffId?: string | null,
  ) => {
    slotsAbortRef.current?.abort();
    const controller = new AbortController();
    slotsAbortRef.current = controller;

    setSlotsLoading(true);
    setSlotsError(null);
    setAvailableSlots([]);

    try {
      const params = new URLSearchParams({ date, serviceId, businessId });
      if (staffId) params.set('staffId', staffId);

      const response = await fetch(`/api/availability?${params}`, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Errore nel caricamento');

      if (!controller.signal.aborted) {
        setAvailableSlots(() => {
          const slots: SlotInfo[] = data.slots || [];
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (date === todayStr) {
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            return slots.filter(s => {
              const [h, m] = s.time.split(':').map(Number);
              return h * 60 + m > nowMinutes;
            });
          }
          return slots;
        });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setSlotsError(err instanceof Error ? err.message : 'Errore nel caricamento orari');
    } finally {
      if (!controller.signal.aborted) setSlotsLoading(false);
    }
  }, [businessId]);

  // Build data for AppointmentModal
  const staffServicesMap: StaffServicesMap = {};
  staffServices.forEach(ss => {
    if (!staffServicesMap[ss.staff_id]) {
      staffServicesMap[ss.staff_id] = [];
    }
    staffServicesMap[ss.staff_id].push(ss.service_id);
  });

  const modalCustomers: ModalCustomer[] = customers.map(c => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone || undefined,
    email: c.email || undefined,
    invitedAt: c.invited_at || null,
  }));

  const modalServices: ModalService[] = servicesList.map(s => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: s.price,
    categoryId: s.categoryId,
    categoryName: s.categoryName,
  }));

  const modalStaff: ModalStaff[] = staffList.map(s => ({
    id: s.id,
    name: s.full_name,
    color: s.color || undefined,
  }));

  const modalBusinessHours: BusinessHoursData[] = businessHours.map(bh => ({
    day_of_week: bh.day_of_week,
    is_open: bh.is_open,
    open_time_1: bh.open_time_1,
    close_time_1: bh.close_time_1,
    open_time_2: bh.open_time_2,
    close_time_2: bh.close_time_2,
  }));

  const modalClosures: ClosureData[] = closures.map(c => ({
    date: c.date,
    reason: c.reason,
  }));

  const handleBookAppointment = (customerId: string) => {
    setDetailModal(prev => ({ ...prev, isOpen: false }));
    setAppointmentModal({ isOpen: true, preselectedCustomerId: customerId });
  };

  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    setIsSubmittingAppointment(true);
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customerId,
          customerFirstName: data.customerFirstName,
          customerLastName: data.customerLastName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          isNewCustomer: data.isNewCustomer,
          sendInvite: data.sendInvite,
          serviceId: data.serviceId,
          staffId: data.staffId,
          date: data.date,
          time: data.time,
          notes: data.notes,
          businessId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella creazione');

      setAppointmentModal({ isOpen: false, preselectedCustomerId: null });

      // If an existing customer was given missing contact data, save it back to their record
      if (data.customerId && !data.isNewCustomer) {
        const contactPatch: Record<string, string> = {};
        // Only patch fields that were previously missing (we detect this by checking the original customer)
        const original = customers.find(c => c.id === data.customerId);
        if (original) {
          if (!original.email && data.customerEmail?.trim()) contactPatch.email = data.customerEmail.trim().toLowerCase();
          if (!original.phone && data.customerPhone?.trim()) contactPatch.phone = data.customerPhone.trim();
        }
        if (Object.keys(contactPatch).length > 0) {
          await supabase.from('customers').update(contactPatch as never).eq('id', data.customerId);
          setCustomers(prev => prev.map(c => c.id === data.customerId ? { ...c, ...contactPatch } : c));
        }
        // Send invite if requested (customer just got email added or already had one)
        if (data.sendInvite) {
          await handleInviteSingle(data.customerId);
        }
      }

      // Refresh customer list to update visit counts
      fetchCustomers(currentPage, activeFilter, searchQuery);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error instanceof Error ? error.message : 'Errore nella creazione dell\'appuntamento');
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  // ============================================================================
  // EXPORT
  // ============================================================================

  const handleExport = async () => {
    try {
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('full_name, email, phone, total_appointments, total_spent, last_visit_at, is_active, notes, preferences, birth_date, gender, created_at')
        .eq('business_id', businessId)
        .order('full_name', { ascending: true }) as { data: Array<{
          full_name: string;
          email: string | null;
          phone: string | null;
          total_appointments: number;
          total_spent: number;
          last_visit_at: string | null;
          is_active: boolean;
          notes: string | null;
          preferences: string | null;
          birth_date: string | null;
          gender: string | null;
          created_at: string;
        }> | null };

      if (!allCustomers || allCustomers.length === 0) {
        toast.error('Nessun cliente da esportare');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Aegis Beauty';
      workbook.created = new Date();

      const ws = workbook.addWorksheet('Clienti', {
        views: [{ state: 'frozen', ySplit: 1 }], // freeze header row
      });

      // Definizione colonne con larghezze
      ws.columns = [
        { key: 'nome',         width: 28 },
        { key: 'email',        width: 32 },
        { key: 'telefono',     width: 18 },
        { key: 'visite',       width: 9  },
        { key: 'speso',        width: 16 },
        { key: 'ultimaVisita', width: 15 },
        { key: 'nascita',      width: 16 },
        { key: 'genere',       width: 10 },
        { key: 'stato',        width: 10 },
        { key: 'note',         width: 44 },
        { key: 'preferenze',   width: 44 },
        { key: 'registrato',   width: 15 },
      ];

      // ── HEADER ──
      const headerRow = ws.addRow([
        'Nome Completo', 'Email', 'Telefono', 'Visite',
        'Totale Speso (€)', 'Ultima Visita', 'Data di Nascita',
        'Genere', 'Stato', 'Note', 'Preferenze', 'Registrato il',
      ]);
      headerRow.height = 22;
      headerRow.eachCell(cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top:    { style: 'thin',   color: { argb: 'FF5B21B6' } },
          left:   { style: 'thin',   color: { argb: 'FF5B21B6' } },
          bottom: { style: 'medium', color: { argb: 'FF5B21B6' } },
          right:  { style: 'thin',   color: { argb: 'FF5B21B6' } },
        };
      });

      // ── DATI ──
      allCustomers.forEach((c, i) => {
        const isEven = i % 2 === 0;
        const bgColor = isEven ? 'FFFFFFFF' : 'FFF5F3FF';

        const row = ws.addRow([
          c.full_name,
          c.email || '',
          c.phone || '',
          c.total_appointments,
          c.total_spent,
          c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('it-IT') : '',
          c.birth_date ? new Date(c.birth_date + 'T00:00:00').toLocaleDateString('it-IT') : '',
          c.gender || '',
          c.is_active ? 'Attivo' : 'Inattivo',
          c.notes || '',
          c.preferences || '',
          new Date(c.created_at).toLocaleDateString('it-IT'),
        ]);

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1F2937' } };
          cell.border = {
            top:    { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left:   { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right:  { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
          cell.alignment = {
            vertical: 'top',
            wrapText: true,
          };
        });

        // Formato numero per visite e totale speso
        row.getCell(4).numFmt = '#,##0';
        row.getCell(5).numFmt = '#,##0.00 "€"';
      });

      // Auto-height rows for wrapped text (columns keep their fixed widths)
      ws.eachRow((row) => {
        let maxLines = 1;
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          if (!cell.alignment?.wrapText) return;
          if (typeof cell.value !== 'string' || cell.value.length <= 25) return;
          const colWidth = Math.max((ws.getColumn(colNumber).width as number | undefined) ?? 20, 12);
          const lines = Math.ceil(cell.value.length / Math.floor(colWidth * 1.05));
          maxLines = Math.max(maxLines, lines);
        });
        if (maxLines > 1) {
          const h = Math.min(120, maxLines * 15 + 4);
          if (!row.height || row.height < h) row.height = h;
        }
      });

      // Download via blob
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clienti_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${allCustomers.length} clienti esportati`);

    } catch (err) {
      console.error('Export error:', err);
      toast.error('Errore durante l\'esportazione');
    }
  };

  // ============================================================================
  // TRANSFORM DATA
  // ============================================================================

  const customerListItems: CustomerListItem[] = customers.map(c => ({
    id: c.id,
    fullName: c.full_name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    totalVisits: c.total_appointments,
    totalSpent: c.total_spent,
    lastVisitAt: c.last_visit_at || undefined,
    createdAt: c.created_at,
    isActive: c.is_active,
    userId: c.user_id,
    source: c.source,
    invitedAt: c.invited_at,
  }));

  const handleCheckDuplicates = async (
    emails: string[],
    phones: string[],
  ): Promise<{ duplicateEmails: Set<string>; duplicatePhones: Set<string> }> => {
    const { data } = await supabase
      .from('customers')
      .select('email, phone')
      .eq('business_id', businessId);

    const duplicateEmails = new Set<string>();
    const duplicatePhones = new Set<string>();

    if (data) {
      const existingEmails = new Set(
        (data as Array<{ email: string | null; phone: string | null }>)
          .filter(c => c.email)
          .map(c => c.email!.toLowerCase()),
      );
      const existingPhones = new Set(
        (data as Array<{ email: string | null; phone: string | null }>)
          .filter(c => c.phone)
          .map(c => c.phone!),
      );
      emails.forEach(e => { if (existingEmails.has(e.toLowerCase())) duplicateEmails.add(e); });
      phones.forEach(p => { if (existingPhones.has(p)) duplicatePhones.add(p); });
    }
    return { duplicateEmails, duplicatePhones };
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-[calc(100vh-7rem)]">
        <div className="mb-6" style={{ animation: 'cl-fade-in 0.4s ease-out both' }}>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clienti</h1>
          <p className="text-gray-500 mt-1">Gestisci i tuoi clienti e il loro storico</p>
          <style>{`@keyframes cl-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        <div className="mt-6 pb-2">
          <CustomerList
            customers={customerListItems}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            currency="€"
            filterCounts={filterCounts}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onViewCustomer={handleViewCustomer}
            onInviteSingle={handleInviteSingle}
            onExport={permissions.canExportClients ? handleExport : undefined}
            onImport={permissions.canImportClients ? () => setImporterOpen(true) : undefined}
            loading={loading}
            emptyState={
              <EmptyCustomers
                onAction={() => router.push('/dashboard/calendario')}
                actionLabel="Crea il primo appuntamento"
              />
            }
          />
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal(prev => ({ ...prev, isOpen: false }))}
        customer={detailModal.customer}
        appointments={detailModal.appointments}
        stats={detailModal.stats}
        currency="€"
        onSaveNotes={handleSaveNotes}
        onSavePreferences={handleSavePreferences}
        onSaveContact={handleSaveContact}
        onInvite={handleInviteSingle}
        onBookAppointment={handleBookAppointment}
        loading={detailModal.loading}
      />

      {/* Importer Modal */}
      <ImporterModal
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
        onImportComplete={() => {
          fetchCustomers(1, activeFilter, searchQuery);
          toast.success('Clienti importati con successo');
        }}
        onCheckDuplicates={handleCheckDuplicates}
      />

      {/* Appointment Modal (from Prenota button) */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={() => setAppointmentModal({ isOpen: false, preselectedCustomerId: null })}
        onSubmit={handleAppointmentSubmit}
        customers={modalCustomers}
        services={modalServices}
        staff={modalStaff}
        staffServices={staffServicesMap}
        businessHours={modalBusinessHours}
        closures={modalClosures}
        isLoading={isSubmittingAppointment}
        initialCustomerId={appointmentModal.preselectedCustomerId || undefined}
        availableSlots={availableSlots}
        slotsLoading={slotsLoading}
        slotsError={slotsError || undefined}
        onSlotsNeeded={fetchAvailableSlots}
        lockedStaffId={permissions.isStaff && !permissions.canManageTeamBookings ? (permissions.currentStaffId ?? undefined) : undefined}
        allowedStaffIds={permissions.isStaff && permissions.canManageTeamBookings && permissions.teamBookingStaffIds.length > 0 ? permissions.teamBookingStaffIds : undefined}
        labels={{
          title: 'Nuovo Appuntamento',
          customer: 'Cliente',
          service: 'Servizio',
          staff: 'Operatore',
          newCustomer: 'Nuovo cliente',
          searchCustomer: 'Cerca cliente per nome o telefono...',
          submit: 'Crea appuntamento',
        }}
      />
    </>
  );
}