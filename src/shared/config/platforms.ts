export type PlatformOption = {
  id: number;
  label: string;
  shortLabel: string;
  colorClass: string;
};

/** RAWG platform ids — 筛选参数会传给防腐层，由当前 adapter 解释 */
export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 4, label: "PC", shortLabel: "PC", colorClass: "bg-sky-500" },
  {
    id: 187,
    label: "PlayStation 5",
    shortLabel: "PS5",
    colorClass: "bg-blue-600",
  },
  {
    id: 186,
    label: "Xbox Series X|S",
    shortLabel: "XSX",
    colorClass: "bg-green-600",
  },
  {
    id: 7,
    label: "Nintendo Switch",
    shortLabel: "NS",
    colorClass: "bg-red-500",
  },
];

export const DEFAULT_PLATFORM_IDS = PLATFORM_OPTIONS.map((p) => p.id);

export type ResolvedPlatform = {
  id: string;
  shortLabel: string;
  label: string;
  colorClass: string;
  sortOrder: number;
};

/** 将 RAWG 返回的平台名规范为可识别的展示标签（支持多平台） */
const PLATFORM_RESOLVE_RULES: Array<{
  id: string;
  shortLabel: string;
  label: string;
  colorClass: string;
  sortOrder: number;
  match: (name: string) => boolean;
}> = [
  {
    id: "pc",
    shortLabel: "PC",
    label: "PC",
    colorClass: "bg-sky-500",
    sortOrder: 10,
    match: (n) => /^pc$/i.test(n) || /windows/i.test(n),
  },
  {
    id: "ps5",
    shortLabel: "PS5",
    label: "PlayStation 5",
    colorClass: "bg-blue-600",
    sortOrder: 20,
    match: (n) => /playstation\s*5|ps5/i.test(n),
  },
  {
    id: "ps4",
    shortLabel: "PS4",
    label: "PlayStation 4",
    colorClass: "bg-blue-500",
    sortOrder: 21,
    match: (n) => /playstation\s*4|ps4/i.test(n),
  },
  {
    id: "xsx",
    shortLabel: "XSX",
    label: "Xbox Series X|S",
    colorClass: "bg-green-600",
    sortOrder: 30,
    match: (n) => /xbox series|series [xs]/i.test(n),
  },
  {
    id: "xone",
    shortLabel: "XO",
    label: "Xbox One",
    colorClass: "bg-green-700",
    sortOrder: 31,
    match: (n) => /xbox one/i.test(n),
  },
  {
    id: "xbox360",
    shortLabel: "360",
    label: "Xbox 360",
    colorClass: "bg-green-800",
    sortOrder: 32,
    match: (n) => /xbox 360/i.test(n),
  },
  {
    id: "switch",
    shortLabel: "NS",
    label: "Nintendo Switch",
    colorClass: "bg-red-500",
    sortOrder: 40,
    match: (n) => /switch/i.test(n) || /nintendo/i.test(n),
  },
  {
    id: "mac",
    shortLabel: "Mac",
    label: "macOS",
    colorClass: "bg-zinc-500",
    sortOrder: 50,
    match: (n) => /mac/i.test(n),
  },
  {
    id: "linux",
    shortLabel: "Linux",
    label: "Linux",
    colorClass: "bg-zinc-600",
    sortOrder: 51,
    match: (n) => /linux/i.test(n),
  },
];

export function resolvePlatformsFromRawgNames(
  names: string[],
): ResolvedPlatform[] {
  const byId = new Map<string, ResolvedPlatform>();

  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    for (const rule of PLATFORM_RESOLVE_RULES) {
      if (rule.match(name) && !byId.has(rule.id)) {
        byId.set(rule.id, {
          id: rule.id,
          shortLabel: rule.shortLabel,
          label: rule.label,
          colorClass: rule.colorClass,
          sortOrder: rule.sortOrder,
        });
        break;
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function platformColorForName(name: string): string {
  const resolved = resolvePlatformsFromRawgNames([name]);
  return resolved[0]?.colorClass ?? "bg-zinc-500";
}

export function platformBorderGradient(platformNames: string[]): string {
  const platforms = resolvePlatformsFromRawgNames(platformNames);
  if (platforms.length === 0) return "border-l-zinc-600";
  if (platforms.length === 1) {
    const map: Record<string, string> = {
      pc: "border-l-sky-500",
      ps5: "border-l-blue-600",
      ps4: "border-l-blue-500",
      xsx: "border-l-green-600",
      xone: "border-l-green-700",
      xbox360: "border-l-green-800",
      switch: "border-l-red-500",
      mac: "border-l-zinc-500",
      linux: "border-l-zinc-600",
    };
    return map[platforms[0].id] ?? "border-l-zinc-600";
  }
  return "border-l-violet-500";
}
