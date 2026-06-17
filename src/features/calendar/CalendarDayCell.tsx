"use client";

import type { GameListItem } from "@/entities/game/types";
import { cn } from "@/shared/lib/cn";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import { format, isSameMonth, isToday } from "date-fns";

const MAX_VISIBLE = 3;

type CalendarDayCellProps = {
  date: Date;
  month: Date;
  games: GameListItem[];
  wishlistIds?: Set<string>;
  onSelectGame: (game: GameListItem) => void;
  onExpandDay?: (date: string, games: GameListItem[]) => void;
};

export function CalendarDayCell({
  date,
  month,
  games,
  wishlistIds,
  onSelectGame,
  onExpandDay,
}: CalendarDayCellProps) {
  const inMonth = isSameMonth(date, month);
  const dateKey = format(date, "yyyy-MM-dd");
  const visible = games.slice(0, MAX_VISIBLE);
  const overflow = games.length - visible.length;

  return (
    <div
      className={cn(
        "flex min-h-[7.25rem] flex-col border border-zinc-800/80 bg-zinc-900/40 p-1.5",
        !inMonth && "opacity-40",
        isToday(date) && "ring-1 ring-violet-500/60",
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            isToday(date) ? "text-violet-300" : "text-zinc-400",
          )}
        >
          {format(date, "d")}
        </span>
        {overflow > 0 && onExpandDay ? (
          <button
            type="button"
            className="text-[10px] text-violet-400 hover:underline"
            onClick={() => onExpandDay(dateKey, games)}
          >
            +{overflow}
          </button>
        ) : null}
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {visible.map((game) => {
          const watched = wishlistIds?.has(game.id);
          return (
          <li key={game.id}>
            <button
              type="button"
              onClick={() => onSelectGame(game)}
              className={cn(
                "group flex w-full items-start gap-1 rounded px-0.5 py-px text-left hover:bg-white/5",
                watched && "bg-amber-500/10 ring-1 ring-amber-500/30",
              )}
              title={`${game.name} · ${game.platformNames.join(", ") || "平台未知"}`}
            >
              <PlatformBadgeGroup
                variant="dot"
                platformNames={game.platformNames}
                max={5}
                className="mt-1.5"
              />
              <span className="line-clamp-2 min-w-0 flex-1 text-[10px] leading-snug text-zinc-200 group-hover:text-white">
                {watched ? (
                  <span className="mr-0.5 text-amber-400" aria-hidden>
                    ★
                  </span>
                ) : null}
                {game.releaseEdition === "early_access" ? (
                  <span className="mr-0.5 font-semibold text-amber-400/90">
                    EA
                  </span>
                ) : null}
                {game.name}
              </span>
            </button>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DayChipList({
  games,
  onSelectGame,
}: {
  games: GameListItem[];
  onSelectGame: (game: GameListItem) => void;
}) {
  return (
    <ul className="space-y-2">
      {games.map((game) => (
        <li key={game.id}>
          <button
            type="button"
            onClick={() => onSelectGame(game)}
            className="flex w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 p-2 text-left hover:border-violet-500/50"
          >
            {game.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.coverUrl}
                alt=""
                className="h-12 w-20 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                无封面
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-1.5">
                <PlatformBadgeGroup
                  variant="chip"
                  platformNames={game.platformNames}
                />
              </div>
              <p className="truncate text-sm font-medium text-zinc-100">
                {game.name}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
