/**
 * Standard geographic reference data (approximate country centroid
 * lat/lon and ISO 3166-1 numeric codes) for the countries already
 * listed in the APPROVED GLOBAL_PRESENCE data (data/global.ts). This
 * file adds no business facts of its own -- it does not say which
 * countries Khatore serves or how many patients are in each; it only
 * supplies public-domain geography so that approved list can be
 * plotted on a real globe. No patient counts, no per-country
 * statistics: none exist in the approved data, so none are shown here
 * (see Globe3D's info panel, which reads only "Patient presence
 * established").
 */
export interface CountryGeo {
  /** Must match a country string in data/global.ts GLOBAL_PRESENCE exactly. */
  name: string;
  lat: number;
  lon: number;
  /** ISO 3166-1 numeric code, matching world-atlas/topojson-client country ids. */
  iso: string;
}

export const COUNTRY_GEO: CountryGeo[] = [
  // South Asia & Middle East
  { name: 'India', lat: 22.0, lon: 79.0, iso: '356' },
  { name: 'United Arab Emirates', lat: 24.0, lon: 54.0, iso: '784' },
  { name: 'Sri Lanka', lat: 7.0, lon: 81.0, iso: '144' },
  { name: 'Nepal', lat: 28.2, lon: 84.0, iso: '524' },
  { name: 'Bangladesh', lat: 24.0, lon: 90.0, iso: '050' },
  // Africa
  { name: 'Nigeria', lat: 9.0, lon: 8.0, iso: '566' },
  { name: 'South Africa', lat: -29.0, lon: 24.0, iso: '710' },
  { name: 'Ghana', lat: 7.9, lon: -1.0, iso: '288' },
  { name: 'Kenya', lat: 1.0, lon: 38.0, iso: '404' },
  { name: 'Tanzania', lat: -6.0, lon: 35.0, iso: '834' },
  // Europe & Americas
  { name: 'United Kingdom', lat: 54.0, lon: -2.0, iso: '826' },
  { name: 'United States', lat: 39.8, lon: -98.5, iso: '840' },
  { name: 'Canada', lat: 56.1, lon: -106.3, iso: '124' },
  { name: 'Netherlands', lat: 52.1, lon: 5.3, iso: '528' },
  { name: 'Germany', lat: 51.2, lon: 10.4, iso: '276' },
  // Asia-Pacific
  { name: 'Australia', lat: -25.0, lon: 133.0, iso: '036' },
  { name: 'Malaysia', lat: 2.5, lon: 112.5, iso: '458' },
  { name: 'Singapore', lat: 1.35, lon: 103.8, iso: '702' },
  { name: 'Mauritius', lat: -20.3, lon: 57.55, iso: '480' },
];

/** India is Khatore's headquarters/origin -- the real, non-invented hub the network arcs radiate from. */
export const HUB_COUNTRY = 'India';
