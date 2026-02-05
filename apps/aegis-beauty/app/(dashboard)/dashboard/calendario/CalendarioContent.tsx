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
import { Plus, X } from 'lucide-react';

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
  
  // State
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents);
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  
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

  // Handlers
  const handleEventClick = (event: CalendarEventData) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
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

  return (
    <>
      <div className="min-h-[calc(100vh-7rem)]">
        {/* Header */}
        <PageHeader
          title="Calendario"
          description="Gestisci gli appuntamenti del tuo salone"
          actions={[
            {
              label: 'Nuovo appuntamento',
              onClick: handleNewClick,
              icon: <Plus className="w-4 h-4" />,
            },
          ]}
        />

        {/* Layout calendario + sidebar */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              staffMembers={staffList.map(s => ({
                id: s.id,
                name: s.full_name,
                color: s.color || '#9333ea',
              }))}
              selectedStaffId={selectedStaff}
              onStaffFilter={handleStaffFilter}
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

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedEvent.title}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-medium">{selectedEvent.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Operatore</span>
                  <span className="font-medium">{selectedEvent.staffName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data</span>
                  <span className="font-medium">
                    {new Date(selectedEvent.startTime).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Orario</span>
                  <span className="font-medium">
                    {new Date(selectedEvent.startTime).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(selectedEvent.endTime).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {selectedEvent.notes && (
                  <div>
                    <span className="text-gray-500 block mb-1">Note</span>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded-lg">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-500">Stato</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full
                    ${selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                    ${selectedEvent.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${selectedEvent.status === 'completed' ? 'bg-gray-100 text-gray-600' : ''}
                    ${selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${selectedEvent.status === 'no_show' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {selectedEvent.status === 'confirmed' && 'Confermato'}
                    {selectedEvent.status === 'pending' && 'In attesa'}
                    {selectedEvent.status === 'completed' && 'Completato'}
                    {selectedEvent.status === 'cancelled' && 'Cancellato'}
                    {selectedEvent.status === 'no_show' && 'No-show'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Chiudi
                </button>
                <button
                  onClick={() => {
                    console.log('Edit event:', selectedEvent.id);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Modifica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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