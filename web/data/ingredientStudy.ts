/**
 * "Ingredient Study" scaffold for the post-review Bhui Amla rebuild —
 * connects the botanical (roots -> stem -> branches -> leaves) to the
 * company timeline (data/heritage.ts), so growth stage and story
 * milestone can be driven from the same scroll progress value.
 *
 * The botanical description is the one already used as this project's
 * own reference material for the real vanilla-Three.js Bhui Amla
 * build (khatore-homepage-v6-1.html, the same document
 * app/globals.css's header comment cites as the source the current
 * design tokens were "ported verbatim" from) — reused here verbatim,
 * not rewritten, and clearly attributed. No new botanical or medical
 * claim is added.
 *
 * IMPORTANT — no "late 60s/70s" pre-1984 milestone exists anywhere in
 * the approved record: data/heritage.ts's HERITAGE_ENTRIES starts at
 * 1984 (Founding) and has nothing earlier. A brief asked for a
 * "roots -> late 60s/70s -> ... -> 1984" progression; that pre-1984
 * stage is left out below rather than invented — see the final report
 * for this as a pending item.
 */

import { HERITAGE_ENTRIES } from './heritage';

export const BHUI_AMLA_INTRO = {
  heading: 'Every story begins at its roots.',
  body:
    "In classical Ayurvedic texts, Bhui Amla — literally 'ground amla' — is described as a liver-supportive herb that carries its seed capsules on the underside of each leaf, close to the ground it grows from. It is one of the botanicals in Khatore's traditional formulation lineage.",
  attribution: 'Traditional Ayurvedic Materia Medica',
};

export type GrowthStage = 'roots' | 'stem' | 'branches' | 'leaves' | 'full-plant';

export interface IngredientStudyBeat {
  stage: GrowthStage;
  /** 0..1 scroll-progress range this beat owns, for the rebuild's growth-driver to map against. */
  progressStart: number;
  progressEnd: number;
  /** Pulled 1:1 from HERITAGE_ENTRIES — never a separate/duplicated copy of the story. */
  heritageEntry: (typeof HERITAGE_ENTRIES)[number];
}

// Maps the plant's 4 growth phases onto the 4 real Heritage entries
// that actually exist (Founding through Global Presence). Even split
// by default; the rebuild can weight this once real motion-design
// values are picked — the mapping itself must stay 1 heritage entry
// per beat, in chronological order, nothing invented in between.
export const INGREDIENT_STUDY_TIMELINE: IngredientStudyBeat[] = [
  { stage: 'roots', progressStart: 0, progressEnd: 0.25, heritageEntry: HERITAGE_ENTRIES[0]! }, // 1984 — Founding
  { stage: 'stem', progressStart: 0.25, progressEnd: 0.5, heritageEntry: HERITAGE_ENTRIES[1]! }, // 1987–1988 — Clinical Trials
  { stage: 'branches', progressStart: 0.5, progressEnd: 0.75, heritageEntry: HERITAGE_ENTRIES[2]! }, // 1992–1993 — Publication
  { stage: 'leaves', progressStart: 0.75, progressEnd: 1, heritageEntry: HERITAGE_ENTRIES[3]! }, // 2000 — Industry Recognition
  // 'full-plant' / HERITAGE_ENTRIES[4] ("Today") intentionally has no
  // scroll-progress slice — it's the resting end state, not a beat.
];
