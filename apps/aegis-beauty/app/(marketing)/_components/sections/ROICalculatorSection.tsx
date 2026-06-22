'use client';

// ============================================================================
// AEGIS BEAUTY - ROI CALCULATOR SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/ROICalculatorSection.tsx
// Calcolatore ROI interattivo — zero server, pura matematica client.
// Tema: light premium (crema + ametista), card "calcolatore" su vetro.
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

// ─── Constants (same logic as Step8ROI) ────────────────────────────────────

const HOURLY_RATE = { hair: 25, beauty: 35, mixed: 30 } as const;
const NOSHOW_VALUE = { hair: 30, beauty: 50, mixed: 40 } as const;

function calcDashHours(manualH: number): number {
  return manualH * 0.10;
}

type BizType = 'hair' | 'beauty' | 'mixed';

// ─── Animated counter (RAF, smooth on every slider drag) ───────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return;

    const duration = 500;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    const to = value;
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{display.toLocaleString('it-IT')}</>;
}

// ─── Glow bar chart ──────────────────────────────────────────────────────────

function DarkBarChart({ timeSavings, noShowRecovery }: { timeSavings: number; noShowRecovery: number }) {
  const total = timeSavings + noShowRecovery;
  if (total === 0) return (
    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: mk.inkFaint }}>Sposta i cursori per calcolare</span>
    </div>
  );

  const MAX_H = 56;
  const bars = [
    {
      label: 'Tempo',
      val: timeSavings,
      pct: timeSavings / total,
      grad: 'linear-gradient(to top, #6d28d9, #a855f7)',
      glow: 'rgba(168,85,247,0.45)',
      color: mk.purpleDeep,
    },
    {
      label: 'No-show',
      val: noShowRecovery,
      pct: noShowRecovery / total,
      grad: 'linear-gradient(to top, #059669, #10b981)',
      glow: 'rgba(16,185,129,0.4)',
      color: mk.green,
    },
    {
      label: 'Totale',
      val: total,
      pct: 1,
      grad: 'linear-gradient(to top, #4338ca, #818cf8)',
      glow: 'rgba(99,102,241,0.4)',
      color: mk.indigo,
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24, height: 90, paddingBottom: 4 }}>
      {bars.map((bar, i) => {
        const h = Math.max(6, bar.pct * MAX_H);
        return (
          <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: bar.color, letterSpacing: '-0.01em' }}>
              €{Math.round(bar.val).toLocaleString('it-IT')}
            </span>
            <div
              style={{
                width: 32, height: h, borderRadius: '6px 6px 0 0',
                background: bar.grad,
                boxShadow: `0 0 16px ${bar.glow}, 0 -2px 8px ${bar.glow}`,
                transition: 'height 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {/* Diagonal gloss */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 6px)',
              }} />
            </div>
            <span style={{ fontSize: 10, color: mk.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function DarkSlider({
  value, onChange, min, max, step,
}: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="roi-mk-slider"
      style={{
        width: '100%', height: 4, borderRadius: 2, appearance: 'none',
        background: `linear-gradient(to right, ${mk.purpleBright} ${pct}%, rgba(45,45,45,0.1) ${pct}%)`,
        cursor: 'pointer', outline: 'none', display: 'block',
      }}
    />
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export function ROICalculatorSection() {
  const [type, setType] = useState<BizType>('hair');
  const [phoneMin, setPhoneMin] = useState(30);
  const [noShows, setNoShows] = useState(4);

  const handleTypeChange = useCallback((t: BizType) => setType(t), []);
  const handlePhoneMin   = useCallback((v: number) => setPhoneMin(v), []);
  const handleNoShows    = useCallback((v: number) => setNoShows(v), []);

  // ── Calculations (identical logic to Step8ROI) ──────────────────────────
  const hourlyRate       = HOURLY_RATE[type];
  const noShowValue      = NOSHOW_VALUE[type];
  const openDaysPerMonth = 5 * 4.33;
  const manualHoursPerMonth = (phoneMin * openDaysPerMonth) / 60;
  const dashHours        = calcDashHours(manualHoursPerMonth);
  const hoursSaved       = Math.max(0, manualHoursPerMonth - dashHours);
  const timeSavings      = hoursSaved * hourlyRate;
  const noShowsAvoided   = Math.round(noShows * 0.7);
  const noShowRecovery   = noShowsAvoided * noShowValue;
  const monthlyTotal     = timeSavings + noShowRecovery;
  const annualTotal      = monthlyTotal * 12;

  const tabs: { key: BizType; label: string }[] = [
    { key: 'hair',   label: 'Parrucchiere' },
    { key: 'beauty', label: 'Centro Estetico' },
    { key: 'mixed',  label: 'Misto' },
  ];

  return (
    <section
      style={{
        background: mk.gradBgAlt,
        padding: '64px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${mk.purpleA(0.07)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 100,
              background: mk.purpleA(0.08), border: `1px solid ${mk.purpleA(0.18)}`,
              color: mk.purpleDeep, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
            }}>
              Calcola il tuo risparmio
            </span>
            <h2 style={{
              fontFamily: mk.serif,
              fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 600,
              letterSpacing: '-0.01em', ...mk.gradHeadingText,
              margin: '0 0 10px', lineHeight: 1.2,
            }}>
              Quanto lasci sul tavolo<br />ogni mese?
            </h2>
            <p style={{ color: mk.inkSoft, fontSize: 15, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
              Due cursori. Il conto lo facciamo noi — in tempo reale.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Calculator card ── */}
        <ScrollReveal delay={120}>
          <div
            className="roi-mk-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: mk.card,
              backdropFilter: mk.blur,
              WebkitBackdropFilter: mk.blur,
              border: `1px solid ${mk.purpleA(0.16)}`,
              borderRadius: 24,
              boxShadow: `${mk.shadowLg}, 0 0 0 1px ${mk.purpleA(0.06)}`,
              overflow: 'hidden',
            }}
          >

            {/* ── LEFT: Inputs ── */}
            <div style={{ padding: '28px 32px', borderRight: `1px solid ${mk.border}` }}>

              {/* Type tabs */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, color: mk.inkFaint, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px',
                }}>
                  Tipo di attività
                </p>
                <div style={{
                  display: 'flex', gap: 6,
                  background: 'rgba(45,45,45,0.04)',
                  padding: 4, borderRadius: 12,
                  border: `1px solid ${mk.border}`,
                }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => handleTypeChange(tab.key)}
                      className="roi-mk-tab-btn"
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 9,
                        fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: type === tab.key
                          ? mk.gradBrand
                          : 'transparent',
                        color: type === tab.key ? mk.onPurple : mk.inkSoft,
                        boxShadow: type === tab.key ? `0 4px 14px ${mk.purpleA(0.3)}` : 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1 — Phone minutes */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: mk.ink, margin: 0 }}>
                      Prenotazioni telefoniche
                    </p>
                    <p style={{ fontSize: 12, color: mk.inkFaint, margin: '4px 0 0', lineHeight: 1.5 }}>
                      Minuti al giorno su chiamate e WhatsApp
                    </p>
                  </div>
                  <div style={{
                    minWidth: 68, padding: '6px 10px', borderRadius: 10, textAlign: 'center',
                    background: mk.purpleA(0.08), border: `1px solid ${mk.purpleA(0.2)}`,
                    flexShrink: 0, marginLeft: 12,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: mk.purple, lineHeight: 1 }}>{phoneMin}</span>
                    <br />
                    <span style={{ fontSize: 10, color: mk.inkFaint }}>min</span>
                  </div>
                </div>
                <DarkSlider value={phoneMin} onChange={handlePhoneMin} min={5} max={120} step={5} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: mk.inkFaint }}>5 min</span>
                  <span style={{ fontSize: 10, color: mk.inkFaint }}>2 ore</span>
                </div>
              </div>

              {/* Slider 2 — No-shows */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: mk.ink, margin: 0 }}>
                      No-show mensili
                    </p>
                    <p style={{ fontSize: 12, color: mk.inkFaint, margin: '4px 0 0', lineHeight: 1.5 }}>
                      Clienti che non si presentano all&apos;appuntamento
                    </p>
                  </div>
                  <div style={{
                    minWidth: 68, padding: '6px 10px', borderRadius: 10, textAlign: 'center',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(5,150,105,0.22)',
                    flexShrink: 0, marginLeft: 12,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: mk.green, lineHeight: 1 }}>{noShows}</span>
                    <br />
                    <span style={{ fontSize: 10, color: mk.inkFaint }}>/mese</span>
                  </div>
                </div>
                <DarkSlider value={noShows} onChange={handleNoShows} min={0} max={20} step={1} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: mk.inkFaint }}>0</span>
                  <span style={{ fontSize: 10, color: mk.inkFaint }}>20 / mese</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p style={{
                fontSize: 11, color: mk.inkFaint, marginTop: 24, lineHeight: 1.6,
                display: 'flex', alignItems: 'flex-start', gap: 6,
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ flexShrink: 0, color: mk.inkFaint, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stime basate su medie del settore beauty italiano. I risultati reali possono variare.
              </p>
            </div>

            {/* ── RIGHT: Results ── */}
            <div style={{
              padding: '28px 32px',
              display: 'flex', flexDirection: 'column',
              background: mk.cardTint,
            }}>

              {/* Big number */}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <p style={{
                  fontSize: 11, color: mk.purpleDeep, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px',
                }}>
                  Risparmio annuale stimato
                </p>
                <div style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: 900,
                  letterSpacing: '-0.04em', lineHeight: 1,
                  ...mk.gradHeadingText,
                  animation: 'roiMkBreathe 3.5s ease-in-out infinite',
                  marginBottom: 10,
                }}>
                  €<AnimatedNumber value={Math.round(annualTotal)} />
                </div>
                <p style={{ fontSize: 14, color: mk.inkFaint, margin: 0 }}>
                  ~&nbsp;
                  <strong style={{ color: mk.inkSoft, fontWeight: 700 }}>
                    €<AnimatedNumber value={Math.round(monthlyTotal)} />
                  </strong>
                  &nbsp;al mese
                </p>
              </div>

              {/* Bar chart */}
              <div style={{
                padding: '12px 16px 10px',
                borderRadius: 16, marginBottom: 10,
                background: mk.cardSolid,
                border: `1px solid ${mk.border}`,
              }}>
                <DarkBarChart timeSavings={timeSavings} noShowRecovery={noShowRecovery} />
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{
                  padding: '12px 10px', borderRadius: 12, textAlign: 'center',
                  background: mk.purpleA(0.06), border: `1px solid ${mk.purpleA(0.12)}`,
                }}>
                  <p style={{ fontSize: 10, color: mk.inkFaint, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Ore risparmiate
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: mk.heading, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                    ~{Math.round(hoursSaved)}h
                  </p>
                  <p style={{ fontSize: 10, color: mk.inkFaint, margin: 0 }}>al mese</p>
                </div>
                <div style={{
                  padding: '12px 10px', borderRadius: 12, textAlign: 'center',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(5,150,105,0.16)',
                }}>
                  <p style={{ fontSize: 10, color: mk.inkFaint, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    No-show evitati
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: mk.green, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                    {noShowsAvoided}
                  </p>
                  <p style={{ fontSize: 10, color: mk.inkFaint, margin: 0 }}>al mese</p>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#pioneers"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '17px 24px', borderRadius: 14, textDecoration: 'none',
                  background: mk.gradBrand,
                  color: mk.onPurple, fontSize: 15, fontWeight: 700,
                  boxShadow: mk.glow,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative', overflow: 'hidden',
                  marginTop: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = mk.glowStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = mk.glow;
                }}
              >
                {/* Shimmer */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  animation: 'roiMkShimmer 2.8s ease-in-out infinite',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Entra nel programma Pioneers
                </span>
                <svg
                  width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes roiMkBreathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        @keyframes roiMkShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        /* Slider thumb — WebKit */
        .roi-mk-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          border: 2px solid #fff;
          box-shadow: 0 0 14px rgba(168,85,247,0.5), 0 2px 6px rgba(45,20,60,0.2);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .roi-mk-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 0 22px rgba(168,85,247,0.7), 0 2px 6px rgba(45,20,60,0.2);
        }
        .roi-mk-slider::-webkit-slider-thumb:active {
          transform: scale(1.35);
          box-shadow: 0 0 28px rgba(168,85,247,0.85), 0 2px 6px rgba(45,20,60,0.2);
        }

        /* Slider thumb — Firefox */
        .roi-mk-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          border: 2px solid #fff;
          box-shadow: 0 0 14px rgba(168,85,247,0.5);
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .roi-mk-grid {
            grid-template-columns: 1fr !important;
          }
          .roi-mk-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid ${mk.border} !important;
          }
        }
        @media (max-width: 540px) {
          .roi-mk-grid > div {
            padding: 28px 20px !important;
          }
          .roi-mk-tab-btn {
            font-size: 11px !important;
            padding: 8px 4px !important;
          }
        }
        @media (max-width: 380px) {
          .roi-mk-tab-btn {
            font-size: 10px !important;
          }
        }
      `}</style>
    </section>
  );
}
