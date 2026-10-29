import { useMemo } from "react";
import { ArrowLeft, CircleHelp, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/company-detail";
import { useCompanyDetailData } from "~/hooks/useCompanyDetailData";
import { CompanyDashboardHeader } from "~/components/dashboard/company/CompanyDashboardHeader";
import { CompanyMetricsGrid } from "~/components/dashboard/company/CompanyMetricsGrid";
import { CompanyChart } from "~/components/dashboard/company/CompanyChart";
import { CompanyHistoryTable } from "~/components/dashboard/company/CompanyHistoryTable";
import { ErrorState, LoadingState } from "~/components/dashboard/shared";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.id} 기업별 수급 분석 · NPS today` }];
}
export default function CompanyDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    allCompanies,
    historicalData,
    companyName,
    rangeDays,
    handleRangeChange,
    initialLoading,
    dataLoading,
    error,
  } = useCompanyDetailData(id);
  const sortedCompanies = useMemo(
    () => [...allCompanies].sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [allCompanies],
  );
  const metrics = useMemo(() => {
    const totalDays = historicalData.length;
    const totalAmount = historicalData.reduce(
      (sum, row) => sum + row.amount,
      0,
    );
    const totalQuantity = historicalData.reduce(
      (sum, row) => sum + row.quantity,
      0,
    );
    const buyDays = historicalData.filter((row) => row.amount > 0).length;
    const sellDays = historicalData.filter((row) => row.amount < 0).length;
    return {
      totalAmount,
      totalQuantity,
      buyDays,
      sellDays,
      totalDays,
      buyRatio: totalDays ? (buyDays / totalDays) * 100 : 0,
      avgAmount: totalDays ? totalAmount / totalDays : 0,
    };
  }, [historicalData]);
  return (
    <main className="dashboard-page">
      <Link className="back-link" to="/company">
        <ArrowLeft size={14} /> 종목 탐색으로 돌아가기
      </Link>
      {initialLoading ? (
        <LoadingState />
      ) : error || !id ? (
        <ErrorState message={error || "기업을 찾을 수 없습니다."} />
      ) : (
        <>
          <CompanyDashboardHeader
            companyId={id}
            companyName={
              allCompanies.find((company) => company.id === id)?.name ||
              companyName
            }
            sortedCompanies={sortedCompanies}
            rangeDays={rangeDays}
            onRangeChange={handleRangeChange}
            onCompanyChange={(companyId) => navigate(`/company/${companyId}`)}
          />
          {dataLoading && (
            <div className="refresh-indicator" role="status">
              <RefreshCw size={13} /> 선택한 기간의 거래 내역을 불러오는 중...
            </div>
          )}
          <div
            className={`detail-content ${dataLoading ? "is-refreshing" : ""}`}
            aria-busy={dataLoading}
          >
            <CompanyMetricsGrid metrics={metrics} />
            <CompanyChart chronologicalData={[...historicalData].reverse()} />
            <CompanyHistoryTable data={historicalData} />
          </div>
          <div className="data-note">
            <CircleHelp size={12} />
            <span>
              선택한 거래일 수 이내에서 실제 수집된 기록을 표시합니다. 금액과
              수량의 순매수 방향은 다를 수 있습니다.
            </span>
          </div>
        </>
      )}
    </main>
  );
}
