// ============================================================================
// AEGIS BEAUTY - MENU CONFIGURATION
// File: apps/aegis-beauty/config/menu.ts
// ============================================================================

import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react';
import type { SidebarMenuSection } from '@aegis/ui';

// ============================================================================
// MENU SECTIONS
// ============================================================================

/**
 * Menu configuration for Aegis Beauty dashboard
 * Used by DashboardLayout to render sidebar navigation
 */
export const beautyMenuSections: SidebarMenuSection[] = [
  {
    id: 'main',
    label: 'Menu Principale',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        id: 'calendario',
        label: 'Calendario',
        icon: Calendar,
        href: '/dashboard/calendario',
      },
      {
        id: 'servizi',
        label: 'Servizi',
        icon: Scissors,
        href: '/dashboard/servizi',
      },
      {
        id: 'staff',
        label: 'Staff',
        icon: Users,
        href: '/dashboard/staff',
      },
      {
        id: 'clienti',
        label: 'Clienti',
        icon: UserCircle,
        href: '/dashboard/clienti',
      },
      {
        id: 'statistiche',
        label: 'Statistiche',
        icon: BarChart3,
        href: '/dashboard/statistiche',
      },
    ],
  },
  {
    id: 'bottom',
    items: [
      {
        id: 'impostazioni',
        label: 'Impostazioni',
        icon: Settings,
        href: '/dashboard/impostazioni',
      },
      {
        id: 'aiuto',
        label: 'Aiuto',
        icon: HelpCircle,
        href: '/dashboard/aiuto',
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get menu item ID from pathname
 * @param pathname - Current URL pathname
 * @returns Menu item ID or undefined
 */
export function getActiveMenuId(pathname: string): string | undefined {
  // Flatten all menu items
  const allItems = beautyMenuSections.flatMap(section => section.items);
  
  // Find exact match first
  const exactMatch = allItems.find(item => item.href === pathname);
  if (exactMatch) return exactMatch.id;
  
  // Find partial match (for nested routes)
  // Sort by href length descending to match most specific route first
  const sortedItems = [...allItems].sort((a, b) => b.href.length - a.href.length);
  const partialMatch = sortedItems.find(item => 
    pathname.startsWith(item.href) && item.href !== '/dashboard'
  );
  if (partialMatch) return partialMatch.id;
  
  // Default to overview for /dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return 'overview';
  }
  
  return undefined;
}

/**
 * Get page title from menu item ID
 * @param itemId - Menu item ID
 * @returns Page title or undefined
 */
export function getPageTitle(itemId: string): string | undefined {
  const allItems = beautyMenuSections.flatMap(section => section.items);
  const item = allItems.find(i => i.id === itemId);
  return item?.label;
}

/**
 * Get breadcrumbs for a given pathname
 * @param pathname - Current URL pathname
 * @returns Array of breadcrumb items
 */
export function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];
  
  const activeId = getActiveMenuId(pathname);
  if (activeId && activeId !== 'overview') {
    const title = getPageTitle(activeId);
    if (title) {
      breadcrumbs.push({ label: title });
    }
  }
  
  return breadcrumbs;
}