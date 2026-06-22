"use client";

import type { GameListItem } from "@/entities/game/types";
import { cn } from "@/shared/lib/cn";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

type DayReleaseListProps = {
  dateKey: string | null;
  games: GameListItem[];
  featuredGameId: string | null;
  wishlistIds: Set<string>;
  onSelectGame: (game: GameListItem) => void;
  layout?: "horizontal" | "vertical";
  className?: string;
};

export function DayReleaseList({
  dateKey,
  games,
  featuredGameId,
  wishlistIds,
  onSelectGame,
  layout = "horizontal",
  className,
}: DayReleaseListProps) {
  const title = dateKey
    ? format(parseISO(dateKey), "M月d日", { locale: zhCN })
    : "选日";

  const vertical = layout === "vertical";

  return (
    <section
      key={dateKey ?? "none"}
      className={cn(
        "showcase-part-enter",
        vertical && "flex min-h-0 flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-baseline justify-between gap-2",
          vertical ? "mb-2 px-0.5" : "mb-3",
        )}
      >
        <h2 className="font-display text-sm font-semibold text-zinc-200 xl:text-base">
          {`${title} 发售`}
        </h2>
        {games.length > 0 ? (
          <span className="text-[10px] tabular-nums text-zinc-500">
            {games.length} 款
          </span>
        ) : null}
      </div>

      {games.length === 0 ? (
        <p
          className={cn(
            "rounded-xl border border-white/5 bg-black/25 text-center text-xs text-zinc-500",
            vertical ? "px-2 py-8" : "px-4 py-6 text-sm",
          )}
        >
          该日暂无发售
        </p>
      ) : (
        <ul
          className={cn(
            vertical
              ? "showcase-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain py-0.5 pl-0.5 pr-1"
              : "flex gap-3 overflow-x-auto px-0.5 py-1 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]",
          )}
        >
          {games.map((game) => (
            <li key={game.id} className={vertical ? "shrink-0" : "snap-start"}>
              <DayReleaseCoverButton
                game={game}
                active={game.id === featuredGameId}
                watched={wishlistIds.has(game.id)}
                compact={vertical}
                onSelect={() => onSelectGame(game)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DayReleaseCoverButton({
  game,
  active,
  watched,
  compact,
  onSelect,
}: {
  game: GameListItem;
  active: boolean;
  watched: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative box-border rounded-lg transition-[border-color,opacity,box-shadow] duration-300",
        "border-2",
        compact ? "w-full" : "w-[7.5rem] shrink-0 sm:w-[8.5rem]",
        active
          ? "border-cyan-400/90 shadow-md shadow-cyan-500/25"
          : "border-white/10 opacity-85 hover:opacity-100 hover:border-white/25",
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[6px] bg-zinc-900">
        {game.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
            无封面
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {watched ? (
          <span className="absolute right-1.5 top-1.5 text-xs text-amber-400">★</span>
        ) : null}
        {game.releaseEdition === "early_access" ? (
          <span className="absolute left-1 top-1 z-10 rounded-sm bg-amber-500 px-1 py-px text-[9px] font-bold leading-none text-black">
            EA
          </span>
        ) : null}
        <p
          className={cn(
            "absolute bottom-0 left-0 right-0 line-clamp-2 p-2 text-left font-medium leading-tight text-white",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {game.name}
        </p>
      </div>
    </button>
  );
}

/** 横向条带（窄屏） */
export function DayReleaseStrip(
  props: Omit<DayReleaseListProps, "layout" | "className">,
) {
  return <DayReleaseList {...props} layout="horizontal" />;
}
