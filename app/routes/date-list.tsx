import type { Route } from "./+types/date-list";
import { Link } from "react-router";
import { useMemo } from "react";
import { formatDateDisplay, formatMonthName, formatAmount } from "~/lib/format";
import { useDateListData } from "~/hooks/useDateListData";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS Today - 거래일 목록" },
    {
      name: "description",
      content:
        "국민연금공단(NPS) 코스피 거래 기록이 있는 모든 거래일 목록입니다.",
    },
  ];
}

export default function DateListRoute() {
  const { availableDates, groupedDates, dailyTotals, loading, error } = useDateListData();

  const maxAbsAmount = useMemo(() => {
    const values = Object.values(dailyTotals);
    if (values.length === 0) return 1; // prevent division by zero
    return Math.max(...values.map(Math.abs));
  }, [dailyTotals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            거래일 목록 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col transition-colors duration-300">
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {error ? (
          <div className="max-w-md mx-auto text-center bg-card border border-border p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-2">
              오류 발생
            </h3>
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
            {Object.keys(groupedDates)
              .sort((a, b) => b.localeCompare(a))
              .map((year) => (
                <section
                  key={year}
                  className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm transition-colors flex flex-col"
                >
                  <h2 className="text-2xl font-black text-foreground mb-6 pb-2 border-b border-border/60">
                    {year}년
                  </h2>

                  <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(groupedDates[year]).map((month) => (
                      <div key={month}>
                        <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-4">
                          {formatMonthName(month)}
                        </h3>

                        <div className="grid grid-cols-6 md:grid-cols-5 gap-3">
                          {groupedDates[year][month]
                            .sort((a, b) => a.localeCompare(b))
                            .map((dateStr) => {
                              const amount = dailyTotals[dateStr];
                              let colorClasses = "bg-background text-foreground border-border hover:bg-yellow-500/5 hover:border-yellow-500/35 hover:text-yellow-600 dark:hover:text-yellow-400";
                              let dynamicStyle: React.CSSProperties = {};

                              if (amount !== undefined) {
                                const ratio = Math.abs(amount) / maxAbsAmount;
                                // 0.1 (가장 연함) ~ 0.8 (가장 진함)
                                const opacity = 0.1 + ratio * 0.7;

                                if (amount > 0) {
                                  // Green
                                  colorClasses = "text-green-800 dark:text-green-300 border-green-200/50 dark:border-green-800/30 bg-[rgba(34,197,94,var(--cell-opacity))] hover:bg-[rgba(34,197,94,calc(var(--cell-opacity)+0.15))]";
                                } else {
                                  // Red
                                  colorClasses = "text-red-800 dark:text-red-300 border-red-200/50 dark:border-red-800/30 bg-[rgba(239,68,68,var(--cell-opacity))] hover:bg-[rgba(239,68,68,calc(var(--cell-opacity)+0.15))]";
                                }

                                dynamicStyle = {
                                  "--cell-opacity": opacity,
                                } as React.CSSProperties;
                              }
                              
                              return (
                                <Link
                                  key={dateStr}
                                  to={`/date/${dateStr}`}
                                  className={`group relative text-xs flex items-center justify-center border rounded-lg p-2 font-semibold shadow-xs hover:shadow-md transition-all duration-100 ${colorClasses}`}
                                  style={dynamicStyle}
                                >
                                  <span className="whitespace-nowrap">
                                    {formatDateDisplay(dateStr)}
                                  </span>
                                  
                                  {amount !== undefined && (
                                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs rounded-xl bg-popover/95 backdrop-blur-sm border border-border shadow-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                                      <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center">해당일 총 순매수액</p>
                                      <p className={`text-sm font-bold text-center ${amount > 0 ? "text-green-600 dark:text-green-400" : amount < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                                        {formatAmount(amount)}
                                      </p>
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
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
