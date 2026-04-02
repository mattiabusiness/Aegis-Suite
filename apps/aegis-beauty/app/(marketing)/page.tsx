// ============================================================================
// AEGIS BEAUTY - MARKETING LANDING PAGE
// File: apps/aegis-beauty/app/(marketing)/page.tsx
// Route: aegisbeauty.app/
// SSG — zero server logic, zero API calls
// ============================================================================

import type { Metadata } from 'next';
import { Navbar } from './_components/Navbar';
import { HeroLoader } from './_components/HeroLoader';
import { Footer } from './_components/Footer';
import { VideoSection } from './_components/sections/VideoSection';
import { ProblemSection } from './_components/sections/ProblemSection';
import { SolutionSection } from './_components/sections/SolutionSection';
import { PioneersSection } from './_components/sections/PioneersSection';
import { WhySection } from './_components/sections/WhySection';
import { FounderSection } from './_components/sections/FounderSection';
import { StatsSection } from './_components/sections/StatsSection';
import { CTASection } from './_components/sections/CTASection';
import { FAQSection } from './_components/sections/FAQSection';

export const metadata: Metadata = {
  title: 'Aegis Beauty — Il software che semplifica il tuo salone',
  description:
    '[DESCRIZIONE — DA INSERIRE] Aegis Beauty è il gestionale intelligente per centri estetici e saloni di bellezza.',
  alternates: { canonical: 'https://aegisbeauty.app' },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroLoader />
        <VideoSection />
        <ProblemSection />
        <SolutionSection />
        <PioneersSection />
        <WhySection />
        <FounderSection />
        <StatsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
