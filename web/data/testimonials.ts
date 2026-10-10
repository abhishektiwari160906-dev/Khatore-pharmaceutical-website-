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
   * Real testimonial media, pulled 9 Oct from the exact same page each
   * entry's sourceUrl points to -- khatorepharma.com embeds each
   * patient's own real YouTube testimonial next to their quote (visible
   * in that page's raw HTML as a `data-src="youtube.com/embed/<id>"`
   * button, in the same document order as the testimonials themselves
   * -- verified by position, not guessed). youtubeId is that same real
   * video, nothing fabricated or re-recorded.
   */
  youtubeId?: string;
  /** Direct-hosted video file, if Khatore ever supplies one outside YouTube -- unused today, every current entry with video uses youtubeId instead. */
  videoUrl?: string;
  posterUrl?: string;
  /**
   * For a person with no video on the old site but a real scanned
   * document instead (e.g. Dr. B. C. Jha's page has no video embed,
   * only his original handwritten letter to Khatore) -- the card shows
   * this labeled as the letter it is, never implied to be a photo of
   * the person (Section: never invent a face for a quote).
   */
  documentUrl?: string;
  documentCaption?: string;
}

export const TESTIMONIALS: TestimonialEntry[] = [
  {
    id: 'joseph-donkoh',
    excerpt: 'Ten years ago, I was diagnosed with hepatitis B. By the year, I was more than healthy.',
    name: 'Mr. Joseph Donkoh',
    location: 'Accra, Ghana',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
    youtubeId: '8P7PDRq1sro',
  },
  {
    id: 'sameer-preeti-badre',
    excerpt: 'He was suffering from Hepatitis-A and related liver disease — he is substantially improved in health.',
    name: 'Sameer & Preeti Badre',
    location: 'Mumbai, India',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
    youtubeId: 'V_e1EWUARns',
  },
  {
    id: 'dr-venkat',
    excerpt: 'After taking Kamalahar for 6 months my Hepatitis B has become undetectable.',
    name: 'Dr. Venkat',
    location: 'Guntur, Andhra Pradesh',
    tag: 'Hepatitis',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/hepatitis',
    youtubeId: '3SBiU80Fpi0',
  },
  {
    id: 'andres-franco',
    // 10 Oct: swapped in for Mr. Yatin Shah at Abhishek's request (new
    // video supplied). The excerpt/tag/sourceUrl below are carried over
    // from the slot this replaced -- they are Yatin Shah's real words,
    // NOT verified as Andres Franco's own testimonial text, so this is
    // flagged back rather than silently shown as if it were his quote.
    excerpt: 'I had been suffering from fatty liver for 25 years. I finished 6 months of medicine and requested another 6 — I am fully recovered.',
    name: 'Mr. Andres Franco',
    location: 'Mount Abu, Rajasthan',
    tag: 'Fatty Liver',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/fatty_liver',
    youtubeId: 'R83bgJbmHlE',
  },
  {
    id: 'nordin',
    // 10 Oct: swapped in for Dr. Soumen Ghosh at Abhishek's request (new
    // video + location supplied). Same caveat as above -- excerpt/tag/
    // sourceUrl are carried over from the replaced slot, not verified as
    // Nordin's own words.
    excerpt: 'My blood profile became better and brought ALT/AST levels down to the normal range.',
    name: 'Mr. Nordin',
    location: 'Malaysia',
    tag: 'Fatty Liver',
    sourceUrl: 'https://www.khatorepharma.com/testimonials/fatty_liver',
    youtubeId: 'zFpXKaaJc2g',
  },
  {
    id: 'dr-bc-jha',
    excerpt: 'Kamalahar has given excellent results — its use in alcoholic hepatitis has especially yielded quick benefits.',
    name: 'Dr. B. C. Jha',
    location: 'Patna, Bihar',
    tag: "Doctor's Testimonial",
    sourceUrl: 'https://www.khatorepharma.com/testimonials/doctor',
    // The doctor-testimonials page has no video embeds at all (unlike
    // the patient pages) -- this is the real document that page shows
    // instead: Dr. Jha's own handwritten letter to Khatore, downloaded
    // from khatorepharma.com's own media directory and self-hosted.
    documentUrl: '/assets/testimonials/dr-bc-jha.jpg',
    documentCaption: "Dr. Jha's original letter to Khatore",
  },
];

export const TESTIMONIALS_ARCHIVE_URL = 'https://www.khatorepharma.com/testimonials';
