"use client";

import type { GameListItem } from "@/entities/game/types";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  notifyWishlistChanged,
  toggleWishlistGame,
  WISHLIST_CHANGED_EVENT,
} from "@/features/wishlist/wishlist-storage";
import { useCallback, useMemo, useSyncExternalStore } from "react";

function subscribeWishlist(onStoreChange: () => void) {
  window.addEventListener(WISHLIST_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(WISHLIST_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useWishlist() {
  const entries = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot,
  );

  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  const toggle = useCallback((game: GameListItem) => {
    const added = toggleWishlistGame(game);
    notifyWishlistChanged();
    return added;
  }, []);

  const isWishlisted = useCallback(
    (gameId: string) => ids.has(gameId),
    [ids],
  );

  return { entries, ids, toggle, isWishlisted };
}
