// ============================================================================
// AEGIS BEAUTY - DASHBOARD OVERVIEW CONTENT
// File: apps/aegis-beauty/app/(dashboard)/OverviewContent.tsx
// ============================================================================

'use client';

import { 
  PageHeader, 
  StatCard, 
  EmptyAppointments,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@aegis/ui';
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  Scissors, 
  UserCheck,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Stats {
  appointmentsToday: number;
  appointmentsWeek: number;
  totalCustomers: number;
  totalServices: number;
  totalStaff: number;
}

interface ROIData {
  weeklyHours: number;
  monthlyHours: number;
  yearlyHours: number;
  noShowReduction: number;
  hourlyValue: number;
}

interface OverviewContentProps {
  stats: Stats;
  roiData: ROIData | null;
  businessName: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OverviewContent({ stats, roiData, businessName }: OverviewContentProps) {
  // Calcola saluto in base all'ora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title={`${getGreeting()}!`}
        description={`Ecco cosa succede oggi in ${businessName}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Appuntamenti oggi"
          value={stats.appointmentsToday}
          icon={Calendar}
          accentColor="purple"
        />
        <StatCard
          title="Appuntamenti settimana"
          value={stats.appointmentsWeek}
          icon={CalendarDays}
          accentColor="blue"
        />
        <StatCard
          title="Clienti totali"
          value={stats.totalCustomers}
          icon={Users}
          accentColor="emerald"
        />
        <StatCard
          title="Servizi attivi"
          value={stats.totalServices}
          icon={Scissors}
          accentColor="amber"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ROI Widget */}
        {roiData && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Il tuo risparmio con Aegis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">
                    {roiData.weeklyHours}h
                  </div>
                  <div className="text-sm text-gray-500 mt-1">a settimana</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">
                    {roiData.monthlyHours}h
                  </div>
                  <div className="text-sm text-gray-500 mt-1">al mese</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">
                    {roiData.yearlyHours}h
                  </div>
                  <div className="text-sm text-gray-500 mt-1">all&apos;anno</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Riduzione no-show stimata</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  -{roiData.noShowReduction}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="w-5 h-5 text-purple-500" />
              Staff attivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-gray-900">
                {stats.totalStaff}
              </div>
              <div className="text-gray-500 mt-2">
                {stats.totalStaff === 1 ? 'membro' : 'membri'} del team
              </div>
            </div>
            {stats.totalStaff === 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-sm text-amber-700">
                  Aggiungi il tuo staff per gestire gli appuntamenti
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-purple-500" />
            Prossimi appuntamenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.appointmentsToday === 0 ? (
            <EmptyAppointments 
              size="sm"
              actionLabel="Vai al calendario"
              onAction={() => window.location.href = '/dashboard/calendario'}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>La lista degli appuntamenti sarà disponibile a breve.</p>
              <p className="text-sm mt-2">
                Hai {stats.appointmentsToday} appuntament{stats.appointmentsToday === 1 ? 'o' : 'i'} oggi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}