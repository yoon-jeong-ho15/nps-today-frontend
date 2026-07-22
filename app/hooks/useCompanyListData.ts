import { useState, useEffect, useMemo } from "react";
import { fetchCompanyList } from "~/services/companyService";
import type { Company } from "~/types/domain";

export function useCompanyListData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCompanyList();
        setCompanies(data);
      } catch (err: any) {
        console.error("Error loading companies:", err);
        setError(err.message || "Failed to load companies list.");
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let result = [...companies];

    if (term !== "") {
      result = result.filter(
        (c) => c.name.toLowerCase().includes(term) || c.id.includes(term)
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [companies, searchTerm]);

  return {
    filteredCompanies,
    searchTerm,
    setSearchTerm,
    loading,
    error,
  };
}
