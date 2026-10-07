/**
 * Idempotent webhook processing (gateways retry delivery on any
 * non-200 or timeout, so the same event can arrive more than once).
 * `shouldProcessEvent` is pure -- no I/O -- so it's fully unit-testable
 * without a real gateway or a real database.
 *
 * `InMemorySeenEventStore` is the only implementation today because
 * this repo has no database (see STATUS.md, Area 2) -- it is NOT
 * durable across a serverless cold start or multiple instances. That
 * is a real gap, stated here rather than hidden: production needs a
 * real store (even a single DB row with a unique constraint on
 * eventId would do) before this is safe against a gateway's retries
 * surviving a redeploy.
 */

export interface SeenEventStore {
  has(eventId: string): Promise<boolean>;
  markSeen(eventId: string): Promise<void>;
}

export class InMemorySeenEventStore implements SeenEventStore {
  private readonly seen = new Set<string>();

  async has(eventId: string): Promise<boolean> {
    return this.seen.has(eventId);
  }

  async markSeen(eventId: string): Promise<void> {
    this.seen.add(eventId);
  }
}

/**
 * Pure decision function: given the set of event ids already
 * processed and a new event id, should this event be processed now?
 * Kept separate from the store so it can be unit-tested with a plain
 * array/Set, no async store needed.
 */
export function shouldProcessEvent(alreadySeen: ReadonlySet<string>, eventId: string): boolean {
  if (!eventId) return true; // no id to dedupe on -- process it, can't do better
  return !alreadySeen.has(eventId);
}

// A single process-lifetime store, shared by the webhook route. See the
// durability caveat on InMemorySeenEventStore above.
export const seenPaymentEvents = new InMemorySeenEventStore();
