// ============================================================================
// AEGIS BEAUTY - MARKETING LAYOUT
// File: apps/aegis-beauty/app/(marketing)/layout.tsx
// Dark SSG layout for aegisbeauty.app — /, /demo, /legal
// ============================================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { CursorFollowerLoader } from './_components/ui/CursorFollowerLoader';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Aegis Beauty — Il software che semplifica il tuo salone',
    template: '%s | Aegis Beauty',
  },
  description:
    '[DESCRIZIONE — DA INSERIRE] Aegis Beauty è il gestionale intelligente per centri estetici e saloni di bellezza.',
  metadataBase: new URL('https://aegisbeauty.app'),
  alternates: {
    canonical: 'https://aegisbeauty.app',
  },
  openGraph: {
    type: 'website',
    url: 'https://aegisbeauty.app',
    siteName: 'Aegis Beauty',
    title: 'Aegis Beauty — Il software che semplifica il tuo salone',
    description: '[OG DESCRIPTION — DA INSERIRE]',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aegis Beauty — Il software che semplifica il tuo salone',
    description: '[TWITTER DESCRIPTION — DA INSERIRE]',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={inter.variable}
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        backgroundColor: '#0A0A0F',
        color: '#F8FAFC',
        minHeight: '100vh',
      }}
    >
      <CursorFollowerLoader />
      {children}
    </div>
  );
}
