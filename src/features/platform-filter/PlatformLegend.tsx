import { PLATFORM_OPTIONS } from "@/shared/config/platforms";

const EXTRA_LEGEND = [
  { shortLabel: "PS4", label: "PlayStation 4", colorClass: "bg-blue-500" },
  { shortLabel: "XO", label: "Xbox One", colorClass: "bg-green-700" },
] as const;

/** 与日历色点对应的图例 */
export function PlatformLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
      <span className="text-zinc-600">平台</span>
      {[...PLATFORM_OPTIONS, ...EXTRA_LEGEND].map((p) => (
        <span key={p.shortLabel} className="inline-flex items-center gap-1">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.colorClass}`}
          />
          <span className="text-zinc-400">{p.shortLabel}</span>
        </span>
      ))}
      <span className="text-zinc-600">悬停条目查看完整平台</span>
    </div>
  );
}
