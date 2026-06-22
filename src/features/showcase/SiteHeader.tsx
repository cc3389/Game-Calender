"use client";

type SiteHeaderProps = {
  monthLabel: string;
};

export function SiteHeader({ monthLabel }: SiteHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <h1 className="font-display truncate text-lg font-bold tracking-tight text-white sm:text-xl">
          游戏发售日历
        </h1>
        <p className="truncate text-xs text-zinc-500">{monthLabel}</p>
      </div>
    </header>
  );
}
