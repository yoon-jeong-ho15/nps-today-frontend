import type { Route } from "./+types/company-detail";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import CompanyDashboard from "../../components/dashboard/company";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `국민연금 투데이 - 기업 상세 분석 (${params.id})` },
    { name: "description", content: "국민연금공단(NPS) 기업별 상세 분석 및 거래 변동 추이 대시보드" },
  ];
}

interface NetBuyRecord {
  date: string;
  company_id: string;
  quantity: number;
  amount: number;
}

interface Company {
  id: string;
  name: string;
}

export default function CompanyDetailRoute() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [historicalData, setHistoricalData] = useState<NetBuyRecord[]>([]);
  const [rangeDays, setRangeDays] = useState<number>(30); // Default to 30 days
  const [companyName, setCompanyName] = useState<string>("");

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the initial company list (done once)
  useEffect(() => {
    async function loadCompanies() {
      try {
        const { data, error: companyErr } = await supabase
          .from("company_list")
          .select();

        if (companyErr) throw companyErr;
        setAllCompanies(data || []);
      } catch (err: any) {
        console.error("Error loading company list:", err);
      }
    }
    loadCompanies();
  }, []);

  // 2. Load company info and full history when companyId changes
  useEffect(() => {
    if (!companyId) {
      setError("No company ID provided. Please select a company from the list page.");
      setInitialLoading(false);
      return;
    }

    async function loadCompanyData() {
      try {
        setInitialLoading(true);
        setError(null);

        // Fetch company details
        const { data: companyData, error: nameErr } = await supabase
          .from("company_list")
          .select("name")
          .eq("id", companyId)
          .maybeSingle();

        if (nameErr) throw nameErr;

        if (companyData) {
          setCompanyName(companyData.name);
        } else {
          setCompanyName(`Unknown Company`);
        }

        // Fetch historical buy/sell records (maximum 365 records)
        const { data: records, error: recordsErr } = await supabase
          .from("kospi_fund_net_buy")
          .select()
          .eq("company_id", companyId)
          .order("date", { ascending: false })
          .limit(365);

        if (recordsErr) throw recordsErr;
        setHistoricalData(records || []);
      } catch (err: any) {
        console.error("Error loading company dashboard data:", err);
        setError(err.message || "Failed to load company transactions dashboard");
      } finally {
        setInitialLoading(false);
      }
    }

    loadCompanyData();
  }, [companyId]);

  // 3. Slice the historical data based on the selected range in memory
  const displayedData = useMemo(() => {
    return historicalData.slice(0, rangeDays);
  }, [historicalData, rangeDays]);

  const handleRangeChange = (days: number) => {
    setDataLoading(true);
    setRangeDays(days);
    setTimeout(() => {
      setDataLoading(false);
    }, 150);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            기업 거래 기록 분석 중...
          </p>
        </div>
      </div>
    );
  }

  if (error || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans transition-colors">
        <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">데이터 로드 오류</h3>
          <p className="text-muted-foreground text-sm mt-2 mb-6">{error || "잘못된 기업 ID"}</p>
          <Link
            to="/company"
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 active:bg-yellow-600 dark:active:bg-yellow-750 text-white dark:text-zinc-950 rounded-lg text-sm font-semibold transition-colors inline-block"
          >
            기업 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased selection:bg-emerald-500/30 transition-colors">
      <CompanyDashboard
        companyId={companyId}
        companyName={companyName}
        allCompanies={allCompanies}
        data={displayedData}
        rangeDays={rangeDays}
        onRangeChange={handleRangeChange}
        dataLoading={dataLoading}
      />
    </div>
  );
}
