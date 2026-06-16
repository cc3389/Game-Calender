"use client";

import type { GameListItem } from "@/entities/game/types";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import * as Dialog from "@radix-ui/react-dialog";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

type GameDetailDialogProps = {
  game: GameListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GameDetailDialog({
  game,
  open,
  onOpenChange,
}: GameDetailDialogProps) {
  if (!game) return null;

  const releaseLabel = format(parseISO(game.released), "yyyy年M月d日 EEEE", {
    locale: zhCN,
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-0 shadow-2xl focus:outline-none">
          {game.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.coverUrl}
              alt=""
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="flex h-32 items-center justify-center bg-zinc-800 text-sm text-zinc-500">
              暂无封面
            </div>
          )}
          <div className="p-5">
            <Dialog.Title className="text-lg font-semibold text-zinc-50">
              {game.name}
            </Dialog.Title>
            {game.nameOriginal && game.nameOriginal !== game.name ? (
              <p className="mt-1 text-sm text-zinc-500">{game.nameOriginal}</p>
            ) : null}
            <Dialog.Description className="mt-1 text-sm text-zinc-400">
              发售日：{releaseLabel}
            </Dialog.Description>
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium uppercase text-zinc-500">
                发售平台
              </p>
              <PlatformBadgeGroup
                platformNames={game.platformNames}
                variant="chip"
                max={12}
              />
              {game.platformNames.length > 0 ? (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {game.platformNames.join(" · ")}
                </p>
              ) : null}
            </div>
            {game.storeLinks.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                  购买 / 商店
                </p>
                <ul className="space-y-1">
                  {game.storeLinks.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 hover:underline"
                      >
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Dialog.Close asChild>
              <button
                type="button"
                className="mt-5 w-full rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                关闭
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type DayGamesDialogProps = {
  dateKey: string | null;
  games: GameListItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGame: (game: GameListItem) => void;
};

export function DayGamesDialog({
  dateKey,
  games,
  open,
  onOpenChange,
  onSelectGame,
}: DayGamesDialogProps) {
  const title = dateKey
    ? format(parseISO(dateKey), "M月d日 发售游戏", { locale: zhCN })
    : "";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <Dialog.Title className="text-base font-semibold text-zinc-100">
            {title}
          </Dialog.Title>
          <ul className="mt-3 space-y-2">
            {games.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 rounded-lg border border-zinc-700 px-3 py-2 text-left hover:border-violet-500/50"
                  onClick={() => {
                    onSelectGame(g);
                    onOpenChange(false);
                  }}
                >
                  <PlatformBadgeGroup
                    variant="chip"
                    platformNames={g.platformNames}
                  />
                  <span className="text-sm text-zinc-200">{g.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-zinc-600 py-2 text-sm text-zinc-400"
            >
              关闭
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
