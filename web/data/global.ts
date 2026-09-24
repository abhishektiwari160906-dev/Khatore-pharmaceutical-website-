/**
 * Patient/country figures updated 2026-09-24 per Khatore/Mr. Vijay's
 * explicit confirmed direction (1M+ -> 5M+, 30+ -> 100+ countries),
 * carried over from the isolated prep-branch scaffolding where this
 * was first verified. The "40+ years" heritage figure is unchanged --
 * still supported by the founding year in data/heritage.ts (1984).
 */
export const GLOBAL_STATS = [
  { n: '5M+', l: 'Patients benefited' },
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
