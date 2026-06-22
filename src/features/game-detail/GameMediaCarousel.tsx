"use client";

import type { GameMediaSlide } from "@/entities/game/detail-types";
import { cn } from "@/shared/lib/cn";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

type GameMediaCarouselProps = {
  slides: GameMediaSlide[];
  fallbackCover?: string | null;
};

export function GameMediaCarousel({
  slides,
  fallbackCover,
}: GameMediaCarouselProps) {
  const items =
    slides.length > 0
      ? slides
      : fallbackCover
        ? [
            {
              kind: "image" as const,
              id: "cover",
              url: fallbackCover,
              thumbUrl: fallbackCover,
            },
          ]
        : [];

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxStartId, setLightboxStartId] = useState<string | null>(null);

  const current = items[Math.min(index, Math.max(0, items.length - 1))];
  const hasMultiple = items.length > 1;

  const go = useCallback(
    (delta: number) => {
      if (items.length === 0) return;
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length],
  );

  if (!current) {
    return (
      <div className="flex h-44 items-center justify-center bg-zinc-800 text-sm text-zinc-500">
        暂无媒体
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="relative aspect-video w-full bg-black">
          {current.kind === "video" ? (
            <HlsVideoPlayer
              key={current.id}
              className="h-full w-full object-contain"
              mp4Url={current.mp4Url}
              hlsUrl={current.hlsUrl}
              poster={current.thumbUrl ?? undefined}
            />
          ) : (
            <button
              type="button"
              className="block h-full w-full cursor-zoom-in"
              onClick={() => {
                setLightboxStartId(current.id);
                setLightbox(true);
              }}
              aria-label="放大截图"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt=""
                className="h-full w-full object-contain"
              />
            </button>
          )}

          {hasMultiple ? (
            <>
              <NavButton
                label="上一张"
                className="left-2"
                size="md"
                onClick={() => go(-1)}
              />
              <NavButton
                label="下一张"
                className="right-2"
                size="md"
                onClick={() => go(1)}
              />
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] tabular-nums text-zinc-200">
                {index + 1} / {items.length}
              </span>
            </>
          ) : null}

          {current.kind === "video" ? (
            <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-zinc-200">
              预告片
            </span>
          ) : null}
        </div>

        {hasMultiple ? (
          <div className="flex gap-1 overflow-x-auto p-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-12 w-20 shrink-0 overflow-hidden rounded border-2 transition-colors",
                  i === index
                    ? "border-violet-500"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbUrl ?? (item.kind === "image" ? item.url : "")}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {item.kind === "video" ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white">
                    ▶
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightbox && lightboxStartId ? (
        <Lightbox
          key={lightboxStartId}
          items={items.filter((s) => s.kind === "image")}
          startId={lightboxStartId}
          onClose={() => {
            setLightbox(false);
            setLightboxStartId(null);
          }}
        />
      ) : null}
    </>
  );
}

function NavButton({
  label,
  className,
  size = "md",
  onClick,
}: {
  label: string;
  className?: string;
  size?: "md" | "lg";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2 cursor-pointer",
        "flex items-center justify-center rounded-full border border-white/10",
        "bg-black/55 text-white shadow-lg backdrop-blur-sm transition-all",
        "hover:scale-105 hover:border-white/30 hover:bg-white/20 active:scale-95",
        size === "md" && "h-10 w-10 text-xl",
        size === "lg" && "h-14 w-14 text-3xl",
        className,
      )}
    >
      {label === "上一张" ? "‹" : "›"}
    </button>
  );
}

function Lightbox({
  items,
  startId,
  onClose,
}: {
  items: Extract<GameMediaSlide, { kind: "image" }>[];
  startId: string;
  onClose: () => void;
}) {
  const start = Math.max(
    0,
    items.findIndex((i) => i.id === startId),
  );
  const [idx, setIdx] = useState(start);
  const item = items[idx];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goPrev = () =>
    setIdx((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIdx((i) => (i + 1) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setIdx((i) => (i - 1 + items.length) % items.length);
      }
      if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % items.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  if (!item || typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal
      aria-label="截图全屏预览"
    >
      <button
        type="button"
        aria-label="关闭预览"
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <div className="pointer-events-auto flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm tabular-nums text-zinc-300">
            {idx + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/25"
          >
            关闭
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          {items.length > 1 ? (
            <>
              <NavButton
                label="上一张"
                className="left-3 sm:left-8"
                size="lg"
                onClick={goPrev}
              />
              <NavButton
                label="下一张"
                className="right-3 sm:right-8"
                size="lg"
                onClick={goNext}
              />
            </>
          ) : null}
          <div className="pointer-events-none flex h-full w-full items-center justify-center px-16 py-8 sm:px-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt=""
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
