"use client";

import type { GameListItem } from "@/entities/game/types";
import { useCalendarMonth } from "@/features/calendar/useCalendarMonth";
import { DayReleaseList, DayReleaseStrip } from "@/features/showcase/DayReleaseStrip";
import { PlatformAmbientBackground } from "@/features/showcase/PlatformAmbientBackground";
import { ReleaseCalendar } from "@/features/showcase/ReleaseCalendar";
import { ReleaseGameInfoCard } from "@/features/showcase/ReleaseGameInfoCard";
import { ReleaseHero } from "@/features/showcase/ReleaseHero";
import {
  findGameInList,
  filterGamesInMonthKey,
  gamesOnDate,
  isFeaturedSelectionInMonth,
  pickDefaultFeaturedSelection,
  resolveFeaturedInDay,
} from "@/features/showcase/showcase-selection";
import { CalendarFilterBar } from "@/features/showcase/CalendarFilterBar";
import { SiteHeader } from "@/features/showcase/SiteHeader";
import { useWishlist } from "@/features/wishlist/useWishlist";
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
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/cn";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMPTY_WISHLIST_IDS = new Set<string>();

export function PlatformShowcasePage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isClient = useIsClient();

  const [initialCalendarUrl] = useState(() => parseCalendarUrl(searchParams));
  const deepLinkHandled = useRef(false);

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
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [featuredGameId, setFeaturedGameId] = useState<string | null>(
    initialCalendarUrl.gameId,
  );

  const { entries: wishlistEntries, ids: wishlistIds, toggle, isWishlisted } =
    useWishlist();

  const displayWishlistEntries = isClient ? wishlistEntries : [];
  const displayWishlistIds = isClient ? wishlistIds : EMPTY_WISHLIST_IDS;

  const listQuery = useQuery({
    queryKey: ["games", monthKey, platformIds],
    queryFn: () => fetchGamesByMonth(monthKey, platformIds),
    placeholderData: keepPreviousData,
  });

  const displayedGames = useMemo(() => {
    const games = listQuery.data?.games ?? [];
    if (!wishlistOnly || !isClient) return games;
    return games.filter((g) => displayWishlistIds.has(g.id));
  }, [listQuery.data?.games, wishlistOnly, isClient, displayWishlistIds]);

  const monthGames = useMemo(
    () => filterGamesInMonthKey(displayedGames, monthKey),
    [displayedGames, monthKey],
  );

  useEffect(() => {
    if (!listQuery.data) return;

    if (monthGames.length === 0) {
      if (listQuery.isFetching || listQuery.isPlaceholderData) return;
      queueMicrotask(() => {
        setSelectedDateKey(null);
        setFeaturedGameId(null);
      });
      return;
    }

    if (initialCalendarUrl.gameId && !deepLinkHandled.current) {
      const fromList = findGameInList(monthGames, initialCalendarUrl.gameId);
      if (fromList) {
        deepLinkHandled.current = true;
        queueMicrotask(() => {
          setSelectedDateKey(fromList.released);
          setFeaturedGameId(fromList.id);
        });
        return;
      }
    }

    if (
      isFeaturedSelectionInMonth(
        monthGames,
        monthKey,
        selectedDateKey,
        featuredGameId,
      )
    ) {
      return;
    }

    const picked = pickDefaultFeaturedSelection(monthGames);
    queueMicrotask(() => {
      if (picked) {
        setSelectedDateKey(picked.dateKey);
        setFeaturedGameId(picked.gameId);
      } else {
        setSelectedDateKey(null);
        setFeaturedGameId(null);
      }
    });
  }, [
    monthKey,
    monthGames,
    listQuery.data,
    listQuery.dataUpdatedAt,
    listQuery.isFetching,
    listQuery.isPlaceholderData,
    initialCalendarUrl.gameId,
    selectedDateKey,
    featuredGameId,
  ]);

  useEffect(() => {
    const gameId = initialCalendarUrl.gameId;
    if (!gameId || deepLinkHandled.current) return;

    let cancelled = false;
    void fetchGameDetail(gameId).then((res) => {
      if (cancelled) return;
      const game = res.game;
      if (!game) return;
      deepLinkHandled.current = true;

      if (!initialCalendarUrl.monthKey) {
        const mk = releasedToMonthKey(game.released);
        if (mk) {
          const [y, m] = mk.split("-").map(Number);
          if (y && m) goToYearMonth(y, m);
        }
      }

      setSelectedDateKey(game.released);
      setFeaturedGameId(game.id);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial URL frozen at mount
  }, [goToYearMonth]);

  const dayGames = useMemo(() => {
    if (!selectedDateKey) return [];
    return gamesOnDate(displayedGames, selectedDateKey);
  }, [displayedGames, selectedDateKey]);

  const resolvedFeaturedId = useMemo(() => {
    if (dayGames.length === 0) return null;
    return resolveFeaturedInDay(dayGames, featuredGameId);
  }, [dayGames, featuredGameId]);

  const detailQuery = useQuery({
    queryKey: ["game-detail", resolvedFeaturedId],
    queryFn: () => fetchGameDetail(resolvedFeaturedId!),
    enabled: !!resolvedFeaturedId,
    staleTime: 5 * 60 * 1000,
  });

  const detailMatchesFeatured =
    detailQuery.data?.game?.id === resolvedFeaturedId;
  const activeDetail = detailMatchesFeatured
    ? detailQuery.data?.detail
    : undefined;
  const detailInitialLoad =
    !!resolvedFeaturedId &&
    detailQuery.isLoading &&
    !detailQuery.data;
  const detailRefreshing =
    !!resolvedFeaturedId &&
    detailQuery.isFetching &&
    !detailMatchesFeatured;

  const featuredGame = useMemo(() => {
    if (!resolvedFeaturedId) return null;
    const fromList = findGameInList(displayedGames, resolvedFeaturedId);
    if (fromList) return fromList;
    if (detailQuery.data?.game?.id === resolvedFeaturedId) {
      return detailQuery.data.game;
    }
    return null;
  }, [displayedGames, resolvedFeaturedId, detailQuery.data]);

  const jumpToMonthKey = useCallback(
    (key: string) => {
      const [y, m] = key.split("-").map(Number);
      if (y && m) goToYearMonth(y, m);
    },
    [goToYearMonth],
  );

  const focusGame = useCallback(
    (game: GameListItem) => {
      setSelectedDateKey(game.released);
      setFeaturedGameId(game.id);
      const mk = game.released.slice(0, 7);
      if (mk !== monthKey) {
        jumpToMonthKey(mk);
      }
    },
    [monthKey, jumpToMonthKey],
  );

  const handleSelectDate = useCallback(
    (dateKey: string, games: GameListItem[]) => {
      setSelectedDateKey(dateKey);
      setFeaturedGameId(resolveFeaturedInDay(games, featuredGameId));
    },
    [featuredGameId],
  );

  useEffect(() => {
    if (!isClient) return;
    const params = buildCalendarSearchParams({
      monthKey,
      platformIds,
      gameId: resolvedFeaturedId,
    });
    const nextSig = params.toString();
    if (nextSig === readCalendarUrlSignature()) return;
    replaceCalendarUrl(pathname, params);
  }, [isClient, monthKey, platformIds, resolvedFeaturedId, pathname]);

  const heroCover =
    featuredGame?.coverUrl ??
    (detailMatchesFeatured ? detailQuery.data?.game?.coverUrl : null) ??
    null;

  const listReady = listQuery.data !== undefined;
  const listBootstrapping = listQuery.isPending && !listQuery.data;

  return (
    <div className="relative min-h-screen flex-1">
      <PlatformAmbientBackground coverUrl={heroCover} />

      <div className="relative mx-auto w-full max-w-[100rem] px-3 py-3 sm:px-5 sm:py-4 2xl:px-8">
        <div className="relative space-y-3 xl:space-y-0">
          <div className="xl:mb-3">
            <SiteHeader monthLabel={monthLabel} />
          </div>

          {listBootstrapping ? (
            <Skeleton className="showcase-hero-frame w-full rounded-2xl" />
          ) : null}

          {listQuery.isError && !listQuery.data ? (
            <div
              className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200"
              role="alert"
            >
              <p>{listQuery.error.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => listQuery.refetch()}
              >
                重试
              </Button>
            </div>
          ) : null}

          {listReady ? (
            <div
              className={cn(
                "grid grid-cols-1 items-start gap-4 transition-opacity duration-200",
                "xl:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)_minmax(20rem,26rem)] xl:gap-5",
                "2xl:grid-cols-[minmax(15rem,19rem)_minmax(0,1fr)_minmax(24rem,32rem)] 2xl:gap-6",
                listQuery.isFetching && listQuery.isPlaceholderData && "opacity-90",
              )}
            >
              <aside className="sticky top-3 hidden min-h-0 xl:flex xl:max-h-[calc(100vh-5rem)] xl:w-full xl:flex-col">
                <DayReleaseList
                  layout="vertical"
                  className="min-h-0 flex-1"
                  dateKey={selectedDateKey}
                  games={dayGames}
                  featuredGameId={resolvedFeaturedId}
                  wishlistIds={displayWishlistIds}
                  onSelectGame={(g) => setFeaturedGameId(g.id)}
                />
              </aside>

              <main className="w-full min-w-0 space-y-3 xl:space-y-4">
              <ReleaseHero
                game={featuredGame}
                slides={activeDetail?.slides}
              />

              <CalendarFilterBar
                viewYear={viewYear}
                viewMonth={viewMonth}
                onPrevMonth={goPrev}
                onNextMonth={goNext}
                onToday={goToday}
                onJumpMonth={goToYearMonth}
                platformIds={platformIds}
                onPlatformChange={setPlatformIds}
                wishlistEntries={displayWishlistEntries}
                wishlistOnly={wishlistOnly}
                onToggleWishlistOnly={() => setWishlistOnly((v) => !v)}
                wishlistOnlyDisabled={!isClient || displayWishlistIds.size === 0}
                onSelectGame={focusGame}
                onJumpToMonth={jumpToMonthKey}
              />

              <ReleaseCalendar
                viewDate={viewDate}
                games={displayedGames}
                selectedDateKey={selectedDateKey}
                featuredGameId={resolvedFeaturedId}
                wishlistIds={displayWishlistIds}
                onSelectDate={handleSelectDate}
                onSelectGame={focusGame}
              />

              <div className="xl:hidden">
                <DayReleaseStrip
                  dateKey={selectedDateKey}
                  games={dayGames}
                  featuredGameId={resolvedFeaturedId}
                  wishlistIds={displayWishlistIds}
                  onSelectGame={(g) => setFeaturedGameId(g.id)}
                />
              </div>

              {featuredGame ? (
                <div className="xl:hidden">
                  <ReleaseGameInfoCard
                    key={featuredGame.id}
                    game={featuredGame}
                    detail={activeDetail}
                    detailInitialLoad={detailInitialLoad}
                    detailRefreshing={detailRefreshing}
                    detailError={detailQuery.isError && !activeDetail}
                    isWishlisted={
                      isClient ? isWishlisted(featuredGame.id) : false
                    }
                    onToggleWishlist={toggle}
                  />
                </div>
              ) : null}

              {displayedGames.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">
                  {wishlistOnly && isClient
                    ? "本月没有已关注的游戏。"
                    : "本月暂无匹配平台的发售游戏。"}
                </p>
              ) : null}
              </main>

              <aside className="sticky top-3 hidden min-h-0 w-full xl:block xl:max-h-[calc(100vh-5rem)]">
                {featuredGame ? (
                  <ReleaseGameInfoCard
                    key={featuredGame.id}
                    variant="sidebar"
                    game={featuredGame}
                    detail={activeDetail}
                    detailInitialLoad={detailInitialLoad}
                    detailRefreshing={detailRefreshing}
                    detailError={detailQuery.isError && !activeDetail}
                    isWishlisted={
                      isClient ? isWishlisted(featuredGame.id) : false
                    }
                    onToggleWishlist={toggle}
                  />
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-8 text-center text-xs text-zinc-500">
                    选择日历日期查看详情
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
