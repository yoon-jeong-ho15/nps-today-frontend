import { useMemo } from "react";
import { fetchCompanyList } from "~/services/companyService";
import {
  fetchAvailableTradingDates,
  fetchRecordsByDates,
} from "~/services/tradeService";
import { useAsyncData } from "./useAsyncData";
import { calculateStreakTrends } from "~/lib/tradeAnalysis";
import type { Company, NetBuyRecord } from "~/types/domain";

const EMPTY = {
  companies: [] as Company[],
  records: [] as NetBuyRecord[],
  dates: [] as string[],
};
async function loadDashboard(signal: AbortSignal) {
  const dates = [...new Set(await fetchAvailableTradingDates(signal))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 20);
  const [companies, records] = await Promise.all([
    fetchCompanyList(),
    fetchRecordsByDates(dates, signal),
  ]);
  return { companies, records, dates };
}
export function useDashboardData() {
  const { data, loading, error } = useAsyncData(loadDashboard, EMPTY);
  const analysis = useMemo(() => {
    const names = new Map(
      data.companies.map((company) => [company.id, company.name]),
    );
    const latestDate = data.dates[0] || "";
    const latest = data.records
      .filter((row) => row.date === latestDate)
      .map((row) => ({
        ...row,
        company_name: names.get(row.company_id) || row.company_id,
      }));
    const daily = data.dates
      .slice()
      .reverse()
      .map((date) => ({ date, amount: 0 }));
    const totals = new Map(daily.map((day) => [day.date, day]));
    data.records.forEach((row) => {
      const day = totals.get(row.date);
      if (day) day.amount += row.amount;
    });
    const streaks =
      data.dates.length >= 5
        ? calculateStreakTrends(
            data.records,
            data.companies,
            data.dates.slice(0, 5),
          )
        : { buyers: [], sellers: [] };
    return { latestDate, latest, daily, streaks };
  }, [data]);
  return { ...data, ...analysis, loading, error };
}
