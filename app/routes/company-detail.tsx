import type { Route } from "./+types/company-detail";
import { useParams, Link } from "react-router";
import CompanyDashboard from "../../components/dashboard/company";
import { useCompanyDetailData } from "~/hooks/useCompanyDetailData";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `국민연금 투데이 - 기업 상세 분석 (${params.id})` },
    { name: "description", content: "국민연금공단(NPS) 기업별 상세 분석 및 거래 변동 추이 대시보드" },
  ];
}

export default function CompanyDetailRoute() {
  const { id: companyId } = useParams();
  const {
    allCompanies,
    historicalData,
    companyName,
    rangeDays,
    handleRangeChange,
    initialLoading,
    dataLoading,
    error,
  } = useCompanyDetailData(companyId);

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
        data={historicalData}
        rangeDays={rangeDays}
        onRangeChange={handleRangeChange}
        dataLoading={dataLoading}
      />
    </div>
  );
}
