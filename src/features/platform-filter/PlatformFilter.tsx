"use client";

import { PLATFORM_OPTIONS } from "@/shared/config/platforms";
import { cn } from "@/shared/lib/cn";

type PlatformFilterProps = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

export function PlatformFilter({
  selectedIds,
  onChange,
}: PlatformFilterProps) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        平台
      </span>
      {PLATFORM_OPTIONS.map((p) => {
        const active = selectedIds.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-violet-500/60 bg-violet-500/20 text-violet-100"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
