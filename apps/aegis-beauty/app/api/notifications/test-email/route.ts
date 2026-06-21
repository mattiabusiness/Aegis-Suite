// ============================================================================
// AEGIS BEAUTY - GET /api/notifications/test-email
// Strumento di DIAGNOSI del fallback email (ZeptoMail). Invia una mail subito
// e restituisce l'esito/errore reale, così non bisogna aspettare il cron 24h.
//
// Uso (da browser):
//   /api/notifications/test-email?secret=<CRON_SECRET>            → solo stato env
//   /api/notifications/test-email?secret=<CRON_SECRET>&to=tua@mail → invia + esito
// ============================================================================

import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function safeJson(e: unknown): unknown {
  try { return JSON.parse(JSON.stringify(e)); } catch { return String(e); }
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') ?? '';
  const to = url.searchParams.get('to') ?? '';

  // Protetto col CRON_SECRET: solo chi lo conosce può usarlo (no relay aperto).
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY ?? '';
  const env = {
    hasApiKey: !!rawKey,
    apiKeyHasPrefix: rawKey.trim().startsWith('Zoho-enczapikey'),
    apiKeyLength: rawKey.trim().length,
    fromEmail: process.env.ZEPTOMAIL_FROM_EMAIL?.trim() || '(default) noreply@aegisbeauty.app',
    apiUrl: process.env.ZEPTOMAIL_API_URL?.trim() || '(default) api.zeptomail.eu/',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || '(default) https://aegisbeauty.app',
  };

  if (!to) {
    return NextResponse.json({ env, note: 'Aggiungi &to=tua@mail per inviare un test reale.' });
  }

  try {
    const response = await sendTestEmail(to);
    return NextResponse.json({ env, sent: true, response });
  } catch (e) {
    return NextResponse.json(
      { env, sent: false, error: e instanceof Error ? e.message : String(e), detail: safeJson(e) },
      { status: 500 },
    );
  }
}
