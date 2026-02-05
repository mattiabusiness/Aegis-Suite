// ============================================================================
// AEGIS SUITE - UI PACKAGE
// File: packages/ui/src/index.ts
// ============================================================================

// ============================================================================
// UI COMPONENTS
// ============================================================================

export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
export { Alert } from './components/ui/alert';
export { ProgressBar } from './components/ui/progress-bar';

// ============================================================================
// AUTH COMPONENTS
// ============================================================================

export { LoginForm } from './components/auth/LoginForm';
export { RegisterForm } from './components/auth/RegisterForm';

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export { Sidebar, defaultSidebarTheme } from './components/dashboard/Sidebar';
export { Header } from './components/dashboard/Header';
export { DashboardLayout } from './components/dashboard/DashboardLayout';
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
export { CalendarEvent, CalendarEventListItem } from './components/dashboard/CalendarEvent';
export { AppointmentModal } from './components/dashboard/AppointmentModal';
export { ServiceList } from './components/dashboard/Servicelist';
export { ServiceModal } from './components/dashboard/ServiceModal';
export { CategoryModal } from './components/dashboard/CategoryModal';
export { StaffList } from './components/dashboard/StaffList';
export { StaffModal, StaffServicesModal, StaffHoursModal } from './components/dashboard/StaffModal';
export { QRCodeDisplay, QRCodeModal } from './components/QRCodeDisplay';

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
// UI TYPES
// ============================================================================

export type { ButtonProps } from './components/ui/button';
export type { InputProps } from './components/ui/input';
export type { CardProps } from './components/ui/card';
export type { AlertProps } from './components/ui/alert';
export type { ProgressBarProps } from './components/ui/progress-bar';

// ============================================================================
// AUTH TYPES
// ============================================================================

export type { LoginFormProps } from './components/auth/LoginForm';
export type { RegisterFormProps, RegisterFormData } from './components/auth/RegisterForm';

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
  QRCodeDisplayProps,
  QRCodeModalProps,
} from './components/QRCodeDisplay';

export type {
  HeaderTheme,
  DashboardTheme,
  ThemeName,
} from './components/dashboard/Themes';