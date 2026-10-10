/**
 * Video manifest — originally the 5 assets from the client's "Final
 * Content" Drive pack covered by the Website Direction Document's
 * approved placements (brand + reel1-4 below). A 6th asset, Reel 5,
 * was discovered in that same Drive folder later (see STATUS.md,
 * "Report Drive-video download constraint + Reel5 discovery") without
 * a placement named in that document -- it's added here (8 Oct) once
 * Khatore's own message explicitly asked for everything in the Drive
 * folder to be added, placed by inspected content (B-label) into the
 * existing "Behind the Scenes" context (heritage page), not invented.
 * Source-of-truth discipline per that document still applies:
 *   A = title-confirmed, B = inspection-confirmed, C = design inference.
 * Nothing here states a video's visual content beyond what's labeled B.
 *
 * `status: 'ready'` means real, self-hosted media under /assets/video/.
 * `status: 'pending-asset'` means the placement is built and wired, but
 * the real bytes aren't available yet (Drive connector's 10MB cap + the
 * files being owner-only/not link-shared — a tooling limitation, not a
 * missing deliverable; the assets are final per the client). These
 * render as a labeled placeholder, never a fake frame or a Drive URL.
 */

export type VideoTreatment = 'cinematic' | 'editorial';
export type VideoStatus = 'ready' | 'pending-asset';

export interface VideoAsset {
  id: string;
  title: string;
  role: string;
  section: string;
  treatment: VideoTreatment;
  status: VideoStatus;
  src?: string; // only set when status === 'ready'
  poster?: string;
  aspect?: string; // "w / h", CSS aspect-ratio value
  captionSourceLabel: string; // A/B/C discipline, shown nowhere on the public page — kept here for editorial traceability
}

export const VIDEOS: Record<string, VideoAsset> = {
  brand: {
    id: 'brand',
    title: 'Brand Video',
    role: 'Primary cinematic brand story',
    section: 'homepage',
    treatment: 'cinematic',
    status: 'ready',
    src: '/assets/video/brand-film.mp4',
    poster: '/assets/video/brand-film-poster.jpg',
    aspect: '16 / 9',
    captionSourceLabel: 'B — inspected in full; aerial Barbil footage + founder-family narration ("The Kamalahar story... our medicine is reaching every corner of the world"); transcoded from 298.8MB source (H.264/AAC, faststart, CRF 24) for web delivery',
  },
  reel1: {
    id: 'reel1',
    title: 'Behind the Scenes',
    role: 'Heritage / manufacturing authenticity',
    section: 'heritage',
    treatment: 'editorial',
    status: 'ready',
    src: '/assets/video/reel1-bts.mp4',
    poster: '/assets/video/reel1-bts-poster.jpg',
    aspect: '9 / 16',
    captionSourceLabel: 'B — inspected in full; trimmed to the manufacturing-facility footage (decoction, quality-control weighing), unrelated tail content removed',
  },
  reel2: {
    id: 'reel2',
    title: 'The Kamalahar Process',
    role: 'Product / process storytelling',
    section: 'products',
    treatment: 'editorial',
    status: 'ready',
    src: '/assets/video/reel2-kamalahar-process.mp4',
    poster: '/assets/video/reel2-kamalahar-process-poster.jpg',
    aspect: '9 / 16',
    captionSourceLabel: 'B — inspected in full; traditional scale-weighing process, "Crafting Kamalahar — for your liver, made the way it\'s always been made"; transcoded from 39.5MB HEVC source to H.264/AAC for broad browser support',
  },
  reel3: {
    id: 'reel3',
    title: 'The Kamalahar Promise',
    role: 'Brand / product promise',
    section: 'products',
    treatment: 'editorial',
    status: 'ready',
    src: '/assets/video/reel3-kamalahar-promise.mp4',
    poster: '/assets/video/reel3-kamalahar-promise-poster.jpg',
    aspect: '9 / 16',
    captionSourceLabel: 'B — inspected in full; raw herb material being packed, "From Day 1 to Day 180 of your Kamalahar journey"; transcoded from 48.7MB source (H.264/AAC, faststart)',
  },
  reel4: {
    id: 'reel4',
    title: 'Herb to Habit',
    role: 'Botanical / ingredient-to-product storytelling',
    section: 'homepage',
    treatment: 'editorial',
    status: 'ready',
    src: '/assets/video/reel4-herb-to-habit.mp4',
    poster: '/assets/video/reel4-herb-to-habit-poster.jpg',
    aspect: '9 / 16',
    captionSourceLabel: 'B — inspected in full; mortar-and-pestle herb grinding, on-screen title "Herbs to Habit"; transcoded from 58.1MB source (H.264/AAC, faststart)',
  },
  testimonialsHeader: {
    id: 'testimonialsHeader',
    title: 'Testimonials',
    role: 'Header video for the self-hosted /testimonials page',
    section: 'testimonials',
    treatment: 'cinematic',
    // 10 Oct: a real, finished "Testimonials .mp4" (259MB) exists in
    // Vrinda's Drive ("Marketing" > "Final Files", shared 10 Oct) --
    // confirmed found, not fabricated -- but too large to pull through
    // this session's file-transfer tooling without an unreasonable
    // resource cost. Stays pending-asset until it's handed over as a
    // direct download/upload.
    status: 'pending-asset',
    aspect: '16 / 9',
    captionSourceLabel: 'Pending -- real file located in Drive (Marketing/Final Files/Testimonials .mp4, 10 Oct) but not yet transferred into this build',
  },
  testimonialsReel1: {
    id: 'testimonialsReel1',
    title: 'Reel 1 — Featured Testimonial',
    role: 'Featured/header testimonial video for the /testimonials page',
    section: 'testimonials',
    treatment: 'editorial',
    // Same situation as testimonialsHeader: a real "Reel 1-.mp4" (96.8MB,
    // 10 Oct) exists in the same Drive folder, distinct from the older,
    // already-self-hosted reel1 (heritage BTS clip) -- confirmed found,
    // not fabricated, too large to transfer in this pass.
    status: 'pending-asset',
    aspect: '9 / 16',
    captionSourceLabel: 'Pending -- real file located in Drive (Marketing/Final Files/Reel 1-.mp4, 10 Oct) but not yet transferred into this build',
  },
  reel5: {
    id: 'reel5',
    title: 'Meet the People Behind Kamalahar',
    role: 'Heritage / manufacturing authenticity — second clip, same role as reel1',
    section: 'heritage',
    treatment: 'editorial',
    status: 'ready',
    src: '/assets/video/reel5.mp4',
    poster: '/assets/video/reel5-poster.jpg',
    aspect: '9 / 16',
    captionSourceLabel: 'B — inspected in full; on-screen title "POV: Meet the people behind Kamalahar\'"; manufacturing-floor footage (capsule filling line, staff in GMP PPE); re-encoded from 54.8MB source (already H.264/AAC) to CRF 24 for web delivery',
  },
};
