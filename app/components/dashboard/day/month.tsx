import { useMemo } from "react";
import { Link } from "react-router";
import { formatMonthName, formatAmount } from "~/lib/format";

interface MonthProps {
  year?: string;
  month: string;
  dates: string[];
  dailyTotals: Record<string, number>;
  maxAbsAmount: number;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Month({
  year,
  month,
  dates,
  dailyTotals,
  maxAbsAmount,
}: MonthProps) {
  // Infer year if not explicitly passed
  const yearNum = useMemo(() => {
    if (year) return parseInt(year, 10);
    if (dates.length > 0 && dates[0].length >= 4) {
      return parseInt(dates[0].substring(0, 4), 10);
    }
    return new Date().getFullYear();
  }, [year, dates]);

  const monthNum = useMemo(() => parseInt(month, 10), [month]);

  // First day of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfWeek = useMemo(() => {
    return new Date(yearNum, monthNum - 1, 1).getDay();
  }, [yearNum, monthNum]);

  // Total days in the month
  const daysInMonth = useMemo(() => {
    return new Date(yearNum, monthNum, 0).getDate();
  }, [yearNum, monthNum]);

  const tradingDateSet = useMemo(() => new Set(dates), [dates]);

  return (
    <div className="bg-card/50 border border-border/50 rounded-2xl p-4 shadow-xs">
      <h3 className="text-base font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-4 text-center">
        {formatMonthName(month)}
      </h3>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center text-xs font-semibold">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`py-1 ${
              idx === 0
                ? "text-red-500/80 dark:text-red-400/80"
                : idx === 6
                ? "text-blue-500/80 dark:text-blue-400/80"
                : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Empty slots for padding before the 1st day of the month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = String(dayNum).padStart(2, "0");
          const monthStr = String(monthNum).padStart(2, "0");
          const dateStr = `${yearNum}${monthStr}${dayStr}`;

          const isTradingDay = tradingDateSet.has(dateStr);
          const amount = dailyTotals[dateStr];

          if (isTradingDay) {
            let colorClasses =
              "bg-background text-foreground border-border hover:bg-yellow-500/5 hover:border-yellow-500/35 hover:text-yellow-600 dark:hover:text-yellow-400";
            let dynamicStyle: React.CSSProperties = {};

            if (amount !== undefined) {
              const ratio = Math.abs(amount) / maxAbsAmount;
              // 0.1 (가장 연함) ~ 0.8 (가장 진함)
              const opacity = 0.1 + ratio * 0.7;

              if (amount > 0) {
                // Green
                colorClasses =
                  "text-green-800 dark:text-green-300 border-green-200/50 dark:border-green-800/30 bg-[rgba(34,197,94,var(--cell-opacity))] hover:bg-[rgba(34,197,94,calc(var(--cell-opacity)+0.15))]";
              } else {
                // Red
                colorClasses =
                  "text-red-800 dark:text-red-300 border-red-200/50 dark:border-red-800/30 bg-[rgba(239,68,68,var(--cell-opacity))] hover:bg-[rgba(239,68,68,calc(var(--cell-opacity)+0.15))]";
              }

              dynamicStyle = {
                "--cell-opacity": opacity,
              } as React.CSSProperties;
            }

            return (
              <Link
                key={dateStr}
                to={`/date/${dateStr}`}
                className={`group relative aspect-square text-xs flex items-center justify-center border rounded-lg font-semibold shadow-2xs hover:shadow-md transition-all duration-100 ${colorClasses}`}
                style={dynamicStyle}
              >
                <span>{dayNum}</span>

                {amount !== undefined && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs rounded-xl bg-popover/95 backdrop-blur-sm border border-border shadow-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center">
                      {yearNum}년 {monthNum}월 {dayNum}일 총 순매수액
                    </p>
                    <p
                      className={`text-sm font-bold text-center ${
                        amount > 0
                          ? "text-green-600 dark:text-green-400"
                          : amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-foreground"
                      }`}
                    >
                      {formatAmount(amount)}
                    </p>
                  </div>
                )}
              </Link>
            );
          }

          return (
            <div
              key={`non-trading-${dayNum}`}
              className="aspect-square text-xs flex items-center justify-center rounded-lg text-muted-foreground/35 font-normal bg-muted/10 select-none"
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}