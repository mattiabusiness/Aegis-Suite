// ============================================================================
// AEGIS BEAUTY - CLIENTI CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/clienti/ClientiContent.tsx
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
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
} from '@aegis/ui';
import { createClient } from '@aegis/core';

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

  // State
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [filterCounts, setFilterCounts] = useState(initialFilterCounts);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
        .select('id, full_name, email, phone, total_appointments, total_spent, last_visit_at, is_active, notes, preferences, tags, birth_date, gender, source, accepts_marketing, created_at', { count: 'exact' })
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
  // BOOK APPOINTMENT (open modal with pre-selected customer)
  // ============================================================================

  // Appointment modal state
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    preselectedCustomerId: string | null;
  }>({ isOpen: false, preselectedCustomerId: null });
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

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
      // Fetch all customers for export
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('full_name, email, phone, total_appointments, total_spent, last_visit_at, is_active, notes, preferences, created_at')
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
          created_at: string;
        }> | null };

      if (!allCustomers || allCustomers.length === 0) {
        alert('Nessun cliente da esportare');
        return;
      }

      // Build CSV
      const headers = ['Nome', 'Email', 'Telefono', 'Visite', 'Totale Speso', 'Ultima Visita', 'Stato', 'Note', 'Preferenze', 'Registrato il'];
      const rows = allCustomers.map(c => [
        c.full_name,
        c.email || '',
        c.phone || '',
        c.total_appointments.toString(),
        c.total_spent.toFixed(2),
        c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('it-IT') : '',
        c.is_active ? 'Attivo' : 'Inattivo',
        (c.notes || '').replace(/"/g, '""'),
        (c.preferences || '').replace(/"/g, '""'),
        new Date(c.created_at).toLocaleDateString('it-IT'),
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
      ].join('\n');

      // BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clienti_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting customers:', err);
      alert('Errore durante l\'esportazione');
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
  }));

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

        <div className="mt-6 pb-8">
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
            onExport={handleExport}
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
        onBookAppointment={handleBookAppointment}
        loading={detailModal.loading}
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