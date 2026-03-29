// ============================================================================
// AEGIS BEAUTY - DEMO PAGE (Server wrapper — metadata only)
// File: apps/aegis-beauty/app/(marketing)/demo/page.tsx
// Route: aegisbeauty.app/demo
// ============================================================================

import type { Metadata } from 'next';
import { DemoContent } from './_DemoContent';

export const metadata: Metadata = {
  title: 'Prenota una Demo — Aegis Beauty',
  description:
    '[DEMO DESCRIPTION — DA INSERIRE] Prenota una chiamata gratuita per scoprire Aegis Beauty.',
  alternates: { canonical: 'https://aegisbeauty.app/demo' },
};

export default function DemoPage() {
  return <DemoContent />;
}
