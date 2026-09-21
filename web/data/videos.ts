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
};
