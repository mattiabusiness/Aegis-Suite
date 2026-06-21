// ============================================================================
// AEGIS BEAUTY - GET /api/notifications/reminder  (Vercel Cron, every 15 min)
// Sends 24h and 1h reminders for upcoming appointments.
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@aegis/core';
import { notify } from '@/lib/notify';
import type { EmailFallbackData } from '@/lib/email';
import type { PushPayload } from '@aegis/core';
import type { Appointment } from '@aegis/types';

// Window half-widths in minutes
const WINDOW_24H_CENTER = 24 * 60;
const WINDOW_1H_CENTER = 60;
const HALF_WINDOW = 1; // ±1 min (cron runs every minute)

// Typed shape returned by the join query
interface AppointmentReminder extends Appointment {
  appointment_services: Array<{ service_name: string }>;
  customers: { user_id: string | null; email: string | null; full_name: string } | null;
  businesses: { name: string; slug: string } | null;
}

// pg_net sends POST — same logic, shared handler
export async function POST(req: Request): Promise<NextResponse> {
  return GET(req);
}

export async function GET(req: Request): Promise<NextResponse> {
  // Security: only allow Vercel Cron or internal calls
  const authHeader = req.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET ?? '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use admin client — cron calls have no user session, RLS would block anon queries
  const supabase = createAdminSupabaseClient();

  const now = new Date();

  function windowFor(minutesFromNow: number): { from: string; to: string } {
    const center = new Date(now.getTime() + minutesFromNow * 60_000);
    return {
      from: new Date(center.getTime() - HALF_WINDOW * 60_000).toISOString(),
      to: new Date(center.getTime() + HALF_WINDOW * 60_000).toISOString(),
    };
  }

  const allWindows = [
    { type: '24h' as const, ...windowFor(WINDOW_24H_CENTER) },
    { type: '1h' as const, ...windowFor(WINDOW_1H_CENTER) },
  ];

  let sent = 0;
  let errors = 0;

  for (const { type, from, to } of allWindows) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        appointment_services ( service_name ),
        customers ( user_id, email, full_name ),
        businesses ( name, slug )
      `)
      .gte('start_time', from)
      .lte('start_time', to)
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error(`[reminder/${type}] query error:`, error);
      errors++;
      continue;
    }

    const appointments = (data ?? []) as unknown as AppointmentReminder[];

    for (const appt of appointments) {
      // Avoid double-sending: skip if already reminded within last 2 hours
      if (appt.reminder_sent_at) {
        const sentAt = new Date(appt.reminder_sent_at).getTime();
        if (Date.now() - sentAt < 2 * 60 * 60_000) continue;
      }

      const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
      const business = Array.isArray(appt.businesses) ? appt.businesses[0] : appt.businesses;
      const services = Array.isArray(appt.appointment_services) ? appt.appointment_services : [];

      if (!customer?.user_id || !business) continue;

      const serviceName = services[0]?.service_name ?? 'Appuntamento';
      const startDate = new Date(appt.start_time);
      const dateLabel = startDate.toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome',
      });
      const timeLabel = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });

      // Link "Aggiungi al calendario" (Google Calendar) per l'azione della notifica 24h.
      // Date in UTC compatto YYYYMMDDTHHMMSSZ — Google le converte nel fuso dell'utente.
      const toGcal = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const calText = encodeURIComponent(`${serviceName} — ${business.name}`);
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calText}&dates=${toGcal(appt.start_time)}/${toGcal(appt.end_time)}`;

      const payload: PushPayload = type === '24h'
        ? {
            title: 'Il tuo appuntamento è domani',
            body: `${serviceName} alle ${timeLabel} da ${business.name}`,
            url: `/${business.slug}/account`,
            calendarUrl,
            actions: [
              { action: 'view', title: 'Vedi' },
              { action: 'calendar', title: 'Aggiungi al calendario' },
            ],
            tag: `reminder-24h-${appt.id}`,
          }
        : {
            title: `Fra un'ora da ${business.name}`,
            body: `${serviceName} alle ${timeLabel} — ti aspettiamo`,
            url: `/${business.slug}/account`,
            actions: [{ action: 'view', title: 'Vedi dettagli' }],
            tag: `reminder-1h-${appt.id}`,
          };

      // Email fallback SOLO per il promemoria 24h (se il cliente non ha il push attivo).
      // Per l'1h niente email: il push basta, così risparmiamo invii ZeptoMail.
      // Se la riga `customers` non ha email, la recuperiamo dall'account registrato
      // (auth) via user_id → così il fallback parte SEMPRE per un cliente loggato.
      let recipientEmail = customer.email;
      if (type === '24h' && !recipientEmail) {
        const { data: authUser } = await supabase.auth.admin.getUserById(customer.user_id);
        recipientEmail = authUser?.user?.email ?? null;
      }

      const emailFallback: EmailFallbackData | undefined = (type === '24h' && recipientEmail)
        ? {
            to: recipientEmail,
            toName: customer.full_name ?? 'Cliente',
            type: 'reminder_24h',
            data: {
              customerName: customer.full_name ?? 'Cliente',
              businessName: business.name,
              serviceName,
              date: dateLabel,
              time: timeLabel,
              businessSlug: business.slug,
            },
          }
        : undefined;

      try {
        await notify(customer.user_id, payload, supabase, emailFallback);

        // Mark reminder as sent
        // @ts-expect-error — Supabase generic inference can't resolve Appointment['Update'] here
        await supabase.from('appointments').update({ reminder_sent_at: new Date().toISOString() }).eq('id', appt.id);

        sent++;
      } catch (e) {
        console.error(`[reminder/${type}] notify failed for appt ${appt.id}:`, e);
        errors++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}
