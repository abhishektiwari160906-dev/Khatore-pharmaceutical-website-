/**
 * The four clinical trial summaries cleared for public use
 * (Master Build Directive, Section 6). These figures are used EXACTLY
 * as they appear in the previously-approved source material — nothing
 * added, nothing rounded, nothing inferred.
 *
 * Do not add a fifth entry, and do not add fields (extra outcomes,
 * extra citations, percentages) beyond what's here without an
 * explicit new clearance. `institutionImageKey`/`evidenceHighlight`
 * were added under an explicit 2026-09-24 clearance (Science/Evidence
 * image refinement) — see INSTITUTION_IMAGES below.
 */

export interface ClinicalTrial {
  id: string;
  order: number;
  location: string;
  dateRange: string;
  patientCount: number;
  conditions: string[];
  summary: string;
  publication: {
    journal: string;
    reference: string;
  };
  /**
   * Post-review rebuild scaffold. The Heritage record (data/heritage.ts,
   * "Clinical Trials" entry) already states "144 patients enrolled
   * across blind and double-blind randomised protocols" — real,
   * approved evidence for the PROGRAM as a whole. It does not say
   * which of these 4 trials used a double-blind design, so this field
   * stays undefined on every entry below rather than guessing. Only
   * set it on a specific trial once Khatore confirms which one(s).
   */
  studyDesign?: 'double-blind' | 'blind';
  /**
   * The large, primary visual tag for this trial's card — replaces
   * the patient count as the dominant element. Only a value directly
   * supported by this trial's own `summary`/`location`/`publication`
   * fields, never inferred from the program-level Heritage statement.
   */
  evidenceHighlight: 'MULTI-CENTRE STUDY' | 'PUBLISHED STUDY';
  /** One or more keys into INSTITUTION_IMAGES — more than one only for the multi-site trial. */
  institutionImageKeys: string[];
}

/**
 * None of the 4 cleared trials above list "Cuttack Hospital" as a
 * location (the approved locations are Jhansi, Guntur, Patna and
 * Ahmedabad only). A client brief asked to "call out Cuttack
 * Hospital" in the evidence section — that cannot be done from
 * current approved data without inventing an affiliation. Flagged
 * here rather than silently added to a trial's `location`.
 */
export const CUTTACK_HOSPITAL_PENDING_CONFIRMATION = true;

export interface InstitutionImage {
  src: string;
  alt: string;
  /** Where the photo was sourced from — kept for the internal record (Section 17), not shown on the page. */
  source: string;
  /** License/usage basis as actually stated by the source, recorded honestly rather than assumed. */
  license: string;
}

/**
 * Real, verified building photographs — each one confirmed to depict
 * the named institution (either by visible signage in the photo, or
 * as the institution's own official-site homepage image). Every
 * source and license basis is recorded here rather than asserted:
 *
 *  - Guntur: Wikimedia Commons, explicitly CC BY-SA / GFDL licensed.
 *  - Jhansi, Patna, Ahmedabad: each institution's own official
 *    website. These sites do not state an explicit reuse license —
 *    used here only for factual institutional identification, not
 *    presented as freely licensed stock. If this ever needs a public
 *    licensing audit, this table is the record to check.
 */
export const INSTITUTION_IMAGES: Record<string, InstitutionImage> = {
  guntur: {
    src: '/assets/science/guntur-medical-college.webp',
    alt: 'Front gate of Guntur Medical College',
    source: 'Wikimedia Commons — "Guntur Medical College (2).jpg" (Gpics, 2007), commons.wikimedia.org/wiki/Category:Guntur_Medical_College',
    license: 'CC BY-SA 3.0 / GFDL 1.2+ (dual-licensed by uploader)',
  },
  jhansi: {
    src: '/assets/science/mlb-medical-college-jhansi.webp',
    alt: 'Main building of Maharani Laxmi Bai Medical College, Jhansi',
    source: 'Official site — mlbmcj.edu.in (homepage banner image)',
    license: 'Not explicitly stated by source; used for factual institutional identification only',
  },
  patna: {
    src: '/assets/science/igims-patna.webp',
    alt: 'Main building of Indira Gandhi Institute of Medical Sciences, Patna',
    source: 'Official site — igims.org (homepage banner image)',
    license: 'Not explicitly stated by source; used for factual institutional identification only',
  },
  ahmedabad: {
    src: '/assets/science/bj-medical-college-ahmedabad.webp',
    alt: 'Main building of B.J. Medical College, Ahmedabad, with building signage visible',
    source: 'Official site — bjmcabd.edu.in (homepage banner image)',
    license: 'Not explicitly stated by source; used for factual institutional identification only',
  },
};

