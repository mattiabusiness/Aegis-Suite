// ============================================================================
// AEGIS SUITE - APPOINTMENT MODAL COMPONENT
// File: packages/ui/src/components/dashboard/AppointmentModal.tsx
// Generic appointment creation modal - works for all verticals
// With staff-service compatibility checking
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

// Business hours type
export interface BusinessHoursData {
  day_of_week: string;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
}

// Closure type
export interface ClosureData {
  date: string;
  reason?: string;
}

// Staff-Services mapping
export interface StaffServicesMap {
  [staffId: string]: string[]; // staffId -> array of serviceIds they can perform
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
  /** Map of staff to their available services */
  staffServices?: StaffServicesMap;
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

// ============================================================================
// CONSTANTS
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

const DAYS_DB = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

function isDateClosed(
  date: Date, 
  businessHours?: BusinessHoursData[], 
  closures?: ClosureData[]
): { closed: boolean; reason?: string } {
  if (businessHours) {
    const dayName = DAYS_DB[date.getDay()];
    const dayHours = businessHours.find(bh => bh.day_of_week === dayName);
    if (dayHours && !dayHours.is_open) {
      return { closed: true, reason: 'Chiuso' };
    }
  }
  
  if (closures) {
    const dateStr = formatDate(date);
    const closure = closures.find(c => c.date === dateStr);
    if (closure) {
      return { closed: true, reason: closure.reason || 'Chiuso per festività' };
    }
  }
  
  return { closed: false };
}

function getMinDate(): string {
  return formatDate(new Date());
}

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
  staffServices,
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

  // Check staff-service compatibility
  const incompatibleStaffService = React.useMemo(() => {
    if (!formData.staffId || !formData.serviceId || !staffServices) {
      return null;
    }
    
    const staffServiceList = staffServices[formData.staffId];
    
    // If staffServices is provided but this staff has no services listed, 
    // they can't perform any service
    if (!staffServiceList || staffServiceList.length === 0) {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const selectedStaffMember = staff.find(s => s.id === formData.staffId);
      return {
        staffName: selectedStaffMember?.name || 'Questo operatore',
        serviceName: selectedService?.name || 'questo servizio',
      };
    }
    
    // Check if service is in staff's list
    if (!staffServiceList.includes(formData.serviceId)) {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const selectedStaffMember = staff.find(s => s.id === formData.staffId);
      return {
        staffName: selectedStaffMember?.name || 'Questo operatore',
        serviceName: selectedService?.name || 'questo servizio',
      };
    }
    
    return null;
  }, [formData.staffId, formData.serviceId, staffServices, services, staff]);

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

