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

interface CalendarioContentProps {
  initialEvents: CalendarEventData[];
  staffList: StaffMember[];
  businessId: string;
  businessHours: BusinessHoursData[];
  closures: ClosureData[];
  customers: CustomerData[];
  services: ServiceData[];
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
    // Apri modal con data/ora precompilata
    setModalInitialDate(date);
    setModalInitialTime(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    // Apri modal senza data/ora precompilata
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
      // Chiama API per creare appuntamento
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
      
      // Mostra messaggio se invito inviato
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

  // Transform data for modal
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

  return (
    <>
      <div className="h-[calc(100vh-7rem)]">
        {/* Header */}
        <PageHeader
          title="Calendario"
          description="Gestisci gli appuntamenti del tuo salone"
        />

      {/* Main content */}
      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {/* Calendar */}
        <div className="flex-1">
          <Calendar
            events={filteredEvents}
            view={view}
            selectedDate={selectedDate}
            businessHours={businessHours}
            closures={closures}
            onViewChange={setView}
            onDateChange={setSelectedDate}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        </div>

        {/* Sidebar - Today's appointments */}
        <div className="w-72 flex-shrink-0 hidden xl:flex flex-col gap-4">
          {/* Bottone Nuovo Appuntamento */}
          <button
            onClick={handleNewClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nuovo appuntamento
          </button>

          {/* Card appuntamenti di oggi */}
          <Card className="flex-1 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm">Appuntamenti di oggi</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {todayEvents.length} appuntament{todayEvents.length === 1 ? 'o' : 'i'}
              </p>
            </div>
            
            <div className="p-2 overflow-auto flex-1">
              {todayEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Nessun appuntamento oggi</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {todayEvents.map((event) => (
                    <CalendarEventListItem
                      key={event.id}
                      event={event}
                      onClick={handleEventClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedEvent.startTime.toLocaleDateString('it-IT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Orario</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedEvent.startTime.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {selectedEvent.endTime.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {selectedEvent.customerName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Cliente</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEvent.customerName}
                    </span>
                  </div>
                )}

                {selectedEvent.staffName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Staff</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEvent.staffName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Stato</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
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
                    // TODO: Aprire modal modifica
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
      </div>

      {/* Modal Nuovo Appuntamento */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customers={modalCustomers}
        services={modalServices}
        staff={modalStaff}
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