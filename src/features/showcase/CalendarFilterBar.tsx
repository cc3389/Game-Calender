"use client";

import type { ReactNode } from "react";
import type { GameListItem } from "@/entities/game/types";
import { MonthYearPicker } from "@/features/calendar/MonthYearPicker";
import { PlatformFilter } from "@/features/platform-filter/PlatformFilter";
import { WishlistPanel } from "@/features/wishlist/WishlistPanel";
import type { WishlistEntry } from "@/features/wishlist/wishlist-storage";
import { cn } from "@/shared/lib/cn";

type CalendarFilterBarProps = {
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onJumpMonth: (year: number, month: number) => void;
  platformIds: number[];
  onPlatformChange: (ids: number[]) => void;
  wishlistEntries: WishlistEntry[];
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
  wishlistOnlyDisabled: boolean;
  onSelectGame: (game: GameListItem) => void;
  onJumpToMonth: (monthKey: string) => void;
};

export function CalendarFilterBar({
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onJumpMonth,
  platformIds,
  onPlatformChange,
  wishlistEntries,
  wishlistOnly,
  onToggleWishlistOnly,
  wishlistOnlyDisabled,
  onSelectGame,
  onJumpToMonth,
}: CalendarFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="shrink-0 text-[11px] font-medium text-zinc-500">
        发售日历
      </span>
      <div className="hidden h-3 w-px shrink-0 bg-white/10 sm:block" aria-hidden />
      <PlatformFilter
        variant="showcase"
        compact
        selectedIds={platformIds}
        onChange={onPlatformChange}
      />
      <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
        <div
          className={cn(
            "inline-flex items-stretch overflow-hidden rounded-full",
            "border border-white/10 bg-black/40 shadow-sm shadow-black/20 backdrop-blur-md",
          )}
        >
          <MonthNavBtn label="上一月" onClick={onPrevMonth}>
            ‹
          </MonthNavBtn>
          <div className="w-px self-stretch bg-white/10" />
          <MonthYearPicker
            year={viewYear}
            month={viewMonth}
            onChange={onJumpMonth}
          />
          <div className="w-px self-stretch bg-white/10" />
          <MonthNavBtn label="下一月" onClick={onNextMonth}>
            ›
          </MonthNavBtn>
          <div className="w-px self-stretch bg-white/10" />
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            今天
          </button>
        </div>
        <WishlistPanel
          entries={wishlistEntries}
          onSelectGame={onSelectGame}
          onJumpToMonth={onJumpToMonth}
        />
        <button
          type="button"
          disabled={wishlistOnlyDisabled}
          onClick={onToggleWishlistOnly}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
            wishlistOnly
              ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
              : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200",
            wishlistOnlyDisabled && "cursor-not-allowed opacity-40",
          )}
        >
          仅关注
        </button>
      </div>
    </div>
  );
}

function MonthNavBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex w-8 items-center justify-center text-base text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
