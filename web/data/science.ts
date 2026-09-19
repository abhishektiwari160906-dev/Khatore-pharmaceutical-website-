/**
 * The four clinical trial summaries cleared for public use
 * (Master Build Directive, Section 6). These figures are used EXACTLY
 * as they appear in the previously-approved source material — nothing
 * added, nothing rounded, nothing inferred.
 *
 * Do not add a fifth entry, and do not add fields (extra outcomes,
 * extra citations, percentages) beyond what's here without an
 * explicit new clearance.
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
}

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
  },
];

export const SCIENCE_COMPLIANCE_NOTE =
  "The above are summaries of Khatore's company-provided documentation of published clinical trials, presented for informational purposes. Records of individual published studies — not guarantees of individual therapeutic outcomes. Individual results vary. Consult a qualified healthcare practitioner.";
