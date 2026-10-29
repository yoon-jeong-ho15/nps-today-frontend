import { useMemo } from "react";
import {
  fetchAvailableTradingDates,
  fetchDailyTotalAmounts,
} from "~/services/tradeService";
import { useAsyncData } from "./useAsyncData";

const EMPTY_DATA = {
  dates: [] as string[],
  totals: {} as Record<string, number>,
};

async function loadDates(signal: AbortSignal) {
  const [dates, totals] = await Promise.all([
    fetchAvailableTradingDates(signal),
    fetchDailyTotalAmounts(signal),
  ]);
  return { dates, totals };
}

export function useDateListData() {
  const { data, loading, error } = useAsyncData(loadDates, EMPTY_DATA);
  const groupedDates = useMemo(() => {
    const groups: Record<string, Record<string, string[]>> = {};
    data.dates.forEach((date) => {
      if (!/^\d{8}$/.test(date)) return;
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      groups[year] ??= {};
      groups[year][month] ??= [];
      groups[year][month].push(date);
    });
    return groups;
  }, [data.dates]);
  return {
    availableDates: data.dates,
    dailyTotals: data.totals,
    groupedDates,
    loading,
    error,
  };
}
