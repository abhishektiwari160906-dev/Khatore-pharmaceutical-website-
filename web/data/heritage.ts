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
    text: "Khatore Pharmaceuticals Pvt. Ltd. launched in Barbil, Odisha. The company's founding purpose: Ayurvedic formulations for patients suffering from liver ailments and jaundice, built on efficacy, safety and economic accessibility.",
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
    // 10 Oct, confirmed by Abhishek/Vrinda -- fills the 2000-to-present
    // timeline gap flagged as "looks like something's missing".
    date: '2000s',
    title: 'Regional Expansion',
    text: 'Distribution expanded locally and regionally across four states in Eastern India, through a business-to-business (B2B) model.',
  },
  {
    date: '2010 onwards',
    title: 'Going Global',
    text: "Launched the company website and shifted to a direct business-to-consumer (B2C) model, beginning to serve customers globally.",
  },
  {
    date: 'Today',
    title: 'Global Presence',
    text: 'Eight Ayurvedic formulations. Patients in 100+ countries across South Asia, Africa, Europe and the Americas. An estimated 3M+ patients benefitted. Available through direct ordering, WhatsApp, and Amazon India.',
  },
];
