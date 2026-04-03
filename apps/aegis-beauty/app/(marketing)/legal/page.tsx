// ============================================================================
// AEGIS BEAUTY - LEGAL PAGE (Server wrapper — metadata only)
// File: apps/aegis-beauty/app/(marketing)/legal/page.tsx
// Route: aegisbeauty.app/legal
// ============================================================================

import type { Metadata } from 'next';
import { LegalContent } from './_LegalContent';

export const metadata: Metadata = {
  title: 'Documenti Legali',
  description:
    'Termini di Servizio, Privacy Policy, DPA e Cookie Policy di Aegis Beauty. Tutti i documenti legali GDPR-compliant.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://aegisbeauty.app/legal' },
};

export default function LegalPage() {
  return <LegalContent />;
}
