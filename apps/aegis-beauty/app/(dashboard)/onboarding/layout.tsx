// ============================================================================
// AEGIS BEAUTY - ONBOARDING LAYOUT
// File: apps/aegis-beauty/app/(dashboard)/onboarding/layout.tsx
// ============================================================================

export const metadata = {
  title: 'Configura la tua attività | Aegis Beauty',
  description: 'Completa la configurazione della tua attività in pochi semplici passaggi',
};

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Logo Aegis Beauty */}
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Aegis Beauty</h1>
              <p className="text-sm text-gray-500">Configurazione attività</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">{children}</main>

      {/* Footer discreto */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3">
        <p className="text-center text-sm text-gray-400">
          Powered by <span className="text-purple-500">Aegis</span> 
        </p>
      </footer>
    </div>
  );
}
