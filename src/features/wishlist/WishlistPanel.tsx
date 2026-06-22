"use client";

import type { GameListItem } from "@/entities/game/types";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import { cn } from "@/shared/lib/cn";
import * as Popover from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { WishlistEntry } from "./wishlist-storage";

type WishlistPanelProps = {
  entries: WishlistEntry[];
  onSelectGame: (game: GameListItem) => void;
  onJumpToMonth: (monthKey: string) => void;
};

export function WishlistPanel({
  entries,
  onSelectGame,
  onJumpToMonth,
}: WishlistPanelProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-lg border border-zinc-700/90 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-300",
            "transition-colors hover:border-amber-500/40 hover:bg-zinc-900 hover:text-amber-100",
          )}
        >
          关注
          {entries.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-px text-[10px] text-amber-200">
              {entries.length}
            </span>
          ) : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[min(100vw-2rem,20rem)] rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl"
        >
          <p className="text-sm font-medium text-zinc-100">我的关注</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            保存在本浏览器，可随时跳转发售月
          </p>
          {entries.length === 0 ? (
            <p className="mt-4 text-center text-xs text-zinc-500">
              在详情中点击「加入关注」添加游戏
            </p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {entries.map((game) => (
                <li key={game.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-0.5 rounded-lg border border-zinc-800 px-2 py-1.5 text-left hover:border-amber-500/40 hover:bg-zinc-800/50"
                    onClick={() => {
                      const monthKey = game.released.slice(0, 7);
                      onJumpToMonth(monthKey);
                      onSelectGame(game);
                    }}
                  >
                    <span className="line-clamp-2 text-xs font-medium text-zinc-100">
                      {game.name}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500">
                        {format(parseISO(game.released), "yyyy/M/d", {
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
          )}
          <Popover.Arrow className="fill-zinc-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
