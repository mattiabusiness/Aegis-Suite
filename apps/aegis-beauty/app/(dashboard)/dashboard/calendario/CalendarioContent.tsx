// ============================================================================
// AEGIS BEAUTY - CALENDARIO CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/calendario/CalendarioContent.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageHeader,
  Calendar,
  Card,
  CalendarEventListItem,
  EmptyAppointments,
  AppointmentModal,
  EventDetailModal,
  type CalendarEventData,
  type CalendarView,
  type BusinessHoursData,
  type ClosureData,
  type Customer,
  type Service,
  type Staff,
  type AppointmentFormData,
  type StaffServicesMap,
} from '@aegis/ui';
import { createClient } from '@aegis/core';
import { Plus } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StaffMember {
  id: string;
  full_name: string;
  color: string | null;
}

interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ServiceData {
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

interface CalendarioContentProps {
  initialEvents: CalendarEventData[];
  staffList: StaffMember[];
  businessId: string;
  businessHours: BusinessHoursData[];
  closures: ClosureData[];
  customers: CustomerData[];
  services: ServiceData[];
  staffServices: StaffServiceData[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CalendarioContent({
  initialEvents,
  staffList,
  businessId,
  businessHours,
  closures,
  customers,
  services,
  staffServices,
}: CalendarioContentProps) {
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents);
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build staffServices map for AppointmentModal
  const staffServicesMap: StaffServicesMap = {};
  staffServices.forEach(ss => {
    if (!staffServicesMap[ss.staff_id]) {
      staffServicesMap[ss.staff_id] = [];
    }
    staffServicesMap[ss.staff_id].push(ss.service_id);
  });

  // Transform data for AppointmentModal
  const modalCustomers: Customer[] = customers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
  }));

  const modalServices: Service[] = services.map(s => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: s.price,
    categoryId: s.categoryId,
    categoryName: s.categoryName,
  }));

  const modalStaff: Staff[] = staffList.map(s => ({
    id: s.id,
    name: s.full_name,
    color: s.color || undefined,
  }));

  // Filtra eventi per staff selezionato
  const filteredEvents = selectedStaff
    ? events.filter((e) => e.staffName === staffList.find(s => s.id === selectedStaff)?.full_name)
    : events;

  // Eventi di oggi per la sidebar
  const todayEvents = events.filter((e) => {
    const today = new Date();
    const eventDate = new Date(e.startTime);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEventClick = (event: CalendarEventData) => {
    setSelectedEvent(event);
  };

  const handleSlotClick = (date: Date, hour: number, minutes: number) => {
    setModalInitialDate(date);
    setModalInitialTime(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setModalInitialDate(undefined);
    setModalInitialTime(undefined);
    setIsModalOpen(true);
  };

  const handleStaffFilter = (staffId: string | null) => {
    setSelectedStaff(staffId);
  };

  // ============================================================================
  // STATUS UPDATE HANDLERS
  // ============================================================================

  const updateEventStatus = async (eventId: string, newStatus: 'completed' | 'no_show' | 'cancelled') => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await (supabase
        .from('appointments') as any)
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, status: newStatus } : e
        )
      );
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Errore nell\'aggiornamento dello stato');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleComplete = (eventId: string) => updateEventStatus(eventId, 'completed');
  const handleNoShow = (eventId: string) => updateEventStatus(eventId, 'no_show');
  const handleCancel = (eventId: string) => updateEventStatus(eventId, 'cancelled');

  // ============================================================================
  // APPOINTMENT CREATION
  // ============================================================================

  const handleModalSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          businessId: businessId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore nella creazione');
      }
      
      // Aggiungi evento al calendario
      const selectedService = services.find(s => s.id === data.serviceId);
      const selectedStaffMember = staffList.find(s => s.id === data.staffId);
      
      const newEvent: CalendarEventData = {
        id: result.appointment.id,
        title: result.appointment.serviceName || selectedService?.name || 'Appuntamento',
        startTime: new Date(result.appointment.startTime),
        endTime: new Date(result.appointment.endTime),
        customerName: result.appointment.customerName,
        staffName: result.appointment.staffName || selectedStaffMember?.full_name,
        status: result.appointment.status || 'confirmed',
        notes: result.appointment.notes || undefined,
      };
      
      setEvents(prev => [...prev, newEvent]);
      setIsModalOpen(false);
      
      if (result.inviteSent) {
        console.log('✅ Invito inviato a:', data.customerEmail);
      }
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error instanceof Error ? error.message : 'Errore nella creazione dell\'appuntamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-[calc(100vh-7rem)]">
        {/* Header */}
        <PageHeader
          title="Calendario"
          description="Gestisci gli appuntamenti del tuo salone"
          actions={[
            {
              id: 'new-appointment',
              label: 'Nuovo appuntamento',
              onClick: handleNewClick,
              icon: Plus,
            },
          ]}
        />

        {/* Staff filter bar */}
        {staffList.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 font-medium">Filtra per staff:</span>
            <button
              onClick={() => handleStaffFilter(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedStaff === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tutti
            </button>
            {staffList.map(s => (
              <button
                key={s.id}
                onClick={() => handleStaffFilter(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedStaff === s.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color || '#9333ea' }}
                />
                {s.full_name}
              </button>
            ))}
          </div>
        )}

        {/* Layout calendario + sidebar */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario principale */}
          <div className="lg:col-span-3">
            <Calendar
              view={view}
              onViewChange={setView}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              businessHours={businessHours}
              closures={closures}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Appuntamenti di oggi */}
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">
                Oggi ({todayEvents.length})
              </h3>
              {todayEvents.length > 0 ? (
                <div className="space-y-2">
                  {todayEvents
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(event => (
                      <CalendarEventListItem
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun appuntamento oggi
                </p>
              )}
            </Card>

            {/* Quick stats */}
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">Statistiche</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Questa settimana</span>
                  <span className="font-medium">{events.length} app.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confermati</span>
                  <span className="font-medium text-green-600">
                    {events.filter(e => e.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">In attesa</span>
                  <span className="font-medium text-amber-600">
                    {events.filter(e => e.status === 'pending').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Event detail modal (from UI package) */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onComplete={handleComplete}
        onNoShow={handleNoShow}
        onCancel={handleCancel}
        isLoading={isUpdatingStatus}
      />

      {/* Modal Nuovo Appuntamento */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customers={modalCustomers}
        services={modalServices}
        staff={modalStaff}
        staffServices={staffServicesMap}
        businessHours={businessHours}
        closures={closures}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
        isLoading={isSubmitting}
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