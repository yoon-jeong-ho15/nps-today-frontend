import { useMemo } from "react";
import { DayMetricsGrid } from "./day/DayMetricsGrid";
import { DayTopTrades } from "./day/DayTopTrades";
import { DayRecordsTable } from "./day/DayRecordsTable";

import type { Company, NetBuyRecord } from "~/types/domain";

interface DayDashboardProps {
  data: NetBuyRecord[];
  companies: Company[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  todayDate: string;
  dataLoading?: boolean;
}

export default function DayDashboard({
  data,
  companies,
  selectedDate,
  dataLoading = false,
}: DayDashboardProps) {
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

  return (
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
  );
}
