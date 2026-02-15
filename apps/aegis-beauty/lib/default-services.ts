// ============================================================================
// AEGIS BEAUTY - DEFAULT SERVICES
// File: apps/aegis-beauty/lib/default-services.ts
// ============================================================================

import type { BusinessType } from '@aegis/types';

interface DefaultCategory {
  id: string;
  name: string;
  icon: string;
}

interface DefaultService {
  id: string;
  name: string;
  duration: number;
  price: number;
  categoryId: string;
}

// ============================================================================
// CATEGORIE PARRUCCHIERE
// ============================================================================

const HAIR_CATEGORIES: DefaultCategory[] = [
  { id: 'taglio-styling', name: 'Taglio & Styling', icon: 'scissors' },
  { id: 'colorazione', name: 'Colorazione', icon: 'palette' },
  { id: 'trattamenti', name: 'Trattamenti', icon: 'beaker' },
  { id: 'piega-acconciature', name: 'Piega & Acconciature', icon: 'sparkles' },
  { id: 'servizi-uomo', name: 'Servizi Uomo', icon: 'user' },
  { id: 'extension-protezione', name: 'Extension & Protezione', icon: 'shield' },
];

const HAIR_SERVICES: DefaultService[] = [
  // 1. TAGLIO & STYLING
  { id: 'taglio-uomo', name: 'Taglio Uomo', duration: 30, price: 20, categoryId: 'taglio-styling' },
  { id: 'taglio-donna', name: 'Taglio Donna', duration: 45, price: 35, categoryId: 'taglio-styling' },
  { id: 'taglio-bambino', name: 'Taglio Bambino', duration: 25, price: 15, categoryId: 'taglio-styling' },
  { id: 'taglio-uomo-shampoo', name: 'Taglio Uomo + Shampoo + Asciugatura', duration: 40, price: 30, categoryId: 'taglio-styling' },
  { id: 'taglio-donna-shampoo', name: 'Taglio Donna + Shampoo + Asciugatura', duration: 60, price: 45, categoryId: 'taglio-styling' },
  { id: 'taglio-piega', name: 'Taglio + Piega', duration: 75, price: 50, categoryId: 'taglio-styling' },
  
  // 2. COLORAZIONE
  { id: 'colore-completo', name: 'Colore Completo', duration: 90, price: 50, categoryId: 'colorazione' },
  { id: 'ritocco-radici', name: 'Ritocco Radici', duration: 60, price: 35, categoryId: 'colorazione' },
  { id: 'meches', name: 'Meches / Colpi di Sole', duration: 120, price: 70, categoryId: 'colorazione' },
  { id: 'balayage', name: 'Balayage / Ombré', duration: 150, price: 90, categoryId: 'colorazione' },
  { id: 'tonalizzante', name: 'Tonalizzante / Shampoo Color', duration: 45, price: 25, categoryId: 'colorazione' },
  { id: 'decolorazione', name: 'Decolorazione', duration: 120, price: 60, categoryId: 'colorazione' },
  
  // 3. TRATTAMENTI
  { id: 'trattamento-cheratina', name: 'Trattamento Cheratina', duration: 120, price: 100, categoryId: 'trattamenti' },
  { id: 'trattamento-botox', name: 'Trattamento Botox Capelli', duration: 90, price: 80, categoryId: 'trattamenti' },
  { id: 'maschera-ricostruttiva', name: 'Maschera Ricostruttiva', duration: 30, price: 20, categoryId: 'trattamenti' },
  { id: 'trattamento-anticaduta', name: 'Trattamento Anticaduta', duration: 45, price: 35, categoryId: 'trattamenti' },
  
  // 4. PIEGA & ACCONCIATURE
  { id: 'piega-completa', name: 'Piega Completa', duration: 45, price: 30, categoryId: 'piega-acconciature' },
  { id: 'piega-sposa', name: 'Piega Sposa / Cerimonia', duration: 90, price: 80, categoryId: 'piega-acconciature' },
  { id: 'acconciatura-elegante', name: 'Acconciatura Elegante', duration: 60, price: 45, categoryId: 'piega-acconciature' },
  { id: 'ondulazione', name: 'Ondulazione / Bigodini', duration: 60, price: 40, categoryId: 'piega-acconciature' },
  
  // 5. SERVIZI UOMO
  { id: 'taglio-barba', name: 'Taglio Barba', duration: 20, price: 15, categoryId: 'servizi-uomo' },
  { id: 'rasatura-rasoio', name: 'Rasatura con Rasoio', duration: 30, price: 20, categoryId: 'servizi-uomo' },
  { id: 'rifiniture-barba', name: 'Rifiniture Barba', duration: 15, price: 10, categoryId: 'servizi-uomo' },
  
  // 6. EXTENSION & PROTEZIONE
  { id: 'extension-capelli', name: 'Extension Capelli', duration: 180, price: 150, categoryId: 'extension-protezione' },
  { id: 'trecce-intrecci', name: 'Trecce / Intrecci', duration: 60, price: 40, categoryId: 'extension-protezione' },
  { id: 'protezione-colore', name: 'Protezione Colore', duration: 15, price: 10, categoryId: 'extension-protezione' },
];

