"use client";

import type { GameListItem } from "@/entities/game/types";
import { releaseEditionLabel } from "@/entities/game/release-edition";
import { GameMediaCarousel } from "@/features/game-detail/GameMediaCarousel";
import { fetchGameDetail } from "@/shared/api/client";
import { PlatformBadgeGroup } from "@/shared/ui/PlatformBadgeGroup";
import { Skeleton } from "@/shared/ui/Skeleton";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
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
  const detailQuery = useQuery({
    queryKey: ["game-detail", game?.id],
    queryFn: () => fetchGameDetail(game!.id),
    enabled: open && !!game?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (!game) return null;

  const releaseLabel = format(parseISO(game.released), "yyyy年M月d日 EEEE", {
    locale: zhCN,
  });

  const detail = detailQuery.data?.detail;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(100vw-1rem,42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl focus:outline-none">
          {detailQuery.isLoading && !detail ? (
            <Skeleton className="aspect-video w-full rounded-none" />
          ) : (
            <GameMediaCarousel
              key={game.id}
              slides={detail?.slides ?? []}
              fallbackCover={game.coverUrl}
            />
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
              <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-300">
                {releaseEditionLabel(game.releaseEdition)}
              </span>
            </Dialog.Description>

            {detailQuery.isLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : null}

            {detailQuery.isError ? (
              <p className="mt-4 text-sm text-amber-200/90">
                介绍与媒体加载失败，请稍后重试。
              </p>
            ) : null}

            {detail ? <DescriptionSection detail={detail} /> : null}

            <div className="mt-4">
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

function DescriptionSection({
  detail,
}: {
  detail: NonNullable<
    Awaited<ReturnType<typeof fetchGameDetail>>["detail"]
  >;
}) {
  const hasZh = detail.descriptionZh || detail.descriptionZhHtml;
  const hasEn = detail.descriptionEn;
  const hasTags = detail.tags.length > 0;

  if (!hasZh && !hasEn && !hasTags) return null;

  return (
    <div className="mt-4 space-y-4">
      {hasTags ? (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            标签
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {detail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {hasZh ? (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            中文介绍
          </h3>
          {detail.descriptionZh ? (
            <p className="text-sm leading-relaxed text-zinc-300">
              {detail.descriptionZh}
            </p>
          ) : null}
          {detail.descriptionZhHtml &&
          !detail.descriptionZh &&
          detail.descriptionZhHtml ? (
            <div
              className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-zinc-400 [&_a]:text-violet-400 [&_h1]:text-base [&_h2]:text-sm [&_img]:hidden [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: detail.descriptionZhHtml }}
            />
          ) : null}
        </section>
      ) : null}

      {hasEn ? (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {hasZh ? "英文介绍" : "游戏介绍"}
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400">
            {detail.descriptionEn}
          </p>
        </section>
      ) : null}
    </div>
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
                  <span className="text-sm text-zinc-200">
                    {g.releaseEdition === "early_access" ? (
                      <span className="mr-1 text-amber-400/90">EA</span>
                    ) : null}
                    {g.name}
                  </span>
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
