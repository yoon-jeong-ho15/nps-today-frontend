import { useCallback } from "react";
import { fetchCompanyList } from "~/services/companyService";
import { fetchDateNetBuyRecords } from "~/services/tradeService";
import { getTodayDate } from "~/lib/format";
import type { Company, NetBuyRecord } from "~/types/domain";
import { useAsyncData } from "./useAsyncData";

const EMPTY_COMPANIES: Company[] = [];
const EMPTY_RECORDS: NetBuyRecord[] = [];

export function useDateDetailData(routeDate: string | undefined) {
  const selectedDate = routeDate || getTodayDate();
  const companies = useAsyncData(fetchCompanyList, EMPTY_COMPANIES);
  const loadRecords = useCallback(
    (signal: AbortSignal) => fetchDateNetBuyRecords(selectedDate, signal),
    [selectedDate],
  );
  const records = useAsyncData(loadRecords, EMPTY_RECORDS);
  return {
    data: records.data,
    companies: companies.data,
    selectedDate,
    initialLoading: companies.initialLoading || records.initialLoading,
    dataLoading: records.dataLoading,
    error: companies.error || records.error,
  };
}
