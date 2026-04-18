// ============================================================================
// AEGIS BEAUTY - GET|PATCH /api/notifications/inbox
// GET  — returns the gestore's last 20 in-app notifications
// PATCH — marks notification(s) as read
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase: AnyClient = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, read, type, data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[notifications/inbox] GET error:', error);
    return NextResponse.json([], { status: 200 });
  }

  // Cleanup: delete read notifications older than 30 days (fire-and-forget)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('read', true)
    .lt('created_at', cutoff)
    .then(() => {/* silent */});

  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase: AnyClient = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

  const body = await req.json() as { ids?: string[]; all?: boolean };

  if (body.all) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .in('id', body.ids);
  }

  return NextResponse.json({ ok: true });
}
