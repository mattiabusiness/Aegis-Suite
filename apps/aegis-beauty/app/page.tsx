export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary-900">
          Aegis Beauty
        </h1>
        <p className="text-xl text-primary-700">
          Piattaforma di gestione per parrucchieri e centri estetici
        </p>
        <div className="mt-8 text-sm text-primary-600 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-lg inline-block">
          ✅ Monorepo configurato correttamente
        </div>
      </div>
    </main>
  );
}