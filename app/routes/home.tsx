import type { Route } from "./+types/home";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router";
import DayDashboard from "../../components/dashboard/day";

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
    { title: "NPS Today - KOSPI Net Buy Dashboard" },
    { name: "description", content: "Daily National Pension Service (NPS) Net Buying Trends for KOSPI Stocks" },
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

        // Fetch all distinct dates by scanning in pages (since Supabase limits results to 1000 rows)
        let allDates: string[] = [];
        let start = 0;
        const step = 1000;

        while (true) {
          const { data, error } = await supabase
            .from("kospi_fund_net_buy")
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

        // Fetch company list
        const { data: companyData, error: companyErr } = await supabase
          .from("company_list")
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !availableDates.length) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-6 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Error Loading Dashboard</h3>
          <p className="text-slate-400 text-sm mt-2 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30">
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
