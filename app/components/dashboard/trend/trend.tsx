import { TrendingUp, TrendingDown, Building2, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { TrendCompany } from "~/hooks/useTrendData";
import type { VolumeTrendCompany } from "~/hooks/useVolumeTrendData";
import { formatAmount } from "~/lib/format";

interface TrendDashboardProps {
  buyers: TrendCompany[];
  sellers: TrendCompany[];
  loading: boolean;
  days: number;
  topBuyers: VolumeTrendCompany[];
  topSellers: VolumeTrendCompany[];
  loadingVolume: boolean;
  volumeDays: number;
}

export default function TrendDashboard({ buyers, sellers, loading, days, topBuyers, topSellers, loadingVolume, volumeDays }: TrendDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            시장 트렌드
          </h1>
          <p className="text-muted-foreground mt-1">
            최근 {days}거래일 연속 순매수/순매도 종목을 확인하세요.
          </p>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
            <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              <span className="text-foreground text-sm font-medium">
                트렌드 데이터 분석 중...
              </span>
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300 ${
            loading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"
          }`}
        >
          {/* Continuous Buyers */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-emerald-500/5">
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {days}일 이상 연속 순매수
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                연기금이 {days}일 연속으로 사들인 종목입니다.
              </p>
            </div>
            
            <div className="p-6 flex-1 bg-background/50">
              {buyers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Building2 className="w-12 h-12 mb-3 opacity-20" />
                  <p>조건에 맞는 종목이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {buyers.map((company) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="group flex items-center justify-between bg-card border border-border hover:border-emerald-500/35 rounded-xl px-4 py-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {company.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {company.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {company.streakDays}일 연속
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Continuous Sellers */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-rose-500/5">
              <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                {days}일 이상 연속 순매도
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                연기금이 {days}일 연속으로 팔아치운 종목입니다.
              </p>
            </div>
            
            <div className="p-6 flex-1 bg-background/50">
              {sellers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Building2 className="w-12 h-12 mb-3 opacity-20" />
                  <p>조건에 맞는 종목이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {sellers.map((company) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="group flex items-center justify-between bg-card border border-border hover:border-rose-500/35 rounded-xl px-4 py-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {company.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {company.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          {company.streakDays}일 연속
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-rose-500 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Dashboard Content Grid */}
      <div className="relative mt-8">
        {loadingVolume && (
          <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
            <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              <span className="text-foreground text-sm font-medium">
                누적 트렌드 데이터 분석 중...
              </span>
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300 ${
            loadingVolume ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"
          }`}
        >
          {/* Top Volume Buyers */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-emerald-500/5">
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                최근 {volumeDays}일 누적 순매수 상위
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                연기금이 최근 {volumeDays}일간 가장 많이 매수한 종목입니다.
              </p>
            </div>
            
            <div className="p-6 flex-1 bg-background/50">
              {topBuyers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Building2 className="w-12 h-12 mb-3 opacity-20" />
                  <p>조건에 맞는 종목이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {topBuyers.map((company) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="group flex items-center justify-between bg-card border border-border hover:border-emerald-500/35 rounded-xl px-4 py-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {company.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {company.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
                          +{formatAmount(company.totalAmount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Volume Sellers */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-rose-500/5">
              <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                최근 {volumeDays}일 누적 순매도 상위
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                연기금이 최근 {volumeDays}일간 가장 많이 매도한 종목입니다.
              </p>
            </div>
            
            <div className="p-6 flex-1 bg-background/50">
              {topSellers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Building2 className="w-12 h-12 mb-3 opacity-20" />
                  <p>조건에 맞는 종목이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {topSellers.map((company) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="group flex items-center justify-between bg-card border border-border hover:border-rose-500/35 rounded-xl px-4 py-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {company.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {company.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold px-2.5 py-1 text-rose-600 dark:text-rose-400">
                          {formatAmount(company.totalAmount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-rose-500 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
