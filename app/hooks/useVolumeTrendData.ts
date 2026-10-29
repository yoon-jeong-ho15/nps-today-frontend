import { useCallback } from "react";
import { fetchVolumeTrend } from "~/services/tradeService";
import { useAsyncData } from "./useAsyncData";
import type { VolumeTrendCompany } from "~/types/domain";

const EMPTY_TRENDS = {
  topBuyers: [] as VolumeTrendCompany[],
  topSellers: [] as VolumeTrendCompany[],
};

export function useVolumeTrendData(days: number = 30) {
  const loadTrends = useCallback(
    async (signal: AbortSignal) => {
      const records = await fetchVolumeTrend(days, signal);
      const companies = records.map((record) => ({
        id: record.id,
        name: record.name,
        totalAmount: record.total_amount,
      }));
      return {
        topBuyers: companies
          .filter((c) => c.totalAmount > 0)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10),
        topSellers: companies
          .filter((c) => c.totalAmount < 0)
          .sort((a, b) => a.totalAmount - b.totalAmount)
          .slice(0, 10),
      };
    },
    [days],
  );
  const { data, loading, error } = useAsyncData(loadTrends, EMPTY_TRENDS);
  return { ...data, loadingVolume: loading, errorVolume: error };
}
