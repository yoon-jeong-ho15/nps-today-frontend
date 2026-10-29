import { useCallback } from "react";
import { fetchCompanyList } from "~/services/companyService";
import {
  fetchAvailableTradingDates,
  fetchRecordsByDates,
} from "~/services/tradeService";
import { calculateStreakTrends } from "~/lib/tradeAnalysis";
import { useAsyncData } from "./useAsyncData";
import type { TrendCompany } from "~/types/domain";

const EMPTY_TRENDS = {
  buyers: [] as TrendCompany[],
  sellers: [] as TrendCompany[],
};

export function useTrendData(days: number = 5) {
  const loadTrends = useCallback(
    async (signal: AbortSignal) => {
      const allDates = await fetchAvailableTradingDates(signal);
      const targetDates = [...new Set(allDates)]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, days);
      if (targetDates.length < days) {
        throw new Error(
          `데이터가 부족합니다. 최소 ${days}일의 데이터가 필요합니다.`,
        );
      }
      const [records, companies] = await Promise.all([
        fetchRecordsByDates(targetDates, signal),
        fetchCompanyList(),
      ]);
      return calculateStreakTrends(records, companies, targetDates);
    },
    [days],
  );
  const { data, loading, error } = useAsyncData(loadTrends, EMPTY_TRENDS);
  return { ...data, loading, error };
}
