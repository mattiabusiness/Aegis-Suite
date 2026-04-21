// ============================================================================
// AEGIS SUITE - FORGOT PASSWORD CARD
// File: packages/ui/src/components/auth/ForgotPasswordCard.tsx
// Reusable — accepts accentColor, logo, brandName as props
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ForgotPasswordCardProps {
  /** Called with the submitted email. Should call supabase.auth.resetPasswordForEmail */
  onSubmit: (email: string) => Promise<void>;
  /** Navigate back to login */
  onBackToLogin?: () => void;
  accentColor?: string;
  logo?: React.ReactNode;
  brandName?: string;
  brandSubtitle?: string;
}

// ============================================================================
// INLINE SVG ICONS
// ============================================================================

const IcoMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const IcoArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const IcoCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================================
// COMPONENT
// ============================================================================

export function ForgotPasswordCard({
  onSubmit,
  onBackToLogin,
  accentColor = '#a855f7',
  logo,
  brandName = 'Aegis',
  brandSubtitle,
}: ForgotPasswordCardProps) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const accent = accentColor;
  const accentDark = '#7e22ce';

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 450); };

  const translateError = (msg: string): string => {
    const lower = msg.toLowerCase();
    const secondsMatch = lower.match(/only request this after (\d+) second/);
    if (secondsMatch) {
      return `Per sicurezza puoi richiedere un nuovo link tra ${secondsMatch[1]} secondi.`;
    }
    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      return 'Troppi tentativi. Riprova tra qualche minuto.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Inserisci la tua email'); doShake(); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Errore durante l\'invio. Riprova.';
      setError(translateError(raw));
      doShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 420,
      borderRadius: '1.5rem',
      overflow: 'hidden',
      boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(168,85,247,0.12), 0 0 40px rgba(168,85,247,0.08)`,
      background: '#ffffff',
    }}>
      {/* Top purple panel */}
      <div style={{
        background: `linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, ${accent} 100%)`,
        padding: '2rem 2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        {logo && <div style={{ position: 'relative', zIndex: 1 }}>{logo}</div>}

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
            {brandName}{brandSubtitle && <span style={{ fontWeight: 300, opacity: 0.85 }}> {brandSubtitle}</span>}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 2 }}>
            Recupero password
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ padding: '2rem' }}>
        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentDark}, ${accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#fff',
            }}>
              <div style={{ width: 28, height: 28 }}><IcoCheckCircle /></div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e1b4b', marginBottom: 8 }}>
              Email inviata!
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              Controlla la tua casella di posta.<br />
              Il link scade tra <strong>1 ora</strong>.
            </div>
            {onBackToLogin && (
              <button onClick={onBackToLogin} style={backBtnStyle(accent)}>
                <span style={{ width: 16, height: 16, flexShrink: 0 }}><IcoArrowLeft /></span>
                Torna al login
              </button>
            )}
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} noValidate className={shake ? 'fp-shake' : ''}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
                Password dimenticata?
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Inserisci l&apos;email del tuo account e ti manderemo un link per reimpostare la password.
              </div>
            </div>

            {/* Email field */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={iconWrapStyle}><IcoMail /></span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="tua@email.com"
                  autoComplete="email"
                  autoFocus
                  style={inputStyle(!!error, accent)}
                />
              </div>
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={submitBtnStyle(loading, accent, accentDark)}
            >
              {loading ? (
                <>
                  <span style={spinnerStyle()} />
                  Invio in corso...
                </>
              ) : 'Invia link di recupero'}
            </button>

            {onBackToLogin && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  style={backBtnStyle(accent)}
                >
                  <span style={{ width: 16, height: 16, flexShrink: 0 }}><IcoArrowLeft /></span>
                  Torna al login
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      <style>{`
        @keyframes fp-spin { to { transform: rotate(360deg); } }
        .fp-shake { animation: fp-shk 0.45s ease-in-out; }
        @keyframes fp-shk {
          0%,100%{transform:translateX(0)} 15%,55%,85%{transform:translateX(-5px)} 35%,75%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const iconWrapStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 17,
  height: 17,
  color: '#9ca3af',
  pointerEvents: 'none',
};

function inputStyle(hasError: boolean, accent: string): React.CSSProperties {
  return {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 0.75rem 0.65rem 2.5rem',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    color: '#111827',
    background: '#fafafa',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  };
}

function submitBtnStyle(loading: boolean, accent: string, accentDark: string): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.625rem',
    border: 'none',
    background: loading
      ? '#d1d5db'
      : `linear-gradient(135deg, ${accentDark}, ${accent})`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.15s, transform 0.1s',
    boxShadow: loading ? 'none' : `0 4px 15px rgba(168,85,247,0.35)`,
    letterSpacing: '0.01em',
  };
}

function backBtnStyle(accent: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: accent,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0.25rem 0',
    fontFamily: 'inherit',
  };
}

function spinnerStyle(): React.CSSProperties {
  return {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'fp-spin 0.7s linear infinite',
    flexShrink: 0,
  };
}
