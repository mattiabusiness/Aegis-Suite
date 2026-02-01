// ============================================================================
// AEGIS SUITE - DASHBOARD THEMES
// File: packages/ui/src/components/dashboard/themes.ts
// ============================================================================

import type { SidebarTheme } from './Sidebar';

// ============================================================================
// HEADER THEME (optional, for future use)
// ============================================================================

export interface HeaderTheme {
  /** Header background */
  background: string;
  /** Header border color */
  borderColor: string;
  /** Avatar fallback background */
  avatarBackground: string;
  /** Avatar fallback icon color */
  avatarIconColor: string;
  /** Accent color for links */
  accentColor: string;
  /** Accent hover color */
  accentHoverColor: string;
  /** Unread notification background */
  unreadBackground: string;
}

// ============================================================================
// COMPLETE DASHBOARD THEME
// ============================================================================

export interface DashboardTheme {
  /** Theme name identifier */
  name: string;
  /** Display name */
  displayName: string;
  /** Sidebar theme configuration */
  sidebar: SidebarTheme;
  /** Header theme configuration */
  header: HeaderTheme;
}

// ============================================================================
// BEAUTY THEME (Purple)
// ============================================================================

export const beautyTheme: DashboardTheme = {
  name: 'beauty',
  displayName: 'Aegis Beauty',
  sidebar: {
    background: 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900',
    borderColor: 'border-purple-500/20',
    logoBackground: 'bg-white/20 shadow-purple-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-purple-200/60',
    itemTextColor: 'text-purple-100',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-purple-700',
    collapseButtonColor: 'text-purple-200',
    tooltipBackground: 'bg-purple-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-purple-500/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-purple-100',
    avatarIconColor: 'text-purple-600',
    accentColor: 'text-purple-600',
    accentHoverColor: 'hover:text-purple-700',
    unreadBackground: 'bg-purple-50/50',
  },
};

// ============================================================================
// SPORT THEME (Emerald/Green)
// ============================================================================

export const sportTheme: DashboardTheme = {
  name: 'sport',
  displayName: 'Aegis Sport',
  sidebar: {
    background: 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900',
    borderColor: 'border-emerald-500/20',
    logoBackground: 'bg-white/20 shadow-emerald-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-emerald-200/60',
    itemTextColor: 'text-emerald-100',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-emerald-700',
    collapseButtonColor: 'text-emerald-200',
    tooltipBackground: 'bg-emerald-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-emerald-500/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-emerald-100',
    avatarIconColor: 'text-emerald-600',
    accentColor: 'text-emerald-600',
    accentHoverColor: 'hover:text-emerald-700',
    unreadBackground: 'bg-emerald-50/50',
  },
};

// ============================================================================
// HEALTH THEME (Sky/Blue)
// ============================================================================

export const healthTheme: DashboardTheme = {
  name: 'health',
  displayName: 'Aegis Health',
  sidebar: {
    background: 'bg-gradient-to-b from-sky-600 via-sky-700 to-sky-900',
    borderColor: 'border-sky-500/20',
    logoBackground: 'bg-white/20 shadow-sky-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-sky-200/60',
    itemTextColor: 'text-sky-100',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-sky-700',
    collapseButtonColor: 'text-sky-200',
    tooltipBackground: 'bg-sky-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-sky-500/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-sky-100',
    avatarIconColor: 'text-sky-600',
    accentColor: 'text-sky-600',
    accentHoverColor: 'hover:text-sky-700',
    unreadBackground: 'bg-sky-50/50',
  },
};

// ============================================================================
// HOME THEME (Orange/Amber)
// ============================================================================

export const homeTheme: DashboardTheme = {
  name: 'home',
  displayName: 'Aegis Home',
  sidebar: {
    background: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900',
    borderColor: 'border-amber-500/20',
    logoBackground: 'bg-white/20 shadow-amber-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-amber-200/60',
    itemTextColor: 'text-amber-100',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-amber-700',
    collapseButtonColor: 'text-amber-200',
    tooltipBackground: 'bg-amber-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-amber-500/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-amber-100',
    avatarIconColor: 'text-amber-600',
    accentColor: 'text-amber-600',
    accentHoverColor: 'hover:text-amber-700',
    unreadBackground: 'bg-amber-50/50',
  },
};

// ============================================================================
// LAW THEME (Slate/Dark Blue)
// ============================================================================

export const lawTheme: DashboardTheme = {
  name: 'law',
  displayName: 'Aegis Law',
  sidebar: {
    background: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900',
    borderColor: 'border-slate-600/20',
    logoBackground: 'bg-white/20 shadow-slate-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-slate-300/60',
    itemTextColor: 'text-slate-200',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-slate-700',
    collapseButtonColor: 'text-slate-300',
    tooltipBackground: 'bg-slate-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-slate-600/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-slate-100',
    avatarIconColor: 'text-slate-600',
    accentColor: 'text-slate-600',
    accentHoverColor: 'hover:text-slate-700',
    unreadBackground: 'bg-slate-50/50',
  },
};

// ============================================================================
// BOOK THEME (Indigo - Marketplace)
// ============================================================================

export const bookTheme: DashboardTheme = {
  name: 'book',
  displayName: 'Aegis Book',
  sidebar: {
    background: 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900',
    borderColor: 'border-indigo-500/20',
    logoBackground: 'bg-white/20 shadow-indigo-500/20',
    brandTextColor: 'text-white',
    sectionLabelColor: 'text-indigo-200/60',
    itemTextColor: 'text-indigo-100',
    itemHoverBackground: 'hover:bg-white/10',
    itemHoverTextColor: 'hover:text-white',
    itemActiveBackground: 'bg-white/20',
    itemActiveTextColor: 'text-white font-semibold',
    badgeBackground: 'bg-white',
    badgeTextColor: 'text-indigo-700',
    collapseButtonColor: 'text-indigo-200',
    tooltipBackground: 'bg-indigo-900',
    tooltipTextColor: 'text-white',
    dividerColor: 'border-indigo-500/20',
    logoutHoverColor: 'hover:text-red-300',
  },
  header: {
    background: 'bg-white',
    borderColor: 'border-gray-200',
    avatarBackground: 'bg-indigo-100',
    avatarIconColor: 'text-indigo-600',
    accentColor: 'text-indigo-600',
    accentHoverColor: 'hover:text-indigo-700',
    unreadBackground: 'bg-indigo-50/50',
  },
};

// ============================================================================
// THEME REGISTRY
// ============================================================================

export const themes = {
  beauty: beautyTheme,
  sport: sportTheme,
  health: healthTheme,
  home: homeTheme,
  law: lawTheme,
  book: bookTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): DashboardTheme {
  return themes[name];
}

/**
 * Get all available themes
 */
export function getAllThemes(): DashboardTheme[] {
  return Object.values(themes);
}