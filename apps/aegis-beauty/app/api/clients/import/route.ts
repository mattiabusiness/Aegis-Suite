// ============================================================================
// AEGIS BEAUTY - API IMPORT CLIENTS
// File: apps/aegis-beauty/app/api/clients/import/route.ts
//
// Importa clienti da file Excel/CSV già parsato lato client.
// Verifica sessione + ruolo admin/owner prima di procedere.
// business_id sempre dalla sessione, MAI dal body.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import type { ParsedRow } from '@aegis/core';

const BATCH_SIZE = 50;

// ============================================================================
// POST /api/clients/import
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
      .in('role', ['owner', 'admin'])
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'Permessi insufficienti. Solo owner e admin possono importare clienti.' },
        { status: 403 },
      );
    }

    const businessId: string = member.business_id;

    // ── 3. Parse body ────────────────────────────────────────────────────────
    const body = await request.json() as { rows: ParsedRow[]; updateDuplicates: boolean };
    const { rows, updateDuplicates } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Nessuna riga da importare' }, { status: 400 });
    }

    // ── 4. If updateDuplicates=true, fetch existing email/phone ──────────────
    let existingEmails = new Set<string>();
    let existingPhones = new Set<string>();

    if (!updateDuplicates) {
      const { data: existing } = await (supabase as any)
        .from('customers')
        .select('email, phone')
        .eq('business_id', businessId);

      if (existing) {
        existing.forEach((c: { email: string | null; phone: string | null }) => {
          if (c.email) existingEmails.add(c.email.toLowerCase());
          if (c.phone) existingPhones.add(c.phone);
        });
      }
    }

    // ── 5. Prepare rows for insert ───────────────────────────────────────────
    const now = new Date().toISOString();

    const toInsert = rows
      .filter((row) => {
        if (!row.full_name?.trim()) return false;
        if (!updateDuplicates) {
          if (row.email && existingEmails.has(row.email.toLowerCase())) return false;
          if (row.phone && existingPhones.has(row.phone)) return false;
        }
        return true;
      })
      .map((row) => ({
        business_id: businessId,
        full_name: row.full_name.trim(),
        email: row.email?.toLowerCase() || null,
        phone: row.phone || null,
        notes: row.notes || null,
        preferences: row.preferences || null,
        total_appointments: row.total_appointments ?? 0,
        total_spent: row.total_spent ?? 0,
        last_visit_at: row.last_visit_at || null,
        birth_date: row.birth_date || null,
        gender: row.gender || null,
        avatar_url: null,
        tags: null,
        accepts_marketing: false,   // GDPR
        marketing_consent_at: null,
        source: 'import',
        referred_by: null,
        invited_at: null,
        is_active: true,
        user_id: null,
        created_at: now,
        updated_at: now,
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({ success: 0, errors: rows.length, importedIds: [] });
    }

    // ── 6. If updateDuplicates=true, upsert by email/phone; else insert ──────
    let totalSuccess = 0;
    let totalErrors = 0;
    const importedIds: string[] = [];

    // Split into batches
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);

      if (updateDuplicates) {
        // Upsert: if email matches, update — conflict on (business_id, email)
        const { data: upserted, error } = await (supabase as any)
          .from('customers')
          .upsert(batch, {
            onConflict: 'business_id,email',
            ignoreDuplicates: false,
          })
          .select('id');

        if (error) {
          totalErrors += batch.length;
        } else {
          totalSuccess += (upserted ?? []).length;
          (upserted ?? []).forEach((r: { id: string }) => importedIds.push(r.id));
        }
      } else {
        const { data: inserted, error } = await (supabase as any)
          .from('customers')
          .insert(batch)
          .select('id');

        if (error) {
          totalErrors += batch.length;
        } else {
          totalSuccess += (inserted ?? []).length;
          (inserted ?? []).forEach((r: { id: string }) => importedIds.push(r.id));
        }
      }
    }

    return NextResponse.json({
      success: totalSuccess,
      errors: totalErrors,
      importedIds,
    });
  } catch (err) {
    console.error('[/api/clients/import] Error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
