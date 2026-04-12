// ============================================================================
// AEGIS SUITE - DATABASE TYPES
// Auto-generated from Supabase schema
// File: packages/types/src/database.ts
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type PlatformVertical = 'beauty' | 'sport' | 'home' | 'health' | 'law';

export type BusinessType = 'hair_salon' | 'beauty_center' | 'mixed';

// ============================================================================
// ROI DATA TYPE
// ============================================================================

export interface ROIData {
  type: 'user_provided' | 'estimated';
  daily_phone_time?: number;
  daily_phone_bookings?: number;
  monthly_no_shows?: number;
  provided_at?: string;
}

// ============================================================================
// BASE TYPES (Shared)
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  vertical: PlatformVertical;
  email: string;
  phone: string | null;
  website: string | null;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  address_postal_code: string | null;
  address_country: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  currency: string;
  booking_advance_min: number;
  booking_advance_max: number;
  cancellation_policy_hours: number;
  auto_confirm_bookings: boolean;
  description: string | null;
  short_description: string | null;
  owner_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Onboarding fields
  business_type: BusinessType | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  workstations: number;
  roi_data: ROIData;
  // Legal consent (gestore)
  terms_accepted_at: string | null;
  articles_1341_accepted_at: string | null;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  max_staff: number | null;
  max_services: number | null;
  max_appointments_month: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  can_manage_bookings: boolean;
  can_manage_services: boolean;
  can_manage_staff: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
  can_see_business_calendar: boolean;
  can_see_business_stats: boolean;
  can_manage_team_bookings: boolean;
  team_booking_staff_ids: string[];
  invited_at: string | null;
  joined_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BEAUTY VERTICAL TYPES
// ============================================================================

