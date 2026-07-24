import { useState, useEffect, useMemo } from "react";
import { fetchAvailableTradingDates, fetchDailyTotalAmounts } from "~/services/tradeService";

export function useDateListData() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDates() {
      try {
        setLoading(true);
        setError(null);
        const [dates, totals] = await Promise.all([
          fetchAvailableTradingDates(),
          fetchDailyTotalAmounts()
        ]);
        setAvailableDates(dates);
        setDailyTotals(totals);
      } catch (err: any) {
        console.error("Error loading dates:", err);
        setError(err.message || "Failed to load available dates.");
      } finally {
        setLoading(false);
      }
    }

    loadDates();
  }, []);

  const groupedDates = useMemo(() => {
    const groups: Record<string, Record<string, string[]>> = {};

    availableDates.forEach((dateStr) => {
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);

        if (!groups[year]) {
          groups[year] = {};
        }
        if (!groups[year][month]) {
          groups[year][month] = [];
        }
        groups[year][month].push(dateStr);
      }
    });

    return groups;
  }, [availableDates]);

  return {
    availableDates,
    groupedDates,
    dailyTotals,
    loading,
    error,
  };
}
