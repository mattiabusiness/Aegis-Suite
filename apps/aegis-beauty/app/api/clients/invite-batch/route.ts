// ============================================================================
// AEGIS BEAUTY - API INVITE BATCH CLIENTS
// File: apps/aegis-beauty/app/api/clients/invite-batch/route.ts
//
// Invia inviti email di benvenuto ai clienti importati.
// STUB: aggiorna invited_at nel DB e logga gli inviti.
// Struttura pronta per aggiungere chiamata Resend in P3.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

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
      return NextResponse.json(
        { error: 'Permessi insufficienti.' },
        { status: 403 },
      );
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

    // ── 4. Verify customers belong to this business and have email ───────────
    const { data: customers, error: fetchError } = await (supabase as any)
      .from('customers')
      .select('id, full_name, email')
      .eq('business_id', businessId)          // RLS: solo clienti del business
      .in('id', customerIds)
      .not('email', 'is', null);              // Solo quelli con email

    if (fetchError) {
      console.error('[/api/clients/invite-batch] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Errore nel recupero clienti' }, { status: 500 });
    }

    const validCustomers: Array<{ id: string; full_name: string; email: string }> =
      customers ?? [];

    if (validCustomers.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    // ── 5. Update invited_at in DB ───────────────────────────────────────────
    const invitedAt = new Date().toISOString();
    const validIds = validCustomers.map((c) => c.id);

    const { error: updateError } = await (supabase as any)
      .from('customers')
      .update({ invited_at: invitedAt, updated_at: invitedAt })
      .in('id', validIds)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('[/api/clients/invite-batch] Update error:', updateError);
    }

    // ── 6. STUB: Log inviti (sostituire con Resend in P3) ───────────────────
    //
    // TODO P3: Replace with Resend email sending
    //
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // for (const customer of validCustomers) {
    //   await resend.emails.send({
    //     from: 'Aegis Beauty <noreply@aegisbeauty.it>',
    //     to: customer.email,
    //     subject: 'Sei stato invitato su Aegis Beauty',
    //     react: WelcomeEmailTemplate({ customerName: customer.full_name }),
    //   });
    // }
    //
    console.log(
      `[invite-batch] Stub: ${validCustomers.length} inviti da inviare per business ${businessId}:`,
      validCustomers.map((c) => `${c.full_name} <${c.email}>`),
    );

    const failed = customerIds.length - validCustomers.length;

    return NextResponse.json({
      sent: validCustomers.length,
      failed,
    });
  } catch (err) {
    console.error('[/api/clients/invite-batch] Error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
