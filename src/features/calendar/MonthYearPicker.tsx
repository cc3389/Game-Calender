"use client";

import { cn } from "@/shared/lib/cn";
import * as Popover from "@radix-ui/react-popover";
import { useState, type ReactNode } from "react";

const MIN_YEAR = 2010;
const MAX_YEAR_OFFSET = 4;

function getMaxYear() {
  return new Date().getFullYear() + MAX_YEAR_OFFSET;
}

const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
] as const;

type MonthYearPickerProps = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  className?: string;
};

export function MonthYearPicker({
  year,
  month,
  onChange,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(year);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraftYear(year);
    setOpen(next);
  };

  const maxYear = getMaxYear();
  const canDecreaseYear = draftYear > MIN_YEAR;
  const canIncreaseYear = draftYear < maxYear;

  const pickMonth = (m: number) => {
    onChange(draftYear, m);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium tabular-nums text-zinc-100",
            "transition-colors hover:bg-white/5 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
            className,
          )}
          aria-label="选择年月"
        >
          <span>
            {year}年 {month}月
          </span>
          <ChevronDown className={cn("opacity-60 transition-transform", open && "rotate-180")} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="center"
          className={cn(
            "z-50 w-[15.5rem] rounded-xl border border-zinc-700/90 bg-zinc-900 p-3 shadow-xl shadow-black/40",
            "focus:outline-none",
          )}
        >
          <div className="mb-3 flex items-center justify-between rounded-lg bg-zinc-950/80 px-1 py-0.5">
            <IconNavButton
              label="上一年"
              disabled={!canDecreaseYear}
              onClick={() => setDraftYear((y) => Math.max(MIN_YEAR, y - 1))}
            >
              ‹
            </IconNavButton>
            <span className="text-sm font-semibold tabular-nums text-zinc-100">
              {draftYear} 年
            </span>
            <IconNavButton
              label="下一年"
              disabled={!canIncreaseYear}
              onClick={() => setDraftYear((y) => Math.min(maxYear, y + 1))}
            >
              ›
            </IconNavButton>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {MONTH_LABELS.map((label, index) => {
              const value = index + 1;
              const highlighted = draftYear === year && value === month;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => pickMonth(value)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-medium transition-colors",
                    highlighted
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-900/40"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function IconNavButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-400",
        "hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5", className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
