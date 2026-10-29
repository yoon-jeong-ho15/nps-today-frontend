import { useCallback, useState } from "react";
import { fetchCompanyList, fetchCompanyInfo } from "~/services/companyService";
import { fetchCompanyNetBuyHistory } from "~/services/tradeService";
import type { Company, NetBuyRecord } from "~/types/domain";
import { useAsyncData } from "./useAsyncData";

const EMPTY_COMPANIES: Company[] = [];
const EMPTY_DETAIL = { companyName: "", historicalData: [] as NetBuyRecord[] };

export function useCompanyDetailData(companyId: string | undefined) {
  const [rangeDays, setRangeDays] = useState(30);
  const companies = useAsyncData(fetchCompanyList, EMPTY_COMPANIES);
  const loadDetail = useCallback(
    async (signal: AbortSignal) => {
      if (!companyId) throw new Error("기업을 선택해주세요.");
      const [company, historicalData] = await Promise.all([
        fetchCompanyInfo(companyId, signal),
        fetchCompanyNetBuyHistory(companyId, rangeDays, signal),
      ]);
      if (!company) throw new Error("기업 정보를 찾을 수 없습니다.");
      return { companyName: company.name, historicalData };
    },
    [companyId, rangeDays],
  );
  const detail = useAsyncData(loadDetail, EMPTY_DETAIL);

  return {
    allCompanies: companies.data,
    ...detail.data,
    rangeDays,
    handleRangeChange: setRangeDays,
    initialLoading: companies.initialLoading || detail.initialLoading,
    dataLoading: detail.dataLoading,
    error: companies.error || detail.error,
  };
}
