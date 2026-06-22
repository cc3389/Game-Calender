"use client";

import {
  groupGamesByReleased,
  type GameListItem,
} from "@/entities/game/types";
import { cn } from "@/shared/lib/cn";
import { platformColorForName } from "@/shared/config/platforms";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CSSProperties } from "react";
import { useMemo } from "react";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const MAX_MICRO_COVERS = 3;

type ReleaseCalendarProps = {
  viewDate: Date;
  games: GameListItem[];
  selectedDateKey: string | null;
  featuredGameId?: string | null;
  wishlistIds?: Set<string>;
  onSelectDate: (dateKey: string, dayGames: GameListItem[]) => void;
  onSelectGame?: (game: GameListItem) => void;
};

export function ReleaseCalendar({
  viewDate,
  games,
  selectedDateKey,
  featuredGameId,
  wishlistIds,
  onSelectDate,
  onSelectGame,
}: ReleaseCalendarProps) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const byDate = useMemo(() => groupGamesByReleased(games), [games]);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthAnimKey = format(viewDate, "yyyy-MM");

  return (
    <section className="release-calendar-panel">
      <div className="cal-board-frame overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="cal-board-header grid grid-cols-7 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/30 via-zinc-900/50 to-violet-950/25">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                "px-1 py-1.5 text-center text-[10px] font-semibold tracking-wide",
                i >= 5 ? "text-violet-400/80" : "text-cyan-400/70",
              )}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          key={monthAnimKey}
          className="cal-board-grid grid grid-cols-7 gap-px bg-white/[0.06] p-px"
        >
          {days.map((day, cellIndex) => {
            const key = format(day, "yyyy-MM-dd");
            const dayGames = byDate.get(key) ?? [];
            return (
              <CalendarDayCell
                key={key}
                cellIndex={cellIndex}
                day={day}
                dateKey={key}
                dayGames={dayGames}
                inMonth={isSameMonth(day, viewDate)}
                selected={selectedDateKey === key}
                today={isToday(day)}
                featuredGameId={featuredGameId ?? null}
                hasWishlist={dayGames.some((g) => wishlistIds?.has(g.id))}
                onSelectDate={() => onSelectDate(key, dayGames)}
                onSelectGame={onSelectGame}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalendarDayCell({
  cellIndex,
  day,
  dateKey,
  dayGames,
  inMonth,
  selected,
  today,
  featuredGameId,
  hasWishlist,
  onSelectDate,
  onSelectGame,
}: {
  cellIndex: number;
  day: Date;
  dateKey: string;
  dayGames: GameListItem[];
  inMonth: boolean;
  selected: boolean;
  today: boolean;
  featuredGameId: string | null;
  hasWishlist: boolean;
  onSelectDate: () => void;
  onSelectGame?: (game: GameListItem) => void;
}) {
  const hasRelease = dayGames.length > 0;
  const heroCover = dayGames.find((g) => g.coverUrl)?.coverUrl ?? null;
  const hotDay = dayGames.length >= 3;

  if (!inMonth) {
    return (
      <div className="cal-day-slot cal-day-slot--ghost relative flex min-h-[4.5rem] flex-col p-1.5 sm:min-h-[5rem] xl:min-h-[6rem] 2xl:min-h-[6.75rem]">
        <span className="text-[11px] font-semibold tabular-nums leading-none text-zinc-600">
          {format(day, "d")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "cal-day-slot group/cell relative flex min-h-[4.5rem] flex-col overflow-hidden p-1.5 sm:min-h-[5rem] xl:min-h-[6rem] 2xl:min-h-[6.75rem]",
        hasRelease && "cal-day-slot--loot cal-cell-deal",
        hasRelease && "hover:z-[3] hover:-translate-y-0.5",
        hotDay && "cal-day-slot--hot",
        selected && "cal-day-slot--selected z-[2]",
        today && "cal-day-slot--today",
        !hasRelease && "cal-day-slot--empty",
      )}
      style={
        hasRelease
          ? ({ animationDelay: `${(cellIndex % 14) * 32}ms` } as CSSProperties)
          : undefined
      }
    >
      {hasRelease && heroCover ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.2] transition-opacity duration-300 group-hover/cell:opacity-[0.32]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroCover}
            alt=""
            className="h-full w-full scale-110 object-cover blur-[3px] saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
        </div>
      ) : null}

      {/* 整格点击：选中该日（默认首款） */}
      <button
        type="button"
        onClick={onSelectDate}
        aria-label={
          hasRelease
            ? `${dateKey}，${dayGames.length} 款发售`
            : `${dateKey} 无发售`
        }
        className="absolute inset-0 z-0 cursor-pointer rounded-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      />

      {today ? (
        <span className="cal-today-ping pointer-events-none absolute bottom-1 left-1 z-[5] size-1.5 rounded-full bg-violet-400" aria-hidden />
      ) : null}

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-0.5">
        <span
          className={cn(
            "cal-day-badge flex h-5 min-w-[1.25rem] items-center justify-center gap-0.5 rounded-md px-1 text-[11px] font-bold tabular-nums leading-none",
            selected && "cal-day-badge--active",
            today && !selected && "cal-day-badge--today",
            hasRelease && !selected && !today && "cal-day-badge--loot",
            !hasRelease && "text-zinc-500",
          )}
        >
          {format(day, "d")}
        </span>
        {hasWishlist ? (
          <span className="cal-wishlist-star text-[9px] text-amber-400" aria-hidden>
            ★
          </span>
        ) : null}
      </div>

      {hasRelease ? (
        <div className="relative z-10 mt-auto flex flex-col items-center gap-1">
          <MicroCoverFan
            games={dayGames}
            expanded={selected}
            featuredGameId={featuredGameId}
            onSelectGame={onSelectGame}
            onSelectDate={onSelectDate}
          />
          <PlatformMicroBar
            platformNames={dayGames.flatMap((g) => g.platformNames)}
            vivid={selected}
          />
        </div>
      ) : (
        <span className="mt-auto block h-6 w-full" />
      )}
    </div>
  );
}

function MicroCoverFan({
  games,
  expanded,
  featuredGameId,
  onSelectGame,
  onSelectDate,
}: {
  games: GameListItem[];
  expanded: boolean;
  featuredGameId: string | null;
  onSelectGame?: (game: GameListItem) => void;
  onSelectDate: () => void;
}) {
  const shown = games.slice(0, MAX_MICRO_COVERS);
  const extra = games.length - shown.length;
  const n = shown.length;

  return (
    <div className="relative h-11 w-full xl:h-[3.25rem] 2xl:h-[3.75rem]">
      {shown.map((game, i) => {
        const offset = i - (n - 1) / 2;
        const stackX = offset * 12;
        const stackRot = offset * 6;
        const fanX = offset * 30;
        const fanX2xl = offset * 36;
        const isActive = !!featuredGameId && game.id === featuredGameId;

        const style = {
          "--stack-x": `${stackX}px`,
          "--stack-rot": `${stackRot}deg`,
          "--fan-x": `${fanX}px`,
          zIndex: 30 - Math.round(Math.abs(offset) * 2),
        } as CSSProperties;

        return (
          <button
            key={game.id}
            type="button"
            title={game.name}
            aria-label={`选择 ${game.name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectGame) onSelectGame(game);
              else onSelectDate();
            }}
            style={style}
            className={cn(
              "cal-cover absolute left-1/2 top-0 h-11 w-8 overflow-hidden rounded-[5px] border bg-zinc-800",
              "xl:h-[3.25rem] xl:w-[2.35rem] 2xl:h-[3.75rem] 2xl:w-[2.75rem]",
              expanded && "is-expanded",
              isActive && "is-picked",
              isActive
                ? "border-cyan-300/90 ring-1 ring-cyan-400/50"
                : "border-white/30",
            )}
          >
            {game.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.coverUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[6px] text-zinc-500">
                ?
              </span>
            )}
            {game.releaseEdition === "early_access" ? (
              <span className="absolute bottom-0 left-0 right-0 bg-amber-500/90 py-px text-center text-[5px] font-black leading-none text-black">
                EA
              </span>
            ) : null}
          </button>
        );
      })}

      {extra > 0 ? (
        <span
          className="cal-loot-more pointer-events-none absolute -right-0.5 top-0 z-40 rounded-full px-1 py-px text-[8px] font-bold tabular-nums text-amber-100"
          aria-hidden
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function PlatformMicroBar({
  platformNames,
  vivid,
}: {
  platformNames: string[];
  vivid?: boolean;
}) {
  const unique = [...new Set(platformNames)].slice(0, 4);
  if (unique.length === 0) return null;
  return (
    <div
      className={cn(
        "flex h-1 w-full max-w-[3rem] gap-px overflow-hidden rounded-full ring-1 ring-black/40 xl:max-w-[3.5rem] 2xl:max-w-[4rem]",
        vivid && "ring-cyan-500/20",
      )}
    >
      {unique.map((name) => (
        <span
          key={name}
          className={cn("h-full flex-1", platformColorForName(name))}
        />
      ))}
    </div>
  );
}
