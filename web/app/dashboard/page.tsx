import { inMemoryEvents } from '@/lib/events/sink';
import { inMemoryLeads } from '@/lib/leads/store';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export default function DashboardPage() {
  const events = inMemoryEvents.getAll();
  const leads = inMemoryLeads.getAll();

  const eventsByDay = new Map<string, number>();
  for (const e of events) {
    const k = dayKey(e.timestamp);
    eventsByDay.set(k, (eventsByDay.get(k) ?? 0) + 1);
  }
  const eventsByDaySorted = [...eventsByDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const countryCounts = new Map<string, number>();
  for (const l of leads) {
    const c = l.country ?? 'Unknown';
    countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }
  const topCountries = [...countryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const sourceCounts = new Map<string, number>();
  for (const l of leads) {
    const s = l.utmSource ?? l.source ?? 'direct';
    sourceCounts.set(s, (sourceCounts.get(s) ?? 0) + 1);
  }
  const topSources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const enquiryCount = events.filter((e) => e.event_name === 'enquiry_submitted' || e.event_name === 'contact_form_submitted').length;
  const checkoutStartedCount = events.filter((e) => e.event_name === 'checkout_started').length;
  const orderPlacedCount = events.filter((e) => e.event_name === 'order_placed').length;

  const eventCountsByName = new Map<string, number>();
  for (const e of events) eventCountsByName.set(e.event_name, (eventCountsByName.get(e.event_name) ?? 0) + 1);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Khatore Website — Activity Dashboard</h1>
      <p className={styles.subtitle}>Internal only. Reads the current server process's in-memory event/lead log.</p>

      <div className={styles.noteBox}>
        <strong>What this can tell you right now:</strong> event counts and leads captured since this server process
        last started, broken down by day/country/source, and the enquiry → checkout funnel for Phase-1 events.
        <br />
        <strong>What it cannot tell you yet:</strong> anything from before the last restart/redeploy (there is no
        database behind this — see STATUS.md), anything across multiple server instances, or revenue/CRM data (no
        gateway or CRM is connected).
      </div>

      <section className={styles.section}>
        <h2>Leads ({leads.length})</h2>
        <a className={styles.exportLink} href="/api/dashboard/leads-csv">Export CSV →</a>
        <table className={styles.table}>
          <thead>
            <tr><th>When</th><th>Name</th><th>Email</th><th>Country</th><th>Product</th><th>Source</th></tr>
          </thead>
          <tbody>
            {leads.slice(-25).reverse().map((l, i) => (
              <tr key={i}>
                <td>{l.submittedAt}</td>
                <td>{l.name}</td>
                <td>{l.email}</td>
                <td>{l.country ?? '—'}</td>
                <td>{l.productInterest ?? '—'}</td>
                <td>{l.utmSource ?? l.source}</td>
              </tr>
            ))}
            {leads.length === 0 ? <tr><td colSpan={6} className={styles.empty}>No leads captured yet this session.</td></tr> : null}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Events per day</h2>
        <table className={styles.table}>
          <thead><tr><th>Day</th><th>Count</th></tr></thead>
          <tbody>
            {eventsByDaySorted.map(([day, count]) => (
              <tr key={day}><td>{day}</td><td>{count}</td></tr>
            ))}
            {eventsByDaySorted.length === 0 ? <tr><td colSpan={2} className={styles.empty}>No events yet this session.</td></tr> : null}
          </tbody>
        </table>
      </section>

      <div className={styles.grid2}>
        <section className={styles.section}>
          <h2>Top countries (leads)</h2>
          <table className={styles.table}>
            <thead><tr><th>Country</th><th>Leads</th></tr></thead>
            <tbody>
              {topCountries.map(([c, n]) => <tr key={c}><td>{c}</td><td>{n}</td></tr>)}
              {topCountries.length === 0 ? <tr><td colSpan={2} className={styles.empty}>—</td></tr> : null}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>Top sources (leads)</h2>
          <table className={styles.table}>
            <thead><tr><th>Source</th><th>Leads</th></tr></thead>
            <tbody>
              {topSources.map(([s, n]) => <tr key={s}><td>{s}</td><td>{n}</td></tr>)}
              {topSources.length === 0 ? <tr><td colSpan={2} className={styles.empty}>—</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>

      <section className={styles.section}>
        <h2>Enquiry → Checkout funnel</h2>
        <table className={styles.table}>
          <thead><tr><th>Step</th><th>Count</th></tr></thead>
          <tbody>
            <tr><td>Enquiries submitted</td><td>{enquiryCount}</td></tr>
            <tr><td>Checkouts started</td><td>{checkoutStartedCount}</td></tr>
            <tr><td>Orders placed</td><td>{orderPlacedCount}</td></tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>All event types (this session)</h2>
        <table className={styles.table}>
          <thead><tr><th>Event</th><th>Count</th></tr></thead>
          <tbody>
            {[...eventCountsByName.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => (
              <tr key={name}><td>{name}</td><td>{n}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
