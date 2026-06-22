// ============================================================================
// AEGIS BEAUTY - MARKETING THEME TOKENS
// File: apps/aegis-beauty/app/(marketing)/_components/theme.ts
// Light-premium palette (panna + ametista) — token unico per tutto il marketing.
// Tutti i componenti marketing importano `mk` invece di hardcodare colori inline.
// Cambiare qui = cambiare tutto il sito. Non tocca il theme system di packages/ui.
// ============================================================================

// Due tonalità crema che si alternano A/B sezione per sezione (1-1-1-1).
// UNICO punto da ritoccare per i due crema:
const CREMA_CALDO = '#EFE6D2';   // sezioni "A" — crema bello caldo
const CREMA_FREDDO = '#F7F4EC';  // sezioni "B" — crema più freddo e chiaro

export const mk = {
  // ── Font ──────────────────────────────────────────────────────────────────
  serif: 'var(--font-serif), "Playfair Display", Georgia, serif', // titoli
  sans: 'var(--font-inter), system-ui, -apple-system, sans-serif', // corpo

  // ── Sfondi (ritmo alternato, sostituisce #0A0A0F / #0D0D16) ─────────────────
  bg: CREMA_CALDO,      // crema caldo (sezioni "A")
  bgAlt: CREMA_FREDDO,  // crema freddo/chiaro (sezioni "B")
  bgTint: '#F4EEF6',    // crema con velo viola (zone "speciali")
  glass: 'rgba(239,230,210,0.82)', // navbar glass (= bg con alpha)
  // Sfondi sezione PIATTI che si alternano A/B (1-1-1-1) — alias dei due crema sopra
  gradBg: CREMA_CALDO,     // sezioni "A" (caldo)
  gradBgAlt: CREMA_FREDDO, // sezioni "B" (freddo/chiaro)

  // ── Testo ───────────────────────────────────────────────────────────────────
  heading: '#5A2A7A',   // ametista scuro — titoli
  ink: '#2D2D2D',       // antracite — corpo
  inkSoft: '#57505E',   // grigio caldo — secondario
  inkFaint: '#8B8494',  // etichette / microcopy
  onPurple: '#FFFFFF',  // testo su superfici viola

  // ── Viola (ametista) ─────────────────────────────────────────────────────────
  purple: '#9333ea',       // accento testo/icone (buon contrasto su panna)
  purpleDeep: '#7e22ce',   // profondo
  purpleBright: '#a855f7', // brillante (fill / glow / gradient)
  purpleSoft: '#c084fc',   // chiaro
  purpleDeepest: '#5A2A7A',// = heading

  // ── Semantici (ROI calculator) ────────────────────────────────────────────────
  green: '#059669',        // verde profondo (contrasto su chiaro)
  greenBright: '#10b981',
  indigo: '#4f46e5',
  indigoBright: '#818cf8',

  // ── Superfici / glass ──────────────────────────────────────────────────────────
  card: 'rgba(253,250,243,0.85)', // glass avorio caldo (stacca sul crema senza "bianco ospedale")
  cardSolid: '#FDFBF6',
  cardTint: 'rgba(147,51,234,0.04)', // velo viola
  blur: 'blur(16px)',

  // ── Bordi ───────────────────────────────────────────────────────────────────────
  border: 'rgba(90,42,122,0.10)',       // ametista tenue
  borderStrong: 'rgba(147,51,234,0.25)',
  hairline: 'rgba(45,45,45,0.06)',      // separatore neutro

  // ── Ombre (sfumate ed espanse, riflesso viola — da brief) ─────────────────────────
  shadowSm: '0 4px 16px rgba(90,42,122,0.06)',
  shadowMd: '0 12px 32px rgba(90,42,122,0.08)',
  shadowLg: '0 24px 60px rgba(90,42,122,0.10)',
  glow: '0 8px 28px rgba(147,51,234,0.28)',       // CTA a riposo
  glowStrong: '0 14px 40px rgba(147,51,234,0.40)',// CTA hover

  // ── Gradienti ─────────────────────────────────────────────────────────────────────
  gradBrand: 'linear-gradient(135deg, #7e22ce, #9333ea, #a855f7)',     // CTA
  gradHeading: 'linear-gradient(135deg, #5A2A7A 0%, #9333ea 100%)',    // titoli forti
  gradHeadingSoft: 'linear-gradient(120deg, #2D2D2D 25%, #7e22ce 100%)', // titoli misti

  // Stile pronto: titolo con TESTO in gradiente (look hero) — spread nello style del titolo
  gradHeadingText: {
    background: 'linear-gradient(135deg, #5A2A7A 0%, #9333ea 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // ── Particelle "light" (passate da Hero a FloatingParticles) ──────────────────────
  fp: {
    particle: 'rgba(147,51,234,0.18)',
    glow: 'rgba(147,51,234,0.12)',
    grid: 'transparent', // griglia rimossa: i "quadrati" davano un look tech, non calmo
    orbOpacity: 0.1,
  },

  // ── Helpers per i molti rgba a opacità variabile ──────────────────────────────────
  purpleA: (a: number): string => `rgba(147,51,234,${a})`,  // purple-600
  brightA: (a: number): string => `rgba(168,85,247,${a})`,  // purple-500 (glow/particelle)
  amethystA: (a: number): string => `rgba(90,42,122,${a})`, // base ombre
  inkA: (a: number): string => `rgba(45,45,45,${a})`,       // antracite
} as const;

export type MarketingTheme = typeof mk;
