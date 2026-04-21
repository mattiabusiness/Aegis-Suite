// ============================================================================
// AEGIS SUITE - RESET PASSWORD CARD
// File: packages/ui/src/components/auth/ResetPasswordCard.tsx
// Handles the Supabase recovery token from URL hash (#type=recovery&access_token=...)
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ResetPasswordCardProps {
  /**
   * Called with the new password once the user submits.
   * Should call supabase.auth.updateUser({ password }).
   * The Supabase session is set by this component from the URL hash.
   */
  onSubmit: (password: string) => Promise<void>;
  /**
   * Called to establish the Supabase session from the URL.
   * With PKCE flow (default): receives { code } — call exchangeCodeForSession(code).
   * With implicit flow: receives { accessToken, refreshToken } — call setSession(...).
   * Return true on success, false on failure.
   */
  onSetSession: (tokens: { code?: string; accessToken?: string; refreshToken?: string }) => Promise<boolean>;
  onBackToLogin?: () => void;
  accentColor?: string;
  logo?: React.ReactNode;
  brandName?: string;
  brandSubtitle?: string;
}

type PageState = 'loading' | 'ready' | 'submitting' | 'success' | 'invalid';

// ============================================================================
// INLINE SVG ICONS
// ============================================================================

const IcoLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IcoEye = ({ open }: { open: boolean }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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

const IcoXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Debole', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Sufficiente', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Buona', color: '#3b82f6' };
  return { score, label: 'Ottima', color: '#10b981' };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResetPasswordCard({
  onSubmit,
  onSetSession,
  onBackToLogin,
  accentColor = '#a855f7',
  logo,
  brandName = 'Aegis',
  brandSubtitle,
}: ResetPasswordCardProps) {
  const [pageState, setPageState] = React.useState<PageState>('loading');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState('');

  const accent = accentColor;
  const accentDark = '#7e22ce';
  const strength = getStrength(password);

  // On mount: detect PKCE (?code=) or implicit (#type=recovery) token, establish session
  React.useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      // ── 1. PKCE flow: ?code= in query string (default with @supabase/ssr) ──
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        // Remove code from URL immediately (security)
        window.history.replaceState(null, '', window.location.pathname);
        const ok = await onSetSession({ code });
        setPageState(ok ? 'ready' : 'invalid');
        return;
      }

      // ── 2. Implicit flow: #type=recovery&access_token= in hash ──
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || '';

      if (type === 'recovery' && accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        const ok = await onSetSession({ accessToken, refreshToken });
        setPageState(ok ? 'ready' : 'invalid');
        return;
      }

      // Nothing found
      setPageState('invalid');
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('La password deve essere di almeno 8 caratteri'); return; }
    if (password !== confirm) { setError('Le password non corrispondono'); return; }
    setPageState('submitting');
    try {
      await onSubmit(password);
      setPageState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio. Riprova.');
      setPageState('ready');
    }
  };

  // ── Render helpers ──

  const renderBody = () => {
    if (pageState === 'loading') {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <span style={{ ...spinnerStyle(), borderTopColor: accent, width: 36, height: 36 }} />
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 12 }}>Verifica del link...</div>
        </div>
      );
    }

    if (pageState === 'invalid') {
      return (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', color: '#fff',
          }}>
            <div style={{ width: 28, height: 28 }}><IcoXCircle /></div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e1b4b', marginBottom: 8 }}>
            Link non valido
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
            Il link è scaduto o già utilizzato.<br />
            Richiedine uno nuovo dalla pagina di login.
          </div>
          {onBackToLogin && (
            <button onClick={onBackToLogin} style={backBtnStyle(accent)}>
              <span style={{ width: 16, height: 16, flexShrink: 0 }}><IcoArrowLeft /></span>
              Torna al login
            </button>
          )}
        </div>
      );
    }

    if (pageState === 'success') {
      return (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentDark}, ${accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', color: '#fff',
          }}>
            <div style={{ width: 28, height: 28 }}><IcoCheckCircle /></div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e1b4b', marginBottom: 8 }}>
            Password aggiornata!
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
            Ora puoi accedere con la tua nuova password.
          </div>
          {onBackToLogin && (
            <button onClick={onBackToLogin} style={submitBtnStyle(false, accent, accentDark)}>
              Vai al login
            </button>
          )}
        </div>
      );
    }

    // ready | submitting
    const isSubmitting = pageState === 'submitting';
    return (
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
            Nuova password
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Scegli una password sicura di almeno 8 caratteri.
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrapStyle}><IcoLock /></span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Minimo 8 caratteri"
              autoComplete="new-password"
              autoFocus
              style={{ ...inputStyle(!!error, accent), paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              style={eyeBtnStyle}
              tabIndex={-1}
              aria-label={showPwd ? 'Nascondi password' : 'Mostra password'}
            >
              <IcoEye open={showPwd} />
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: strength.score >= i ? strength.color : '#e5e7eb',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              {strength.label && (
                <div style={{ fontSize: '0.72rem', color: strength.color, marginTop: 3, fontWeight: 600 }}>
                  {strength.label}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Conferma password</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrapStyle}><IcoLock /></span>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              placeholder="Ripeti la password"
              autoComplete="new-password"
              style={{ ...inputStyle(!!error, accent), paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={eyeBtnStyle}
              tabIndex={-1}
              aria-label={showConfirm ? 'Nascondi password' : 'Mostra password'}
            >
              <IcoEye open={showConfirm} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={submitBtnStyle(isSubmitting, accent, accentDark)}
        >
          {isSubmitting ? (
            <>
              <span style={spinnerStyle()} />
              Salvataggio...
            </>
          ) : 'Salva nuova password'}
        </button>

        {onBackToLogin && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button type="button" onClick={onBackToLogin} style={backBtnStyle(accent)}>
              <span style={{ width: 16, height: 16, flexShrink: 0 }}><IcoArrowLeft /></span>
              Torna al login
            </button>
          </div>
        )}
      </form>
    );
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
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {logo && <div style={{ position: 'relative', zIndex: 1 }}>{logo}</div>}

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
            {brandName}{brandSubtitle && <span style={{ fontWeight: 300, opacity: 0.85 }}> {brandSubtitle}</span>}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 2 }}>
            Reimposta password
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '2rem' }}>
        {renderBody()}
      </div>

      <style>{`
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
        input[type="password"]::-webkit-contacts-auto-fill-button,
        input[type="password"]::-webkit-credentials-auto-fill-button { visibility: hidden; display: none !important; }
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

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 2,
  color: '#9ca3af',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function inputStyle(hasError: boolean, accent: string): React.CSSProperties {
  void accent;
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
    transition: 'opacity 0.15s',
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
    animation: 'rp-spin 0.7s linear infinite',
    flexShrink: 0,
  };
}
