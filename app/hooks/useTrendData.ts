import { useState, useEffect } from "react";
import { fetchCompanyList } from "~/services/companyService";
import { fetchAvailableTradingDates, fetchRecordsByDates } from "~/services/tradeService";
import type { Company } from "~/types/domain";

export interface TrendCompany extends Company {
  streakDays: number;
}

export function useTrendData(days: number = 5) {
  const [buyers, setBuyers] = useState<TrendCompany[]>([]);
  const [sellers, setSellers] = useState<TrendCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrends() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch available dates and get the latest `days` dates
        const allDates = await fetchAvailableTradingDates();
        allDates.sort((a, b) => b.localeCompare(a));
        const targetDates = allDates.slice(0, days);

        if (targetDates.length < days) {
          throw new Error(`데이터가 부족합니다. 최소 ${days}일의 데이터가 필요합니다.`);
        }

        // 2. Fetch records and company list in parallel
        const [records, companies] = await Promise.all([
          fetchRecordsByDates(targetDates),
          fetchCompanyList()
        ]);

        const companyMap = new Map<string, string>();
        companies.forEach(c => companyMap.set(c.id, c.name));

        // 3. Group by company
        const companyRecords = new Map<string, typeof records>();
        records.forEach(r => {
          if (!companyRecords.has(r.company_id)) {
            companyRecords.set(r.company_id, []);
          }
          companyRecords.get(r.company_id)!.push(r);
        });

        const continuousBuyers: TrendCompany[] = [];
        const continuousSellers: TrendCompany[] = [];

        companyRecords.forEach((companyData, companyId) => {
          // Check if the company has records for all target dates
          // Assuming one record per day per company
          if (companyData.length >= days) {
            const recentData = companyData.slice(0, days);
            const allBuy = recentData.every(r => r.amount > 0);
            const allSell = recentData.every(r => r.amount < 0);

            const companyName = companyMap.get(companyId) || companyId;

            if (allBuy) {
              continuousBuyers.push({ id: companyId, name: companyName, streakDays: days });
            } else if (allSell) {
              continuousSellers.push({ id: companyId, name: companyName, streakDays: days });
            }
          }
        });

        // Sort alphabetically
        continuousBuyers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
        continuousSellers.sort((a, b) => a.name.localeCompare(b.name, "ko"));

        setBuyers(continuousBuyers);
        setSellers(continuousSellers);
      } catch (err: any) {
        console.error("Error loading trend data:", err);
        setError(err.message || "트렌드 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, [days]);

  return {
    buyers,
    sellers,
    loading,
    error,
  };
}
