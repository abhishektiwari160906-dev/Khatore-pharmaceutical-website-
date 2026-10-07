import type { Lead } from './types';

export interface LeadStore {
  record(lead: Lead): Promise<void>;
}

export class ConsoleLeadStore implements LeadStore {
  async record(lead: Lead): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ khatore_lead: lead }));
  }
}

export class GoogleSheetLeadStore implements LeadStore {
  constructor(private readonly webhookUrl: string) {}

  async record(lead: Lead): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error(`Lead sheet webhook responded ${res.status}`);
  }
}

/** Same in-memory, per-instance, capped caveat as lib/events/sink.ts's InMemoryEventSink -- see there for the full explanation. */
const MAX_LEADS = 2000;

export class InMemoryLeadStore implements LeadStore {
  private readonly leads: Lead[] = [];

  async record(lead: Lead): Promise<void> {
    this.leads.push(lead);
    if (this.leads.length > MAX_LEADS) this.leads.shift();
  }

  getAll(): readonly Lead[] {
    return this.leads;
  }
}

export class FanOutLeadStore implements LeadStore {
  constructor(private readonly stores: LeadStore[]) {}

  async record(lead: Lead): Promise<void> {
    await Promise.all(this.stores.map((store) => store.record(lead)));
  }
}

export const inMemoryLeads = new InMemoryLeadStore();

export function getConfiguredLeadStore(): LeadStore {
  const stores: LeadStore[] = [new ConsoleLeadStore(), inMemoryLeads];
  const sheetWebhook = process.env.KHATORE_LEADS_SHEET_WEBHOOK_URL;
  if (sheetWebhook) stores.push(new GoogleSheetLeadStore(sheetWebhook));
  return new FanOutLeadStore(stores);
}
