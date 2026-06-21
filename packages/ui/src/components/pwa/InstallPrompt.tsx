'use client';

// ============================================================================
// AEGIS SUITE - PWA INSTALL PROMPT
// File: packages/ui/src/components/pwa/InstallPrompt.tsx
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share, Download } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface InstallPromptProps {
  businessName?: string;
  showAfterBooking?: boolean;
  iosOnly?: boolean;
  onInstalled?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ============================================================================
// GLOBAL DEFERRED PROMPT — captured at module level so late-mounting
// components (e.g. SuccessScreen) don't miss the beforeinstallprompt event
// ============================================================================

let _globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const KEYS = {
  installDismissedAt: 'aegis_pwa_dismissed_at',
  dismissCount: 'aegis_pwa_dismiss_count',
  isInstalled: 'aegis_pwa_installed',
  firstVisitAt: 'aegis_pwa_first_visit',
  visitCount: 'aegis_pwa_visit_count',
} as const;

const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// HELPERS
// ============================================================================

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

function shouldShow(forceShow: boolean): boolean {
  if (typeof window === 'undefined') return false;

  // Already installed
  if (localStorage.getItem(KEYS.isInstalled) === 'true') return false;

  // Already in standalone (installed PWA)
  if (isInStandaloneMode()) {
    localStorage.setItem(KEYS.isInstalled, 'true');
    return false;
  }

  // Track visits
  const now = Date.now();
  const firstVisit = localStorage.getItem(KEYS.firstVisitAt);
  if (!firstVisit) localStorage.setItem(KEYS.firstVisitAt, String(now));

  const visits = parseInt(localStorage.getItem(KEYS.visitCount) ?? '0', 10) + 1;
  localStorage.setItem(KEYS.visitCount, String(visits));

  // Check dismiss cooldown
  const dismissedAt = parseInt(localStorage.getItem(KEYS.installDismissedAt) ?? '0', 10);
  if (dismissedAt && now - dismissedAt < DISMISS_COOLDOWN_MS) return false;

  // Show if: forceShow (after booking) OR at least 2 visits
  return forceShow || visits >= 2;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InstallPrompt({ businessName, showAfterBooking = false, iosOnly = false, onInstalled }: InstallPromptProps) {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  // Effect 1: count this visit + platform detection (runs once on mount)
  useEffect(() => {
    setIos(isIOS());
    if (_globalDeferredPrompt) setDeferredPrompt(_globalDeferredPrompt);

    if (typeof window === 'undefined') return;
    if (localStorage.getItem(KEYS.isInstalled) === 'true') return;
    if (isInStandaloneMode()) {
      localStorage.setItem(KEYS.isInstalled, 'true');
      return;
    }
    if (!localStorage.getItem(KEYS.firstVisitAt)) {
      localStorage.setItem(KEYS.firstVisitAt, String(Date.now()));
    }
    const visits = parseInt(localStorage.getItem(KEYS.visitCount) ?? '0', 10) + 1;
    localStorage.setItem(KEYS.visitCount, String(visits));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      _globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(KEYS.isInstalled, 'true');
      _globalDeferredPrompt = null;
      setVisible(false);
      onInstalled?.();
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: decide whether to show banner
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(KEYS.isInstalled) === 'true') return;
    if (isInStandaloneMode()) return;
    // iosOnly: su iOS il push richiede la PWA installata, quindi qui mostriamo
    // solo l'install; su Android/desktop l'attivazione notifiche è gestita altrove.
    if (iosOnly && !isIOS()) return;

    const now = Date.now();
    const dismissedAt = parseInt(localStorage.getItem(KEYS.installDismissedAt) ?? '0', 10);
    if (dismissedAt && now - dismissedAt < DISMISS_COOLDOWN_MS) return;

    // iOS: niente beforeinstallprompt → mostra le istruzioni "Aggiungi a Home" a tempo.
    if (isIOS()) {
      const t = setTimeout(() => setVisible(true), showAfterBooking ? 1500 : 1200);
      return () => clearTimeout(t);
    }

    // Android/desktop: mostra il banner col tasto "Installa" appena il browser
    // rende l'app installabile (evento beforeinstallprompt catturato → deferredPrompt).
    // Così l'utente non deve passare dai tre puntini → installazione in un tap.
    if (deferredPrompt) {
      const t = setTimeout(() => setVisible(true), showAfterBooking ? 1200 : 500);
      return () => clearTimeout(t);
    }
  }, [showAfterBooking, iosOnly, deferredPrompt]);

  const dismiss = useCallback(() => {
    const count = parseInt(localStorage.getItem(KEYS.dismissCount) ?? '0', 10) + 1;
    localStorage.setItem(KEYS.dismissCount, String(count));
    localStorage.setItem(KEYS.installDismissedAt, String(Date.now()));
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(KEYS.isInstalled, 'true');
      onInstalled?.();
    }
    setVisible(false);
  }, [deferredPrompt, onInstalled]);

  const dismissCount = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem(KEYS.dismissCount) ?? '0', 10)
    : 0;

  const bodyText = dismissCount < 2
    ? `Installa l'app per avere il massimo controllo sui tuoi appuntamenti e non dimenticartene mai.`
    : `Non perdere il prossimo appuntamento — installa l'app e attiva i promemoria automatici in un tap.`;

  const prompt = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ zIndex: 10000 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-3xl rounded-t-3xl backdrop-blur-3xl bg-white/10 border border-white/20 shadow-2xl shadow-purple-900/40"
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm flex-1">
                {businessName ?? 'Aegis Beauty'}
              </span>
              <button
                onClick={dismiss}
                className="text-white/50 hover:text-white/80 transition-colors p-1 -mr-1"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              {bodyText}
            </p>

            {/* iOS instructions */}
            {ios && (
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 mb-4 text-white/60 text-xs">
                <Share className="w-4 h-4 shrink-0" />
                <span>
                  Tocca <strong className="text-white/80">Condividi</strong> poi{' '}
                  <strong className="text-white/80">&ldquo;Aggiungi a schermata Home&rdquo;</strong>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={dismiss}
                className="text-white/50 text-sm hover:text-white/70 transition-colors flex-1 text-left"
              >
                Non ora
              </button>
              {!ios && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Installa
                </button>
              )}
              {ios && (
                <button
                  onClick={dismiss}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Ho capito
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(prompt, document.body);
}
