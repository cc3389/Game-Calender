import { parse, startOfMonth } from "date-fns";
import { DEFAULT_PLATFORM_IDS, PLATFORM_OPTIONS } from "@/shared/config/platforms";

export const MONTH_URL_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const VALID_PLATFORM_IDS = new Set(PLATFORM_OPTIONS.map((p) => p.id));

export type CalendarUrlState = {
  monthKey: string | null;
  platformIds: number[] | null;
  gameId: string | null;
};

export function parseMonthKeyToDate(monthKey: string | null): Date | undefined {
  if (!monthKey || !MONTH_URL_RE.test(monthKey)) return undefined;
  const parsed = parse(`${monthKey}-01`, "yyyy-MM-dd", new Date());
  return startOfMonth(parsed);
}

export function parsePlatformIdsFromUrl(value: string | null): number[] | null {
  if (!value) return null;
  const ids = value
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && VALID_PLATFORM_IDS.has(n));
  return ids.length > 0 ? ids : null;
}

export function parseCalendarUrl(searchParams: URLSearchParams): CalendarUrlState {
  const monthKey = searchParams.get("month");
  const gameId = searchParams.get("game");
  return {
    monthKey: monthKey && MONTH_URL_RE.test(monthKey) ? monthKey : null,
    platformIds: parsePlatformIdsFromUrl(searchParams.get("platforms")),
    gameId: gameId && /^\d+$/.test(gameId) ? gameId : null,
  };
}

export function buildCalendarSearchParams(input: {
  monthKey: string;
  platformIds: number[];
  gameId: string | null;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set("month", input.monthKey);

  const defaultSet = new Set(DEFAULT_PLATFORM_IDS);
  const selectedSet = new Set(input.platformIds);
  const sameAsDefault =
    defaultSet.size === selectedSet.size &&
    DEFAULT_PLATFORM_IDS.every((id) => selectedSet.has(id));

  if (!sameAsDefault && input.platformIds.length > 0) {
    params.set("platforms", [...input.platformIds].sort((a, b) => a - b).join(","));
  }

  if (input.gameId) {
    params.set("game", input.gameId);
  }

  return params;
}

export function releasedToMonthKey(released: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(released)) return null;
  return released.slice(0, 7);
}

/** 仅更新地址栏，不触发 Next.js RSC 导航（避免 replace 循环请求） */
export function replaceCalendarUrl(pathname: string, params: URLSearchParams) {
  if (typeof window === "undefined") return;
  const nextQs = params.toString();
  const currentQs = window.location.search.replace(/^\?/, "");
  if (nextQs === currentQs) return;
  const href = nextQs ? `${pathname}?${nextQs}` : pathname;
  window.history.replaceState(window.history.state, "", href);
}

export function calendarUrlSignature(params: URLSearchParams): string {
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

export function readCalendarUrlSignature(): string {
  if (typeof window === "undefined") return "";
  return calendarUrlSignature(new URLSearchParams(window.location.search));
}
