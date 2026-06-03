import type { Route } from "./+types/date-list";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { FUND_NET_BUY_TABLE } from "../../constants";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS Today - 거래일 목록" },
    { name: "description", content: "국민연금공단(NPS) 코스피 거래 기록이 있는 모든 거래일 목록입니다." },
  ];
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const day = parseInt(dateStr.substring(6, 8), 10);
  return `${day}일`;
}

function formatMonthName(monthStr: string) {
  const month = parseInt(monthStr, 10);
  return `${month}월`;
}

export default function DateListRoute() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDates() {
      try {
        setLoading(true);
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

          allDates.push(...data.map((d) => d.date));
          if (data.length < step) break;
          start += step;
        }

        const sortedDistinctDates = Array.from(new Set(allDates)).sort((a, b) => b.localeCompare(a)); // Descending order (recent first)
        setAvailableDates(sortedDistinctDates);
      } catch (err: any) {
        console.error("Error loading dates:", err);
        setError(err.message || "Failed to load available dates.");
      } finally {
        setLoading(false);
      }
    }

    loadDates();
  }, []);

  // Group dates by year and month
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">거래일 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col transition-colors duration-300">

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {error ? (
          <div className="max-w-md mx-auto text-center bg-card border border-border p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-2">오류 발생</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            등록된 거래일 정보가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.keys(groupedDates).sort((a, b) => b.localeCompare(a)).map((year) => (
              <section key={year} className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
                <h2 className="text-2xl font-black text-foreground mb-6 pb-2 border-b border-border/60">
                  {year}년
                </h2>
                
                <div className="flex flex-col gap-8">
                  {Object.keys(groupedDates[year]).sort((a, b) => b.localeCompare(a)).map((month) => (
                    <div key={month}>
                      <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-4">
                        {formatMonthName(month)}
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {groupedDates[year][month].map((dateStr) => (
                          <Link
                            key={dateStr}
                            to={`/date/${dateStr}`}
                            className="group flex items-center justify-between bg-background hover:bg-yellow-500/5 border border-border hover:border-yellow-500/35 rounded-xl px-4 py-3 text-sm text-foreground font-semibold hover:text-yellow-600 dark:hover:text-yellow-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <span>{formatDateDisplay(dateStr)}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
