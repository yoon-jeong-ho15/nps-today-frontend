import { DollarSign, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { formatAmount, formatQuantity } from "~/lib/format";

import type { CompanyDashboardMetrics } from "~/types/domain";

interface CompanyMetricsGridProps {
  metrics: CompanyDashboardMetrics;
}

export function CompanyMetricsGrid({ metrics }: CompanyMetricsGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Cumulative Net Buy Amount */}
      <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> 누적 순매수 금액
          </CardDescription>
          <CardTitle
            className={`text-2xl font-extrabold tracking-tight mt-2.5 ${metrics.totalAmount >= 0
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
              }`}
          >
            {formatAmount(metrics.totalAmount)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs mt-2">
            최근 {metrics.totalDays} 거래일 동안의 일일 순매수 누적 합계 금액입니다.
          </p>
        </CardContent>
      </Card>

      {/* Cumulative Net Buy Quantity */}
      <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" /> 누적 순매수 수량
          </CardDescription>
          <CardTitle
            className={`text-2xl font-extrabold tracking-tight mt-2.5 ${metrics.totalQuantity >= 0
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
              }`}
          >
            {formatQuantity(metrics.totalQuantity)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs mt-2">
            해당 기간 동안 순매수(+) 또는 순매도(-)한 주식 수의 총합입니다.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
