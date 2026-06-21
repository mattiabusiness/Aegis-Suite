// ============================================================================
// AEGIS BEAUTY - GET /api/notifications/test-reminder
// DIAGNOSI del fallback reminder 24h, senza aspettare il cron.
//
// Uso (da browser):
//   ?secret=<CRON_SECRET>
//       → elenca i prossimi appuntamenti con i loro ID
//   ?secret=<CRON_SECRET>&appointmentId=<ID>
//       → report: email sul cliente / email account / subscription / stato → cosa farebbe
//   ?secret=<CRON_SECRET>&appointmentId=<ID>&send=1
//       → invia DAVVERO la mail di reminder per quell'appuntamento, subito
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@aegis/core';
import { sendReminderEmail } from '@/lib/email';
import type { Appointment } from '@aegis/types';

export const dynamic = 'force-dynamic';

interface ApptJoin extends Appointment {
  appointment_services: Array<{ service_name: string }>;
  customers: { user_id: string | null; email: string | null; full_name: string } | null;
  businesses: { name: string; slug: string } | null;
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') ?? '';
  const appointmentId = url.searchParams.get('appointmentId') ?? '';
  const doSend = url.searchParams.get('send') === '1';

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();

  // ── Modalità elenco: nessun appointmentId → mostra i prossimi appuntamenti ──
  if (!appointmentId) {
    const { data: list } = await admin
      .from('appointments')
      .select('id, start_time, status, customers ( full_name, email )')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);

    type UpcomingRow = {
      id: string;
      start_time: string;
      status: string;
      customers: { full_name: string; email: string | null } | { full_name: string; email: string | null }[] | null;
    };

    const rows = (list ?? []) as unknown as UpcomingRow[];
    const upcoming = rows.map((a) => {
      const c = Array.isArray(a.customers) ? a.customers[0] : a.customers;
      return {
        appointmentId: a.id,
        startTime: a.start_time,
        status: a.status,
        customer: c?.full_name ?? null,
        emailOnRow: c?.email ?? null,
      };
    });

    return NextResponse.json({
      upcoming,
      note: 'Copia un appointmentId e richiama con &appointmentId=<ID> per il report. Aggiungi &send=1 per inviare.',
    });
  }

  // ── Modalità report su singolo appuntamento ──
  const { data, error } = await admin
    .from('appointments')
    .select(`*, appointment_services ( service_name ), customers ( user_id, email, full_name ), businesses ( name, slug )`)
    .eq('id', appointmentId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Appuntamento non trovato', detail: error?.message }, { status: 404 });
  }

  const appt = data as unknown as ApptJoin;
  const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
  const business = Array.isArray(appt.businesses) ? appt.businesses[0] : appt.businesses;
  const services = Array.isArray(appt.appointment_services) ? appt.appointment_services : [];
  const serviceName = services[0]?.service_name ?? 'Appuntamento';

  // Email risolta: riga customers oppure account auth (via user_id)
  let resolvedEmail = customer?.email ?? null;
  let authEmail: string | null = null;
  if (customer?.user_id) {
    const { data: authUser } = await admin.auth.admin.getUserById(customer.user_id);
    authEmail = authUser?.user?.email ?? null;
    if (!resolvedEmail) resolvedEmail = authEmail;
  }

  // Quante subscription push ha il cliente?
  let pushSubscriptions = 0;
  if (customer?.user_id) {
    const { count } = await admin
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', customer.user_id);
    pushSubscriptions = count ?? 0;
  }

  const startDate = new Date(appt.start_time);
  const dateLabel = startDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome' });
  const timeLabel = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });

  const report = {
    appointmentId,
    status: appt.status,
    startTime: appt.start_time,
    reminderSentAt: appt.reminder_sent_at,
    serviceName,
    business: business?.name ?? null,
    customer: {
      user_id: customer?.user_id ?? null,
      emailOnRow: customer?.email ?? null,
      authEmail,
      resolvedEmail,
      full_name: customer?.full_name ?? null,
    },
    pushSubscriptions,
    statusIsReminderable: ['confirmed', 'pending'].includes(appt.status),
    wouldSendEmailFallback: pushSubscriptions === 0 && !!resolvedEmail,
  };

  if (!doSend) {
    return NextResponse.json({ report, note: 'Aggiungi &send=1 per inviare DAVVERO la mail di reminder per questo appuntamento.' });
  }

  if (!resolvedEmail || !business) {
    return NextResponse.json({ report, sent: false, error: 'Nessuna email risolvibile o business mancante' }, { status: 400 });
  }

  const ok = await sendReminderEmail(resolvedEmail, customer?.full_name ?? 'Cliente', {
    customerName: customer?.full_name ?? 'Cliente',
    businessName: business.name,
    serviceName,
    date: dateLabel,
    time: timeLabel,
    businessSlug: business.slug,
  });

  return NextResponse.json({ report, sent: ok });
}
