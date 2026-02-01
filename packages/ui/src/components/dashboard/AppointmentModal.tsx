// ============================================================================
// AEGIS SUITE - APPOINTMENT MODAL COMPONENT
// File: packages/ui/src/components/dashboard/AppointmentModal.tsx
// Generic appointment creation modal - works for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import { X, Calendar, Clock, User, Briefcase, Users, FileText, Search, Plus, AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  categoryId?: string;
  categoryName?: string;
}

export interface Staff {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
}

export interface AppointmentFormData {
  customerId: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  notes: string;
  isNewCustomer: boolean;
  sendInvite: boolean;
}

export interface AppointmentModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Submit handler */
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  /** List of customers */
  customers: Customer[];
  /** List of services */
  services: Service[];
  /** List of staff members */
  staff: Staff[];
  /** Business hours for each day */
  businessHours?: BusinessHoursData[];
  /** Closures (holidays, etc.) */
  closures?: ClosureData[];
  /** Pre-selected date (optional) */
  initialDate?: Date;
  /** Pre-selected time (optional) */
  initialTime?: string;
  /** Pre-selected staff (optional) */
  initialStaffId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Labels customization for different verticals */
  labels?: {
    title?: string;
    customer?: string;
    service?: string;
    staff?: string;
    newCustomer?: string;
    searchCustomer?: string;
    submit?: string;
  };
}

// Business hours type (same as Calendar)
export interface BusinessHoursData {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

// Closure type (same as Calendar)
export interface ClosureData {
  date: string;
  reason?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAYS_DB = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// ============================================================================
// DEFAULT LABELS
// ============================================================================

const defaultLabels = {
  title: 'Nuovo Appuntamento',
  customer: 'Cliente',
  service: 'Servizio',
  staff: 'Operatore',
  newCustomer: 'Nuovo cliente',
  searchCustomer: 'Cerca cliente...',
  submit: 'Crea appuntamento',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

// Generate time slots from 08:00 to 20:00 every 15 minutes
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 15) {
      if (hour === 20 && min > 0) break;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

// Check if a date is closed (regular closing day or holiday)
function isDateClosed(
  date: Date, 
  businessHours?: BusinessHoursData[], 
  closures?: ClosureData[]
): { closed: boolean; reason?: string } {
  // Check regular business hours (e.g., Sunday closed)
  if (businessHours) {
    const dayName = DAYS_DB[date.getDay()];
    const dayHours = businessHours.find(bh => bh.day_of_week === dayName);
    if (dayHours && !dayHours.is_open) {
      return { closed: true, reason: 'Chiuso' };
    }
  }
  
  // Check closures (holidays)
  if (closures) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const closure = closures.find(c => c.date === dateStr);
    if (closure) {
      return { closed: true, reason: closure.reason || 'Chiuso per festività' };
    }
  }
  
  return { closed: false };
}

// Get min date (today)
function getMinDate(): string {
  return formatDate(new Date());
}

// Get max date (3 months from now)
function getMaxDate(): string {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  return formatDate(maxDate);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  services,
  staff,
  businessHours,
  closures,
  initialDate,
  initialTime,
  initialStaffId,
  isLoading = false,
  labels: customLabels,
}: AppointmentModalProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);
  
  // Form state
  const [formData, setFormData] = React.useState<AppointmentFormData>({
    customerId: null,
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: initialStaffId || '',
    date: initialDate ? formatDate(initialDate) : formatDate(new Date()),
    time: initialTime || '09:00',
    notes: '',
    isNewCustomer: false,
    sendInvite: true,
  });
  
  // Check if selected date is closed
  const selectedDateClosed = React.useMemo(() => {
    if (!formData.date) return { closed: false };
    const date = new Date(formData.date + 'T00:00:00');
    return isDateClosed(date, businessHours, closures);
  }, [formData.date, businessHours, closures]);
  
