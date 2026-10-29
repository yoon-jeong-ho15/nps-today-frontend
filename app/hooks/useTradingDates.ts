import { useMemo } from "react";
import { fetchAvailableTradingDates } from "~/services/tradeService";
import { useAsyncData } from "./useAsyncData";
const EMPTY: string[] = [];
export function useTradingDates() {
  const { data, ...state } = useAsyncData(fetchAvailableTradingDates, EMPTY);
  const dates = useMemo(
    () => [...new Set(data)].sort((a, b) => b.localeCompare(a)),
    [data],
  );
  return { dates, ...state };
}
