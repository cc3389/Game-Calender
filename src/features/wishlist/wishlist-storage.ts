import type { GameListItem } from "@/entities/game/types";

const STORAGE_KEY = "game-calendar-wishlist-v1";

export type WishlistEntry = GameListItem & { addedAt: number };

function isWishlistEntry(value: unknown): value is WishlistEntry {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.released === "string" &&
    typeof o.addedAt === "number" &&
    Array.isArray(o.platformNames)
  );
}

function readRaw(): WishlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWishlistEntry);
  } catch {
    return [];
  }
}

function writeRaw(entries: WishlistEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadWishlist(): WishlistEntry[] {
  return readRaw().sort((a, b) => a.released.localeCompare(b.released));
}

/** useSyncExternalStore 要求 server/client snapshot 引用稳定 */
const EMPTY_WISHLIST_SNAPSHOT: WishlistEntry[] = [];

let clientSnapshot: WishlistEntry[] = EMPTY_WISHLIST_SNAPSHOT;
let clientSnapshotKey = "[]";

export function getWishlistServerSnapshot(): WishlistEntry[] {
  return EMPTY_WISHLIST_SNAPSHOT;
}

export function getWishlistSnapshot(): WishlistEntry[] {
  const fresh = loadWishlist();
  const key = JSON.stringify(fresh);
  if (key === clientSnapshotKey) {
    return clientSnapshot;
  }
  clientSnapshotKey = key;
  clientSnapshot = fresh.length === 0 ? EMPTY_WISHLIST_SNAPSHOT : fresh;
  return clientSnapshot;
}

export function isGameWishlisted(gameId: string): boolean {
  return readRaw().some((e) => e.id === gameId);
}

export function toggleWishlistGame(game: GameListItem): boolean {
  const list = readRaw();
  const idx = list.findIndex((e) => e.id === game.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeRaw(list);
    return false;
  }
  list.push({ ...game, addedAt: Date.now() });
  writeRaw(list);
  return true;
}

export function removeWishlistGame(gameId: string) {
  writeRaw(readRaw().filter((e) => e.id !== gameId));
}

export const WISHLIST_CHANGED_EVENT = "game-calendar-wishlist-changed";

export function notifyWishlistChanged() {
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT));
}
