// ============================================================================
// AEGIS BEAUTY - DEMO PAGE (Server wrapper — metadata only)
// File: apps/aegis-beauty/app/(marketing)/demo/page.tsx
// Route: aegisbeauty.app/demo
// ============================================================================

import type { Metadata } from 'next';
import { DemoContent } from './_DemoContent';

export const metadata: Metadata = {
  title: 'Prenota una Demo Gratuita',
  description:
    'Prenota una chiamata gratuita di 20 minuti con il fondatore di Aegis Beauty. Scopri come trasformare il tuo salone con il gestionale white-label italiano.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://aegisbeauty.app/demo' },
};

export default function DemoPage() {
  return <DemoContent />;
}
