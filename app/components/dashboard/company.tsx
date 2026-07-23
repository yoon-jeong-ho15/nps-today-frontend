import { useMemo } from "react";
import { useNavigate } from "react-router";
import { CompanyDashboardHeader } from "./company/CompanyDashboardHeader";
import { CompanyMetricsGrid } from "./company/CompanyMetricsGrid";
import { CompanyChart } from "./company/CompanyChart";
import { CompanyHistoryTable } from "./company/CompanyHistoryTable";

import type { Company, NetBuyRecord, CompanyDashboardMetrics } from "~/types/domain";

interface CompanyDashboardProps {
  companyId: string;
  companyName: string;
  allCompanies: Company[];
  data: NetBuyRecord[];
  rangeDays: number;
  onRangeChange: (days: number) => void;
  dataLoading?: boolean;
}

export default function CompanyDashboard({
  companyId,
  companyName,
  allCompanies,
  data,
  rangeDays,
  onRangeChange,
  dataLoading = false,
}: CompanyDashboardProps) {
  const navigate = useNavigate();

  // Sort all companies alphabetically for the selector
  const sortedCompanies = useMemo(() => {
    return [...allCompanies].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [allCompanies]);

  // Data for the chart needs to be in chronological order (oldest to newest)
  const chronologicalData = useMemo(() => {
    return [...data].reverse();
  }, [data]);

  // Calculate Metrics over the selected range
  const metrics = useMemo(() => {
    let totalAmount = 0;
    let totalQuantity = 0;
    let buyDays = 0;
    let sellDays = 0;

    data.forEach((r) => {
      totalAmount += r.amount;
      totalQuantity += r.quantity;
      if (r.amount > 0) buyDays++;
      else if (r.amount < 0) sellDays++;
    });

    const totalDays = data.length;
    const buyRatio = totalDays > 0 ? (buyDays / totalDays) * 100 : 0;
    const avgAmount = totalDays > 0 ? totalAmount / totalDays : 0;

    return {
      totalAmount,
      totalQuantity,
      buyDays,
      sellDays,
      buyRatio,
      avgAmount,
      totalDays,
    };
  }, [data]);

  const handleCompanyChange = (id: string) => {
    navigate(`/company/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header / Top Panel */}
      <CompanyDashboardHeader
        companyId={companyId}
        companyName={companyName}
        sortedCompanies={sortedCompanies}
        rangeDays={rangeDays}
        onRangeChange={onRangeChange}
        onCompanyChange={handleCompanyChange}
      />

      {/* Dashboard Content Grid */}
      <div className="relative">
        {dataLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
            <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500"></div>
              <span className="text-foreground text-sm font-medium">
                분석 결과 업데이트 중...
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
          <CompanyMetricsGrid metrics={metrics} />

          {/* Chart Panel */}
          <CompanyChart chronologicalData={chronologicalData} />

          {/* Historical Table */}
          <CompanyHistoryTable data={data} />
        </div>
      </div>
    </div>
  );
}