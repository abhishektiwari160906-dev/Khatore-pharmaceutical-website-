/**
 * Video manifest — the 5 assets from the client's "Final Content" Drive
 * pack, mapped to their approved site placements (Website Direction
 * Document). Source-of-truth discipline per that document:
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
    status: 'pending-asset',
    aspect: '16 / 9',
    captionSourceLabel: 'A — title-confirmed only; 298.8MB, over the Drive connector\'s 10MB inspection cap',
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
    status: 'pending-asset',
    captionSourceLabel: 'A — title-confirmed only; 39.6MB, over the Drive connector\'s 10MB inspection cap',
  },
  reel3: {
    id: 'reel3',
    title: 'The Kamalahar Promise',
    role: 'Brand / product promise',
    section: 'products',
    treatment: 'editorial',
    status: 'pending-asset',
    captionSourceLabel: 'A — title-confirmed only; 48.7MB, over the Drive connector\'s 10MB inspection cap',
  },
  reel4: {
    id: 'reel4',
    title: 'Herb to Habit',
    role: 'Botanical / ingredient-to-product storytelling',
    section: 'homepage',
    treatment: 'editorial',
    status: 'pending-asset',
    captionSourceLabel: 'A — title-confirmed only; 58.1MB, over the Drive connector\'s 10MB inspection cap',
  },
};
