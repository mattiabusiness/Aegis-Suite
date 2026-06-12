// ============================================================================
// AEGIS SUITE - UI PACKAGE
// File: packages/ui/src/index.ts
// ============================================================================

// ============================================================================
// PWA
// ============================================================================

export { InstallPrompt } from './components/pwa/InstallPrompt';
export type { InstallPromptProps } from './components/pwa/InstallPrompt';
export { NotificationPrompt } from './components/pwa/NotificationPrompt';

// ============================================================================
// UI COMPONENTS
// ============================================================================

export { AnimatedSelect } from './components/ui/AnimatedList';
export type { AnimatedSelectProps, AnimatedSelectOption } from './components/ui/AnimatedList';
export { FloatingParticles } from './components/FloatingParticles';
export { StepTransitionProvider, useStepTransition } from './components/StepTransition';

export { ProgressBar } from './components/ui/progress-bar';

// ============================================================================
// AUTH COMPONENTS
// ============================================================================

export { AuthFlipCard } from './components/auth/AuthFlipCard';
export { ForgotPasswordCard } from './components/auth/ForgotPasswordCard';
export type { ForgotPasswordCardProps } from './components/auth/ForgotPasswordCard';
export { ResetPasswordCard } from './components/auth/ResetPasswordCard';
export type { ResetPasswordCardProps } from './components/auth/ResetPasswordCard';

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export { Sidebar, defaultSidebarTheme } from './components/dashboard/Sidebar';
export { Header } from './components/dashboard/Header';
export { DashboardLayout } from './components/dashboard/DashboardLayout';
export { DashboardMobileHeader, DashboardMobileBottomNav, DASH_MOBILE_HEADER_H, DASH_MOBILE_NAV_H } from './components/dashboard/DashboardMobileNav';
export type { DashboardMobileHeaderProps, DashboardMobileBottomNavProps } from './components/dashboard/DashboardMobileNav';
export { StatCard } from './components/dashboard/StatCard';
export { PageHeader } from './components/dashboard/PageHeader';
export { 
  EmptyState,
  EmptyAppointments,
  EmptyServices,
  EmptyStaff,
  EmptyCustomers,
  EmptyNotifications,
  EmptySearchResults,
} from './components/dashboard/EmptyState';
export { Calendar } from './components/dashboard/Calendar';
export { CalendarEvent, CalendarEventListItem, EventDetailModal } from './components/dashboard/CalendarEvent';
export { AppointmentModal } from './components/dashboard/AppointmentModal';
export { ServiceList } from './components/dashboard/Servicelist';
export { ServiceModal } from './components/dashboard/ServiceModal';
export { CategoryModal } from './components/dashboard/CategoryModal';
export { StaffList } from './components/dashboard/StaffList';
export { StaffModal, StaffServicesModal, StaffHoursModal } from './components/dashboard/StaffModal';
export { CustomerList } from './components/dashboard/CustomerList';
export { CustomerDetailModal } from './components/dashboard/CustomerDetailModal';
export { SlotPicker } from './components/dashboard/SlotPicker';
export { computeEventColumns } from './components/dashboard/CalendarColumns';
export { HelpPage } from './components/dashboard/HelpPage';
export { SettingsPage } from './components/dashboard/SettingsPage';
export { StatsPage } from './components/dashboard/StatsPage';
export { OverviewPage } from './components/dashboard/OverviewPage';
export { QRCodeDisplay, QRCodeModal } from './components/QRCodeDisplay';
export { ImporterModal } from './components/dashboard/ImporterModal';
export type { ImporterModalProps, ImporterParsedRow } from './components/dashboard/ImporterModal';

// ============================================================================
// THEMES
// ============================================================================

export {
  beautyTheme,
  sportTheme,
  healthTheme,
  homeTheme,
  lawTheme,
  bookTheme,
  themes,
  getTheme,
  getAllThemes,
} from './components/dashboard/Themes';

// ============================================================================
// ISTRUZIONI: Aggiungi queste righe al file packages/ui/src/index.ts
// nella sezione THEMES e DASHBOARD TYPES
// ============================================================================

// --- AGGIUNGI nella sezione THEMES, dopo gli export di Themes ---

export {
  ContentThemeProvider,
  useContentTheme,
  beautyContentTheme,
  sportContentTheme,
  healthContentTheme,
  homeContentTheme,
  lawContentTheme,
  bookContentTheme,
  contentThemes,
} from './components/dashboard/ContentTheme';



// ============================================================================
// UI TYPES
// ============================================================================

export type { ProgressBarProps } from './components/ui/progress-bar';

// ============================================================================
// AUTH TYPES
// ============================================================================

 export type { AuthFlipCardProps, AuthFlipRegisterData } from './components/auth/AuthFlipCard';

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export type { 
  SidebarProps, 
  SidebarMenuItem, 
  SidebarMenuSection,
  SidebarTheme,
} from './components/dashboard/Sidebar';

export type { 
  HeaderProps, 
  HeaderNotification, 
  HeaderUserMenuAction,
} from './components/dashboard/Header';

