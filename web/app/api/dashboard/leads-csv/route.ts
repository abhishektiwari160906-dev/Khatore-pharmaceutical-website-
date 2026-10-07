import { NextResponse } from 'next/server';
import { inMemoryLeads } from '@/lib/leads/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/**
 * Gated by middleware.ts the same way /dashboard itself is (same
 * matcher, same Basic Auth check) -- this route is not separately
 * protected here, it relies on that.
 */
export async function GET(): Promise<NextResponse> {
  const leads = inMemoryLeads.getAll();
  const header = ['submittedAt', 'name', 'email', 'phone', 'country', 'productInterest', 'source', 'utmSource', 'utmMedium', 'utmCampaign', 'message'];
  const rows = leads.map((l) =>
    [l.submittedAt, l.name, l.email, l.phone ?? '', l.country ?? '', l.productInterest ?? '', l.source, l.utmSource ?? '', l.utmMedium ?? '', l.utmCampaign ?? '', l.message]
      .map((v) => csvEscape(String(v)))
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="khatore-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
