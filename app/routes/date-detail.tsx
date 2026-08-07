import type { Route } from "./+types/date-detail";
import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { DayMetricsGrid } from "~/components/dashboard/day/DayMetricsGrid";
import { DayTopTrades } from "~/components/dashboard/day/DayTopTrades";
import { DayRecordsTable } from "~/components/dashboard/day/DayRecordsTable";
import { useDateDetailData } from "~/hooks/useDateDetailData";

export function meta({ params }: Route.MetaArgs) {
  const dateStr = params.date || "";
  let formattedDate = dateStr;
  if (dateStr.length === 8) {
    formattedDate = `${dateStr.substring(0, 4)}년 ${parseInt(dateStr.substring(4, 6), 10)}월 ${parseInt(dateStr.substring(6, 8), 10)}일`;
  }
  return [
    { title: `NPS today - ${formattedDate} 거래 동향` },
    {
      name: "description",
      content: `국민연금공단(NPS) 코스피 주식 ${formattedDate} 일별 동향 대시보드`,
    },
  ];
}

export default function DateDetailRoute() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();

  const {
    data,
    companies,
    selectedDate,
    todayDate,
    initialLoading,
    dataLoading,
    error,
  } = useDateDetailData(routeDate);

  const handleDateChange = (newDate: string) => {
    navigate(`/date/${newDate}`);
  };

  // 1. Map company IDs to names
  const companyMap = useMemo(() => {
    return new Map(companies.map((c) => [c.id, c.name]));
  }, [companies]);

  // 2. Filter records for the selected date
  const selectedRecords = useMemo(() => {
    return data
      .filter((r) => r.date === selectedDate)
      .map((r) => ({
        ...r,
        company_name: companyMap.get(r.company_id) || `회사 (${r.company_id})`,
      }));
  }, [data, selectedDate, companyMap]);

  // 3. Metrics calculation
  const metrics = useMemo(() => {
    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    let buyCount = 0;
    let sellCount = 0;

    selectedRecords.forEach((r) => {
      if (r.amount > 0) {
        totalBuyAmount += r.amount;
        buyCount += 1;
      } else if (r.amount < 0) {
        totalSellAmount += r.amount;
        sellCount += 1;
      }
    });

    return {
      totalBuyAmount,
      totalSellAmount,
      netAmount: totalBuyAmount + totalSellAmount,
      buyCount,
      sellCount,
    };
  }, [selectedRecords]);

  const displayDateStr = useMemo(() => {
    if (!selectedDate || selectedDate.length !== 8) return selectedDate;
    const year = selectedDate.substring(0, 4);
    const month = selectedDate.substring(4, 6);
    const day = selectedDate.substring(6, 8);
    
    const dateObj = new Date(`${year}-${month}-${day}`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[dateObj.getDay()];

    return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 (${dayName}요일)`;
  }, [selectedDate]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            대시보드 초기화 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            대시보드 로드 오류
          </h3>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="relative">
          {dataLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
              <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <span className="text-foreground text-sm font-medium">
                  거래 데이터 불러오는 중...
                </span>
              </div>
            </div>
          )}

          <div
            className={`flex flex-col gap-8 transition-all duration-300 ${
              dataLoading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"
            }`}
          >
            {/* Key Metrics Cards */}
            <DayMetricsGrid metrics={metrics} displayDateStr={displayDateStr} />

            {/* Top 10 Trades */}
            <DayTopTrades selectedRecords={selectedRecords} />

            {/* Interactive Full Table Section */}
            <DayRecordsTable selectedRecords={selectedRecords} />
          </div>
        </div>
      </div>
    </div>
  );
}
