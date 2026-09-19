'use client';

import { ACTIVE_EVENT_NAMES, type EventEnvelope, type Phase1EventName } from './types';

const SESSION_KEY = 'khatore_session_id';

/**
 * One session id per browser tab session — used to correlate events
 * without any PII. Not a customer identity; customer_id (when we have
 * one, e.g. after a form submission) is a separate field on the event.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage can throw in locked-down/private browsing contexts —
    // fall back to a per-call id rather than losing the event entirely.
    return crypto.randomUUID();
  }
}

export type TrackPayload = Omit<
  EventEnvelope,
  'event_name' | 'event_version' | 'timestamp' | 'session_id' | 'channel'
>;

/**
 * The ONLY way any component should fire a commercial event. Never call
 * fetch('/api/events', ...) directly from a component — this is the one
 * place the envelope gets assembled, so the contract (Section 10) stays
 * consistent everywhere it's used.
 *
 * Returns a Promise<boolean> so a caller that needs to know the outcome
 * (e.g. the enquiry form, before showing a confirmation) can await it;
 * a caller that doesn't (a WhatsApp/Buy click that's about to navigate
 * away) can just call it without awaiting — fire-and-forget either way.
 *
 * `confirmDelivery`: pass true when the caller actually needs to know
 * the server received it (forms) — this skips sendBeacon (which only
 * confirms the browser queued the send, not server receipt) and uses a
 * real fetch instead. Leave false/default for nav-triggering clicks
 * (whatsapp_click, external_checkout_redirect) where sendBeacon's
 * navigation-survival matters more than a delivery guarantee.
 */
export function trackEvent(
  eventName: Phase1EventName,
  payload: TrackPayload = {},
  options: { confirmDelivery?: boolean } = {},
): Promise<boolean> {
  if (!ACTIVE_EVENT_NAMES.includes(eventName)) {
    // Guards against a future event name being wired up before its
    // phase actually opens (Section 15's boundary, generalized).
    // eslint-disable-next-line no-console
    console.warn(`trackEvent: "${eventName}" is not an active Phase-1 event, dropping.`);
    return Promise.resolve(false);
  }

  const envelope: EventEnvelope = {
    event_name: eventName,
    event_version: 1,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    channel: 'web',
    context: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ...payload,
  };

  const body = JSON.stringify(envelope);

  if (!options.confirmDelivery && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon('/api/events', blob)) {
      return Promise.resolve(true);
    }
  }

  return fetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  })
    .then((res) => res.ok)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('trackEvent failed', err);
      return false;
    });
}
