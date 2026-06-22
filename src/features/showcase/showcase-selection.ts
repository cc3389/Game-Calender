import type { GameListItem } from "@/entities/game/types";
import { format, startOfDay } from "date-fns";

function compareGamesByRelease(a: GameListItem, b: GameListItem): number {
  const byDate = a.released.localeCompare(b.released);
  if (byDate !== 0) return byDate;
  return a.name.localeCompare(b.name, "zh-Hans");
}

/** 默认选中：距今天最近的即将发售（含当天）；当月无未来发售时取最近已发售日 */
export function pickDefaultFeaturedSelection(
  games: GameListItem[],
  today: Date = new Date(),
): { dateKey: string; gameId: string } | null {
  if (games.length === 0) return null;

  const todayKey = format(startOfDay(today), "yyyy-MM-dd");

  const upcoming = games
    .filter((g) => g.released >= todayKey)
    .sort(compareGamesByRelease);
  if (upcoming.length > 0) {
    const game = upcoming[0]!;
    return { dateKey: game.released, gameId: game.id };
  }

  const past = games
    .filter((g) => g.released < todayKey)
    .sort((a, b) => -compareGamesByRelease(a, b));
  if (past.length > 0) {
    const game = past[0]!;
    return { dateKey: game.released, gameId: game.id };
  }

  return null;
}

export function filterGamesInMonthKey(
  games: GameListItem[],
  monthKey: string,
): GameListItem[] {
  const prefix = `${monthKey}-`;
  return games.filter((g) => g.released.startsWith(prefix));
}

export function isFeaturedSelectionInMonth(
  monthGames: GameListItem[],
  monthKey: string,
  selectedDateKey: string | null,
  featuredGameId: string | null,
): boolean {
  if (!selectedDateKey?.startsWith(`${monthKey}-`) || !featuredGameId) {
    return false;
  }
  return monthGames.some(
    (g) => g.id === featuredGameId && g.released === selectedDateKey,
  );
}

export function gamesOnDate(
  games: GameListItem[],
  dateKey: string,
): GameListItem[] {
  return games.filter((g) => g.released === dateKey);
}

export function resolveFeaturedInDay(
  dayGames: GameListItem[],
  featuredGameId: string | null,
): string | null {
  if (dayGames.length === 0) return null;
  if (featuredGameId && dayGames.some((g) => g.id === featuredGameId)) {
    return featuredGameId;
  }
  return dayGames[0]!.id;
}

export function findGameInList(
  games: GameListItem[],
  gameId: string,
): GameListItem | undefined {
  return games.find((g) => g.id === gameId);
}
