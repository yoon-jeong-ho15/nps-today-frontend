import type { Route } from "./+types/date-list";
import { Link } from "react-router";
import { formatDateDisplay, formatMonthName } from "~/lib/format";
import { useDateListData } from "~/hooks/useDateListData";

export function meta({}: Route.MetaArgs) {
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
  const { availableDates, groupedDates, loading, error } = useDateListData();

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
                          {groupedDates[year][month].map((dateStr) => (
                            <Link
                              key={dateStr}
                              to={`/date/${dateStr}`}
                              className="group text-xs flex items-center bg-background hover:bg-yellow-500/5 border border-border hover:border-yellow-500/35 rounded-lg p-2 text-foreground font-semibold hover:text-yellow-600 dark:hover:text-yellow-400 shadow-xs hover:shadow-md transition-all duration-100"
                            >
                              <span className="whitespace-nowrap">
                                {formatDateDisplay(dateStr)}
                              </span>
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
