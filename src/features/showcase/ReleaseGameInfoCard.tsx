"use client";

import type { GameDetailMedia } from "@/entities/game/detail-types";
import type { GameListItem } from "@/entities/game/types";
import { releaseEditionLabel } from "@/entities/game/release-edition";
import { cn } from "@/shared/lib/cn";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

type ReleaseGameInfoCardProps = {
  game: GameListItem;
  detail: GameDetailMedia | undefined;
  detailInitialLoad: boolean;
  detailRefreshing?: boolean;
  detailError: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (game: GameListItem) => void;
  variant?: "default" | "sidebar";
  className?: string;
};

export function ReleaseGameInfoCard({
  game,
  detail,
  detailInitialLoad,
  detailRefreshing = false,
  detailError,
  isWishlisted,
  onToggleWishlist,
  variant = "default",
  className,
}: ReleaseGameInfoCardProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const sidebar = variant === "sidebar";

  const descZh = detail?.descriptionZh?.trim() ?? "";
  const descEn = detail?.descriptionEn?.trim() ?? "";
  const hasLongDesc =
    descZh.length > 180 || descEn.length > 180 || (descZh && descEn);

  return (
    <div
      className={cn(
        "border border-white/10 bg-black/45 backdrop-blur-md transition-opacity duration-200",
        detailRefreshing && "opacity-95",
        sidebar
          ? "flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-xl"
          : "rounded-2xl px-3 py-3 sm:px-4",
        className,
      )}
    >
      <div
        key={game.id}
        className={cn(
          "showcase-part-enter",
          sidebar &&
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 showcase-scrollbar [-ms-overflow-style:none]",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadgeGroup
            variant="chip"
            platformNames={game.platformNames}
            max={sidebar ? 6 : 8}
          />
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
            {releaseEditionLabel(game.releaseEdition)}
          </span>
          {detailRefreshing ? (
            <span className="text-[10px] text-cyan-400/70">加载中…</span>
          ) : null}
        </div>

        {sidebar ? (
          <h2 className="font-display mt-2 text-base font-bold leading-snug text-zinc-50">
            {game.name}
          </h2>
        ) : null}

        {game.nameOriginal && game.nameOriginal !== game.name ? (
          <p className="text-xs text-zinc-500">{game.nameOriginal}</p>
        ) : null}

        <p className="mt-1 text-xs text-zinc-400">
          {format(parseISO(game.released), "yyyy年M月d日 EEEE", {
            locale: zhCN,
          })}
        </p>

        {detailInitialLoad ? (
          <div className="mt-3 space-y-2">
            <div className="h-2.5 animate-pulse rounded bg-white/8" />
            <div className="h-2.5 w-4/5 animate-pulse rounded bg-white/6" />
          </div>
        ) : null}

        {detail?.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {detail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {!detailInitialLoad && (descZh || descEn) ? (
          <div className="mt-3 space-y-2">
            {descZh ? (
              <p
                className={cn(
                  sidebar ? "text-xs" : "text-sm",
                  "leading-relaxed text-zinc-300",
                  !descExpanded && (sidebar ? "line-clamp-4" : "line-clamp-3"),
                )}
              >
                {descZh}
              </p>
            ) : null}
            {descEn && descExpanded ? (
              <p className="text-sm leading-relaxed text-zinc-500">{descEn}</p>
            ) : null}
            {hasLongDesc ? (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="text-xs font-medium text-cyan-400/90 hover:text-cyan-300"
              >
                {descExpanded ? "收起介绍" : "阅读全文"}
              </button>
            ) : null}
          </div>
        ) : null}

        {!detailInitialLoad && !descZh && detailRefreshing ? (
          <div className="mt-3 h-8 animate-pulse rounded-md bg-white/5" />
        ) : null}

        {detailError ? (
          <p className="mt-3 text-xs text-amber-200/90">介绍加载失败，请稍后重试</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleWishlist(game)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              isWishlisted
                ? "border-amber-400/60 bg-amber-500/20 text-amber-100"
                : "border-white/15 bg-white/5 text-zinc-200 hover:border-amber-400/40",
            )}
          >
            {isWishlisted ? "已关注" : "加入关注"}
          </button>
          {game.storeLinks[0] ? (
            <a
              href={game.storeLinks[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-cyan-400"
            >
              前往 {game.storeLinks[0].name}
            </a>
          ) : null}
        </div>

        {game.storeLinks.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
            {game.storeLinks.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cyan-300/95 hover:border-cyan-400/35 hover:text-cyan-200"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
