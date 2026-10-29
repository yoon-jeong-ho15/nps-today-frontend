import type { MarketInsights } from "~/types/insights";

export function insightFixture(): MarketInsights {
  return {
    as_of: "20261029", flow_latest: "20261029", window_days: 5,
    period_start: "20261023", previous_start: "20261016", previous_end: "20261022",
    history_start: "20260102", classification_as_of: "2026-10-29",
    company_count: 204, coverage_count: 204, pullback_count: 1, sector_coverage_count: 204,
    pullbacks: [{ company_id: "005930", name: "테스트전자", sector_name: "전기·전자", net_amount: 1000, turnover_pct: 2, price_change: -3 }],
    influence: [{ company_id: "005930", name: "테스트전자", sector_name: "전기·전자", net_amount: -1000, turnover_pct: -2 }],
    sectors: Array.from({ length: 7 }, (_, index) => ({ sector_name: `업종 ${index}`, current_amount: index * 100, previous_amount: -100, change_amount: index * 100 + 100, company_count: 2 })),
    performance: ([5, 20, 60] as const).map((horizon) => ({
      horizon, signal_count: 10, sample_count: 6, pending_count: 3, excluded_count: 1,
      average_return: horizon === 5 ? 1.25 : -2.5, median_return: 0,
      excess_return: -1.1, positive_rate: 50,
      examples: [{ company_id: "005930", name: "테스트전자", signal_date: "20260102", entry_date: "20260105", exit_date: "20260202", return_pct: 3, excess_return: 1 }],
    })),
  };
}
