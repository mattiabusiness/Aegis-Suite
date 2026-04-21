// ============================================================================
// AEGIS SUITE - BOOKING TYPES (shared across carousel, card, steps)
// File: packages/ui/src/components/customer/booking/types.ts
// Minimal structural types — compatible with @aegis/types but no dependency
// ============================================================================

export interface BookingCategory {
  id:   string;
  name: string;
}

export interface BookingBusiness {
  id:                        string;
  slug:                      string;
  phone:                     string | null;
  address_street:            string | null;
  address_city:              string | null;
  address_province:          string | null;
  cancellation_policy_hours: number;
  description:               string | null;
  shampoo_price?:            number;
  business_type?:            string | null;
}

export interface BookingService {
  id:               string;
  name:             string;
  duration_minutes: number;
  price:            number;
  price_from:       boolean;
  category_id?:     string | null;
}

export interface BookingStaff {
  id:               string;
  full_name:        string;
  nickname:         string | null;
  avatar_url:       string | null;
  specializations:  string[] | null;
}

export interface BookingHours {
  day_of_week: string;
  is_open:     boolean;
}

export interface BookingSlot {
  time:               string;
  availableStaffIds?: string[];
}

export interface BookingState {
  selectedService:   BookingService | null;
  selectedStaff:     BookingStaff | null;
  selectedDate:      Date | null;
  selectedTime:      string | null;
  customerNotes:     string;
  autoAssignedStaff: BookingStaff | null;
  includeShampoo:    boolean;
}

export type FetchSlotsFn = (params: {
  businessId: string;
  serviceId:  string;
  staffId?:   string;
  date:       string;
}) => Promise<BookingSlot[]>;
