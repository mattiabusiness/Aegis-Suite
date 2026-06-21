// ============================================================================
// AEGIS SUITE - AUTH FLIP CARD COMPONENT
// File: packages/ui/src/components/auth/AuthFlipCard.tsx
// Two-panel card with crossfade, violet premium accents
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthFlipCardProps {
  initialMode?: 'login' | 'register';
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;

  onLogin: (data: { email: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
  onRegister: (data: AuthFlipRegisterData) => Promise<void>;

  showPhone?: boolean;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  inviteMode?: boolean;

  loginError?: string;
  loginSuccess?: string;
  registerError?: string;
  registerSuccess?: string;

  accentColor?: string;
  brandName?: string;
  brandSubtitle?: string;
  logo?: React.ReactNode;
  loginWelcomeTitle?: string;
  loginWelcomeSubtitle?: string;
  registerWelcomeTitle?: string;
  registerWelcomeSubtitle?: string;
  termsHref?: string;
  privacyHref?: string;
}

export interface AuthFlipRegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  termsAcceptedAt: string;
}

// ============================================================================
// SVG ICONS (inline, no dependencies)
// ============================================================================

const IcoMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const IcoUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const IcoPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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

// ============================================================================
// PASSWORD INPUT (single eye toggle, always visible)
// ============================================================================

function PasswordField({ label, value, onChange, placeholder, autoComplete }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="afc-field">
      <label className="afc-label">{label}</label>
      <div className="afc-input-wrap">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="afc-input"
          autoComplete={autoComplete}
        />
        <button type="button" className="afc-icon afc-eye" onClick={() => setShow(!show)} tabIndex={-1} aria-label={show ? 'Nascondi password' : 'Mostra password'}>
          <IcoEye open={show} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AuthFlipCard({
  initialMode = 'login',
  mode: controlledMode,
  onModeChange,
  onLogin,
  onForgotPassword,
  onRegister,
  showPhone = true,
  initialName = '',
  initialEmail = '',
  initialPhone = '',
  inviteMode = false,
  loginError,
  loginSuccess,
  registerError,
  registerSuccess,
  accentColor = '#a855f7',
  brandName = 'Aegis',
  brandSubtitle = 'Beauty',
  logo,
  loginWelcomeTitle = 'Bentornato!',
  loginWelcomeSubtitle = 'Accedi per gestire il tuo business',
  registerWelcomeTitle = 'Benvenuto!',
  registerWelcomeSubtitle = 'Registrati per iniziare la tua avventura',
  termsHref = 'https://aegisbeauty.app/legal#terms-customer',
  privacyHref = 'https://aegisbeauty.app/legal#privacy-customer',
}: AuthFlipCardProps) {

  const [internalMode, setInternalMode] = React.useState<'login' | 'register'>(initialMode);
  const currentMode = controlledMode ?? internalMode;
  const isRegister = currentMode === 'register';

  // Login
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginFormError, setLoginFormError] = React.useState('');
  const [loginShake, setLoginShake] = React.useState(false);

  // Register
  const [regName, setRegName] = React.useState(initialName);
  const [regEmail, setRegEmail] = React.useState(initialEmail);
  const [regPhone, setRegPhone] = React.useState(initialPhone);
  const [regPassword, setRegPassword] = React.useState('');
  const [regTerms, setRegTerms] = React.useState(false);
  const [regLoading, setRegLoading] = React.useState(false);
  const [regFormError, setRegFormError] = React.useState('');
  const [regShake, setRegShake] = React.useState(false);

  // Mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  // Sync initial values
  React.useEffect(() => { if (initialName) setRegName(initialName); }, [initialName]);
  React.useEffect(() => { if (initialEmail) setRegEmail(initialEmail); }, [initialEmail]);
  React.useEffect(() => { if (initialPhone) setRegPhone(initialPhone); }, [initialPhone]);

  const isNameRO = inviteMode && !!initialName;
  const isEmailRO = inviteMode;
  const isPhoneRO = inviteMode && !!initialPhone;

  // ── Switch mode (CSS handles the slide transition) ──
  const switchTo = (m: 'login' | 'register') => {
    if (m === currentMode) return;
    if (controlledMode === undefined) setInternalMode(m);
    onModeChange?.(m);
    setLoginFormError('');
    setRegFormError('');
  };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFormError('');
    if (!loginEmail) { setLoginFormError('Inserisci la tua email'); doShake('login'); return; }
    if (!loginPassword) { setLoginFormError('Inserisci la password'); doShake('login'); return; }
    setLoginLoading(true);
    try {
      await onLogin({ email: loginEmail, password: loginPassword });
    } catch {
      if (!loginFormError && !loginError) setLoginFormError('Errore durante il login. Riprova.');
      doShake('login');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegFormError('');
    if (!regName.trim()) { setRegFormError('Inserisci il tuo nome'); doShake('reg'); return; }
    if (!regEmail) { setRegFormError('Inserisci la tua email'); doShake('reg'); return; }
    if (showPhone && !regPhone.trim()) { setRegFormError('Inserisci il telefono'); doShake('reg'); return; }
    if (!regPassword) { setRegFormError('Inserisci una password'); doShake('reg'); return; }
    if (regPassword.length < 8) { setRegFormError('Minimo 8 caratteri'); doShake('reg'); return; }
    if (!regTerms) { setRegFormError('Accetta i Termini di Servizio'); doShake('reg'); return; }
    setRegLoading(true);
    try {
      await onRegister({ fullName: regName, email: regEmail, phone: regPhone, password: regPassword, termsAcceptedAt: new Date().toISOString() });
    } catch {
      if (!regFormError && !registerError) setRegFormError('Errore durante la registrazione.');
      doShake('reg');
    } finally {
      setRegLoading(false);
    }
  };

  const doShake = (s: 'login' | 'reg') => {
    if (s === 'login') { setLoginShake(true); setTimeout(() => setLoginShake(false), 500); }
    else { setRegShake(true); setTimeout(() => setRegShake(false), 500); }
  };

  // ── Ripple ──
  const doRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const el = document.createElement('span');
    const sz = Math.max(r.width, r.height);
    el.style.width = el.style.height = `${sz}px`;
    el.style.left = `${e.clientX - r.left - sz/2}px`;
    el.style.top = `${e.clientY - r.top - sz/2}px`;
    el.className = 'afc-ripple';
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };

  const vars = { '--afc-a': accentColor, '--afc-r': hexToRgb(accentColor) } as React.CSSProperties;
  const errL = loginError || loginFormError;
  const errR = registerError || regFormError;

  return (
    <div className="afc-root" style={vars}>
      <div className={`afc-card ${mounted ? 'afc-in' : ''} ${isRegister ? 'afc-reg-active' : ''}`}>

        {/* ═══════ BOTH FORMS (always rendered, behind the overlay) ═══════ */}
        <div className="afc-forms">
          {/* LOGIN FORM — left half */}
          <div className={`afc-form-area afc-form-left ${loginShake ? 'afc-shake' : ''}`}>
            <div className="afc-form-inner">
              <h3 className="afc-title">Accedi</h3>
              <p className="afc-desc">Inserisci le tue credenziali</p>
              {errL && <div className="afc-alert afc-err">{errL}</div>}
              {loginSuccess && <div className="afc-alert afc-ok">{loginSuccess}</div>}
              <form onSubmit={handleLogin} className="afc-form">
                <div className="afc-field">
                  <label className="afc-label">Email</label>
                  <div className="afc-input-wrap">
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="nome@esempio.it" className="afc-input" autoComplete="email" />
                    <span className="afc-icon"><IcoMail /></span>
                  </div>
                </div>
                <PasswordField label="Password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••" autoComplete="current-password" />
                {onForgotPassword && (
                  <button type="button" onClick={onForgotPassword} className="afc-forgot">Password dimenticata?</button>
                )}
                <button type="submit" disabled={loginLoading} className="afc-btn" onClick={doRipple}>
                  {loginLoading ? <span className="afc-spinner" /> : 'Accedi'}
                </button>
              </form>
              <div className="afc-mobile-sw">
                <span>Non hai un account?</span>
                <button type="button" onClick={() => switchTo('register')} className="afc-sw-link">Registrati</button>
              </div>
            </div>
          </div>

          {/* REGISTER FORM — right half */}
          <div className={`afc-form-area afc-form-right ${regShake ? 'afc-shake' : ''}`}>
            <div className="afc-form-inner afc-form-reg">
              <h3 className="afc-title">{inviteMode ? 'Scegli la password' : 'Registrati'}</h3>
              <p className="afc-desc">{inviteMode ? 'Il tuo profilo è già pronto' : 'Crea il tuo account'}</p>
              {errR && <div className="afc-alert afc-err">{errR}</div>}
              {registerSuccess && <div className="afc-alert afc-ok">{registerSuccess}</div>}
              <form onSubmit={handleRegister} className="afc-form">
                {inviteMode ? (
                  /* ── Invite mode: show profile summary, only ask for password ── */
                  <>
                    <div className="afc-invite-summary">
                      <div className="afc-invite-avatar">
                        {regName ? regName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                      </div>
                      <div className="afc-invite-info">
                        {regName && <p className="afc-invite-name">{regName}</p>}
                        {regEmail && <p className="afc-invite-email">{regEmail}</p>}
                        {regPhone && <p className="afc-invite-phone">{regPhone}</p>}
                      </div>
                    </div>
                    <PasswordField label="Scegli una password" value={regPassword} onChange={setRegPassword} placeholder="Minimo 8 caratteri" autoComplete="new-password" />
                  </>
                ) : (
                  /* ── Normal mode: all fields ── */
                  <>
                    <div className="afc-field">
                      <label className="afc-label">Nome completo</label>
                      <div className="afc-input-wrap">
                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Mario Rossi" className="afc-input" autoComplete="name" />
                        <span className="afc-icon"><IcoUser /></span>
                      </div>
                    </div>
                    <div className="afc-field">
                      <label className="afc-label">Email</label>
                      <div className="afc-input-wrap">
                        <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="nome@esempio.it" className="afc-input" autoComplete="email" />
                        <span className="afc-icon"><IcoMail /></span>
                      </div>
                    </div>
                    {showPhone && (
                      <div className="afc-field">
                        <label className="afc-label">Telefono</label>
                        <div className="afc-input-wrap">
                          <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+39 333 1234567" className="afc-input" autoComplete="tel" />
                          <span className="afc-icon"><IcoPhone /></span>
                        </div>
                      </div>
                    )}
                    <PasswordField label="Password" value={regPassword} onChange={setRegPassword} placeholder="Minimo 8 caratteri" autoComplete="new-password" />
                  </>
                )}
                <label className="afc-check">
                  <input type="checkbox" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} className="afc-checkbox" />
                  <span className="afc-check-text">
                    Accetto i <a href={termsHref} target="_blank" rel="noopener noreferrer" className="afc-a">Termini</a> e la <a href={privacyHref} target="_blank" rel="noopener noreferrer" className="afc-a">Privacy Policy</a>
                  </span>
                </label>
                <button type="submit" disabled={regLoading} className="afc-btn" onClick={doRipple}>
                  {regLoading ? <span className="afc-spinner" /> : 'Registrati'}
                </button>
              </form>
              {!inviteMode && (
                <div className="afc-mobile-sw">
                  <span>Hai già un account?</span>
                  <button type="button" onClick={() => switchTo('login')} className="afc-sw-link">Accedi</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ WELCOME OVERLAY (slides left ↔ right) ═══════ */}
        <div className="afc-overlay">
          <div className="afc-overlay-inner">

            {/* Panel 1: Visible in LOGIN mode (covers right side) — invites to register */}
            <div className="afc-overlay-panel">
              <div className="afc-welcome-body">
                {logo && <div className="afc-logo">{logo}</div>}
                {brandName && <h1 className="afc-brand-name">{brandName} <span className="afc-brand-sub">{brandSubtitle}</span></h1>}
                {brandName && <div className="afc-welcome-divider" />}
                <h2 className="afc-welcome-title">{loginWelcomeTitle}</h2>
                <p className="afc-welcome-sub">{loginWelcomeSubtitle}</p>
                <div className="afc-deco"><span className="afc-deco-line" /><span className="afc-deco-dot" /><span className="afc-deco-line" /></div>
                <p className="afc-welcome-hint">Non hai un account?</p>
                <button type="button" onClick={() => switchTo('register')} className="afc-welcome-btn">Crea un account</button>
              </div>
            </div>

            {/* Panel 2: Visible in REGISTER mode (covers left side) — invites to login */}
            <div className="afc-overlay-panel">
              <div className="afc-welcome-body">
                {logo && <div className="afc-logo">{logo}</div>}
                {brandName && <h1 className="afc-brand-name">{brandName} <span className="afc-brand-sub">{brandSubtitle}</span></h1>}
                {brandName && <div className="afc-welcome-divider" />}
                <h2 className="afc-welcome-title">{registerWelcomeTitle}</h2>
                <p className="afc-welcome-sub">{registerWelcomeSubtitle}</p>
                <div className="afc-deco"><span className="afc-deco-line" /><span className="afc-deco-dot" /><span className="afc-deco-line" /></div>
                {!inviteMode && <p className="afc-welcome-hint">Hai già un account?</p>}
                {!inviteMode && <button type="button" onClick={() => switchTo('login')} className="afc-welcome-btn">Accedi al tuo account</button>}
              </div>
            </div>

          </div>
        </div>

      </div>

      <p className="afc-powered">Powered by <span className="afc-pow-brand">{brandName} Group</span></p>

      {/* ═══════════════════ STYLES ═══════════════════ */}
      <style>{`
        .afc-root {
          width: 100%; max-width: 920px; margin: 0 auto; padding: 0.75rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
        }

        /* ===== CARD ===== */
        .afc-card {
          position: relative;
          width: 100%; min-height: 520px;
          border-radius: 1.5rem; overflow: hidden;
          background: #fff;
          box-shadow:
            0 0 0 2px rgba(var(--afc-r),0.2),
            0 0 15px rgba(var(--afc-r),0.15),
            0 0 40px rgba(var(--afc-r),0.08),
            0 10px 40px rgba(var(--afc-r),0.1),
            0 25px 70px rgba(var(--afc-r),0.06);
          /* Fade-in on mount */
          opacity: 0; transform: translateY(28px) scale(0.97);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
          animation: borderGlow 3s ease-in-out infinite;
        }
        .afc-card.afc-in { opacity: 1; transform: translateY(0) scale(1); }

        @keyframes borderGlow {
          0%,100% {
            box-shadow:
              0 0 0 2px rgba(var(--afc-r),0.15),
              0 0 10px rgba(var(--afc-r),0.1),
              0 0 30px rgba(var(--afc-r),0.05),
              0 10px 40px rgba(var(--afc-r),0.08);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(var(--afc-r),0.35),
              0 0 20px rgba(var(--afc-r),0.25),
              0 0 50px rgba(var(--afc-r),0.12),
              0 10px 40px rgba(var(--afc-r),0.12);
          }
        }

        /* ═════════════════════════════════
           FORMS LAYER (behind overlay)
        ═════════════════════════════════ */
        .afc-forms {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
        }

        .afc-form-area {
          padding: 2.5rem;
          display: flex; align-items: center; justify-content: center;
          overflow-y: auto;
        }
        .afc-form-inner { width: 100%; max-width: 380px; }
        .afc-form-reg { max-width: 400px; }

        /* ═════════════════════════════════
           OVERLAY (slides left ↔ right)
        ═════════════════════════════════ */
        .afc-overlay {
          position: absolute;
          top: 0; left: 50%; width: 50%; height: 100%;
          z-index: 60;
          overflow: hidden;
          transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1);
          border-radius: 0 1.4rem 1.4rem 0;
        }
        .afc-reg-active .afc-overlay {
          transform: translateX(-100%);
          border-radius: 1.4rem 0 0 1.4rem;
        }

        .afc-overlay-inner {
          display: flex;
          width: 200%; height: 100%;
          transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .afc-reg-active .afc-overlay-inner {
          transform: translateX(-50%);
        }

        .afc-overlay-panel {
          width: 50%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          /* DARK AMETISTA VIOLET */
          background: linear-gradient(145deg, #3b0764 0%, #581c87 30%, #6b21a8 60%, #7c3aed 100%);
        }
        /* Subtle dot pattern */
        .afc-overlay-panel::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        /* Inner glow */
        .afc-overlay-panel::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.15), transparent 65%);
          pointer-events: none;
        }

        .afc-welcome-body {
          position: relative; z-index: 2;
          text-align: center; max-width: 300px;
          padding: 2rem;
        }

        /* Logo breathing animation */
        .afc-logo {
          margin-bottom: 1rem;
          display: inline-flex;
          animation: breathe 3.5s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(168,85,247,0.35)); }
        }

        .afc-brand-name {
          font-size: 1.35rem; font-weight: 700; color: #fff;
          letter-spacing: -0.02em; margin: 0 0 1.25rem;
          font-family: var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
          animation: breathe 3.5s ease-in-out infinite;
        }
        .afc-brand-sub { font-weight: 600; opacity: 0.8; font-family: var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif); }

        .afc-welcome-divider {
          width: 40px; height: 2px; margin: 0 auto 1.25rem;
          background: rgba(255,255,255,0.2); border-radius: 1px;
        }

        .afc-welcome-title {
          font-size: 1.6rem; font-weight: 700;
          color: #fff; letter-spacing: -0.02em;
          margin: 0 0 0.6rem; line-height: 1.2;
        }
        .afc-welcome-sub {
          color: rgba(255,255,255,0.65);
          font-size: 0.85rem; line-height: 1.6;
          margin: 0 0 1.5rem;
        }

        .afc-deco {
          display: flex; align-items: center; justify-content: center;
          gap: 0.6rem; margin-bottom: 1.75rem;
        }
        .afc-deco-line { width: 2rem; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent); }
        .afc-deco-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #c084fc; box-shadow: 0 0 10px rgba(192,132,252,0.6);
          animation: dotP 2.5s ease-in-out infinite;
        }
        @keyframes dotP { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }

        .afc-welcome-hint {
          color: rgba(255,255,255,0.55);
          font-size: 0.8rem; margin: 0 0 0.5rem;
        }

        .afc-welcome-btn {
          display: inline-flex; align-items: center;
          padding: 0.65rem 1.75rem;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.08);
          color: #fff; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .afc-welcome-btn:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 4px 20px rgba(168,85,247,0.2);
          transform: translateY(-1px);
        }

        /* ═════════════════════════════════
           FORM STYLES
        ═════════════════════════════════ */
        .afc-title {
          font-size: 1.45rem; font-weight: 700;
          color: #1e1b3a; margin: 0 0 0.2rem; letter-spacing: -0.02em;
        }
        .afc-desc { color: #8b85a8; font-size: 0.85rem; margin: 0 0 1.2rem; }
        .afc-form { display: flex; flex-direction: column; gap: 0.8rem; }
        .afc-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .afc-label {
          font-size: 0.72rem; font-weight: 600;
          color: #6b6590; text-transform: uppercase; letter-spacing: 0.06em;
        }

        .afc-input-wrap { position: relative; display: flex; align-items: center; }
        .afc-input {
          width: 100%; padding: 0.7rem 2.5rem 0.7rem 0.9rem;
          background: #f8f7fc; border: 1.5px solid #e8e5f0;
          border-radius: 0.7rem; color: #1e1b3a; font-size: 0.875rem;
          outline: none; transition: all 0.3s ease;
        }
        .afc-input::placeholder { color: #b5b0c8; }
        .afc-input::-ms-reveal,
        .afc-input::-ms-clear,
        .afc-input::-webkit-credentials-auto-fill-button { display: none !important; }
        input[type="password"]::-ms-reveal { display: none !important; }
        .afc-input:focus {
          border-color: var(--afc-a);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(var(--afc-r),0.12), 0 0 20px rgba(var(--afc-r),0.06);
        }
        .afc-input.afc-ro { opacity: 0.5; cursor: not-allowed; background: #f0eff5; }

        .afc-icon {
          position: absolute; right: 0.75rem;
          width: 1.05rem; height: 1.05rem;
          color: #b5b0c8; pointer-events: none;
          display: flex; flex-shrink: 0;
        }
        .afc-icon svg { width: 100%; height: 100%; }
        .afc-eye {
          pointer-events: auto; cursor: pointer;
          background: none; border: none; padding: 0;
          transition: color 0.2s;
        }
        .afc-eye:hover { color: var(--afc-a); }

        .afc-forgot {
          align-self: flex-end; background: none; border: none;
          color: var(--afc-a); font-size: 0.78rem; font-weight: 500;
          cursor: pointer; padding: 0; margin-top: -0.15rem; transition: color 0.2s;
        }
        .afc-forgot:hover { color: #7e22ce; text-decoration: underline; }

        .afc-btn {
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          height: 2.85rem; border: none; border-radius: 0.75rem;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #581c87);
          color: #fff;
          box-shadow: 0 4px 18px rgba(var(--afc-r),0.28);
          transition: all 0.3s ease; margin-top: 0.35rem;
        }
        .afc-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(var(--afc-r),0.38);
        }
        .afc-btn:active:not(:disabled) { transform: translateY(0); }
        .afc-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .afc-ripple {
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: scale(0); animation: rpl 0.6s ease-out; pointer-events: none;
        }
        @keyframes rpl { to { transform: scale(4); opacity: 0; } }

        .afc-spinner {
          width: 1.15rem; height: 1.15rem;
          border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spn 0.6s linear infinite;
        }
        @keyframes spn { to { transform: rotate(360deg); } }

        .afc-check { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; }
        .afc-checkbox { width: 0.95rem; height: 0.95rem; margin-top: 0.1rem; accent-color: var(--afc-a); cursor: pointer; flex-shrink: 0; }
        .afc-check-text { font-size: 0.72rem; color: #8b85a8; line-height: 1.45; }
        .afc-a { color: var(--afc-a); text-decoration: none; font-weight: 500; }
        .afc-a:hover { text-decoration: underline; color: #7e22ce; }

        .afc-alert { padding: 0.6rem 0.85rem; border-radius: 0.6rem; font-size: 0.8rem; margin-bottom: 0.5rem; line-height: 1.45; }
        .afc-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .afc-ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }

        .afc-shake { animation: shk 0.45s ease-in-out; }
        @keyframes shk {
          0%,100%{transform:translateX(0)} 15%,55%,85%{transform:translateX(-5px)} 35%,75%{transform:translateX(5px)}
        }

        .afc-mobile-sw {
          display: none; align-items: center; justify-content: center;
          gap: 0.35rem; margin-top: 1.25rem; font-size: 0.8rem; color: #8b85a8;
        }
        .afc-sw-link {
          background: none; border: none; color: var(--afc-a);
          font-weight: 600; cursor: pointer; padding: 0; font-size: 0.8rem;
        }
        .afc-sw-link:hover { color: #7e22ce; text-decoration: underline; }

        .afc-powered { color: #c4c0d4; font-size: 0.85rem; letter-spacing: 0.03em; }
        .afc-pow-brand { color: var(--afc-a); font-weight: 600; opacity: 0.75; }

        /* ===== INVITE MODE — profile summary ===== */
        .afc-invite-summary {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px; margin-bottom: 4px;
          background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.15);
        }
        .afc-invite-avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(147,51,234,0.25), rgba(126,34,206,0.15));
          border: 1px solid rgba(147,51,234,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #7c3aed; letter-spacing: -0.5px;
        }
        .afc-invite-info { flex: 1; min-width: 0; }
        .afc-invite-name { margin: 0; font-size: 14px; font-weight: 600; color: #1e1b2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .afc-invite-email { margin: 2px 0 0; font-size: 12px; color: #7c3aed; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .afc-invite-phone { margin: 1px 0 0; font-size: 12px; color: #9ca3af; }

        /* ===== RESPONSIVE — mobile/tablet-portrait < 1024px ===== */
        @media (max-width: 1023px) {
          .afc-root { padding: 0.5rem 0.75rem; gap: 0.3rem; }

          /* Both forms overlap in the same grid cell — card sizes to tallest (register) */
          .afc-forms { grid-template-columns: 1fr; }
          .afc-form-left, .afc-form-right {
            grid-column: 1; grid-row: 1;
            transition: opacity 0.28s ease, filter 0.28s ease;
          }

          /* Login: visible by default */
          .afc-form-left  { opacity: 1; filter: blur(0px);  pointer-events: auto; }
          .afc-form-right { opacity: 0; filter: blur(10px); pointer-events: none; }

          /* Register mode: swap visibility with blur-fade */
          .afc-reg-active .afc-form-left  { opacity: 0; filter: blur(10px); pointer-events: none; }
          .afc-reg-active .afc-form-right { opacity: 1; filter: blur(0px);  pointer-events: auto; }

          .afc-overlay { display: none; }
          .afc-mobile-sw { display: flex; }
          .afc-form-area { padding: 1.5rem 1.25rem; overflow-y: auto; -ms-overflow-style: none; scrollbar-width: none; }
          .afc-form-area::-webkit-scrollbar { display: none; }
          .afc-desc { display: none; }
        }

`}</style>
      </div>
    );
  }

// ============================================================================
// UTILITY
// ============================================================================
function hexToRgb(hex: string): string {
  const h = hex.replace('#','');
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`;
}
