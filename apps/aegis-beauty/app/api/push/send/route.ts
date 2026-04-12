// ============================================================================
// AEGIS BEAUTY - POST /api/push/send  (internal, service role only)
// Sends a push notification to a user, with optional email fallback.
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@aegis/core';
import type { PushPayload } from '@aegis/core';
import { notify } from '@/lib/notify';
import type { EmailFallbackData } from '@/lib/email';

interface SendBody {
  userId: string;
  payload: PushPayload;
  emailFallback?: EmailFallbackData;
}

export async function POST(req: Request): Promise<NextResponse> {
  // Guard: only allow service role (internal calls)
  const authHeader = req.headers.get('authorization') ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: SendBody;
  try {
    body = await req.json() as SendBody;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { userId, payload, emailFallback } = body;
  if (!userId || !payload) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = createClient();
  await notify(userId, payload, supabase, emailFallback);

  return NextResponse.json({ ok: true });
}
