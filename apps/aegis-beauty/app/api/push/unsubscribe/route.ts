// ============================================================================
// AEGIS BEAUTY - DELETE /api/push/unsubscribe
// Removes the push subscription for the authenticated user.
// ============================================================================

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

interface UnsubscribeBody {
  endpoint: string;
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const supabase = createServerSupabaseClient(await cookies());
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UnsubscribeBody;
  try {
    body = await req.json() as UnsubscribeBody;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { endpoint } = body;
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[push/unsubscribe]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
