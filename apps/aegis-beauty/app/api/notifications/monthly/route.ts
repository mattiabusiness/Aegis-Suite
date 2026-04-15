// ============================================================================
// AEGIS BEAUTY - GET /api/notifications/monthly  (Vercel Cron, 1st of month 09:00)
// Sends monthly summary to gestori and active clients.
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@aegis/core';

export const maxDuration = 60;
import { notify } from '@/lib/notify';
import type { PushPayload } from '@aegis/core';
import type { Business, BusinessMember } from '@aegis/types';

interface AppointmentStatRow {
  total_price: number | null;
  status: string;
}

interface AppointmentCustomerRow {
  customer_id: string;
  customers: { user_id: string | null; full_name: string } | null;
  businesses: { name: string; slug: string } | null;
}

export async function GET(req: Request): Promise<NextResponse> {
  // Security
  const authHeader = req.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET ?? '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use admin client — cron calls have no user session, RLS would block anon queries
  const supabase = createAdminSupabaseClient();

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let sent = 0;
  let errors = 0;

  // ── 1. GESTORI REPORT ─────────────────────────────────────────────────────
  const [{ data: businessRows }, { data: appointmentRows }, { data: ownerRows }] = await Promise.all([
    supabase.from('businesses').select('id, name, slug'),
    supabase
      .from('appointments')
      .select('business_id, total_price, status')
      .gte('start_time', firstOfLastMonth.toISOString())
      .lt('start_time', firstOfThisMonth.toISOString())
      .neq('status', 'cancelled'),
    supabase
      .from('business_members')
      .select('business_id, user_id')
      .eq('role', 'owner')
      .eq('is_active', true),
  ]);

  const businesses = (businessRows ?? []) as Pick<Business, 'id' | 'name' | 'slug'>[];

  // Build lookup maps to avoid N+1
  const statsByBusiness = new Map<string, AppointmentStatRow[]>();
  for (const row of (appointmentRows ?? []) as (AppointmentStatRow & { business_id: string })[]) {
    const list = statsByBusiness.get(row.business_id) ?? [];
    list.push(row);
    statsByBusiness.set(row.business_id, list);
  }
  const ownerByBusiness = new Map<string, string>();
  for (const row of (ownerRows ?? []) as unknown as { business_id: string; user_id: string | null }[]) {
    if (row.user_id) ownerByBusiness.set(row.business_id, row.user_id);
  }

  await Promise.allSettled(businesses.map(async (business) => {
    const ownerId = ownerByBusiness.get(business.id);
    if (!ownerId) return;

    const stats = statsByBusiness.get(business.id) ?? [];
    const totalAppointments = stats.length;
    const revenue = stats.reduce((sum, a) => sum + (a.total_price ?? 0), 0);

    const payload: PushPayload = {
      title: 'Il tuo mese su Aegis Beauty',
      body: `${totalAppointments} appuntamenti · €${revenue.toFixed(0)} di entrate`,
      url: '/dashboard/statistiche',
      actions: [{ action: 'stats', title: 'Vedi statistiche' }],
      tag: `monthly-report-gestore`,
    };

    try {
      await notify(ownerId, payload, supabase);
      sent++;
    } catch (e) {
      console.error(`[monthly] gestore ${business.id} failed:`, e);
      errors++;
    }
  }));

  // ── 2. CLIENTI REPORT ─────────────────────────────────────────────────────
  const { data: customerRows } = await supabase
    .from('appointments')
    .select(`
      customer_id,
      customers ( user_id, full_name ),
      businesses ( name, slug )
    `)
    .gte('start_time', firstOfLastMonth.toISOString())
    .lt('start_time', firstOfThisMonth.toISOString())
    .neq('status', 'cancelled');

  const activeCustomers = (customerRows ?? []) as unknown as AppointmentCustomerRow[];

  // Deduplicate by customer_id, count appointments
  const customerMap = new Map<
    string,
    { userId: string; count: number; businessName: string; businessSlug: string }
  >();

  for (const row of activeCustomers) {
    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
    const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
    if (!customer?.user_id || !business) continue;

    const existing = customerMap.get(row.customer_id);
    if (existing) {
      existing.count++;
    } else {
      customerMap.set(row.customer_id, {
        userId: customer.user_id,
        count: 1,
        businessName: business.name,
        businessSlug: business.slug,
      });
    }
  }

  for (const { userId, count, businessName, businessSlug } of customerMap.values()) {
    const payload: PushPayload = {
      title: `Il tuo mese con ${businessName}`,
      body: `Hai fatto ${count} appuntament${count === 1 ? 'o' : 'i'} questo mese`,
      url: `/${businessSlug}/account`,
      actions: [{ action: 'history', title: 'Vedi storico' }],
      tag: `monthly-report-cliente`,
    };

    try {
      await notify(userId, payload, supabase);
      sent++;
    } catch (e) {
      console.error(`[monthly] cliente ${userId} failed:`, e);
      errors++;
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}
