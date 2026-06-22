"use client";

import type { GameListItem } from "@/entities/game/types";
import { searchGames } from "@/shared/api/client";
import { cn } from "@/shared/lib/cn";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useEffect, useId, useRef, useState } from "react";

type GameSearchProps = {
  platformIds: number[];
  onSelectGame: (game: GameListItem) => void;
  onJumpToMonth: (monthKey: string) => void;
};

export function GameSearch({
  platformIds,
  onSelectGame,
  onJumpToMonth,
}: GameSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ["game-search", debounced, platformIds],
    queryFn: () => searchGames(debounced, platformIds),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results = searchQuery.data?.games ?? [];
  const showDropdown = open && debounced.length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full min-w-[12rem] max-w-md flex-1">
      <label htmlFor={listId} className="sr-only">
        搜索游戏
      </label>
      <input
        id={listId}
        type="search"
        value={query}
        placeholder="搜索游戏名称…"
        autoComplete="off"
        className={cn(
          "w-full rounded-lg border border-zinc-700/90 bg-zinc-950/80 px-3 py-1.5 text-sm text-zinc-100",
          "placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40",
        )}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
          {searchQuery.isLoading ? (
            <p className="px-3 py-2 text-xs text-zinc-500">搜索中…</p>
          ) : null}
          {searchQuery.isError ? (
            <p className="px-3 py-2 text-xs text-red-300">
              {searchQuery.error.message}
            </p>
          ) : null}
          {searchQuery.isSuccess && results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">未找到匹配的发售游戏</p>
          ) : null}
          {searchQuery.isSuccess && results.length > 0 ? (
            <ul>
              {results.map((game) => (
                <li key={game.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-zinc-800"
                    onClick={() => {
                      const monthKey = game.released.slice(0, 7);
                      onJumpToMonth(monthKey);
                      onSelectGame(game);
                      setOpen(false);
                      setQuery("");
                      setDebounced("");
                    }}
                  >
                    <span className="line-clamp-1 text-sm text-zinc-100">
                      {game.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500">
                        {format(parseISO(game.released), "yyyy年M月d日", {
                          locale: zhCN,
                        })}
                      </span>
                      <PlatformBadgeGroup
                        variant="dot"
                        platformNames={game.platformNames}
                        max={4}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
