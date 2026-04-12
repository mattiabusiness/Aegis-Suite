// ============================================================================
// AEGIS BEAUTY - POST /api/push/subscribe
// Saves a push subscription for the authenticated user.
// ============================================================================

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

interface SubscribeBody {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const supabase = createServerSupabaseClient(await cookies());
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SubscribeBody;
  try {
    body = await req.json() as SubscribeBody;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { endpoint, p256dh, auth_key } = body;
  if (!endpoint || !p256dh || !auth_key) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Get the user's business_id (optional — null for pure customers)
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  // @ts-expect-error — Supabase generic inference doesn't pick up push_subscriptions.Insert
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      business_id: (member as { business_id: string } | null)?.business_id ?? null,
      endpoint,
      p256dh,
      auth_key,
      user_agent: req.headers.get('user-agent') ?? null,
    },
    { onConflict: 'user_id,endpoint' }
  );

  if (error) {
    console.error('[push/subscribe]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
