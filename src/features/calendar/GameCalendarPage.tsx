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
import { GameSearch } from "@/features/search/GameSearch";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { WishlistPanel } from "@/features/wishlist/WishlistPanel";
import { fetchGameDetail, fetchGamesByMonth } from "@/shared/api/client";
import { DEFAULT_PLATFORM_IDS } from "@/shared/config/platforms";
import { useIsClient } from "@/shared/hooks/useIsClient";
import {
  buildCalendarSearchParams,
  parseCalendarUrl,
  parseMonthKeyToDate,
  releasedToMonthKey,
  replaceCalendarUrl,
  readCalendarUrlSignature,
} from "@/shared/lib/calendar-url";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMPTY_WISHLIST_IDS = new Set<string>();

export function GameCalendarPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isClient = useIsClient();

  const [initialCalendarUrl] = useState(() => parseCalendarUrl(searchParams));
  const deepLinkGameHandled = useRef(false);

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
  } = useCalendarMonth(parseMonthKeyToDate(initialCalendarUrl.monthKey));

  const [platformIds, setPlatformIds] = useState<number[]>(
    () => initialCalendarUrl.platformIds ?? DEFAULT_PLATFORM_IDS,
  );
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<{
    dateKey: string;
    games: GameListItem[];
  } | null>(null);

  const { entries: wishlistEntries, ids: wishlistIds, toggle, isWishlisted } =
    useWishlist();

  const displayWishlistEntries = isClient ? wishlistEntries : [];
  const displayWishlistIds = isClient ? wishlistIds : EMPTY_WISHLIST_IDS;

  const query = useQuery({
    queryKey: ["games", monthKey, platformIds],
    queryFn: () => fetchGamesByMonth(monthKey, platformIds),
  });

  const displayedGames = useMemo(() => {
    const games = query.data?.games ?? [];
    if (!wishlistOnly || !isClient) return games;
    return games.filter((g) => displayWishlistIds.has(g.id));
  }, [query.data?.games, wishlistOnly, isClient, displayWishlistIds]);

  const jumpToMonthKey = useCallback(
    (key: string) => {
      const [y, m] = key.split("-").map(Number);
      if (y && m) goToYearMonth(y, m);
    },
    [goToYearMonth],
  );

  const openGame = useCallback((game: GameListItem) => {
    setSelectedGame(game);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) setSelectedGame(null);
  }, []);

  const handleExpandDay = useCallback(
    (dateKey: string, games: GameListItem[]) => {
      setExpandedDay({ dateKey, games });
      setDayDialogOpen(true);
    },
    [],
  );

  const selectedGameId = selectedGame?.id ?? null;

  useEffect(() => {
    const gameId = initialCalendarUrl.gameId;
    if (!gameId || deepLinkGameHandled.current) return;
    deepLinkGameHandled.current = true;

    let cancelled = false;
    void fetchGameDetail(gameId).then((res) => {
      if (cancelled) return;
      const game = res.game;
      if (!game) return;

      if (!initialCalendarUrl.monthKey) {
        const mk = releasedToMonthKey(game.released);
        if (mk) jumpToMonthKey(mk);
      }

      setSelectedGame(game);
      setDetailOpen(true);
    });

    return () => {
      cancelled = true;
    };
    // 仅处理首屏 URL 中的 game= 深链，不随后续地址栏变化重复拉取
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialCalendarUrl is frozen at mount
  }, [jumpToMonthKey]);

  useEffect(() => {
    if (!isClient) return;

    const params = buildCalendarSearchParams({
      monthKey,
      platformIds,
      gameId: detailOpen && selectedGameId ? selectedGameId : null,
    });
    const nextSig = params.toString();
    if (nextSig === readCalendarUrlSignature()) return;

    replaceCalendarUrl(pathname, params);
  }, [isClient, monthKey, platformIds, detailOpen, selectedGameId, pathname]);

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

      <div className="flex flex-wrap items-center gap-2">
        <GameSearch
          platformIds={platformIds}
          onSelectGame={openGame}
          onJumpToMonth={jumpToMonthKey}
        />
        <WishlistPanel
          entries={displayWishlistEntries}
          onSelectGame={openGame}
          onJumpToMonth={jumpToMonthKey}
        />
      </div>

      <PlatformFilter selectedIds={platformIds} onChange={setPlatformIds} />

      <div className="flex flex-wrap items-center gap-3">
        <PlatformLegend />
        <button
          type="button"
          disabled={!isClient || displayWishlistIds.size === 0}
          onClick={() => setWishlistOnly((v) => !v)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
            wishlistOnly
              ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
            (!isClient || displayWishlistIds.size === 0) &&
              "cursor-not-allowed opacity-40",
          )}
        >
          仅显示关注
        </button>
      </div>

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

      {query.isSuccess && displayedGames.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-400">
          {wishlistOnly && isClient
            ? "本月没有已关注的游戏，试试取消「仅显示关注」或添加关注。"
            : "本月暂无匹配平台的发售游戏。"}
        </p>
      ) : null}

      {query.isSuccess && displayedGames.length > 0 ? (
        <CalendarMonth
          viewDate={viewDate}
          games={displayedGames}
          wishlistIds={displayWishlistIds}
          onSelectGame={openGame}
          onExpandDay={handleExpandDay}
        />
      ) : null}

      <GameDetailDialog
        game={selectedGame}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        isWishlisted={
          selectedGame && isClient ? isWishlisted(selectedGame.id) : false
        }
        onToggleWishlist={toggle}
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
