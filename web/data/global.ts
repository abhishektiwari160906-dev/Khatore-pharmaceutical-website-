/**
 * Confirmed by the client (Mr. Vijay), 2026-09-24 — 1M+/30+ updated to
 * 5M/100+ per that confirmation. Prep-branch change only; not deployed
 * to the locked review build. See also data/heritage.ts's "Today" entry,
 * which states the same figures in prose and was updated to match.
 */
export const GLOBAL_STATS = [
  { n: '5M', l: 'Patients benefited' },
  { n: '100+', l: 'Countries served' },
  { n: '40+', l: 'Years of practice' },
];

export const GLOBAL_PRESENCE: { region: string; countries: string[] }[] = [
  {
    region: 'South Asia & Middle East',
    countries: ['India', 'United Arab Emirates', 'Sri Lanka', 'Nepal', 'Bangladesh'],
  },
  { region: 'Africa', countries: ['Nigeria', 'South Africa', 'Ghana', 'Kenya', 'Tanzania'] },
  { region: 'Europe & Americas', countries: ['United Kingdom', 'United States', 'Canada', 'Netherlands', 'Germany'] },
  { region: 'Asia-Pacific', countries: ['Australia', 'Malaysia', 'Singapore', 'Mauritius'] },
];

export const GLOBAL_DATA_CAVEAT = 'Country data to be confirmed by Khatore.';
