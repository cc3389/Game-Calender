"use client";

import { MonthYearPicker } from "@/features/calendar/MonthYearPicker";
import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

type CalendarToolbarProps = {
  monthLabel: string;
  viewYear: number;
  viewMonth: number;
  provider?: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onJump: (year: number, month: number) => void;
};

export function CalendarToolbar({
  monthLabel,
  viewYear,
  viewMonth,
  provider,
  onPrev,
  onNext,
  onToday,
  onJump,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          游戏发售日历
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <span>{monthLabel}</span>
          {provider ? (
            <span className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-0.5 text-[11px] text-zinc-500">
              {provider}
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className={cn(
            "inline-flex items-stretch overflow-hidden rounded-lg",
            "border border-zinc-700/90 bg-zinc-950/80 shadow-sm shadow-black/20",
          )}
        >
          <ToolbarNavButton label="上一月" onClick={onPrev}>
            ‹
          </ToolbarNavButton>
          <div className="w-px self-stretch bg-zinc-700/80" />
          <MonthYearPicker
            year={viewYear}
            month={viewMonth}
            onChange={onJump}
          />
          <div className="w-px self-stretch bg-zinc-700/80" />
          <ToolbarNavButton label="下一月" onClick={onNext}>
            ›
          </ToolbarNavButton>
        </div>
        <button
          type="button"
          onClick={onToday}
          className={cn(
            "rounded-lg border border-zinc-700/90 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-300",
            "transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white",
          )}
        >
          今天
        </button>
      </div>
    </div>
  );
}

function ToolbarNavButton({
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
      className={cn(
        "flex w-9 items-center justify-center text-lg text-zinc-400",
        "transition-colors hover:bg-white/5 hover:text-zinc-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/50",
      )}
    >
      {children}
    </button>
  );
}