// ============================================================================
// CATEGORIE CENTRO ESTETICO
// ============================================================================

const BEAUTY_CATEGORIES: DefaultCategory[] = [
  { id: 'trattamenti-viso', name: 'Trattamenti Viso', icon: 'face' },
  { id: 'depilazione', name: 'Depilazione', icon: 'leaf' },
  { id: 'massaggi', name: 'Massaggi', icon: 'heart' },
  { id: 'trattamenti-corporei', name: 'Trattamenti Corporei', icon: 'body' },
  { id: 'unghie-spa', name: 'Unghie & Spa Mani/Piedi', icon: 'hand' },
  { id: 'trattamenti-speciali', name: 'Trattamenti Speciali', icon: 'star' },
];

const BEAUTY_SERVICES: DefaultService[] = [
  // 1. TRATTAMENTI VISO
  { id: 'pulizia-viso-base', name: 'Pulizia Viso Base', duration: 60, price: 50, categoryId: 'trattamenti-viso' },
  { id: 'pulizia-viso-profonda', name: 'Pulizia Viso Profonda', duration: 75, price: 70, categoryId: 'trattamenti-viso' },
  { id: 'peeling-chimico', name: 'Peeling Chimico', duration: 45, price: 60, categoryId: 'trattamenti-viso' },
  { id: 'botox-dermopigmentazione', name: 'Botox/Dermopigmentazione', duration: 60, price: 120, categoryId: 'trattamenti-viso' },
  { id: 'luce-pulsata', name: 'Luce Pulsata', duration: 45, price: 90, categoryId: 'trattamenti-viso' },
  { id: 'filler-labbra', name: 'Filler Labbra', duration: 45, price: 150, categoryId: 'trattamenti-viso' },
  
  // 2. DEPILAZIONE
  { id: 'depilazione-sopracciglia', name: 'Depilazione Sopracciglia', duration: 15, price: 12, categoryId: 'depilazione' },
  { id: 'depilazione-labbra-mento', name: 'Depilazione Labbra/Mento', duration: 15, price: 15, categoryId: 'depilazione' },
  { id: 'depilazione-ascelle', name: 'Depilazione Ascelle', duration: 20, price: 18, categoryId: 'depilazione' },
  { id: 'depilazione-gambe-complete', name: 'Depilazione Gambe Complete', duration: 60, price: 45, categoryId: 'depilazione' },
  { id: 'depilazione-bikini-base', name: 'Depilazione Bikini Base', duration: 30, price: 25, categoryId: 'depilazione' },
  { id: 'depilazione-bikini-integrale', name: 'Depilazione Bikini Integrale', duration: 45, price: 35, categoryId: 'depilazione' },
  { id: 'depilazione-uomo', name: 'Depilazione Uomo (petto/schiena)', duration: 45, price: 40, categoryId: 'depilazione' },
  
  // 3. MASSAGGI
  { id: 'massaggio-rilassante', name: 'Massaggio Rilassante', duration: 60, price: 55, categoryId: 'massaggi' },
  { id: 'massaggio-decontratturante', name: 'Massaggio Decontratturante', duration: 60, price: 60, categoryId: 'massaggi' },
  { id: 'massaggio-svedese', name: 'Massaggio Svedese', duration: 90, price: 80, categoryId: 'massaggi' },
  { id: 'massaggio-linfodrenante', name: 'Massaggio Linfodrenante', duration: 60, price: 65, categoryId: 'massaggi' },
  { id: 'massaggio-riflessologico', name: 'Massaggio Riflessologico Plantare', duration: 45, price: 40, categoryId: 'massaggi' },
  { id: 'massaggio-coppettazione', name: 'Massaggio Coppettazione', duration: 60, price: 70, categoryId: 'massaggi' },
  
  // 4. TRATTAMENTI CORPOREI
  { id: 'body-scrub', name: 'Body Scrub', duration: 45, price: 50, categoryId: 'trattamenti-corporei' },
  { id: 'trattamento-anticellulite', name: 'Trattamento Anticellulite', duration: 60, price: 65, categoryId: 'trattamenti-corporei' },
  { id: 'trattamento-rassodante', name: 'Trattamento Rassodante', duration: 60, price: 60, categoryId: 'trattamenti-corporei' },
  { id: 'impacco-alghe', name: 'Impacco Alghe', duration: 45, price: 55, categoryId: 'trattamenti-corporei' },
  { id: 'crioterapia', name: 'Crioterapia', duration: 30, price: 45, categoryId: 'trattamenti-corporei' },
  
  // 5. UNGHIE & SPA MANI/PIEDI
  { id: 'manicure-base', name: 'Manicure Base', duration: 45, price: 25, categoryId: 'unghie-spa' },
  { id: 'manicure-semipermanente', name: 'Manicure con Smalto Semiperm.', duration: 60, price: 35, categoryId: 'unghie-spa' },
  { id: 'manicure-ricostruzione', name: 'Manicure Ricostruzione', duration: 90, price: 45, categoryId: 'unghie-spa' },
  { id: 'pedicure-base', name: 'Pedicure Base', duration: 45, price: 30, categoryId: 'unghie-spa' },
  { id: 'pedicure-ristrutturante', name: 'Pedicure Ristrutturante', duration: 60, price: 40, categoryId: 'unghie-spa' },
  { id: 'spa-mani', name: 'Spa Mani', duration: 60, price: 40, categoryId: 'unghie-spa' },
  { id: 'spa-piedi', name: 'Spa Piedi', duration: 60, price: 45, categoryId: 'unghie-spa' },
  
  // 6. TRATTAMENTI SPECIALI
  { id: 'epilazione-laser', name: 'Epilazione Laser (1 zona)', duration: 30, price: 70, categoryId: 'trattamenti-speciali' },
  { id: 'pressoterapia', name: 'Pressoterapia', duration: 45, price: 50, categoryId: 'trattamenti-speciali' },
  { id: 'carbossiterapia', name: 'Carbossiterapia', duration: 45, price: 85, categoryId: 'trattamenti-speciali' },
  { id: 'microblading', name: 'Trattamento Microblading', duration: 120, price: 250, categoryId: 'trattamenti-speciali' },
  { id: 'laminazione-ciglia', name: 'Laminazione Ciglia', duration: 60, price: 55, categoryId: 'trattamenti-speciali' },
  { id: 'extension-ciglia', name: 'Extension Ciglia', duration: 90, price: 65, categoryId: 'trattamenti-speciali' },
];

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export function getDefaultCategories(businessType: BusinessType): DefaultCategory[] {
  switch (businessType) {
    case 'hair_salon':
      return HAIR_CATEGORIES;
    case 'beauty_center':
      return BEAUTY_CATEGORIES;
    case 'mixed':
      return [...HAIR_CATEGORIES, ...BEAUTY_CATEGORIES];
    default:
      return [];
  }
}

export function getDefaultServices(businessType: BusinessType): DefaultService[] {
  switch (businessType) {
    case 'hair_salon':
      return HAIR_SERVICES;
    case 'beauty_center':
      return BEAUTY_SERVICES;
    case 'mixed':
      return [...HAIR_SERVICES, ...BEAUTY_SERVICES];
    default:
      return [];
  }
}

// ============================================================================
// CATEGORY ICON SVG PATHS
// ============================================================================

export function getCategoryIconSvg(iconName: string): string {
  const icons: Record<string, string> = {
    scissors: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/>`,
    palette: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>`,
    sparkles: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>`,
    beaker: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>`,
    user: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>`,
    shield: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`,
    face: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>`,
    leaf: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 12c0-4.97 4.03-9 9-9 0 4.97-4.03 9-9 9zm0 0c0 3 2 5 2 5m1-5c0-3.5 2.5-6.5 6-7.5"/>`,
    heart: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>`,
    body: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
    hand: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>`,
    star: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>`,
  };
  return icons[iconName] || icons.sparkles;
}