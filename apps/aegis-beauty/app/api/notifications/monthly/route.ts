// ============================================================================
// AEGIS BEAUTY - GET /api/notifications/monthly  (Vercel Cron, 1st of month 09:00)
// Sends monthly summary to gestori and active clients.
// ============================================================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@aegis/core';
import { notify } from '@/lib/notify';
import type { PushPayload } from '@aegis/core';
import { cookies } from 'next/headers';
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
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServerSupabaseClient(await cookies());

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let sent = 0;
  let errors = 0;

  // ── 1. GESTORI REPORT ─────────────────────────────────────────────────────
  const { data: businessRows } = await supabase
    .from('businesses')
    .select('id, name, slug');

  const businesses = (businessRows ?? []) as Pick<Business, 'id' | 'name' | 'slug'>[];

  for (const business of businesses) {
    const { data: statsRows } = await supabase
      .from('appointments')
      .select('total_price, status')
      .eq('business_id', business.id)
      .gte('start_time', firstOfLastMonth.toISOString())
      .lt('start_time', firstOfThisMonth.toISOString())
      .neq('status', 'cancelled');

    const stats = (statsRows ?? []) as AppointmentStatRow[];
    const totalAppointments = stats.length;
    const revenue = stats.reduce((sum, a) => sum + (a.total_price ?? 0), 0);

    const { data: ownerRow } = await supabase
      .from('business_members')
      .select('user_id')
      .eq('business_id', business.id)
      .eq('role', 'owner')
      .eq('is_active', true)
      .single();

    const owner = ownerRow as Pick<BusinessMember, 'user_id'> | null;
    if (!owner?.user_id) continue;

    const payload: PushPayload = {
      title: 'Il tuo mese su Aegis Beauty',
      body: `${totalAppointments} appuntamenti · €${revenue.toFixed(0)} di entrate`,
      url: '/dashboard/statistiche',
      actions: [{ action: 'stats', title: 'Vedi statistiche' }],
      tag: `monthly-report-gestore`,
    };

    try {
      await notify(owner.user_id, payload, supabase);
      sent++;
    } catch (e) {
      console.error(`[monthly] gestore ${business.id} failed:`, e);
      errors++;
    }
  }

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
