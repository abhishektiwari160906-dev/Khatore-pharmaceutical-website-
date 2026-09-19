import type { EventEnvelope } from './types';

/**
 * The swap point (Master Build Directive, Section 11): "the future CRM
 * must be able to replace this backend without changing the frontend
 * event model." Nothing outside this file and its implementations
 * should know or care where events actually end up.
 */
export interface EventSink {
  record(event: EventEnvelope): Promise<void>;
}

/**
 * Phase 1 default: structured JSON to the server log. Zero setup, works
 * identically in local dev and on serverless hosting (where a
 * write-to-file sink would NOT reliably work — most serverless
 * platforms, Vercel included, don't guarantee a persistent writable
 * filesystem across invocations). Every event is fully inspectable via
 * the platform's function logs — genuinely "structured JSON/log
 * storage" per Section 11's own suggested options, just without a
 * false promise of durable storage this scaffold can't actually keep
 * without a real database or sheet being provisioned.
 */
export class ConsoleEventSink implements EventSink {
  async record(event: EventEnvelope): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ khatore_commercial_event: event }));
  }
}

/**
 * Optional Phase 1 alternative: post to a Google Sheets Apps Script
 * webhook (Section 11's "controlled Sheet" option) — the closest thing
 * to a human-inspectable table without building a custom admin UI.
 * Inactive unless KHATORE_EVENTS_SHEET_WEBHOOK_URL is set, since
 * creating that webhook requires Khatore's own Google account — not
 * something this scaffold can provision on their behalf.
 */
export class GoogleSheetEventSink implements EventSink {
  constructor(private readonly webhookUrl: string) {}

  async record(event: EventEnvelope): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      throw new Error(`Sheet webhook responded ${res.status}`);
    }
  }
}

/**
 * Fans out to every configured sink so switching backends is additive,
 * not a rewrite — e.g. keep the console sink for debugging while a
 * Sheet or a real CRM sink is added alongside it.
 */
export class FanOutEventSink implements EventSink {
  constructor(private readonly sinks: EventSink[]) {}

  async record(event: EventEnvelope): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.record(event)));
  }
}

export function getConfiguredEventSink(): EventSink {
  const sinks: EventSink[] = [new ConsoleEventSink()];
  const sheetWebhook = process.env.KHATORE_EVENTS_SHEET_WEBHOOK_URL;
  if (sheetWebhook) {
    sinks.push(new GoogleSheetEventSink(sheetWebhook));
  }
  return new FanOutEventSink(sinks);
}
