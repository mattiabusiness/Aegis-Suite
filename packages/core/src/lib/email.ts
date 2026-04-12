// ============================================================================
// AEGIS SUITE - EMAIL (ZeptoMail fallback)
// File: packages/core/src/lib/email.ts
// Used only as fallback when client has no push subscription.
// ============================================================================

import { SendMailClient } from 'zeptomail';

// ============================================================================
// TYPES
// ============================================================================

export interface ReminderEmailData {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;   // e.g. "lunedì 14 aprile"
  time: string;   // e.g. "10:30"
  businessSlug: string;
}

export interface EmailFallbackData {
  to: string;
  toName: string;
  type: 'reminder_24h' | 'reminder_1h';
  data: ReminderEmailData;
}

// ============================================================================
// CLIENT FACTORY
// ============================================================================

function getClient(): SendMailClient {
  const apiKey = process.env.ZEPTOMAIL_API_KEY;
  if (!apiKey) throw new Error('[email] ZEPTOMAIL_API_KEY not set');
  return new SendMailClient({ url: 'api.zeptomail.eu/', token: apiKey });
}

// ============================================================================
// SEND HELPERS
// ============================================================================

export async function sendReminderEmail(
  to: string,
  toName: string,
  data: ReminderEmailData
): Promise<boolean> {
  const client = getClient();
  const from = process.env.ZEPTOMAIL_FROM_EMAIL ?? 'noreply@aegisbeauty.app';
  const accountUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aegisbeauty.app'}/${data.businessSlug}/account`;

  try {
    await client.sendMail({
      from: { address: from, name: 'Aegis Beauty' },
      to: [{ email_address: { address: to, name: toName } }],
      subject: `Il tuo appuntamento è domani — ${data.businessName}`,
      htmlbody: buildReminderHtml({
        ...data,
        hoursLabel: '24 ore',
        accountUrl,
      }),
    });
    return true;
  } catch (err) {
    console.error('[email] reminder_24h failed:', err);
    return false;
  }
}

export async function sendReminderHourEmail(
  to: string,
  toName: string,
  data: ReminderEmailData
): Promise<boolean> {
  const client = getClient();
  const from = process.env.ZEPTOMAIL_FROM_EMAIL ?? 'noreply@aegisbeauty.app';
  const accountUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aegisbeauty.app'}/${data.businessSlug}/account`;

  try {
    await client.sendMail({
      from: { address: from, name: 'Aegis Beauty' },
      to: [{ email_address: { address: to, name: toName } }],
      subject: `Fra un'ora da ${data.businessName}`,
      htmlbody: buildReminderHtml({
        ...data,
        hoursLabel: "1 ora",
        accountUrl,
      }),
    });
    return true;
  } catch (err) {
    console.error('[email] reminder_1h failed:', err);
    return false;
  }
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

function buildReminderHtml(opts: ReminderEmailData & { hoursLabel: string; accountUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Promemoria appuntamento</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:28px 32px;text-align:center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:10px;">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span style="color:white;font-size:18px;font-weight:700;vertical-align:middle;">Aegis Beauty</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Promemoria appuntamento</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#f1f5f9;">
                Fra ${opts.hoursLabel} da<br/>${opts.businessName}
              </h1>
              <!-- Appointment card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;color:#a78bfa;">Servizio</p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#f1f5f9;">${opts.serviceName}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#94a3b8;">${opts.date}</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9;">${opts.time}</p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <a href="${opts.accountUrl}" style="display:block;text-align:center;background:#7c3aed;color:#fff;font-size:15px;font-weight:600;padding:14px 24px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
                Vedi il tuo appuntamento
              </a>
              <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
                Hai ricevuto questa email perché hai un appuntamento prenotato tramite Aegis Beauty.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
