import type { Route } from "./+types/home";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router";
import DayDashboard from "../../components/dashboard/day";
import { ThemeToggle } from "../components/theme-toggle";
import { COMPANY_LIST_TABLE, FUND_NET_BUY_TABLE } from "../../constants";
import Header from "../../components/header";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function getTodayDate() {
  const dateObject = new Date();
  const year = dateObject.getFullYear().toString();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const date = dateObject.getDate().toString().padStart(2, "0");
  return year + month + date;
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS today" },
    { name: "description", content: "국민연금공단(NPS) 코스피 주식 일별 동향 대시보드" },
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

export default function Home() {
  const [data, setData] = useState<NetBuyRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const todayDate = getTodayDate();
  const dateParam = searchParams.get("date");

  // 1. Fetch initial configuration: distinct dates and companies
  useEffect(() => {
    async function loadConfig() {
      try {
        setInitialLoading(true);
        setError(null);

        let allDates: string[] = [];
        let start = 0;
        const step = 1000;

        while (true) {
          const { data, error } = await supabase
            .from(FUND_NET_BUY_TABLE)
            .select("date")
            .range(start, start + step - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          allDates.push(...data.map(d => d.date));
          if (data.length < step) break;
          start += step;
        }

        const sortedDistinctDates = Array.from(new Set(allDates)).sort();
        setAvailableDates(sortedDistinctDates);

        const { data: companyData, error: companyErr } = await supabase
          .from(COMPANY_LIST_TABLE)
          .select();

        if (companyErr) throw companyErr;

        setCompanies(companyData || []);
      } catch (err: any) {
        console.error("Error loading config:", err);
        setError(err.message || "Failed to initialize dashboard configuration");
      } finally {
        setInitialLoading(false);
      }
    }

    loadConfig();
  }, [todayDate]);

  // Derived selectedDate from search params, falling back to latest database date
  const selectedDate = useMemo(() => {
    if (dateParam) {
      return dateParam;
    }
    if (availableDates.length > 0) {
      return availableDates[availableDates.length - 1];
    }
    return todayDate;
  }, [dateParam, availableDates, todayDate]);

  // 2. Fetch data for the selected date when it changes
  useEffect(() => {
    if (!selectedDate) return;

    async function loadDateData() {
      try {
        setDataLoading(true);
        const { data: dayData, error: dayErr } = await supabase
          .from("kospi_fund_net_buy")
          .select()
          .eq("date", selectedDate);

        if (dayErr) throw dayErr;
        setData(dayData || []);
      } catch (err: any) {
        console.error("Error loading date data:", err);
        setError(err.message || "Failed to load data for selected date");
      } finally {
        setDataLoading(false);
      }
    }

    loadDateData();
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSearchParams({ date: newDate });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">대시보드 초기화 중...</p>
        </div>
      </div>
    );
  }

  if (error && !availableDates.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">대시보드 로드 오류</h3>
          <p className="text-muted-foreground text-sm mt-2 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 active:bg-yellow-600 dark:active:bg-yellow-750 text-white dark:text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased selection:bg-emerald-500/30 transition-colors">
      <DayDashboard
        data={data}
        companies={companies}
        selectedDate={selectedDate}
        availableDates={availableDates}
        onChangeDate={handleDateChange}
        todayDate={todayDate}
        dataLoading={dataLoading}
      />
    </div>
  );
}
