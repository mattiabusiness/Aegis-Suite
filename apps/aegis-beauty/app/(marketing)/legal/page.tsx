// ============================================================================
// AEGIS BEAUTY - LEGAL PAGE (Server wrapper — metadata only)
// File: apps/aegis-beauty/app/(marketing)/legal/page.tsx
// Route: aegisbeauty.app/legal
// ============================================================================

import type { Metadata } from 'next';
import { LegalContent } from './_LegalContent';

export const metadata: Metadata = {
  title: 'Privacy & Legal — Aegis Beauty',
  description: 'Termini di servizio, privacy policy, DPA e cookie policy di Aegis Beauty.',
  alternates: { canonical: 'https://aegisbeauty.app/legal' },
};

export default function LegalPage() {
  return <LegalContent />;
}
