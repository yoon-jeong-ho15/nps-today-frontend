import { DollarSign, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { formatAmount } from "~/lib/format";

import type { DayDashboardMetrics } from "~/types/domain";

interface DayMetricsGridProps {
  metrics: DayDashboardMetrics;
}

export function DayMetricsGrid({ metrics }: DayMetricsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Net Total Card */}
      <Card className="bg-card border-border shadow-lg relative overflow-hidden group hover:border-primary/50 transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            일일 순매수 합계
          </CardDescription>
          <CardTitle
            className={`text-3xl font-extrabold tracking-tight mt-2 flex items-baseline gap-1.5 ${metrics.netAmount >= 0
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
              }`}
          >
            {formatAmount(metrics.netAmount)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-24 h-24 text-foreground" />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold border-t border-border/50 pt-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground">총 매수</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold mt-0.5">
                {formatAmount(metrics.totalBuyAmount)}
              </span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">총 매도</span>
              <span className="text-rose-500 dark:text-rose-400 font-bold mt-0.5">
                {formatAmount(metrics.totalSellAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy/Sell Counts Card */}
      <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 매수/매도 종목 수
          </CardDescription>
          <div className="mt-2 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs mb-1">매수 종목</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold text-3xl tracking-tight">
                {metrics.buyCount}
                <span className="text-sm text-emerald-500/70 dark:text-emerald-400/70 ml-1">개</span>
              </span>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs mb-1">매도 종목</span>
              <span className="text-rose-500 dark:text-rose-400 font-bold text-3xl tracking-tight">
                {metrics.sellCount}
                <span className="text-sm text-rose-500/70 dark:text-rose-400/70 ml-1">개</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 border-t border-border/50 pt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">전체 거래 종목</span>
            <span className="text-foreground font-mono font-semibold">
              {metrics.buyCount + metrics.sellCount}개
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
