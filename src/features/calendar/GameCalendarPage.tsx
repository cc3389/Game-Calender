"use client";

import type { GameListItem } from "@/entities/game/types";
import { CalendarMonth } from "@/features/calendar/CalendarMonth";
import { CalendarToolbar } from "@/features/calendar/CalendarToolbar";
import { useCalendarMonth } from "@/features/calendar/useCalendarMonth";
import {
  DayGamesDialog,
  GameDetailDialog,
} from "@/features/game-detail/GameDetailDialog";
import { PlatformFilter } from "@/features/platform-filter/PlatformFilter";
import { PlatformLegend } from "@/features/platform-filter/PlatformLegend";
import { fetchGamesByMonth } from "@/shared/api/client";
import { DEFAULT_PLATFORM_IDS } from "@/shared/config/platforms";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function GameCalendarPage() {
  const {
    viewDate,
    viewYear,
    viewMonth,
    monthKey,
    monthLabel,
    goPrev,
    goNext,
    goToday,
    goToYearMonth,
  } = useCalendarMonth();
  const [platformIds, setPlatformIds] = useState<number[]>(
    DEFAULT_PLATFORM_IDS,
  );
  const [selectedGame, setSelectedGame] = useState<GameListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<{
    dateKey: string;
    games: GameListItem[];
  } | null>(null);

  const query = useQuery({
    queryKey: ["games", monthKey, platformIds],
    queryFn: () => fetchGamesByMonth(monthKey, platformIds),
  });

  const openGame = useCallback((game: GameListItem) => {
    setSelectedGame(game);
    setDetailOpen(true);
  }, []);

  const handleExpandDay = useCallback(
    (dateKey: string, games: GameListItem[]) => {
      setExpandedDay({ dateKey, games });
      setDayDialogOpen(true);
    },
    [],
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <CalendarToolbar
        monthLabel={monthLabel}
        viewYear={viewYear}
        viewMonth={viewMonth}
        provider={query.data?.provider}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onJump={goToYearMonth}
      />

      <PlatformFilter selectedIds={platformIds} onChange={setPlatformIds} />
      <PlatformLegend />

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[420px] w-full" />
        </div>
      ) : null}

      {query.isError ? (
        <div
          className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200"
          role="alert"
        >
          <p>{query.error.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => query.refetch()}
          >
            重试
          </Button>
        </div>
      ) : null}

      {query.isSuccess && query.data.games.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-400">
          本月暂无匹配平台的发售游戏。
        </p>
      ) : null}

      {query.isSuccess && query.data.games.length > 0 ? (
        <CalendarMonth
          viewDate={viewDate}
          games={query.data.games}
          onSelectGame={openGame}
          onExpandDay={handleExpandDay}
        />
      ) : null}

      <GameDetailDialog
        game={selectedGame}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DayGamesDialog
        dateKey={expandedDay?.dateKey ?? null}
        games={expandedDay?.games ?? []}
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        onSelectGame={openGame}
      />
    </main>
  );
}
