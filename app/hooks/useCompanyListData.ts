import { useState, useMemo } from "react";
import { fetchCompanyList } from "~/services/companyService";
import type { Company } from "~/types/domain";
import { useAsyncData } from "./useAsyncData";

const EMPTY_COMPANIES: Company[] = [];

export function useCompanyListData() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: companies,
    loading,
    error,
  } = useAsyncData(fetchCompanyList, EMPTY_COMPANIES);
  const filteredCompanies = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return companies
      .filter(
        (company) =>
          company.name.toLowerCase().includes(term) ||
          company.id.includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [companies, searchTerm]);
  return { filteredCompanies, searchTerm, setSearchTerm, loading, error };
}
