// ============================================================================
// AEGIS BEAUTY - MARKETING LAYOUT
// File: apps/aegis-beauty/app/(marketing)/layout.tsx
// Dark SSG layout for aegisbeauty.app — /, /demo, /legal
// ============================================================================

import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import type { ReactNode } from 'react';
import { CursorFollowerLoader } from './_components/ui/CursorFollowerLoader';
import { mk } from './_components/theme';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

// Serif editoriale per i titoli — look "beauty alta gamma" (variable font)
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'Aegis Beauty — Il software che semplifica il tuo salone',
    template: '%s | Aegis Beauty',
  },
  description:
    'Aegis Beauty è il gestionale white-label per parrucchieri e centri estetici italiani. Prenotazioni online, CRM clienti, gestione staff e agenda digitale — senza commissioni, senza marketplace. Programma Pioneers gratuito a Torino.',
  metadataBase: new URL('https://aegisbeauty.app'),
  alternates: {
    canonical: 'https://aegisbeauty.app',
  },
  openGraph: {
    type: 'website',
    url: 'https://aegisbeauty.app',
    siteName: 'Aegis Beauty',
    title: 'Aegis Beauty — Il software che semplifica il tuo salone',
    description: 'Gestionale per saloni di bellezza e centri estetici italiani. Zero commissioni, zero marketplace — solo il tuo brand. Prenotazioni online, CRM, staff e statistiche in un unico sistema. Gratis per i 40 Pioneers selezionati a Torino.',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aegis Beauty — Il software che semplifica il tuo salone',
    description: 'Il gestionale white-label per parrucchieri e centri estetici. Prenotazioni online, CRM clienti, zero commissioni. Programma Pioneers gratuito — 40 saloni selezionati a Torino.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${fraunces.variable}`}
      style={{
        fontFamily: mk.sans,
        backgroundColor: mk.bg,
        color: mk.ink,
        minHeight: '100vh',
      }}
    >
      <CursorFollowerLoader />
      {children}
      {/* Film grain overlay — texture "carta" premium su panna */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          pointerEvents: 'none',
          opacity: 0.03,
          mixBlendMode: 'multiply',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
