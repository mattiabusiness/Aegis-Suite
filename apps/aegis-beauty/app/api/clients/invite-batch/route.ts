// ============================================================================
// AEGIS BEAUTY - API INVITE BATCH CLIENTS
// File: apps/aegis-beauty/app/api/clients/invite-batch/route.ts
//
// Invia inviti Supabase ai clienti importati (singolo o batch).
// Stessa logica di /api/appointments/create → inviteUserByEmail.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser, createAdminSupabaseClient } from '@aegis/core';

// ============================================================================
// POST /api/clients/invite-batch
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore) as ReturnType<typeof createServerSupabaseClient>;

    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const user = await getCurrentUser(supabase as Parameters<typeof getCurrentUser>[0]);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // ── 2. Get business_id + verify role ────────────────────────────────────
    const { data: member } = await (supabase as any)
      .from('business_members')
      .select('business_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('role', ['owner', 'admin', 'staff'])
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Permessi insufficienti.' }, { status: 403 });
    }

    const businessId: string = member.business_id;

    // ── 3. Parse body ────────────────────────────────────────────────────────
    const body = await request.json() as { customerIds: string[] };
    const { customerIds } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: 'Nessun cliente specificato' }, { status: 400 });
    }
    if (customerIds.length > 500) {
      return NextResponse.json({ error: 'Massimo 500 clienti per batch' }, { status: 400 });
    }

    // ── 4. Fetch business info (needed for invite metadata) ──────────────────
    const admin = createAdminSupabaseClient() as any;

    const { data: business } = await admin
      .from('businesses')
      .select('name, slug')
      .eq('id', businessId)
      .single();

    // ── 5. Fetch customers — only those with email and not yet registered ─────
    const { data: customers, error: fetchError } = await (supabase as any)
      .from('customers')
      .select('id, full_name, email, phone')
      .eq('business_id', businessId)
      .in('id', customerIds)
      .not('email', 'is', null)
      .is('user_id', null);  // Skip already-registered customers

    if (fetchError) {
      console.error('[invite-batch] fetch error:', fetchError);
      return NextResponse.json({ error: 'Errore nel recupero clienti' }, { status: 500 });
    }

    const validCustomers: Array<{ id: string; full_name: string; email: string; phone: string | null }> =
      customers ?? [];

    if (validCustomers.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    // ── 6. Send invites via Supabase inviteUserByEmail (10 concurrent) ───────
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://aegisbeauty.app';
    const redirectTo = `${appUrl}/auth/callback?type=invite`;
    const CONCURRENCY = 10;

    let sent = 0;
    let failed = 0;
    const invitedIds: string[] = [];

    for (let i = 0; i < validCustomers.length; i += CONCURRENCY) {
      const batch = validCustomers.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(async (customer) => {
        try {
          const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
            customer.email.toLowerCase(),
            {
              data: {
                full_name: customer.full_name,
                phone: customer.phone || '',
                invited_by_business: businessId,
                business_name: business?.name || '',
                business_slug: business?.slug || '',
                customer_id: customer.id,
              },
              redirectTo,
            }
          );
          if (inviteError) {
            console.error(`[invite-batch] invite error for ${customer.email}:`, inviteError);
            failed++;
          } else {
            sent++;
            invitedIds.push(customer.id);
          }
        } catch (err) {
          console.error(`[invite-batch] unexpected error for ${customer.email}:`, err);
          failed++;
        }
      }));
      // Small pause between batches to respect Supabase rate limits
      if (i + CONCURRENCY < validCustomers.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // ── 7. Update invited_at only for successful sends ───────────────────────
    if (invitedIds.length > 0) {
      const invitedAt = new Date().toISOString();
      await (supabase as any)
        .from('customers')
        .update({ invited_at: invitedAt, updated_at: invitedAt })
        .in('id', invitedIds)
        .eq('business_id', businessId);
    }

    const skipped = customerIds.length - validCustomers.length;
    return NextResponse.json({ sent, failed, skipped });

  } catch (err) {
    console.error('[invite-batch] Error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
