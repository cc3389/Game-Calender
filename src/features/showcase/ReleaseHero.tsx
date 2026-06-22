"use client";

import type { GameMediaSlide } from "@/entities/game/detail-types";
import type { GameListItem } from "@/entities/game/types";
import { HlsVideoPlayer } from "@/features/game-detail/HlsVideoPlayer";
import { cn } from "@/shared/lib/cn";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ReleaseHeroProps = {
  game: GameListItem | null;
  slides?: GameMediaSlide[];
};

const HERO_MEDIA_FRAME =
  "showcase-hero-frame relative w-full overflow-hidden bg-black";

export function ReleaseHero({ game, slides = [] }: ReleaseHeroProps) {
  if (!game) {
    return (
      <div
        className={cn(
          HERO_MEDIA_FRAME,
          "flex items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm",
        )}
      >
        <p className="text-sm text-zinc-500">选择日历日期与下方封面以预览发售作品</p>
      </div>
    );
  }

  const items = buildHeroItems(slides, game.coverUrl);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/30">
      <div className="relative">
        <HeroMediaCarousel gameId={game.id} items={items} />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/50 via-black/15 to-transparent"
          aria-hidden
        />
        <HeroTitleOverlay game={game} />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}

function HeroTitleOverlay({ game }: { game: GameListItem }) {
  return (
    <div
      key={game.id}
      className="showcase-part-enter pointer-events-none absolute left-3 top-3 z-20 max-w-[min(75%,20rem)] pr-16 sm:pr-20 xl:max-w-[min(80%,28rem)] xl:pr-24 2xl:left-5 2xl:top-5"
    >
      <h2 className="font-display line-clamp-2 text-base font-bold leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_24px_rgba(0,0,0,0.65)] sm:text-lg xl:text-xl 2xl:text-2xl">
        {game.name}
      </h2>
      {game.nameOriginal && game.nameOriginal !== game.name ? (
        <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-200/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
          {game.nameOriginal}
        </p>
      ) : null}
    </div>
  );
}

function buildHeroItems(
  slides: GameMediaSlide[],
  fallbackCover: string | null,
): GameMediaSlide[] {
  if (slides.length > 0) return slides;
  if (!fallbackCover) return [];
  return [
    {
      kind: "image",
      id: "cover",
      url: fallbackCover,
      thumbUrl: fallbackCover,
    },
  ];
}

const SLIDE_FADE_MS = 420;
const SLIDE_PRELOAD_TIMEOUT_MS = 2500;

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      void img.decode().finally(() => resolve());
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

function preloadHeroSlide(slide: GameMediaSlide): Promise<void> {
  if (slide.kind === "image") {
    return preloadImage(slide.url);
  }
  const poster = slide.thumbUrl ?? slide.mp4Url;
  return poster ? preloadImage(poster) : Promise.resolve();
}

function preloadHeroSlideWithTimeout(slide: GameMediaSlide): Promise<void> {
  return Promise.race([
    preloadHeroSlide(slide),
    new Promise<void>((resolve) => {
      setTimeout(resolve, SLIDE_PRELOAD_TIMEOUT_MS);
    }),
  ]);
}

