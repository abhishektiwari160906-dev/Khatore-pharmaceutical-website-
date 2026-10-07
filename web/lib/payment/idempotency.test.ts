import { describe, it, expect } from 'vitest';
import { shouldProcessEvent, InMemorySeenEventStore } from './idempotency';

describe('shouldProcessEvent (pure)', () => {
  it('processes an event id not seen before', () => {
    expect(shouldProcessEvent(new Set(), 'pay_1')).toBe(true);
  });

  it('does not reprocess an event id already seen', () => {
    expect(shouldProcessEvent(new Set(['pay_1']), 'pay_1')).toBe(false);
  });

  it('processes when there is no event id to dedupe on', () => {
    expect(shouldProcessEvent(new Set(['pay_1']), '')).toBe(true);
  });
});

describe('InMemorySeenEventStore', () => {
  it('marks an event seen and then reports it as seen', async () => {
    const store = new InMemorySeenEventStore();
    expect(await store.has('pay_1')).toBe(false);
    await store.markSeen('pay_1');
    expect(await store.has('pay_1')).toBe(true);
  });

  it('simulates a gateway retry: the same webhook delivered twice is only processed once', async () => {
    const store = new InMemorySeenEventStore();
    const processed: string[] = [];

    async function handleWebhook(eventId: string) {
      if (await store.has(eventId)) return; // retry -- already processed
      processed.push(eventId);
      await store.markSeen(eventId);
    }

    await handleWebhook('pay_abc');
    await handleWebhook('pay_abc'); // gateway retries the same delivery
    await handleWebhook('pay_def');

    expect(processed).toEqual(['pay_abc', 'pay_def']);
  });
});