  // Filtered and grouped services
  const groupedServices = React.useMemo(() => {
    let filtered = services;
    if (serviceSearch.trim()) {
      const search = serviceSearch.toLowerCase();
      filtered = services.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.categoryName?.toLowerCase().includes(search)
      );
    }
    
    const groups: Record<string, Service[]> = {};
    filtered.forEach(service => {
      const category = service.categoryName || 'Altri';
      if (!groups[category]) groups[category] = [];
      groups[category].push(service);
    });
    
    // Sort by price within each category
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => a.price - b.price);
    });
    
    return groups;
  }, [services, serviceSearch]);

  // Filtered services (flat)
  const filteredServices = React.useMemo(() => {
    if (!serviceSearch.trim()) return services;
    const search = serviceSearch.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.categoryName?.toLowerCase().includes(search)
    );
  }, [services, serviceSearch]);

  // Filtered staff
  const filteredStaff = React.useMemo(() => {
    if (!staffSearch.trim()) return staff;
    const search = staffSearch.toLowerCase();
    return staff.filter(s => 
      s.name.toLowerCase().includes(search)
    );
  }, [staff, staffSearch]);

  // Get selected service and staff details
  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedStaff = staff.find(s => s.id === formData.staffId);

  // Handlers
  const handleCustomerSelect = (customer: Customer) => {
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
    setServiceSearch('');
    setShowServiceList(false);
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
    setStaffSearch('');
    setShowStaffList(false);
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
    
    // Warn but allow if incompatible (gestore may want to override)
    // The warning is shown in the UI already
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl z-10">
            <h2 className="text-xl font-semibold text-gray-900">{labels.title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              
              {/* Incompatibility Warning */}
              {incompatibleStaffService && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Servizio non disponibile
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      <strong>{incompatibleStaffService.staffName}</strong> non può eseguire il servizio "<strong>{incompatibleStaffService.serviceName}</strong>". 
                      Puoi comunque procedere, ma considera di cambiare operatore o servizio.
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Selection */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  {labels.customer}
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
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
                      errors.customerFirstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  
                  {/* Dropdown */}
                  {showCustomerDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {/* New customer option */}
                      {customerSearch.trim() && (
                        <button
                          type="button"
                          onClick={handleNewCustomer}
                          className="w-full p-3 text-left hover:bg-purple-50 border-b border-gray-100 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            <span className="text-purple-600 font-medium">{labels.newCustomer}:</span>{' '}
                            <span className="text-gray-900">{customerSearch}</span>
                          </span>
                        </button>
                      )}
                      
                      {/* Existing customers */}
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                          {customer.phone && (
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          )}
                        </button>
                      ))}
                      
                      {filteredCustomers.length === 0 && !customerSearch.trim() && (
                        <p className="text-xs text-gray-500 text-center py-4">
                          Digita per cercare o creare un cliente
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {errors.customerFirstName && (
                  <p className="text-xs text-red-500">{errors.customerFirstName}</p>
                )}
              </div>

              {/* New Customer Form */}
              {formData.isNewCustomer && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Dati nuovo cliente
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={formData.customerFirstName}
                        onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                        placeholder="Nome *"
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          errors.customerFirstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.customerLastName}
                        onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                        placeholder="Cognome *"
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          errors.customerLastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="Telefono *"
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="Email *"
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      errors.customerEmail ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  
                  {/* Send invite checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendInvite}
                      onChange={(e) => handleInputChange('sendInvite', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">
                      Invia invito via email per accedere all'app
                    </span>
                  </label>
                </div>
              )}

              {/* Service Selection */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Briefcase className="w-4 h-4" />
                  {labels.service}
                </label>
                
                <div className="relative">
                  <div className="flex gap-2">
                    {selectedService && !showServiceList && !serviceSearch ? (
                      <div className="flex-1 flex items-center justify-between px-3 py-2.5 bg-purple-50 border-2 border-purple-500 rounded-xl">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 text-sm">{selectedService.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{formatDuration(selectedService.duration)}</span>
                            <span className="text-xs font-semibold text-purple-600">{formatPrice(selectedService.price)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, serviceId: '' }));
                            setServiceSearch('');
                          }}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
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
                    >
                      <Briefcase className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search results */}
                  {serviceSearch.trim() && filteredServices.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {filteredServices.map(service => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                            formData.serviceId === service.id ? 'bg-purple-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{formatDuration(service.duration)}</span>
                              <span className="text-xs font-semibold text-purple-600">{formatPrice(service.price)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Full list grouped by category */}
                  {showServiceList && !serviceSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {Object.entries(groupedServices).map(([category, categoryServices]) => (
                        <div key={category}>
                          <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                            {category}
                          </div>
                          {categoryServices.map(service => (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => handleServiceSelect(service)}
                              className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                                formData.serviceId === service.id ? 'bg-purple-50' : 'hover:bg-gray-50'
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

              {/* Staff Selection */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4" />
                  {labels.staff}
                </label>
                
                <div className="relative">
                  <div className="flex gap-2">
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
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search results */}
                  {staffSearch.trim() && filteredStaff.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredStaff.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleStaffSelect(member)}
                          className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                            formData.staffId === member.id ? 'bg-purple-50' : 'hover:bg-gray-50'
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

                  {/* Full list */}
                  {showStaffList && !staffSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {staff.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleStaffSelect(member)}
                          className={`w-full p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                            formData.staffId === member.id ? 'bg-purple-50' : 'hover:bg-gray-50'
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
              <div className="grid grid-cols-2 gap-3">
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
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.date || selectedDateClosed.closed ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {selectedDateClosed.closed && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {selectedDateClosed.reason}
                    </p>
                  )}
                  {errors.date && !selectedDateClosed.closed && (
                    <p className="text-xs text-red-500">{errors.date}</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4" />
                    Orario
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.time ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
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
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {labels.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}