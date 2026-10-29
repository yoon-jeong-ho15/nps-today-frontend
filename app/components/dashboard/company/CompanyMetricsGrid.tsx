import {
  ArrowDownUp,
  ChartNoAxesCombined,
  PieChart,
  Scale,
} from "lucide-react";
import type { CompanyDashboardMetrics } from "~/types/domain";
import { MetricCard } from "../shared";
import { formatCompactAmount } from "~/lib/format";
export function CompanyMetricsGrid({
  metrics,
}: {
  metrics: CompanyDashboardMetrics;
}) {
  return (
    <section className="metrics-grid">
      <MetricCard
        featured
        label="누적 순매수 금액"
        value={formatCompactAmount(metrics.totalAmount)}
        detail={`실제 데이터 ${metrics.totalDays}거래일 기준`}
        icon={<ChartNoAxesCombined size={16} />}
      />
      <MetricCard
        label="누적 순매수 수량"
        value={
          <>
            {Intl.NumberFormat("ko-KR", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(metrics.totalQuantity)}
            <span className="metric-unit">주</span>
          </>
        }
        detail="선택한 기간의 순매수 수량 합계"
        icon={<ArrowDownUp size={16} />}
      />
      <MetricCard
        label="순매수 거래일 비중"
        value={
          <>
            {metrics.buyRatio.toFixed(1)}
            <span className="metric-unit">%</span>
          </>
        }
        detail={`매수 ${metrics.buyDays}일 · 매도 ${metrics.sellDays}일`}
        icon={<PieChart size={16} />}
      />
      <MetricCard
        label="하루 평균 순매수"
        value={formatCompactAmount(metrics.avgAmount)}
        detail="선택한 기간의 일평균 순매수 금액"
        icon={<Scale size={16} />}
      />
    </section>
  );
}