export const CLEARED_CLINICAL_TRIALS: ClinicalTrial[] = [
  {
    id: 'trial-01-multi-hospital',
    order: 1,
    location:
      'M.L.B. Medical College Jhansi, Guntur Medical College, Indira Gandhi Institute of Medical Sciences Patna, and B.J. Medical College Ahmedabad',
    dateRange: '27 Nov 1987 – 15 May 1988',
    patientCount: 46,
    conditions: ['Infective Hepatitis', 'ATD Jaundice', 'Alcoholic Hepatitis'],
    summary:
      'Serum bilirubin in the Infective Hepatitis group fell from mean 8.38 ± 1.02 mg/100 ml to 2.57 ± 0.57 mg/100 ml after 12 days of treatment. Comparable reductions were observed across all three patient groups.',
    publication: {
      journal: 'Indian Journal of Gastroenterology, 1993; JAPI, 1992',
      reference: 'NIH/PubMed listed',
    },
    evidenceHighlight: 'MULTI-CENTRE STUDY',
    institutionImageKeys: ['jhansi', 'guntur', 'patna', 'ahmedabad'],
  },
  {
    id: 'trial-02-jhansi',
    order: 2,
    location: 'M.L.B. Medical College, Jhansi',
    dateRange: '15 Jun – 15 Nov 1987',
    patientCount: 50,
    conditions: ['Infective Hepatitis', 'ATD Jaundice', 'Alcoholic Hepatitis'],
    summary:
      'Bilirubin rise halted by day 2–3; levels fell below 3 mg/100 ml by day 10. Symptomatic improvements — nausea, anorexia, vomiting, fatigue — responded earlier than biochemical indicators.',
    publication: {
      journal: 'Indian Medical Practitioner (Bombay)',
      reference: 'Vol. XLII No 4, pp. 303–308',
    },
    evidenceHighlight: 'PUBLISHED STUDY',
    institutionImageKeys: ['jhansi'],
  },
  {
    id: 'trial-03-patna',
    order: 3,
    location: 'Indira Gandhi Institute of Medical Sciences, Patna',
    dateRange: 'May 1987 – Jan 1988',
    patientCount: 33,
    conditions: ['Acute Viral Hepatitis'],
    summary:
      '80% showed full clinical and biochemical recovery after 2 weeks. Faster recovery vs. the placebo group. No side effects related to the compound reported in trial documentation.',
    publication: {
      journal: 'Journal of Physicians of India',
      reference: 'JAPI Vol 37, Abstract p. 64',
    },
    evidenceHighlight: 'PUBLISHED STUDY',
    institutionImageKeys: ['patna'],
  },
  {
    id: 'trial-04-ahmedabad',
    order: 4,
    location: 'B.J. Medical College & Civil Hospital, Ahmedabad',
    dateRange: 'Sep 1987 – May 1988',
    patientCount: 15,
    conditions: ['Acute Viral Hepatitis (AVH)'],
    summary:
      'Marked clinical improvement within 3–4 days. All patients had classical AVH symptoms. Almost all patients were free of symptoms at discharge with biochemical improvement. Bilirubin fell from 9.9 to 4.6 mg/100 ml over 10 days.',
    publication: {
      journal: 'Journal of Association of Physicians India',
      reference: 'JAPI Vol 39, ISSN 004/5772, p. 82',
    },
    evidenceHighlight: 'PUBLISHED STUDY',
    institutionImageKeys: ['ahmedabad'],
  },
];

export const SCIENCE_COMPLIANCE_NOTE =
  "The above are summaries of Khatore's company-provided documentation of published clinical trials, presented for informational purposes. Records of individual published studies — not guarantees of individual therapeutic outcomes. Individual results vary. Consult a qualified healthcare practitioner.";
