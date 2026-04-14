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
import { ROICalculatorSection } from './_components/sections/ROICalculatorSection';

export const metadata: Metadata = {
  title: 'Aegis Beauty — Gestionale per Saloni e Centri Estetici Italiani',
  description:
    'Il gestionale SaaS white-label per parrucchieri e centri estetici italiani. Zero commissioni, zero marketplace. Prenotazioni online, CRM clienti, gestione staff. Programma Aegis Pioneers — 40 saloni selezionati a Torino.',
  alternates: { canonical: 'https://aegisbeauty.app' },
  openGraph: {
    title: 'Aegis Beauty — Il tuo salone, finalmente libero.',
    description:
      'Il gestionale white-label per parrucchieri e centri estetici italiani. Zero commissioni. Zero marketplace. Solo il tuo brand, al livello che merita.',
    url: 'https://aegisbeauty.app',
    images: [{ url: '/og-image.png', width: 1200, height: 627, alt: 'Aegis Beauty — Gestionale per saloni italiani' }],
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Cos\'è Aegis Beauty?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aegis Beauty è un gestionale SaaS white-label per parrucchieri e centri estetici italiani. Offre prenotazioni online, CRM clienti, gestione staff e agenda digitale — senza commissioni e senza marketplace.',
      },
    },
    {
      '@type': 'Question',
      name: 'Aegis Beauty è gratuito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Durante la fase Beta il programma Aegis Pioneers è completamente gratuito per i 40 saloni selezionati a Torino.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual è la differenza rispetto a Treatwell, Fresha o Booksy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A differenza dei marketplace come Treatwell, Booksy o Fresha, Aegis Beauty è white-label: il cliente prenota direttamente sul tuo salone, senza cedere visibilità a un marketplace esterno. Zero commissioni per prenotazione.',
      },
    },
    {
      '@type': 'Question',
      name: 'Cos\'è il programma Aegis Pioneers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aegis Pioneers è il programma di accesso anticipato riservato a 40 saloni selezionati a Torino. I Pioneers ottengono accesso gratuito, supporto diretto del fondatore e influenza sul roadmap del prodotto.',
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main>
        <HeroLoader />
        <VideoSection />
        <ProblemSection />
        <SolutionSection />
        <ROICalculatorSection />
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
