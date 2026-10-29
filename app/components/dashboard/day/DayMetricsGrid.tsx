import {
  ArrowDownLeft,
  ArrowUpRight,
  ChartNoAxesCombined,
  PieChart,
} from "lucide-react";
import type { DayDashboardMetrics } from "~/types/domain";
import { formatCompactAmount } from "~/lib/format";
import { MetricCard } from "../shared";
export function DayMetricsGrid({
  metrics,
  displayDateStr,
}: {
  metrics: DayDashboardMetrics;
  displayDateStr?: string;
}) {
  const count = metrics.buyCount + metrics.sellCount;
  return (
    <section className="metrics-grid">
      <MetricCard
        label="순매수 합계"
        value={formatCompactAmount(metrics.netAmount)}
        detail={displayDateStr || "해당 거래일의 전체 순매수 금액"}
        featured
        icon={<ChartNoAxesCombined size={16} />}
      />
      <MetricCard
        label="매수 우위 종목"
        value={
          <>
            {metrics.buyCount}
            <span className="metric-unit">개</span>
          </>
        }
        detail={formatCompactAmount(metrics.totalBuyAmount)}
        icon={<ArrowUpRight size={16} />}
      />
      <MetricCard
        label="매도 우위 종목"
        value={
          <>
            {metrics.sellCount}
            <span className="metric-unit">개</span>
          </>
        }
        detail={formatCompactAmount(metrics.totalSellAmount)}
        icon={<ArrowDownLeft size={16} />}
      />
      <MetricCard
        label="매수 우위 비중"
        value={
          <>
            {count ? Math.round((metrics.buyCount / count) * 100) : 0}
            <span className="metric-unit">%</span>
          </>
        }
        detail="순매수·순매도 종목 중 매수 종목 비중"
        icon={<PieChart size={16} />}
      />
    </section>
  );
}
