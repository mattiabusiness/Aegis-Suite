// ============================================================================
// AEGIS SUITE - CONTENT THEME SYSTEM
// File: packages/ui/src/components/dashboard/ContentTheme.tsx
//
// Provides CSS custom properties for theming all dashboard page content.
// Components use Tailwind classes that reference these variables.
// Each vertical sets its own colors via <ContentThemeProvider>.
//
// Usage in layout:
//   <ContentThemeProvider theme={beautyContentTheme}>
//     {children}
//   </ContentThemeProvider>
//
// Usage in components (via tailwind.config extend):
//   className="bg-accent-50 text-accent-600 border-accent-200"
//
// Or directly with CSS variables:
//   style={{ color: 'var(--accent-600)' }}
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentTheme {
  name: string;
  /** Core accent palette — hex values */
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  /** Chart colors (array of hex, first is primary) */
  chart: string[];
  /** Gradient strings for special elements */
  gradient: {
    /** e.g. "from-purple-600 to-violet-600" */
    primary: string;
    /** e.g. "from-purple-500 via-violet-500 to-purple-500" */
    glow: string;
  };
}

// ============================================================================
// PREDEFINED THEMES
// ============================================================================

export const beautyContentTheme: ContentTheme = {
  name: 'beauty',
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  chart: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
  gradient: {
    primary: 'from-purple-600 to-violet-600',
    glow: 'from-purple-500 via-violet-500 to-purple-500',
  },
};

export const sportContentTheme: ContentTheme = {
  name: 'sport',
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  chart: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  gradient: {
    primary: 'from-emerald-600 to-teal-600',
    glow: 'from-emerald-500 via-teal-500 to-emerald-500',
  },
};

export const healthContentTheme: ContentTheme = {
  name: 'health',
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  chart: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
  gradient: {
    primary: 'from-sky-600 to-cyan-600',
    glow: 'from-sky-500 via-cyan-500 to-sky-500',
  },
};

export const homeContentTheme: ContentTheme = {
  name: 'home',
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  chart: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  gradient: {
    primary: 'from-amber-600 to-orange-600',
    glow: 'from-amber-500 via-orange-500 to-amber-500',
  },
};

export const lawContentTheme: ContentTheme = {
  name: 'law',
  accent: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  chart: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
  gradient: {
    primary: 'from-slate-700 to-slate-800',
    glow: 'from-slate-500 via-slate-600 to-slate-500',
  },
};

export const bookContentTheme: ContentTheme = {
  name: 'book',
  accent: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  chart: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  gradient: {
    primary: 'from-indigo-600 to-blue-600',
    glow: 'from-indigo-500 via-blue-500 to-indigo-500',
  },
};

// ============================================================================
// REGISTRY
// ============================================================================

export const contentThemes = {
  beauty: beautyContentTheme,
  sport: sportContentTheme,
  health: healthContentTheme,
  home: homeContentTheme,
  law: lawContentTheme,
  book: bookContentTheme,
} as const;

// ============================================================================
// CONTEXT
// ============================================================================

const ContentThemeContext = React.createContext<ContentTheme>(beautyContentTheme);

export function useContentTheme(): ContentTheme {
  return React.useContext(ContentThemeContext);
}

// ============================================================================
// PROVIDER — injects CSS custom properties
// ============================================================================

export function ContentThemeProvider({
  theme,
  children,
}: {
  theme: ContentTheme;
  children: React.ReactNode;
}) {
  const cssVars = React.useMemo(() => ({
    '--accent-50': theme.accent[50],
    '--accent-100': theme.accent[100],
    '--accent-200': theme.accent[200],
    '--accent-300': theme.accent[300],
    '--accent-400': theme.accent[400],
    '--accent-500': theme.accent[500],
    '--accent-600': theme.accent[600],
    '--accent-700': theme.accent[700],
    '--accent-800': theme.accent[800],
    '--accent-900': theme.accent[900],
    '--chart-1': theme.chart[0],
    '--chart-2': theme.chart[1],
    '--chart-3': theme.chart[2],
    '--chart-4': theme.chart[3],
    '--chart-5': theme.chart[4],
  } as React.CSSProperties), [theme]);

  return (
    <ContentThemeContext.Provider value={theme}>
      <div style={cssVars}>
        {children}
      </div>
    </ContentThemeContext.Provider>
  );
}