export type { DashboardLayoutProps } from './components/dashboard/DashboardLayout';

export type { 
  StatCardProps, 
  StatCardTrend, 
  StatCardAccentColor,
} from './components/dashboard/StatCard';

export type { 
  PageHeaderProps, 
  PageHeaderAction, 
  BreadcrumbItem,
} from './components/dashboard/PageHeader';

export type { 
  EmptyStateProps, 
  EmptyStateAction,
  PresetEmptyStateProps,
} from './components/dashboard/EmptyState';

export type {
  CalendarProps,
  CalendarView,
  BusinessHoursData,
  ClosureData,
} from './components/dashboard/Calendar';

export type {
  CalendarEventProps,
  CalendarEventData,
  CalendarEventListItemProps,
  EventDetailModalProps,
  EventStatus,
} from './components/dashboard/CalendarEvent';

export type {
  AppointmentModalProps,
  AppointmentFormData,
  Customer,
  Service,
  Staff,
  StaffServicesMap,
} from './components/dashboard/AppointmentModal';

export type {
  ServiceListProps,
  ServiceItem,
  ServiceCategory,
} from './components/dashboard/Servicelist';

export type {
  ServiceModalProps,
  ServiceFormData,
  ServiceModalCategory,
} from './components/dashboard/ServiceModal';

export type {
  CategoryModalProps,
  CategoryFormData,
} from './components/dashboard/CategoryModal';

export type {
  StaffListProps,
  StaffMember,
} from './components/dashboard/StaffList';

export type {
  StaffModalProps,
  StaffFormData,
  StaffRole,
  StaffServicesModalProps,
  ServiceOption,
  StaffHoursModalProps,
  DayHours,
} from './components/dashboard/StaffModal';

export type {
  CustomerListProps,
  CustomerListItem,
  CustomerFilter,
} from './components/dashboard/CustomerList';

export type {
  CustomerDetailModalProps,
  CustomerDetail,
  CustomerAppointment,
  CustomerStats,
} from './components/dashboard/CustomerDetailModal';

export type {
  SlotPickerProps,
  SlotInfo,
} from './components/dashboard/SlotPicker';

export type {
  HelpPageProps,
  FAQItem,
  GuideItem,
  GuideStep,
  SupportCategory,
} from './components/dashboard/HelpPage';

export type {
  SettingsPageProps,
  SettingsTab,
  BusinessGeneralData,
  BusinessHoursRow,
  ClosureItem,
  BookingSettings,
  AccountData,
} from './components/dashboard/SettingsPage';

export type {
  StatsPageProps,
  PeriodFilter,
  KPICard,
  ChartDataPoint,
  TopService,
  PopularHour,
  StaffPerformance,
  InsightItem,
  ROIStats,
  RetentionData,
  DayRevenueData,
  HeatmapCell,
} from './components/dashboard/StatsPage';
export type {
  OverviewPageProps,
  OverviewStat,
  OverviewQuickAction,
  OverviewSection,
  OverviewSummaryItem,
} from './components/dashboard/OverviewPage';

export type {
  QRCodeDisplayProps,
  QRCodeModalProps,
} from './components/QRCodeDisplay';

export type {
  HeaderTheme,
  DashboardTheme,
  ThemeName,
} from './components/dashboard/Themes';

// --- AGGIUNGI nella sezione DASHBOARD TYPES ---

export type {
  ContentTheme,
} from './components/dashboard/ContentTheme';

// ============================================================================
// CUSTOMER COMPONENTS (multi-vertical)
// ============================================================================

export { BottomNav, DesktopHeader } from './components/customer/CustomerNav';
export { CustomerLayout } from './components/customer/CustomerLayout';
export { ServiceCard } from './components/customer/ServiceCard';
export { StaffCard } from './components/customer/StaffCard';
export { AppointmentCard } from './components/customer/AppointmentCard';

export type { BottomNavProps, DesktopHeaderProps } from './components/customer/CustomerNav';
export type { CustomerLayoutProps, CustomerLayoutBusiness } from './components/customer/CustomerLayout';
export type { ServiceCardProps, ServiceCardService } from './components/customer/ServiceCard';
export type { StaffCardProps, StaffCardStaff } from './components/customer/StaffCard';
export type { AppointmentCardProps, AppointmentCardData } from './components/customer/AppointmentCard';

// ============================================================================
// BOOKING CAROUSEL (multi-vertical)
// ============================================================================

export { BookingCarousel } from './components/customer/booking/BookingCarousel';
export { CarouselCard } from './components/customer/booking/CarouselCard';
export {
  Step1Front, Step1Back,
  Step2Front, Step2Back,
  Step3Front, Step3Back,
} from './components/customer/booking/Steps';

export type {
  BookingState,
  BookingBusiness,
  BookingService,
  BookingStaff,
  BookingHours,
  BookingClosure,
  BookingSlot,
  FetchSlotsFn,
} from './components/customer/booking/types';