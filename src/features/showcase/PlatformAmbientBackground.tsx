"use client";

type PlatformAmbientBackgroundProps = {
  coverUrl: string | null;
};

/** 封面切换时仅图层轻淡入，不再整屏先黑再亮 */
export function PlatformAmbientBackground({
  coverUrl,
}: PlatformAmbientBackgroundProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]"
    >
      {coverUrl ? (
        <div key={coverUrl} className="showcase-ambient-enter absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt=""
            className="ambient-cover-bloom absolute inset-0 h-full w-full scale-[1.35] object-cover blur-[96px]"
          />
        </div>
      ) : null}
      <AmbientScrim />
    </div>
  );
}

function AmbientScrim() {
  return (
    <>
      <div className="ambient-scrim-vignette absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_30%,transparent_0%,#020617_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/15 to-[#020617]" />
      <div className="absolute inset-0 bg-[#020617]/35" />
    </>
  );
}
