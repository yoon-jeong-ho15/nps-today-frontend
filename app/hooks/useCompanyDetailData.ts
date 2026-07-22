import { useState, useEffect } from "react";
import { fetchCompanyList, fetchCompanyInfo } from "~/services/companyService";
import { fetchCompanyNetBuyHistory } from "~/services/tradeService";
import type { Company, NetBuyRecord } from "~/types/domain";

export function useCompanyDetailData(companyId: string | undefined) {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [historicalData, setHistoricalData] = useState<NetBuyRecord[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [rangeDays, setRangeDays] = useState<number>(30);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial load: company list
  useEffect(() => {
    async function loadCompanies() {
      try {
        const companies = await fetchCompanyList();
        setAllCompanies(companies);
      } catch (err: any) {
        console.error("Error loading company list:", err);
      }
    }
    loadCompanies();
  }, []);

  // 2. Load company info and history when companyId or rangeDays changes
  useEffect(() => {
    if (!companyId) {
      setError("No company ID provided. Please select a company from the list page.");
      setInitialLoading(false);
      return;
    }

    async function loadCompanyData() {
      try {
        if (historicalData.length === 0) {
          setInitialLoading(true);
        } else {
          setDataLoading(true);
        }
        setError(null);

        const [companyInfo, records] = await Promise.all([
          fetchCompanyInfo(companyId),
          fetchCompanyNetBuyHistory(companyId, rangeDays),
        ]);

        if (companyInfo) {
          setCompanyName(companyInfo.name);
        } else {
          setCompanyName("Unknown Company");
        }

        setHistoricalData(records);
      } catch (err: any) {
        console.error("Error loading company dashboard data:", err);
        setError(err.message || "Failed to load company transactions dashboard");
      } finally {
        setInitialLoading(false);
        setDataLoading(false);
      }
    }

    loadCompanyData();
  }, [companyId, rangeDays]);

  const handleRangeChange = (days: number) => {
    setRangeDays(days);
  };

  return {
    allCompanies,
    historicalData,
    companyName,
    rangeDays,
    handleRangeChange,
    initialLoading,
    dataLoading,
    error,
  };
}