export interface ServiceCategory {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  display_order: number;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  price: number;
  price_from: boolean;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  requires_deposit: boolean;
  deposit_amount: number | null;
  is_addon: boolean;
  parent_service_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  business_id: string;
  user_id: string | null;
  full_name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  specializations: string[] | null;
  display_order: number;
  is_active: boolean;
  accepts_bookings: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  custom_duration_minutes: number | null;
  custom_price: number | null;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: DayOfWeek;
  is_open: boolean;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffHours {
  id: string;
  staff_id: string;
  day_of_week: DayOfWeek;
  is_working: boolean;
  start_time_1: string | null;
  end_time_1: string | null;
  start_time_2: string | null;
  end_time_2: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffBreak {
  id: string;
  staff_id: string;
  name: string;
  day_of_week: DayOfWeek | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
}

export interface StaffTimeOff {
  id: string;
  staff_id: string;
  title: string;
  reason: string | null;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  avatar_url: string | null;
  notes: string | null;
  preferences: string | null;
  tags: string[] | null;
  total_appointments: number;
  total_spent: number;
  last_visit_at: string | null;
  accepts_marketing: boolean;
  marketing_consent_at: string | null;
  // Legal consent (cliente)
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  source: string | null;
  referred_by: string | null;
  invited_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  customer_notes: string | null;
  staff_notes: string | null;
  internal_notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  confirmed_at: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  reminder_sent_at: string | null;
  total_price: number | null;
  deposit_paid: number;
  payment_status: string;
  recurrence_rule: string | null;
  parent_appointment_id: string | null;
  booked_online: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price: number;
  display_order: number;
  created_at: string;
}

export interface BusinessClosure {
  id: string;
  business_id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  start_time: string | null;
  end_time: string | null;
  is_recurring_yearly: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  appointment_id: string | null;
  customer_id: string;
  staff_id: string | null;
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  is_visible: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VIEW TYPES (Composite)
// ============================================================================

export interface StaffWithServices extends Staff {
  services: Array<{
    service_id: string;
    service_name: string;
    duration_minutes: number;
    price: number;
  }>;
}

export interface AppointmentDetailed extends Appointment {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  staff_name: string;
  staff_nickname: string | null;
  business_name: string;
  business_slug: string;
  services: Array<{
    service_name: string;
    duration_minutes: number;
    price: number;
  }>;
}

// ============================================================================
// INSERT TYPES (campi obbligatori + opzionali con default)
// ============================================================================

export interface BusinessInsert {
  // Obbligatori
  slug: string;
  name: string;
  email: string;
  // Opzionali (hanno default nel DB)
  vertical?: PlatformVertical;
  phone?: string | null;
  website?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_province?: string | null;
  address_postal_code?: string | null;
  address_country?: string;
  latitude?: number | null;
  longitude?: number | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  timezone?: string;
  currency?: string;
  booking_advance_min?: number;
  booking_advance_max?: number;
  cancellation_policy_hours?: number;
  auto_confirm_bookings?: boolean;
  description?: string | null;
  short_description?: string | null;
  owner_id?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  // Onboarding fields
  business_type?: BusinessType | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  workstations?: number;
  roi_data?: ROIData;
}

export interface BusinessMemberInsert {
  business_id: string;
  user_id: string;
  role?: UserRole;
  can_manage_bookings?: boolean;
  can_manage_services?: boolean;
  can_manage_staff?: boolean;
  can_view_analytics?: boolean;
  can_manage_settings?: boolean;
  can_see_business_calendar?: boolean;
  can_see_business_stats?: boolean;
  can_manage_team_bookings?: boolean;
  team_booking_staff_ids?: string[];
  invited_at?: string | null;
  joined_at?: string | null;
  is_active?: boolean;
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type BusinessUpdate = Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>;

export type ServiceCategoryInsert = Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>;
export type ServiceCategoryUpdate = Partial<Omit<ServiceCategory, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;

export type StaffInsert = Omit<Staff, 'id' | 'created_at' | 'updated_at'>;
export type StaffUpdate = Partial<Omit<Staff, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;

export type CustomerInsert = Omit<Customer, 'id' | 'total_appointments' | 'total_spent' | 'last_visit_at' | 'created_at' | 'updated_at'>;
export type CustomerUpdate = Partial<Omit<Customer, 'id' | 'business_id' | 'total_appointments' | 'total_spent' | 'created_at' | 'updated_at'>>;

export type AppointmentInsert = Omit<Appointment, 'id' | 'cancelled_at' | 'confirmed_at' | 'checked_in_at' | 'completed_at' | 'reminder_sent_at' | 'created_at' | 'updated_at'>;
export type AppointmentUpdate = Partial<Omit<Appointment, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// SUPABASE DATABASE TYPE (for supabase-js client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      businesses: {
        Row: Business;
        Insert: BusinessInsert;
        Update: BusinessUpdate;
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          business_id: string;
          plan_name?: string;
          status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancelled_at?: string | null;
          max_staff?: number | null;
          max_services?: number | null;
          max_appointments_month?: number | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: Partial<Omit<Subscription, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
      };
      business_members: {
        Row: BusinessMember;
        Insert: BusinessMemberInsert;
        Update: Partial<Omit<BusinessMember, 'id' | 'business_id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      service_categories: {
        Row: ServiceCategory;
        Insert: ServiceCategoryInsert;
        Update: ServiceCategoryUpdate;
      };
      services: {
        Row: Service;
        Insert: ServiceInsert;
        Update: ServiceUpdate;
      };
      staff: {
        Row: Staff;
        Insert: StaffInsert;
        Update: StaffUpdate;
      };
      staff_services: {
        Row: StaffService;
        Insert: Omit<StaffService, 'id' | 'created_at'>;
        Update: Partial<Omit<StaffService, 'id' | 'staff_id' | 'service_id' | 'created_at'>>;
      };
      business_hours: {
        Row: BusinessHours;
        Insert: Omit<BusinessHours, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessHours, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
      };
      staff_hours: {
        Row: StaffHours;
        Insert: Omit<StaffHours, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StaffHours, 'id' | 'staff_id' | 'created_at' | 'updated_at'>>;
      };
      staff_breaks: {
        Row: StaffBreak;
        Insert: Omit<StaffBreak, 'id' | 'created_at'>;
        Update: Partial<Omit<StaffBreak, 'id' | 'staff_id' | 'created_at'>>;
      };
      staff_time_off: {
        Row: StaffTimeOff;
        Insert: Omit<StaffTimeOff, 'id' | 'created_at'>;
        Update: Partial<Omit<StaffTimeOff, 'id' | 'staff_id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      appointments: {
        Row: Appointment;
        Insert: AppointmentInsert;
        Update: AppointmentUpdate;
      };
      appointment_services: {
        Row: AppointmentService;
        Insert: Omit<AppointmentService, 'id' | 'created_at'>;
        Update: Partial<Omit<AppointmentService, 'id' | 'appointment_id' | 'created_at'>>;
      };
      business_closures: {
        Row: BusinessClosure;
        Insert: Omit<BusinessClosure, 'id' | 'created_at'>;
        Update: Partial<Omit<BusinessClosure, 'id' | 'business_id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Omit<PushSubscriptionRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PushSubscriptionRow, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: {
      staff_with_services: {
        Row: StaffWithServices;
      };
      appointments_detailed: {
        Row: AppointmentDetailed;
      };
    };
    Functions: {
      is_business_member: {
        Args: { business_uuid: string };
        Returns: boolean;
      };
      is_business_admin: {
        Args: { business_uuid: string };
        Returns: boolean;
      };
      get_user_business_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_status: SubscriptionStatus;
      appointment_status: AppointmentStatus;
      day_of_week: DayOfWeek;
      platform_vertical: PlatformVertical;
      business_type: BusinessType;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ServiceWithCategory extends Service {
  category: ServiceCategory | null;
}

export interface StaffWithHours extends Staff {
  staff_hours: StaffHours[];
  staff_breaks: StaffBreak[];
}

export interface BusinessWithDetails extends Business {
  subscription: Subscription | null;
  business_hours: BusinessHours[];
  staff: Staff[];
  services: Service[];
  service_categories: ServiceCategory[];
}

export interface BookingSlot {
  start_time: string;
  end_time: string;
  staff_id: string;
  staff_name: string;
  available: boolean;
}

export interface BookingRequest {
  business_id: string;
  customer_id?: string;
  customer_data?: {
    full_name: string;
    email: string;
    phone: string;
  };
  staff_id: string;
  service_ids: string[];
  start_time: string;
  customer_notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  staff_id: string;
  staff_name: string;
  staff_color: string;
  customer_name: string;
  services: string[];
  status: AppointmentStatus;
  type: 'appointment' | 'break' | 'time_off' | 'closure';
}

export interface DashboardStats {
  total_appointments_today: number;
  total_appointments_week: number;
  total_appointments_month: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  new_customers_month: number;
  average_rating: number;
  cancellation_rate: number;
  most_popular_services: Array<{
    service_name: string;
    count: number;
  }>;
  staff_performance: Array<{
    staff_name: string;
    appointments: number;
    revenue: number;
  }>;
}

// ============================================================================
// PUSH SUBSCRIPTIONS
// ============================================================================

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  business_id: string | null;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}