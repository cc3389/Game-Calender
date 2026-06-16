import { cn } from "@/shared/lib/cn";
import {
  resolvePlatformsFromRawgNames,
  type ResolvedPlatform,
} from "@/shared/config/platforms";

type PlatformBadgeGroupProps = {
  platformNames: string[];
  /** dot：日历用色点；chip：详情/列表用紧凑缩写；badge：稍大标签 */
  variant?: "dot" | "chip" | "badge";
  max?: number;
  className?: string;
};

export function PlatformBadgeGroup({
  platformNames,
  variant = "chip",
  max = 6,
  className,
}: PlatformBadgeGroupProps) {
  const platforms = resolvePlatformsFromRawgNames(platformNames);
  const visible = platforms.slice(0, max);
  const hidden = platforms.length - visible.length;
  const title = platforms.map((p) => p.label).join(" · ");

  if (platforms.length === 0) {
    if (variant === "dot") {
      return (
        <span
          title="平台未知"
          className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600", className)}
        />
      );
    }
    return (
      <span className={cn("text-[10px] text-zinc-500", className)}>—</span>
    );
  }

  if (variant === "dot") {
    return (
      <span
        className={cn("inline-flex shrink-0 items-center gap-px", className)}
        title={title}
      >
        {visible.map((p) => (
          <span
            key={p.id}
            className={cn("h-1.5 w-1.5 rounded-full ring-1 ring-black/20", p.colorClass)}
          />
        ))}
        {hidden > 0 ? (
          <span className="ml-0.5 text-[8px] leading-none text-zinc-500">+</span>
        ) : null}
      </span>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-0.5", className)}
      title={variant === "chip" ? title : undefined}
    >
      {visible.map((p) => (
        <PlatformBadge key={p.id} platform={p} variant={variant} />
      ))}
      {hidden > 0 ? (
        <span className="text-[8px] text-zinc-500">+{hidden}</span>
      ) : null}
    </div>
  );
}

function PlatformBadge({
  platform,
  variant,
}: {
  platform: ResolvedPlatform;
  variant: "chip" | "badge";
}) {
  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 rounded-sm px-0.5 py-px text-[8px] font-semibold leading-none text-white/95",
          platform.colorClass,
        )}
      >
        {platform.shortLabel}
      </span>
    );
  }

  return (
    <span
      title={platform.label}
      className={cn(
        "inline-flex shrink-0 rounded px-1 py-px text-[9px] font-bold text-white",
        platform.colorClass,
      )}
    >
      {platform.shortLabel}
    </span>
  );
}
