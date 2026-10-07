import { NextResponse } from 'next/server';
import { validateLead } from '@/lib/leads/validate';
import { getConfiguredLeadStore } from '@/lib/leads/store';
import { getConfiguredNotifier, sendWithRetry, ConsoleNotifier } from '@/lib/notify';
import type { Lead } from '@/lib/leads/types';

export const runtime = 'nodejs';

/**
 * The dedicated lead-capture endpoint (Area 2). Separate from
 * /api/events: a lead is a record Khatore acts on (follow up, export,
 * count in the dashboard), not a fire-and-forget analytics ping -- see
 * lib/leads/types.ts. Validation and spam-checking happen server-side
 * only (lib/leads/validate.ts) -- client-side validation is UX, never
 * the actual gate.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const validated = validateLead((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const lead: Lead = { ...validated.value, submittedAt: new Date().toISOString() };

  try {
    await getConfiguredLeadStore().record(lead);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('lead store failure', err);
    return NextResponse.json({ error: 'failed to record lead' }, { status: 502 });
  }

  // Notify (configurable recipient, retried, flagged if it still fails
  // -- see lib/notify.ts). Never block the lead being recorded on the
  // notification succeeding -- the lead above is already durable-enough
  // (logged either way) even if this fails.
  const notifier = getConfiguredNotifier() ?? new ConsoleNotifier();
  const notifyResult = await sendWithRetry(notifier, {
    subject: `New lead: ${lead.name} (${lead.productInterest ?? 'general enquiry'})`,
    body: `Name: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone ?? '-'}\nCountry: ${lead.country ?? '-'}\nProduct: ${lead.productInterest ?? '-'}\nSource: ${lead.source}\nMessage: ${lead.message}`,
  });

  return NextResponse.json({ ok: true, notified: notifyResult.ok }, { status: 201 });
}
