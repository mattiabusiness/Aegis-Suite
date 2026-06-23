// ============================================================================
// AEGIS BEAUTY - ONBOARDING LAYOUT
// File: apps/aegis-beauty/app/(dashboard)/onboarding/layout.tsx
// ============================================================================

import { FloatingParticles, StepTransitionProvider } from '@aegis/ui';

export const metadata = {
  title: 'Configura la tua attività | Aegis Beauty',
  description: 'Completa la configurazione della tua attività in pochi semplici passaggi',
};

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <StepTransitionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 relative overflow-x-hidden">
        {/* Animated background */}
        <FloatingParticles />

        {/* Header con logo */}
        <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-purple-100/50">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-orizzontale.png?v=4"
                alt="Aegis Beauty"
                style={{ height: 44, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <div className="pl-3 border-l border-purple-100">
                <p className="text-xs text-gray-400 font-medium tracking-wide">Configurazione attività</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 max-w-3xl mx-auto px-4 py-6 pb-20">{children}</main>

        {/* Footer discreto */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-t border-gray-100 py-2.5">
          <p className="text-center text-xs text-gray-400">
            Powered by <span className="text-purple-500 font-semibold">Aegis Group</span>
          </p>
        </footer>
      </div>
    </StepTransitionProvider>
  );
}