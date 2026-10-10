/**
 * Full product copy deck ("Khatore Pharma — Complete Product Copy
 * Deck.docx"), supplied 10 Oct and legally cleared the same day for
 * publication. Transcribed verbatim from that document -- nothing
 * reworded, trimmed, or softened. Kept in its own file, separate from
 * data/products.ts's `description` (the short grid/card copy), since
 * this is detail-page-only content: see app/products/[slug]/page.tsx's
 * existing progressive-sections pattern (a section only renders when
 * its data exists -- same discipline applied here).
 *
 * Only the 5 products this deck actually covers are keyed here
 * (Kamalahar, K-Mens, K-Matic Capsules, K-Matic Oil, K-Matic Combo
 * Pack) -- K-Cuff Syrup, Kaptone and K-Morex are NOT in the cleared
 * deck and keep their existing data/products.ts copy only.
 */

export interface ProductBenefit {
  title: string;
  text: string;
}

/** Some products list conditions as "Name: description.", others as a flat name-only list -- `text` is undefined for the latter rather than invented. */
export interface ProductCondition {
  name: string;
  text?: string;
}

export interface ProductClinicalInfo {
  herbalSource: string;
  dosage: string;
  duration: string;
  complications: string;
}

export interface ProductLifestyle {
  dos: string;
  donts: string;
}

export interface ProductCopyDeck {
  tagline: string;
  shortStory: string;
  benefits: ProductBenefit[];
  conditions: ProductCondition[];
  clinicalInfo: ProductClinicalInfo;
  lifestyle: ProductLifestyle;
}

