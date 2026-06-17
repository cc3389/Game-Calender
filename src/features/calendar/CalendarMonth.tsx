"use client";

import {
  groupGamesByReleased,
  type GameListItem,
} from "@/entities/game/types";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo } from "react";
import { CalendarDayCell } from "./CalendarDayCell";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

type CalendarMonthProps = {
  viewDate: Date;
  games: GameListItem[];
  wishlistIds?: Set<string>;
  onSelectGame: (game: GameListItem) => void;
  onExpandDay: (dateKey: string, games: GameListItem[]) => void;
};

export function CalendarMonth({
  viewDate,
  games,
  wishlistIds,
  onSelectGame,
  onExpandDay,
}: CalendarMonthProps) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const byDate = useMemo(() => groupGamesByReleased(games), [games]);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
      <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/80">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-zinc-500"
          >
            周{d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayGames = byDate.get(key) ?? [];
          return (
            <CalendarDayCell
              key={key}
              date={day}
              month={viewDate}
              games={dayGames}
              wishlistIds={wishlistIds}
              onSelectGame={onSelectGame}
              onExpandDay={(dateKey, list) => onExpandDay(dateKey, list)}
            />
          );
        })}
      </div>
    </div>
  );
}
