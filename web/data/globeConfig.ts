/**
 * Data structure for the future interactive 3D globe (post-review
 * rebuild). Rendering must read from this file — never hardcode a
 * country name, coordinate, or status inline in the globe component.
 *
 * Seeded from the same 18 countries already approved in
 * data/global.ts's GLOBAL_PRESENCE list (nothing new added). Lat/lng
 * are real country centroids — objective geography, not client data,
 * safe to include without separate approval. `patientCount` stays
 * `null` for every entry: no client has supplied a real per-country
 * number, so every country renders the neutral approved status line
 * instead of a fabricated figure (Master Brief: "do not fabricate
 * patient counts").
 *
 * When Mr. Vijay supplies real per-country numbers, set patientCount
 * and the component should prefer it over `label` automatically.
 */

export type PresenceStatus = 'origin' | 'active';

export interface GlobeCountry {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: PresenceStatus;
  /** Real aggregate count, only when Khatore has approved one. Never invented. */
  patientCount: number | null;
  /** Shown when patientCount is null — a neutral, approved-safe status line. */
  label: string;
}

const DEFAULT_LABEL = 'Patient presence established';

export const GLOBE_COUNTRIES: GlobeCountry[] = [
  // South Asia & Middle East
  { code: 'IN', name: 'India', region: 'South Asia & Middle East', lat: 20.59, lng: 78.96, status: 'origin', patientCount: null, label: DEFAULT_LABEL },
  { code: 'AE', name: 'United Arab Emirates', region: 'South Asia & Middle East', lat: 23.42, lng: 53.85, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'LK', name: 'Sri Lanka', region: 'South Asia & Middle East', lat: 7.87, lng: 80.77, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'NP', name: 'Nepal', region: 'South Asia & Middle East', lat: 28.39, lng: 84.12, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'BD', name: 'Bangladesh', region: 'South Asia & Middle East', lat: 23.68, lng: 90.36, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  // Africa
  { code: 'NG', name: 'Nigeria', region: 'Africa', lat: 9.08, lng: 8.68, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'ZA', name: 'South Africa', region: 'Africa', lat: -30.56, lng: 22.94, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'GH', name: 'Ghana', region: 'Africa', lat: 7.95, lng: -1.02, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'KE', name: 'Kenya', region: 'Africa', lat: -0.02, lng: 37.91, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'TZ', name: 'Tanzania', region: 'Africa', lat: -6.37, lng: 34.89, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  // Europe & Americas
  { code: 'GB', name: 'United Kingdom', region: 'Europe & Americas', lat: 55.38, lng: -3.44, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'US', name: 'United States', region: 'Europe & Americas', lat: 37.09, lng: -95.71, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'CA', name: 'Canada', region: 'Europe & Americas', lat: 56.13, lng: -106.35, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'NL', name: 'Netherlands', region: 'Europe & Americas', lat: 52.13, lng: 5.29, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'DE', name: 'Germany', region: 'Europe & Americas', lat: 51.17, lng: 10.45, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  // Asia-Pacific
  { code: 'AU', name: 'Australia', region: 'Asia-Pacific', lat: -25.27, lng: 133.78, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'MY', name: 'Malaysia', region: 'Asia-Pacific', lat: 4.21, lng: 101.98, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'SG', name: 'Singapore', region: 'Asia-Pacific', lat: 1.35, lng: 103.82, status: 'active', patientCount: null, label: DEFAULT_LABEL },
  { code: 'MU', name: 'Mauritius', region: 'Asia-Pacific', lat: -20.35, lng: 57.55, status: 'active', patientCount: null, label: DEFAULT_LABEL },
];

/**
 * Arcs to draw between India (origin) and each active country — purely
 * derived from GLOBE_COUNTRIES, never hardcoded per-arc in the render
 * layer. The rebuild's globe component should map this, not redefine it.
 */
export const GLOBE_ARCS = GLOBE_COUNTRIES.filter((c) => c.status === 'active').map((c) => ({
  from: 'IN',
  to: c.code,
}));

export function getCountryByCode(code: string): GlobeCountry | undefined {
  return GLOBE_COUNTRIES.find((c) => c.code === code);
}
