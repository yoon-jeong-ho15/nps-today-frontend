import { TrendingUp, TrendingDown, Building2, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { VolumeTrendCompany } from "~/hooks/useVolumeTrendData";
import { formatAmount } from "~/lib/format";
import { CompanyCard } from "~/components/dashboard/company/CompanyCard";

interface VolumeTrendGridProps {
  topBuyers: VolumeTrendCompany[];
  topSellers: VolumeTrendCompany[];
  loadingVolume: boolean;
  volumeDays: number;
}

export function VolumeTrendGrid({
  topBuyers,
  topSellers,
  loadingVolume,
  volumeDays,
}: VolumeTrendGridProps) {
  return (
    <div className="relative">
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
        className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300 ${loadingVolume ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"
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
                  <CompanyCard
                    key={company.id}
                    company={company}
                    hoverColor="emerald"
                    rightAction={
                      <>
                        <span className="text-sm font-semibold px-2.5 py-1 text-emerald-600 dark:text-emerald-400 shrink-0">
                          +{formatAmount(company.totalAmount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-emerald-500 transition-all shrink-0" />
                      </>
                    }
                  />
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
                  <CompanyCard
                    key={company.id}
                    company={company}
                    hoverColor="rose"
                    rightAction={
                      <>
                        <span className="text-sm font-semibold px-2.5 py-1 text-rose-600 dark:text-rose-400 shrink-0">
                          {formatAmount(company.totalAmount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-rose-500 transition-all shrink-0" />
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
