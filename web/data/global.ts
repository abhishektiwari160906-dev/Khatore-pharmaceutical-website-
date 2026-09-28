/**
 * Patient/country figures updated 2026-09-28 per Khatore's confirmed
 * revision: patient figure corrected from 5M+ to 3M+ (estimated), the
 * 100+ countries figure (set 2026-09-24) is unchanged. The "40+ years"
 * heritage figure is unchanged -- still supported by the founding year
 * in data/heritage.ts (1984).
 */
export const GLOBAL_STATS = [
  { n: '3M+', l: 'Estimated patients benefitted' },
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
