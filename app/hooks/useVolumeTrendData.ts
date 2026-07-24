import { useState, useEffect } from "react";
import { fetchCompanyList } from "~/services/companyService";
import { fetchAvailableTradingDates, fetchRecordsByDates } from "~/services/tradeService";
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

        // 1. Fetch available dates and get the latest `days` dates
        const allDates = await fetchAvailableTradingDates();
        allDates.sort((a, b) => b.localeCompare(a));
        const targetDates = allDates.slice(0, days);

        if (targetDates.length === 0) {
          throw new Error("데이터가 없습니다.");
        }

        // 2. Fetch records and company list in parallel
        const [records, companies] = await Promise.all([
          fetchRecordsByDates(targetDates),
          fetchCompanyList()
        ]);

        const companyMap = new Map<string, string>();
        companies.forEach(c => companyMap.set(c.id, c.name));

        // 3. Group by company and sum the amounts
        const companyAmounts = new Map<string, number>();
        records.forEach(r => {
          const currentTotal = companyAmounts.get(r.company_id) || 0;
          companyAmounts.set(r.company_id, currentTotal + r.amount);
        });

        const allVolumeCompanies: VolumeTrendCompany[] = [];

        companyAmounts.forEach((totalAmount, companyId) => {
          const companyName = companyMap.get(companyId) || companyId;
          allVolumeCompanies.push({
            id: companyId,
            name: companyName,
            totalAmount
          });
        });

        // 4. Sort to get top 10 buyers (positive amount) and top 10 sellers (negative amount)
        const buyers = allVolumeCompanies
          .filter(c => c.totalAmount > 0)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);

        const sellers = allVolumeCompanies
          .filter(c => c.totalAmount < 0)
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
