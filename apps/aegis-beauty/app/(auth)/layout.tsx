// ============================================================================
// AEGIS BEAUTY - AUTH LAYOUT
// File: apps/aegis-beauty/app/(auth)/layout.tsx
// ============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aegis Beauty - Accedi',
  description: 'Accedi o registrati per gestire il tuo salone',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header semplice */}
      <header className="p-6">
        <div className="max-w-md mx-auto">
          <a href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold">Aegis Beauty</span>
          </a>
        </div>
      </header>

      {/* Contenuto centrale */}
      <main className="flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        <p>© 2025 Aegis. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}
