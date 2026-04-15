// ============================================================================
// AEGIS BEAUTY - GET /api/customers/search
// Async customer search for AppointmentModal — replaces SSR preload of 500 records.
// Auth: session required + must belong to the business.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Get business from session — never trust businessId from client
    const { data: member } = await supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single() as { data: { business_id: string } | null };

    if (!member) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim() ?? '';
    const rawLimit = parseInt(searchParams.get('limit') ?? '50', 10);
    const rawOffset = parseInt(searchParams.get('offset') ?? '0', 10);
    const limit = Math.min(isNaN(rawLimit) ? 50 : rawLimit, 50);
    const offset = Math.max(isNaN(rawOffset) ? 0 : rawOffset, 0);

    let query = supabase
      .from('customers')
      .select('id, full_name, email, phone', { count: 'exact' })
      .eq('business_id', member.business_id)
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (q) {
      // Search by name, phone, or email
      query = query.or(
        `full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`
      );
    }

    const { data, count, error } = await query as unknown as {
      data: Array<{ id: string; full_name: string; email: string | null; phone: string | null }> | null;
      count: number | null;
      error: { message: string } | null;
    };

    if (error) {
      return NextResponse.json({ error: 'Errore ricerca' }, { status: 500 });
    }

    return NextResponse.json({
      customers: (data ?? []).map(c => ({
        id: c.id,
        name: c.full_name,
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
      })),
      total: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
