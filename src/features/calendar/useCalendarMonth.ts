"use client";

import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";

export function useCalendarMonth(initial = new Date()) {
  const [viewDate, setViewDate] = useState(() => startOfMonth(initial));

  const monthKey = useMemo(
    () => format(viewDate, "yyyy-MM"),
    [viewDate],
  );

  const monthLabel = useMemo(
    () => format(viewDate, "yyyy年 MMMM", { locale: zhCN }),
    [viewDate],
  );

  const goPrev = useCallback(
    () => setViewDate((d) => subMonths(d, 1)),
    [],
  );
  const goNext = useCallback(
    () => setViewDate((d) => addMonths(d, 1)),
    [],
  );
  const goToday = useCallback(
    () => setViewDate(startOfMonth(new Date())),
    [],
  );

  const goToYearMonth = useCallback((year: number, month: number) => {
    const clampedMonth = Math.min(12, Math.max(1, month));
    setViewDate(startOfMonth(new Date(year, clampedMonth - 1, 1)));
  }, []);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth() + 1;

  return {
    viewDate,
    viewYear,
    viewMonth,
    monthKey,
    monthLabel,
    goPrev,
    goNext,
    goToday,
    goToYearMonth,
  };
}
