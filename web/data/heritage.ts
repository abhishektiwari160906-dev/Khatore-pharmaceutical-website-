import { HERITAGE_FOUNDING_YEAR } from '@/lib/config';

export interface HeritageEntry {
  date: string;
  title: string;
  text: string;
}

export const HERITAGE_ENTRIES: HeritageEntry[] = [
  {
    date: String(HERITAGE_FOUNDING_YEAR),
    title: 'Founding',
    text: "Khatore Pharmaceuticals Pvt. Ltd. launched in Barbil, Orissa. The company's founding purpose: Ayurvedic formulations for patients suffering from liver ailments and jaundice, built on efficacy, safety and economic accessibility.",
  },
  {
    date: '1987–1988',
    title: 'Clinical Trials',
    text: 'Four clinical trials conducted at M.L.B. Medical College Jhansi, Guntur Medical College, Indira Gandhi Institute of Medical Sciences Patna, and B.J. Medical College Ahmedabad. 144 patients enrolled across blind and double-blind randomised protocols.',
  },
  {
    date: '1992–1993',
    title: 'Peer-Reviewed Publication',
    text: 'Findings published in the Journal of the Association of Physicians of India (JAPI), Indian Journal of Gastroenterology, and Indian Medical Practitioner. Listed on NIH/PubMed. Conducted by Heads of Department and Professors of Gastroenterology, Medicine and Pharmacology.',
  },
  {
    date: '2000',
    title: 'Industry Recognition',
    text: 'Best Entrepreneur Award for Ayurvedic Medicine in Asia. GMP certification maintained in recognition of strict quality assurance standards. Designed by Ayurvedacharya. Traditional Ayurveda combined with latest scientific research. No heavy metals.',
  },
  {
    date: 'Today',
    title: 'Global Presence',
    text: 'Eight Ayurvedic formulations. Patients in 100+ countries across South Asia, Africa, Europe and the Americas. Over five million patients benefited. Available through direct ordering, WhatsApp, and Amazon India.',
  },
];
