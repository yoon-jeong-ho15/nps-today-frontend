import { useState, useEffect } from "react";
import { fetchVolumeTrend } from "~/services/tradeService";
import type { Company } from "~/types/domain";

export interface VolumeTrendCompany extends Company {
  totalAmount: number;
}

export function useVolumeTrendData(days: number = 30) {
  const [topBuyers, setTopBuyers] = useState<VolumeTrendCompany[]>([]);
  const [topSellers, setTopSellers] = useState<VolumeTrendCompany[]>([]);
  const [loadingVolume, setLoadingVolume] = useState<boolean>(true);
  const [errorVolume, setErrorVolume] = useState<string | null>(null);

  useEffect(() => {
    async function loadVolumeTrends() {
      try {
        setLoadingVolume(true);
        setErrorVolume(null);

        // Fetch aggregated volume trend directly from DB RPC
        const records = await fetchVolumeTrend(days);

        if (!records || records.length === 0) {
          throw new Error("데이터가 없습니다.");
        }

        const allVolumeCompanies: VolumeTrendCompany[] = records.map((r) => ({
          id: r.id,
          name: r.name,
          totalAmount: r.total_amount,
        }));

        // Sort to get top 10 buyers (positive amount) and top 10 sellers (negative amount)
        const buyers = allVolumeCompanies
          .filter((c) => c.totalAmount > 0)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);

        const sellers = allVolumeCompanies
          .filter((c) => c.totalAmount < 0)
          .sort((a, b) => a.totalAmount - b.totalAmount)
          .slice(0, 10);

        setTopBuyers(buyers);
        setTopSellers(sellers);
      } catch (err: any) {
        console.error("Error loading volume trend data:", err);
        setErrorVolume(err.message || "누적 트렌드 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoadingVolume(false);
      }
    }

    loadVolumeTrends();
  }, [days]);

  return {
    topBuyers,
    topSellers,
    loadingVolume,
    errorVolume,
  };
}
