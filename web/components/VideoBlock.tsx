import { VIDEOS } from '@/data/videos';
import { EditorialVideo } from './EditorialVideo';
import { CinematicVideo } from './CinematicVideo';
import { VideoPlaceholder } from './VideoPlaceholder';

/**
 * Single entry point a page uses to place any of the 5 manifest videos —
 * picks the right treatment/ready-vs-placeholder rendering so pages never
 * need to know which videos are self-hosted yet.
 */
export function VideoBlock({
  id,
  caption,
  label,
  maxWidth,
}: {
  id: keyof typeof VIDEOS;
  caption?: string;
  label?: string;
  maxWidth?: number;
}) {
  const video = VIDEOS[id];
  if (!video) return null;

  if (video.status === 'pending-asset') {
    return <VideoPlaceholder video={video} maxWidth={maxWidth} />;
  }

  if (video.treatment === 'cinematic') {
    return <CinematicVideo video={video} label={label} />;
  }

  return <EditorialVideo video={video} caption={caption} />;
}
