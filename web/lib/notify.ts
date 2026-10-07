/**
 * Minimal notification layer for Area 2 (lead/order alerts). Same
 * "swap point" pattern as lib/events/sink.ts and lib/order/store.ts --
 * nothing outside this file should know HOW a notification is sent.
 *
 * Today: ConsoleNotifier always works (visible in server logs).
 * ResendEmailNotifier is a real implementation, active only when
 * RESEND_API_KEY + KHATORE_NOTIFY_EMAIL_TO are both set -- neither is
 * set in this environment, so email sending here is PARTIAL (the HTTP
 * call is real and correctly shaped, but has never been run against a
 * real Resend account in this environment -- see STATUS.md).
 */

export interface Notification {
  subject: string;
  body: string;
}

export interface NotifyResult {
  ok: boolean;
  attempts: number;
  error?: string;
}

export interface Notifier {
  send(notification: Notification): Promise<{ ok: boolean; error?: string }>;
}

export class ConsoleNotifier implements Notifier {
  async send(notification: Notification): Promise<{ ok: boolean }> {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ khatore_notification: notification }));
    return { ok: true };
  }
}

export class ResendEmailNotifier implements Notifier {
  constructor(
    private readonly apiKey: string,
    private readonly to: string,
    private readonly from = 'Khatore Website <onboarding@resend.dev>',
  ) {}

  async send(notification: Notification): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: this.from,
          to: [this.to],
          subject: notification.subject,
          text: notification.body,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, error: `Resend responded ${res.status}: ${text}`.slice(0, 300) };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

/**
 * Pure retry policy -- no timers, no real I/O -- the caller supplies a
 * `send` function and this just governs attempts/backoff math, so it's
 * fully unit-testable with a fake send() that fails N times.
 */
export async function sendWithRetry(
  notifier: Notifier,
  notification: Notification,
  opts: { maxAttempts?: number; delayMs?: (attempt: number) => number } = {},
): Promise<NotifyResult> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const delayMs = opts.delayMs ?? ((attempt: number) => attempt * 200);
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await notifier.send(notification);
    if (result.ok) return { ok: true, attempts: attempt };
    lastError = result.error;
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs(attempt)));
    }
  }

  // Flagged, not silently dropped: a record that exhausts retries is
  // logged as its own loud, greppable event so a human can catch it --
  // there is no database in this repo to set a `notified: false` flag
  // on in place (see STATUS.md, Area 2).
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ khatore_notification_failed: { notification, attempts: maxAttempts, lastError } }));
  return { ok: false, attempts: maxAttempts, error: lastError };
}

export function getConfiguredNotifier(): Notifier | null {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.KHATORE_NOTIFY_EMAIL_TO;
  if (!apiKey || !to) return null;
  return new ResendEmailNotifier(apiKey, to);
}
