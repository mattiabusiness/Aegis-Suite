// ============================================================================
// AEGIS BEAUTY - GET /api/ics
// Genera un file .ics dell'appuntamento con PROMEMORIA incorporati (24h + 3h).
// Aprendo il link: iPhone → schermata nativa "Aggiungi al Calendario",
// Android → app Calendario, desktop → scarica/apre nel calendario di default.
// Tutto preimpostato e responsive su ogni dispositivo.
//
// Query: ?title=&start=YYYYMMDDTHHMMSSZ&end=YYYYMMDDTHHMMSSZ&details=&uid=
// ============================================================================

export const dynamic = 'force-dynamic';

// Escape per i valori di testo ICS (RFC 5545): \ ; , e newline.
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function nowStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const title = url.searchParams.get('title') || 'Appuntamento';
  const start = url.searchParams.get('start') || '';
  const end = url.searchParams.get('end') || '';
  const details = url.searchParams.get('details') || '';
  const uid = url.searchParams.get('uid') || `${Date.now()}@aegisbeauty.app`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AegisBeauty//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${esc(uid)}`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(title)}`,
    details ? `DESCRIPTION:${esc(details)}` : '',
    // Promemoria 24 ore prima
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Promemoria appuntamento',
    'END:VALARM',
    // Promemoria 3 ore prima
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Promemoria appuntamento',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="appuntamento.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
