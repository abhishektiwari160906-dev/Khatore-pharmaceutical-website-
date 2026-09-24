/**
 * Patient testimonials.
 *
 * These are real, attributed accounts already published live on
 * Khatore's own site (khatorepharma.com/testimonials/<category>) —
 * fetched from those pages, not invented. Each entry keeps its real
 * name, location and condition category, and carries its own source
 * URL for direct verification against the original.
 *
 * Two honesty notes, deliberately kept close to this data rather than
 * buried:
 *  1. The excerpt text was retrieved through an automated fetch-and-
 *     summarize step, so it should be treated as a faithful EXCERPT of
 *     the original, not a guaranteed character-for-character quote —
 *     that's exactly why every card links back to its real source page.
 *  2. Some of Khatore's own published testimonials use strong outcome
 *     language ("cured", "undetectable", "negative"). That wording is
 *     already live and public on Khatore's own site today, under
 *     Khatore's own editorial judgment; it is reproduced here as
 *     attributed personal experience, not as a claim made by this site,
 *     and stays next to the same "individual results may vary" notice
 *     used elsewhere across the site.
 */

export interface TestimonialEntry {
  id: string;
  excerpt: string;
  name: string;
  location: string;
  tag: string;
  sourceUrl: string;
  /**
   * Real testimonial video/photo, once Khatore supplies one for this
   * person -- currently undefined for every entry (see 2026-09-24
   * FINAL CLIENT-REVIEW SPRINT: no real video/photo assets of these
   * specific patients exist in the repo, and the brief explicitly
   * prohibits fabricating or AI-generating people to fill this gap).
   * The card component renders the real media when this is set, and
   * an honestly-labeled pending placeholder otherwise -- so dropping
   * in real assets later needs no component changes, only this field.
   */
  videoUrl?: string;
  posterUrl?: string;
}

export const TESTIMONIALS: TestimonialEntry[] = [
  {
    id: 'joseph-donkoh',
    excerpt: 'Ten years ago, I was diagnosed with hepatitis B. By the year, I was more than healthy.',
    name: 'Mr. Joseph Donkoh',
    location: 'Accra, Ghana',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
  },
  {
    id: 'sameer-preeti-badre',
    excerpt: 'He was suffering from Hepatitis-A and related liver disease — he is substantially improved in health.',
    name: 'Sameer & Preeti Badre',
    location: 'Mumbai, India',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
  },
  {
    id: 'dr-venkat',
    excerpt: 'After taking Kamalahar for 6 months my Hepatitis B has become undetectable.',
    name: 'Dr. Venkat',
    location: 'Guntur, Andhra Pradesh',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
  },
  {
    id: 'yatin-shah',
    excerpt: 'I had been suffering from fatty liver for 25 years. I finished 6 months of medicine and requested another 6 — I am fully recovered.',
    name: 'Mr. Yatin Shah',
    location: 'Mount Abu, Rajasthan',
    tag: 'Fatty Liver',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/fatty_liver',
  },
  {
    id: 'dr-soumen-ghosh',
    excerpt: 'My blood profile became better and brought ALT/AST levels down to the normal range.',
    name: 'Dr. Soumen Ghosh',
    location: 'San Jose, California',
    tag: 'Fatty Liver',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/fatty_liver',
  },
  {
    id: 'dr-bc-jha',
    excerpt: 'Kamalahar has given excellent results — its use in alcoholic hepatitis has especially yielded quick benefits.',
    name: 'Dr. B. C. Jha',
    location: 'Patna, Bihar',
    tag: "Doctor's Testimonial",
    sourceUrl: 'https://www.khatorepharma.com/testimonials/doctor',
  },
];

export const TESTIMONIALS_ARCHIVE_URL = 'https://www.khatorepharma.com/testimonials';
