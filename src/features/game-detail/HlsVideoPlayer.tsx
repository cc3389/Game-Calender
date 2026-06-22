"use client";

import { cn } from "@/shared/lib/cn";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

type HlsVideoPlayerProps = {
  mp4Url?: string;
  hlsUrl?: string;
  poster?: string;
  className?: string;
};

export function HlsVideoPlayer({
  mp4Url,
  hlsUrl,
  poster,
  className,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (mp4Url) {
      video.src = mp4Url;
      return;
    }

    if (!hlsUrl) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      return;
    }

    if (!Hls.isSupported()) return;

    const hls = new Hls({ enableWorker: true });
    hls.loadSource(hlsUrl);
    hls.attachMedia(video);

    return () => {
      hls.destroy();
    };
  }, [mp4Url, hlsUrl]);

  return (
    <video
      ref={videoRef}
      className={cn(className)}
      controls
      playsInline
      preload="metadata"
      poster={poster}
    />
  );
}