function HeroMediaCarousel({
  gameId,
  items,
}: {
  gameId: string;
  items: GameMediaSlide[];
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);
  const prevGameIdRef = useRef(gameId);
  const slideFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevGameIdRef.current === gameId) return;
    prevGameIdRef.current = gameId;
    setIndex(0);
    setSlideVisible(false);
    const t = setTimeout(() => setSlideVisible(true), 80);
    return () => clearTimeout(t);
  }, [gameId]);

  useEffect(() => {
    return () => {
      if (slideFadeTimer.current) clearTimeout(slideFadeTimer.current);
    };
  }, []);

  useEffect(() => {
    for (const item of items) {
      void preloadHeroSlide(item);
    }
  }, [items]);

  const safeIndex = Math.min(index, Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const hasMultiple = items.length > 1;

  const goToIndex = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      const normalized =
        ((next % items.length) + items.length) % items.length;
      const target = items[normalized];
      if (!target || normalized === safeIndex) return;

      if (slideFadeTimer.current) clearTimeout(slideFadeTimer.current);
      setSlideVisible(false);

      slideFadeTimer.current = setTimeout(() => {
        void preloadHeroSlideWithTimeout(target).then(() => {
          setIndex(normalized);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setSlideVisible(true));
          });
        });
      }, SLIDE_FADE_MS / 2);
    },
    [items, safeIndex],
  );

  const go = useCallback(
    (delta: number) => {
      goToIndex(safeIndex + delta);
    },
    [goToIndex, safeIndex],
  );

  if (!current) {
    return (
      <div className={cn(HERO_MEDIA_FRAME, "flex items-center justify-center bg-zinc-900 text-zinc-500 sm:min-h-[10.5rem]")}>
        暂无预览
      </div>
    );
  }

  return (
    <>
      <div className={HERO_MEDIA_FRAME}>
        <div
          key={`${gameId}-${current.id}`}
          className={cn(
            "absolute inset-0 transition-opacity ease-out motion-reduce:transition-none",
            slideVisible ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${SLIDE_FADE_MS}ms` }}
        >
          {current.kind === "video" ? (
            <HlsVideoPlayer
              key={current.id}
              className="h-full w-full object-cover"
              mp4Url={current.mp4Url}
              hlsUrl={current.hlsUrl}
              poster={current.thumbUrl ?? undefined}
            />
          ) : (
            <button
              type="button"
              className="block h-full w-full cursor-zoom-in"
              onClick={() => setLightbox(true)}
              aria-label="放大截图"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.id}
                src={current.url}
                alt=""
                decoding="async"
                className="hero-ken-burns h-full w-full object-cover"
              />
            </button>
          )}
        </div>

        {current.kind === "video" ? (
          <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            预告片
          </span>
        ) : null}

        {hasMultiple ? (
          <>
            <HeroNavBtn label="上一张" className="left-3 top-1/2" onClick={() => go(-1)} />
            <HeroNavBtn
              label="下一张"
              className="right-3 top-1/2"
              onClick={() => go(1)}
            />
            <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
              <HeroSlideDots
                items={items}
                index={safeIndex}
                onSelect={goToIndex}
              />
            </div>
          </>
        ) : null}
      </div>

      {lightbox && current.kind === "image" ? (
        <HeroLightbox url={current.url} onClose={() => setLightbox(false)} />
      ) : null}
    </>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      {/* 略向右偏移，视觉居中 */}
      <path d="M3.6 2.1v5.8L8.1 5 3.6 2.1Z" />
    </svg>
  );
}

function HeroSlideDots({
  items,
  index,
  onSelect,
}: {
  items: GameMediaSlide[];
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm"
      role="tablist"
      aria-label="媒体轮播"
    >
      {items.map((item, i) => {
        const active = i === index;
        const isVideo = item.kind === "video";
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={
              isVideo ? `预告片 ${i + 1}` : `截图 ${i + 1}`
            }
            title={isVideo ? "预告片" : "截图"}
            onClick={() => onSelect(i)}
            className={cn(
              "flex items-center justify-center transition-all duration-300",
              isVideo
                ? cn(
                    "h-2 min-w-[0.5rem] rounded-sm border border-white/25",
                    active
                      ? "w-5 border-cyan-400/80 bg-cyan-400/35"
                      : "w-2 bg-white/25 hover:bg-white/45",
                  )
                : cn(
                    "h-1.5 rounded-full",
                    active ? "w-4 bg-cyan-400" : "w-1.5 bg-white/40 hover:bg-white/70",
                  ),
            )}
          >
            {isVideo ? (
              <PlayIcon
                className={cn(
                  "size-[0.45rem] shrink-0 text-white/90",
                  active ? "opacity-100" : "opacity-70",
                )}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function HeroNavBtn({
  label,
  className,
  onClick,
}: {
  label: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
        "border border-white/15 bg-black/50 text-xl text-white backdrop-blur-sm",
        "transition-colors hover:bg-white/15",
        className,
      )}
    >
      {label === "上一张" ? "‹" : "›"}
    </button>
  );
}

function HeroLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="关闭"
        onClick={onClose}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="relative max-h-full max-w-full object-contain" />
    </div>,
    document.body,
  );
}
