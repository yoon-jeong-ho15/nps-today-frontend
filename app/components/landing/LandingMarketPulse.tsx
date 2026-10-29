import { Link } from "react-router";
import { Flame, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useTrendData } from "~/hooks/useTrendData";
import { CompanyLogo } from "~/components/dashboard/company/CompanyLogo";

export function LandingMarketPulse() {
  const { buyers, sellers, loading, error } = useTrendData(5);

  return (
    <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>실시간 시장 수급 레이더</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            최근 국민연금 연속 매매 포착
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            최근 5거래일 동안 쉬지 않고 순매수 혹은 순매도한 주도 종목들입니다.
          </p>
        </div>

        <Link
          to="/trend"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 self-start sm:self-center transition-colors group"
        >
          <span>전체 트렌드 대시보드</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {error ? (
        <p role="alert" className="py-8 text-center text-sm text-destructive">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Buyers Column */}
          <div className="bg-background/60 border border-emerald-500/20 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-foreground text-base">
                  5일 연속 순매수 종목
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {loading ? "조회중..." : `${buyers.length}개 포착`}
              </span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>데이터 분석 중...</span>
              </div>
            ) : buyers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                현재 5일 연속 순매수 기준을 충족하는 종목이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {buyers.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    to={`/company/${c.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CompanyLogo company={c} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {c.id}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      5일 매수
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Sellers Column */}
          <div className="bg-background/60 border border-rose-500/20 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-foreground text-base">
                  5일 연속 순매도 종목
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {loading ? "조회중..." : `${sellers.length}개 포착`}
              </span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>데이터 분석 중...</span>
              </div>
            ) : sellers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                현재 5일 연속 순매도 기준을 충족하는 종목이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sellers.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    to={`/company/${c.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 hover:border-rose-500/50 hover:bg-rose-500/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CompanyLogo company={c} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {c.id}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      5일 매도
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
