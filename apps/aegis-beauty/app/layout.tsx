import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aegisbeauty.app'),
  title: {
    default: 'Aegis Beauty — Gestionale per Saloni e Centri Estetici Italiani',
    template: '%s | Aegis Beauty',
  },
  description:
    'Il gestionale SaaS white-label per parrucchieri e centri estetici italiani. Zero commissioni, zero marketplace. Prenotazioni online, CRM clienti, gestione staff. Programma Aegis Pioneers — 40 saloni selezionati a Torino.',
  keywords: [
    'gestionale parrucchieri',
    'software salone bellezza',
    'prenotazioni online parrucchiere',
    'gestionale centro estetico',
    'software estetista',
    'CRM salone',
    'prenotazioni online salone',
    'gestionale beauty italiano',
    'software parrucchiere Italia',
    'Aegis Beauty',
    'Aegis Pioneers',
    'gestionale white-label salone',
    'alternativa Treatwell',
    'alternativa Fresha',
    'alternativa Booksy',
    'software gestione appuntamenti parrucchiere',
    'agenda digitale salone',
    'prenotazioni parrucchiere Torino',
  ],
  authors: [{ name: 'Mattia', url: 'https://aegisbeauty.app' }],
  creator: 'Mattia — Aegis Group',
  publisher: 'Aegis Beauty',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://aegisbeauty.app',
    siteName: 'Aegis Beauty',
    title: 'Aegis Beauty — Il tuo salone, finalmente libero.',
    description:
      'Il gestionale white-label per parrucchieri e centri estetici italiani. Zero commissioni. Zero marketplace. Solo il tuo brand, al livello che merita.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 627,
        alt: 'Aegis Beauty — Gestionale per saloni italiani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aegis Beauty — Il tuo salone, finalmente libero.',
    description:
      'Il gestionale white-label per parrucchieri e centri estetici italiani. Zero commissioni. Zero marketplace.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://aegisbeauty.app',
  },
  themeColor: '#7C3AED',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aegis Beauty',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Aegis Beauty',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://aegisbeauty.app',
  description:
    'Gestionale SaaS B2B white-label per saloni di parrucchieri e centri estetici italiani.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Accesso gratuito durante la fase Beta — Programma Aegis Pioneers',
  },
  creator: {
    '@type': 'Person',
    name: 'Mattia',
    jobTitle: 'Founder',
    worksFor: {
      '@type': 'Organization',
      name: 'Aegis Group',
    },
  },
  areaServed: {
    '@type': 'City',
    name: 'Torino',
    containedInPlace: {
      '@type': 'Country',
      name: 'Italia',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}