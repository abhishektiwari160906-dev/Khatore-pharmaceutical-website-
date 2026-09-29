import type { Order } from './types';

/**
 * The order-recording swap point -- same shape as lib/events/sink.ts's
 * EventSink, deliberately: this project has no provisioned database, so
 * "record" means "make the order durably visible to Khatore" (server
 * logs today, optionally also a Google Sheet webhook, same as
 * commercial events), not a query-able datastore. The checkout route
 * returns the full created Order in its response, so the client never
 * needs to read it back from here -- see app/checkout/page.tsx.
 */
export interface OrderStore {
  record(order: Order): Promise<void>;
}

export class ConsoleOrderStore implements OrderStore {
  async record(order: Order): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ khatore_order: order }));
  }
}

/**
 * Optional: posts the order to the same Google Apps Script webhook
 * pattern already used for commercial events (lib/events/sink.ts),
 * under its own env var so it can be pointed at a different sheet/tab
 * than events. Inactive unless KHATORE_ORDERS_SHEET_WEBHOOK_URL is set.
 */
export class GoogleSheetOrderStore implements OrderStore {
  constructor(private readonly webhookUrl: string) {}

  async record(order: Order): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      throw new Error(`Order sheet webhook responded ${res.status}`);
    }
  }
}

export class FanOutOrderStore implements OrderStore {
  constructor(private readonly stores: OrderStore[]) {}

  async record(order: Order): Promise<void> {
    await Promise.all(this.stores.map((store) => store.record(order)));
  }
}

export function getConfiguredOrderStore(): OrderStore {
  const stores: OrderStore[] = [new ConsoleOrderStore()];
  const sheetWebhook = process.env.KHATORE_ORDERS_SHEET_WEBHOOK_URL;
  if (sheetWebhook) {
    stores.push(new GoogleSheetOrderStore(sheetWebhook));
  }
  return new FanOutOrderStore(stores);
}
