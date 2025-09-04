import { useEffect, useRef } from "react";
import { useOverlayStore } from "@/store/overlayStore";
import OverlayPortal from "@/components/shared/overlays/OverlayPortal";

const DEFAULT_VIDEO_URL = "https://still-bird-8438.t3.storage.dev/pf/pf_cooking-your-token.mp4";
const DEFAULT_POSTER = "/processing-cooking.png";
const DEFAULT_TITLE = "COOKING YOUR TOKEN";

export default function ProcessingOverlay({
  status,
  imageUrl,
  videoUrl,
  posterUrl,
  titleText,
}: {
  status?: string;
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  titleText?: string;
}) {
  // Video handling (single persistent element)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // ensure muted & inline before loading for autoplay policies
    v.muted = true;
    v.playsInline = true as any;
    // try immediate play; if source not ready, canplay/loadeddata will trigger
    const tryPlay = () => v.play().catch(() => {});
    const onLoaded = () => tryPlay();
    const onCanPlay = () => tryPlay();
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("canplay", onCanPlay);
    tryPlay();
    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("canplay", onCanPlay);
      // pause to release resources
      v.pause();
    };
  }, []);

  return (
    <OverlayPortal>
      <div className="relative z-[120] flex items-center justify-center">
        <div className="relative w-[320px] rounded-[var(--radius-2xl)] bg-white/90 p-6 text-center]">
          <div className="mx-auto mb-6 w-full aspect-square rounded-[var(--radius-xl)] overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl || DEFAULT_VIDEO_URL}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              controls={false}
              disablePictureInPicture
              poster={posterUrl || DEFAULT_POSTER}
            />
          </div>
          <div className="[font-family:var(--font-bagel-fat-one)] text-[24px] leading-[24px]">{titleText || DEFAULT_TITLE}</div>
        </div>
      </div>
    </OverlayPortal>
  );
}