  // UI state
  const [customerSearch, setCustomerSearch] = React.useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [showServiceList, setShowServiceList] = React.useState(false);
  const [staffSearch, setStaffSearch] = React.useState('');
  const [showStaffList, setShowStaffList] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Refs
  const modalRef = React.useRef<HTMLDivElement>(null);
  const customerInputRef = React.useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        customerId: null,
        customerFirstName: '',
        customerLastName: '',
        customerPhone: '',
        customerEmail: '',
        serviceId: '',
        staffId: initialStaffId || '',
        date: initialDate ? formatDate(initialDate) : formatDate(new Date()),
        time: initialTime || '09:00',
        notes: '',
        isNewCustomer: false,
        sendInvite: true,
      });
      setCustomerSearch('');
      setServiceSearch('');
      setShowServiceList(false);
      setStaffSearch('');
      setShowStaffList(false);
      setErrors({});
    }
  }, [isOpen, initialDate, initialTime, initialStaffId]);

  // Close on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Filtered customers based on search
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10);
    const search = customerSearch.toLowerCase();
    return customers
      .filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [customers, customerSearch]);

  // Services sorted by price (low to high) and filtered
  const sortedServices = React.useMemo(() => {
    return [...services].sort((a, b) => a.price - b.price);
  }, [services]);

  // Services grouped by category, sorted by price within each category
  const groupedServices = React.useMemo(() => {
    // Get unique categories
    const categories = new Map<string, { name: string; services: Service[] }>();
    
    // Group services by category
    sortedServices.forEach(service => {
      const catId = service.categoryId || 'other';
      const catName = service.categoryName || 'Altri servizi';
      
      if (!categories.has(catId)) {
        categories.set(catId, { name: catName, services: [] });
      }
      categories.get(catId)!.services.push(service);
    });
    
    return Array.from(categories.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      services: data.services,
    }));
  }, [sortedServices]);

  // Filtered services based on search (only when typing)
  const filteredServices = React.useMemo(() => {
    if (!serviceSearch.trim()) return [];
    const search = serviceSearch.toLowerCase();
    return sortedServices.filter(s => 
      s.name.toLowerCase().includes(search)
    );
  }, [sortedServices, serviceSearch]);

  // Get selected service details
  const selectedService = services.find(s => s.id === formData.serviceId);

  // Filtered staff based on search
  const filteredStaff = React.useMemo(() => {
    if (!staffSearch.trim()) return [];
    const search = staffSearch.toLowerCase();
    return staff.filter(s => 
      s.name.toLowerCase().includes(search)
    );
  }, [staff, staffSearch]);

  // Get selected staff details
  const selectedStaff = staff.find(s => s.id === formData.staffId);

  // Handlers
  const handleCustomerSelect = (customer: Customer) => {
    // Split name into first and last name
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerPhone: customer.phone || '',
      customerEmail: customer.email || '',
      isNewCustomer: false,
      sendInvite: false,
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleNewCustomer = () => {
    // Try to split search into first and last name
    const nameParts = customerSearch.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setFormData(prev => ({
      ...prev,
      customerId: null,
      customerFirstName: firstName,
      customerLastName: lastName,
      isNewCustomer: true,
      sendInvite: true,
    }));
    setShowCustomerDropdown(false);
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleServiceSelect = (service: Service) => {
    setFormData(prev => ({ ...prev, serviceId: service.id }));
    setServiceSearch(''); // Svuoto per mostrare la preview dentro il campo
    setShowServiceList(false);
    // Clear error
    if (errors.serviceId) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.serviceId;
        return next;
      });
    }
  };

  const handleStaffSelect = (member: Staff) => {
    setFormData(prev => ({ ...prev, staffId: member.id }));
    setStaffSearch(''); // Svuoto per mostrare la preview dentro il campo
    setShowStaffList(false);
    // Clear error
    if (errors.staffId) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.staffId;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.isNewCustomer) {
      if (!formData.customerFirstName.trim()) {
        newErrors.customerFirstName = 'Inserisci il nome';
      }
      if (!formData.customerLastName.trim()) {
        newErrors.customerLastName = 'Inserisci il cognome';
      }
      if (!formData.customerPhone.trim()) {
        newErrors.customerPhone = 'Inserisci il telefono';
      }
      if (!formData.customerEmail.trim()) {
        newErrors.customerEmail = 'Inserisci l\'email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Email non valida';
      }
    } else if (!formData.customerId && !formData.customerFirstName.trim()) {
      newErrors.customerFirstName = 'Seleziona o inserisci un cliente';
    }
    
    if (!formData.serviceId) {
      newErrors.serviceId = 'Seleziona un servizio';
    }
    if (!formData.staffId) {
      newErrors.staffId = 'Seleziona un operatore';
    }
    if (!formData.date) {
      newErrors.date = 'Seleziona una data';
    } else if (selectedDateClosed.closed) {
      newErrors.date = selectedDateClosed.reason || 'Giorno chiuso';
    }
    if (!formData.time) {
      newErrors.time = 'Seleziona un orario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{labels.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            
            {/* Customer Selection */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                {labels.customer}
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={customerInputRef}
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                      if (formData.customerId) {
                        setFormData(prev => ({ ...prev, customerId: null, isNewCustomer: false }));
                      }
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder={labels.searchCustomer}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.customerName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                
                {/* Customer Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full px-4 py-2.5 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                              {customer.phone && (
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : null}
                    
                    {/* New Customer Option */}
                    {customerSearch.trim() && (
                      <button
                        type="button"
                        onClick={handleNewCustomer}
                        className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">
                            {labels.newCustomer}: "{customerSearch}"
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {errors.customerFirstName && !formData.isNewCustomer && (
                <p className="text-xs text-red-500">{errors.customerFirstName}</p>
              )}
              
              {/* New Customer Fields */}
              {formData.isNewCustomer && (
                <div className="mt-3 p-4 bg-green-50 rounded-xl space-y-3">
                  <p className="text-xs font-medium text-green-700">Dati nuovo cliente</p>
                  
                  {/* Nome e Cognome */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={formData.customerFirstName}
                        onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                        placeholder="Nome *"
                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.customerFirstName ? 'border-red-300 bg-red-50' : 'border-green-200'
                        }`}
                      />
                      {errors.customerFirstName && (
                        <p className="text-xs text-red-500 mt-1">{errors.customerFirstName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.customerLastName}
                        onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                        placeholder="Cognome *"
                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.customerLastName ? 'border-red-300 bg-red-50' : 'border-green-200'
                        }`}
                      />
                      {errors.customerLastName && (
                        <p className="text-xs text-red-500 mt-1">{errors.customerLastName}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Telefono */}
                  <div>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Telefono *"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-green-200'
                      }`}
                    />
                    {errors.customerPhone && (
                      <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="Email *"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.customerEmail ? 'border-red-300 bg-red-50' : 'border-green-200'
                      }`}
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>
                    )}
                  </div>
                  
                  {/* Checkbox Invito */}
                  <label className="flex items-center gap-3 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendInvite}
                      onChange={(e) => handleInputChange('sendInvite', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-green-700">
                      Invia invito via email
                    </span>
                  </label>
                  <p className="text-xs text-green-600">
                    Il cliente riceverà un'email per completare la registrazione e accedere all'app
                  </p>
                </div>
              )}
            </div>

            {/* Service Selection - Search + List */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Briefcase className="w-4 h-4" />
                {labels.service}
              </label>
              
              <div className="relative">
                {/* Search input + button OR Selected service display */}
                <div className="flex gap-2">
                  {/* Se c'è un servizio selezionato e non sto cercando, mostra il servizio nel campo */}
                  {selectedService && !showServiceList && !serviceSearch ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-2.5 bg-purple-50 border-2 border-purple-500 rounded-xl">
                      <span className="font-medium text-gray-900 text-sm truncate">{selectedService.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          {formatDuration(selectedService.duration)}
                        </span>
                        <span className="text-xs font-semibold text-purple-700 bg-white px-2 py-1 rounded-md">
                          {formatPrice(selectedService.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, serviceId: '' }));
                            setServiceSearch('');
                          }}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          title="Rimuovi servizio"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => {
                          setServiceSearch(e.target.value);
                          setShowServiceList(false);
                          if (formData.serviceId) {
                            setFormData(prev => ({ ...prev, serviceId: '' }));
                          }
                        }}
                        placeholder="Cerca servizio..."
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.serviceId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowServiceList(!showServiceList);
                      setServiceSearch('');
                    }}
                    className={`px-3 py-2.5 border rounded-xl transition-colors ${
                      showServiceList 
                        ? 'border-purple-500 bg-purple-50 text-purple-600' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                    title="Mostra tutti i servizi"
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                </div>

                {/* Search results dropdown (only when typing) */}
                {serviceSearch.trim() && filteredServices.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {filteredServices.map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.serviceId === service.id
                            ? 'bg-purple-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" />
                              {formatDuration(service.duration)}
                            </span>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {serviceSearch.trim() && filteredServices.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <p className="text-xs text-gray-500 text-center py-4">Nessun servizio trovato per "{serviceSearch}"</p>
                  </div>
                )}

                {/* Full service list grouped by category (only when button clicked) */}
                {showServiceList && !serviceSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {groupedServices.map((category, catIndex) => (
                      <div key={category.id}>
                        {/* Category header */}
                        <div className={`px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide ${
                          catIndex > 0 ? 'border-t border-gray-200' : ''
                        }`}>
                          {category.name}
                        </div>
                        {/* Services in category */}
                        {category.services.map(service => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceSelect(service)}
                            className={`w-full p-3 text-left transition-colors border-b border-gray-50 last:border-b-0 ${
                              formData.serviceId === service.id
                                ? 'bg-purple-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(service.duration)}
                                </span>
                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                  {formatPrice(service.price)}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {errors.serviceId && (
                <p className="text-xs text-red-500">{errors.serviceId}</p>
              )}
            </div>

            {/* Staff Selection - Search + List like services */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                {labels.staff}
              </label>
              
              <div className="relative">
                {/* Search input + button OR Selected staff display */}
                <div className="flex gap-2">
                  {/* Se c'è uno staff selezionato e non sto cercando, mostra lo staff nel campo */}
                  {selectedStaff && !showStaffList && !staffSearch ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-2.5 bg-purple-50 border-2 border-purple-500 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: selectedStaff.color || '#9333ea' }}
                        >
                          {selectedStaff.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{selectedStaff.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, staffId: '' }));
                          setStaffSearch('');
                        }}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        title="Rimuovi operatore"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => {
                          setStaffSearch(e.target.value);
                          setShowStaffList(false);
                          if (formData.staffId) {
                            setFormData(prev => ({ ...prev, staffId: '' }));
                          }
                        }}
                        placeholder="Cerca operatore..."
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.staffId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowStaffList(!showStaffList);
                      setStaffSearch('');
                    }}
                    className={`px-3 py-2.5 border rounded-xl transition-colors ${
                      showStaffList 
                        ? 'border-purple-500 bg-purple-50 text-purple-600' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                    title="Mostra tutti gli operatori"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>

                {/* Search results dropdown (only when typing) */}
                {staffSearch.trim() && filteredStaff.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredStaff.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleStaffSelect(member)}
                        className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.staffId === member.id
                            ? 'bg-purple-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                            style={{ backgroundColor: member.color || '#9333ea' }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {staffSearch.trim() && filteredStaff.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <p className="text-xs text-gray-500 text-center py-4">Nessun operatore trovato per "{staffSearch}"</p>
                  </div>
                )}

                {/* Full staff list (only when button clicked) */}
                {showStaffList && !staffSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {staff.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleStaffSelect(member)}
                        className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.staffId === member.id
                            ? 'bg-purple-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                            style={{ backgroundColor: member.color || '#9333ea' }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {errors.staffId && (
                <p className="text-xs text-red-500">{errors.staffId}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.date || selectedDateClosed.closed ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {selectedDateClosed.closed && !errors.date && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {selectedDateClosed.reason || 'Giorno chiuso'}
                  </p>
                )}
                {errors.date && (
                  <p className="text-xs text-red-500">{errors.date}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Ora
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  disabled={selectedDateClosed.closed}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white ${
                    errors.time ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } ${selectedDateClosed.closed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time && (
                  <p className="text-xs text-red-500">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                Note (opzionale)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Aggiungi note per l'appuntamento..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creazione...
                </>
              ) : (
                labels.submit
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}