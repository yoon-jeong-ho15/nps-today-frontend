import { useState, useEffect, useMemo } from "react";
import { fetchCompanyList } from "~/services/companyService";
import { fetchDateNetBuyRecords } from "~/services/tradeService";
import type { Company, NetBuyRecord } from "~/types/domain";

function getTodayDate() {
  const dateObject = new Date();
  const year = dateObject.getFullYear().toString();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const date = dateObject.getDate().toString().padStart(2, "0");
  return year + month + date;
}

export function useDateDetailData(routeDate: string | undefined) {
  const [data, setData] = useState<NetBuyRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const todayDate = getTodayDate();

  const selectedDate = useMemo(() => {
    return routeDate || todayDate;
  }, [routeDate, todayDate]);

  // 1. Initial configuration load (company list)
  useEffect(() => {
    async function loadConfig() {
      try {
        setInitialLoading(true);
        setError(null);
        const companyData = await fetchCompanyList();
        setCompanies(companyData);
      } catch (err: any) {
        console.error("Error loading config:", err);
        setError(err.message || "Failed to initialize dashboard configuration");
      } finally {
        setInitialLoading(false);
      }
    }

    loadConfig();
  }, []);

  // 2. Fetch data for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    async function loadDateData() {
      try {
        setDataLoading(true);
        const dayData = await fetchDateNetBuyRecords(selectedDate);
        setData(dayData);
      } catch (err: any) {
        console.error("Error loading date data:", err);
        setError(err.message || "Failed to load data for selected date");
      } finally {
        setDataLoading(false);
      }
    }

    loadDateData();
  }, [selectedDate]);

  return {
    data,
    companies,
    selectedDate,
    todayDate,
    initialLoading,
    dataLoading,
    error,
  };
}
