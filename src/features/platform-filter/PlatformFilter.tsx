"use client";

import { PLATFORM_OPTIONS } from "@/shared/config/platforms";
import { cn } from "@/shared/lib/cn";

type PlatformFilterProps = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  variant?: "default" | "showcase";
  compact?: boolean;
};

export function PlatformFilter({
  selectedIds,
  onChange,
  variant = "default",
  compact = false,
}: PlatformFilterProps) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center", compact ? "gap-1" : "gap-2")}>
      {variant === "default" ? (
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          平台
        </span>
      ) : compact ? null : (
        <span className="text-xs font-medium text-zinc-500">平台筛选</span>
      )}
      {PLATFORM_OPTIONS.map((p) => {
        const active = selectedIds.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className={cn(
              "rounded-full border font-medium transition-colors",
              compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
              variant === "showcase"
                ? active
                  ? "border-cyan-400/40 bg-cyan-500/15 text-white shadow-sm shadow-cyan-500/10"
                  : "border-white/10 bg-black/25 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                : active
                  ? "border-violet-500/60 bg-violet-500/20 text-violet-100"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
            )}
          >
            {variant === "showcase" ? p.shortLabel : p.label}
          </button>
        );
      })}
    </div>
  );
}
