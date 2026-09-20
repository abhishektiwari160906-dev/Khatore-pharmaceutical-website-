/**
 * Patient testimonial placeholders.
 *
 * The approved v5/v6 reference design (khatore-homepage-v6-1.html) has
 * its own Testimonials section, and it is itself an honest placeholder —
 * bracketed "to be populated" copy, an "Awaiting Khatore content
 * approval" tag on every card, and a real link out to Khatore's own
 * verified archive. That's the pattern carried forward here verbatim:
 * no patient name, quote, country or outcome is invented anywhere in
 * this file. Every card resolves to real bracketed placeholder text
 * until Khatore supplies and approves real testimonials.
 */

export interface TestimonialPlaceholder {
  id: string;
  text: string;
  name: string;
  tag: string;
}

export const TESTIMONIAL_PLACEHOLDERS: TestimonialPlaceholder[] = [
  {
    id: 'hepatitis',
    text: '[Approved patient testimonial — to be populated from Khatore’s verified archive. Name, location and product to be confirmed.]',
    name: '[Patient Name] — [Country]',
    tag: 'Hepatitis · Personal Experience',
  },
  {
    id: 'fatty-liver',
    text: '[Approved patient testimonial. Personal experiences preserved as individual accounts — not reinterpreted as medical efficacy claims.]',
    name: '[Patient Name] — [Country]',
    tag: 'Fatty Liver · Personal Experience',
  },
  {
    id: 'doctors',
    text: '[Doctor or healthcare professional testimonial — credentials and institution to be verified by Khatore before publication.]',
    name: '[Doctor Name, Credentials]',
    tag: 'Doctors’ Testimonials',
  },
];

export const TESTIMONIALS_ARCHIVE_URL = 'https://www.khatorepharma.com/testimonials';
