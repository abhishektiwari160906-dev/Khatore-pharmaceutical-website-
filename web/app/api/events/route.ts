import { NextResponse } from 'next/server';
import { ACTIVE_EVENT_NAMES, type EventEnvelope } from '@/lib/events/types';
import { getConfiguredEventSink } from '@/lib/events/sink';

export const runtime = 'nodejs';

function isValidEnvelope(body: unknown): body is EventEnvelope {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.event_name === 'string' &&
    (ACTIVE_EVENT_NAMES as readonly string[]).includes(b.event_name) &&
    b.event_version === 1 &&
    typeof b.timestamp === 'string' &&
    typeof b.session_id === 'string' &&
    b.channel === 'web'
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!isValidEnvelope(body)) {
    // Reject anything that doesn't match the Phase-1 event contract —
    // this endpoint only accepts the five active events (Section 10);
    // future events stay schema-only until explicitly turned on.
    return NextResponse.json({ error: 'invalid event envelope' }, { status: 400 });
  }

  try {
    await getConfiguredEventSink().record(body);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('event sink failure', err);
    return NextResponse.json({ error: 'sink failure' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