export const PRODUCT_COPY: Record<string, ProductCopyDeck> = {
  kamalahar: {
    tagline: 'Herbal Hepato-Protective & Liver Regeneration Therapy',
    shortStory:
      'High stress, heavy meals, urban pollution, and alcohol strain your liver first. Kamalahar works at the cellular level to optimize liver function tests (LFTs), protect liver parenchyma, and promote tissue regeneration.',
    benefits: [
      { title: 'Clean Slate', text: 'Deep-cleans heavy environmental & dietary toxins.' },
      { title: 'Metabolic Balance', text: 'Clears stubborn bloat & supports fat breakdown.' },
      { title: 'Unlocked Energy', text: 'Reduces liver-related fatigue & sluggishness.' },
      { title: 'LFT Normalization', text: 'Restores elevated SGOT, SGPT, and serum bilirubin levels to healthy baseline ranges.' },
    ],
    conditions: [
      { name: 'Hepatitis (Viral & Toxic)', text: 'Inflammatory liver condition caused by viral infections or toxin exposure leading to cell damage.' },
      { name: 'Liver Cirrhosis', text: 'Advanced liver fibrosis where healthy tissue is replaced by scar tissue, impairing organ function.' },
      { name: 'Ascites', text: 'Abdominal fluid accumulation resulting from severe portal hypertension and liver dysfunction.' },
      { name: 'Fatty Liver (NAFLD & AFLD)', text: 'Excessive lipid accumulation in liver cells causing metabolic sluggishness and tissue inflammation.' },
      { name: 'Jaundice', text: 'Hyperbilirubinemia resulting in yellowing of the skin and eyes due to impaired bile excretion.' },
      { name: 'Liver Lesions', text: 'Structural cellular abnormalities or localized tissue damage within the hepatic parenchyma.' },
      { name: 'Alcoholic Liver Disorders', text: 'Hepatic damage ranging from fatty infiltration to cellular necrosis caused by chronic alcohol consumption.' },
      { name: 'Loss of Appetite & Malabsorption', text: 'Digestive dysfunction caused by deficient bile secretion and impaired nutrient assimilation.' },
      { name: 'Sluggish Liver Function & Metabolic Fatigue', text: 'Reduced metabolic efficiency of the liver leading to chronic bodily tiredness.' },
      { name: 'Hepatic Tissue Inflammation', text: 'Acute or subacute swelling of liver parenchymal cells.' },
      { name: 'Chronic Digestion Impairment', text: 'Persistent indigestion and bloating triggered by inadequate liver metabolic performance.' },
    ],
    clinicalInfo: {
      herbalSource: 'Phyllanthus urinaria, Tecoma undulata, and active Ayurvedic bio-actives.',
      dosage: '2 capsules 3 times daily after meals.',
      duration: 'Full therapeutic regimen is a 6-month course.',
      complications: 'Hypersensitivity to ingredients. Monitor LFTs routinely during therapy; consult a physician if severe jaundice persists.',
    },
    lifestyle: {
      dos: 'Maintain a low-fat, high-fiber diet; drink plentiful water; schedule routine LFT panels to track progress.',
      donts: 'Strictly avoid alcohol; eliminate active and passive smoking; avoid excessively greasy, fried, or spicy foods.',
    },
  },

  'k-mens': {
    tagline: 'Uterine Tonic & Gynecological Care Therapy',
    shortStory:
      "Period days shouldn't pause your life. K-Mens is a clinically inspired uterine sedative and hemostatic formulation that modulates reproductive endocrine pathways to soothe menstrual pain and restore cycle predictability.",
    benefits: [
      { title: 'Cramp Defense', text: 'Relieves deep uterine spasms & heavy flow.' },
      { title: 'Mood Rebalance', text: 'Eases PMS tension, irritability & fluid bloat.' },
      { title: 'Full-Cycle Support', text: 'Tones the endometrial lining and supports pelvic vascular health.' },
    ],
    conditions: [
      { name: 'Dysmenorrhea', text: 'Painful menstrual cramps caused by exaggerated uterine prostaglandin contractions.' },
      { name: 'Menorrhagia', text: 'Abnormally heavy or prolonged menstrual bleeding impacting pelvic vascular tone.' },
      { name: 'Metrorrhagia', text: 'Irregular uterine bleeding occurring between expected menstrual cycles.' },
      { name: 'Premenstrual Syndrome (PMS)', text: 'Hormonal fluctuations causing mood swings, irritability, fluid retention, and mastalgia (breast tenderness).' },
      { name: 'Irregular & Delayed Cycles', text: 'Disrupted ovulation and hormonal timing causing unpredictable cycle intervals.' },
      { name: 'Uterine Weakness', text: 'Loss of tone in uterine muscle walls leading to pelvic heaviness and menstrual pain.' },
      { name: 'Pelvic Congestion', text: 'Stagnant venous blood flow in pelvic vessels causing dull abdominal aches.' },
    ],
    clinicalInfo: {
      herbalSource: 'Phyto-estrogenic botanicals and traditional uterine tonics (Saraca asoca, Lodhra).',
      dosage: '1 to 2 capsules twice daily after meals.',
      duration: 'Recommended 3-month course for full cycle normalization.',
      complications: 'Strictly contraindicated during pregnancy and lactation. Use with caution in known hormone-sensitive conditions.',
    },
    lifestyle: {
      dos: 'Stay hydrated; practice gentle yoga; maintain an iron-rich diet during menstrual cycles.',
      donts: 'Avoid excessive caffeine; limit raw/cold foods; avoid intense strenuous physical exertion during peak bleeding days.',
    },
  },

  'k-matic': {
    tagline: 'Neuro-Muscular & Systemic Anti-Inflammatory Capsules',
    shortStory:
      'Built for bodies in motion. K-Matic Capsules deliver systemic anti-inflammatory bio-actives internally to regulate cytokines, protect cartilage, and soothe deep neuro-muscular discomfort.',
    benefits: [
      { title: 'Joint Cushioning', text: 'Restores natural fluid movement & reduces joint creaking.' },
      { title: 'Wear Protection', text: 'Shields cartilage from daily friction & structural strain.' },
      { title: 'Root-Cause Relief', text: 'Calms neuro-muscular pathways, morning stiffness, and chronic joint inflammation.' },
    ],
    conditions: [
      { name: 'Osteoarthritis', text: 'Progressive wear-and-tear degradation of articular joint cartilage causing joint friction.' },
      { name: 'Rheumatoid Arthritis', text: 'Autoimmune inflammatory joint disorder causing painful swelling and bone erosion.' },
      { name: 'Cervical & Lumbar Spondylitis', text: 'Age-related spinal disc degeneration leading to neck, back, and nerve compression discomfort.' },
      { name: 'Sciatica', text: 'Irritation or compression of the sciatic nerve causing radiating leg and lower back pain.' },
      { name: 'Chronic Low Back Pain (Lumbago)', text: 'Persistent muscular strain and vertebral stiffness in the lumbar region.' },
      { name: 'Joint Crepitus & Stiffness', text: 'Reduced synovial fluid friction causing joint creaking and limited range of movement.' },
      { name: 'Post-Traumatic Stiffness', text: 'Joint and muscular inflexibility following physical injury or prolonged immobility.' },
    ],
    clinicalInfo: {
      herbalSource: 'Boswellia serrata (Shallaki), Commiphora mukul (Guggulu), and neuro-muscular herbal extracts.',
      dosage: '1 capsule twice daily after meals.',
      duration: 'Recommended 3-month course for deep tissue repair.',
      complications: 'Contraindicated in active peptic ulcer disease or severe hyperacidity. Consult a doctor if combined with anticoagulant medications.',
    },
    lifestyle: {
      dos: 'Perform low-impact joint mobilization exercises; apply local warmth; maintain a healthy body weight.',
      donts: 'Avoid heavy impact lifting during acute flare-ups; avoid cold/damp environments; limit high-purine and highly acidic diets.',
    },
  },

  'k-matic-oil': {
    tagline: 'Transdermal Analgesic & Neuro-Muscular Rub',
    shortStory:
      'Your instant "off button" for localized pain. Formulated for rapid dermal penetration, this warming rub delivers targeted analgesic relief directly to tight muscles and painful nerve endings.',
    benefits: [
      { title: 'Fast Sink-In', text: 'Non-sticky transdermal formulation that absorbs quickly into dermal layers.' },
      { title: 'Warm Therapy', text: 'Induces local hyperemic warmth to ease neck, back & knee stiffness.' },
      { title: 'Post-Work Recovery', text: 'Unwinds knotty muscles, local nerve irritation, and muscle spasms.' },
    ],
    conditions: [
      { name: 'Acute Muscle Spasms & Tightness' },
      { name: 'Localized Joint Pain (Knees, Shoulders, Elbows, Wrists)' },
      { name: 'Stiff Neck, Shoulder Torticollis & Cervical Pain' },
      { name: 'Lumbar Muscular Strain & Lower Back Aches' },
      { name: 'Neuralgia & Peripheral Nerve Discomfort' },
      { name: 'Sports Injuries & Strain-Related Muscle Soreness' },
    ],
    clinicalInfo: {
      herbalSource: 'Medicated herbal lipid matrix (Mahanarayana extracts, Gandhapura, and camphoraceous botanicals).',
      dosage: 'Gently massage 5–10 ml over the affected joint or muscular area 2–3 times daily.',
      duration: 'Use as needed or continuously over a 6-week to 3-month course.',
      complications: 'For external topical application only. Contraindicated on broken skin, open wounds, eczema, or active skin infections.',
    },
    lifestyle: {
      dos: 'Keep the massaged region warm after application; wash hands thoroughly after use.',
      donts: 'Do not apply heating pads immediately after oil application; avoid direct cold draft exposure on treated skin.',
    },
  },

  'k-matic-combo': {
    tagline: 'Synergistic Oral & Topical Musculoskeletal Regimen',
    shortStory:
      'Why choose between surface comfort and root care? This dual-pathway clinical system combines internal capsular therapy for tissue repair with transdermal oil for rapid local pain suppression.',
    benefits: [
      { title: 'Double Action', text: 'Internal joint & cartilage care meets instant external neuro-muscular relief.' },
      { title: 'Fast Track', text: 'Designed for severe joint stiffness, arthritis flare-ups, and limited mobility.' },
      { title: 'Complete Kit', text: 'Dual therapeutic formulation engineered for complete musculoskeletal recovery.' },
    ],
    conditions: [
      { name: 'Severe Osteoarthritis & Advanced Joint Wear' },
      { name: 'Acute Arthritic Flare-Ups & Inflammation' },
      { name: 'Combined Nerve & Joint Degeneration (Sciatica with Lumbar Spondylitis)' },
      { name: 'Severe Morning Joint Stiffness & Loss of Range of Motion' },
      { name: 'Chronic Post-Traumatic Joint & Muscle Pain' },
    ],
    clinicalInfo: {
      herbalSource: 'Combined bio-actives of K-Matic Capsules (Shallaki/Guggulu) + K-Matic Oil (Medicated lipid matrix).',
      dosage: '1 capsule twice daily orally + local topical massage 2 times daily.',
      duration: 'Full treatment duration: 6-week to 3-month course.',
      complications: 'Discontinue topical application if local skin irritation develops; observe oral capsule guidelines for gastric sensitivities.',
    },
    lifestyle: {
      dos: 'Follow a daily gentle physical therapy routine; maintain consistency with both internal and topical regimens.',
      donts: 'Do not skip oral doses during symptom-free intervals; avoid extreme weight-bearing stresses during recovery.',
    },
  },
};

export function getProductCopy(productId: string): ProductCopyDeck | undefined {
  return PRODUCT_COPY[productId];
}
