import { supabase } from "~/lib/supabase";
import type { InsightWindow, MarketInsights } from "~/types/insights";

// Reject malformed values rather than rendering missing observations as zero.
function numeric(value: unknown, nullable = false): number | null {
  if (nullable && value === null) return null;
  if ((typeof value !== "number" && typeof value !== "string") || value === "") {
    throw new Error("분석 데이터의 숫자 형식이 올바르지 않습니다.");
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error("분석 데이터에 유효하지 않은 숫자가 있습니다.");
  return number;
}

export function normalizeInsights(value: unknown): MarketInsights {
  if (!value || typeof value !== "object") throw new Error("분석 데이터가 없습니다.");
  const data = structuredClone(value) as Record<string, unknown>;
  if (data.window_days !== 5 && data.window_days !== 20) throw new Error("분석 기간이 올바르지 않습니다.");
  for (const field of ["as_of", "flow_latest", "period_start", "previous_start", "previous_end", "history_start"]) {
    if (data[field] !== null && (typeof data[field] !== "string" || !/^\d{8}$/.test(data[field] as string))) {
      throw new Error("분석 기준일이 올바르지 않습니다.");
    }
  }
  for (const field of ["company_count", "coverage_count", "pullback_count", "sector_coverage_count"]) {
    data[field] = numeric(data[field]);
  }
  const columns = {
    pullbacks: ["net_amount", "turnover_pct", "price_change"],
    influence: ["net_amount", "turnover_pct"],
    sectors: ["current_amount", "previous_amount", "change_amount", "company_count"],
    performance: ["horizon", "signal_count", "sample_count", "pending_count", "excluded_count", "average_return", "median_return", "excess_return", "positive_rate"],
  };
  const nullable = new Set(["turnover_pct", "average_return", "median_return", "excess_return", "positive_rate"]);
  for (const [key, fields] of Object.entries(columns)) {
    if (!Array.isArray(data[key])) throw new Error("분석 목록이 올바르지 않습니다.");
    for (const item of data[key] as Record<string, unknown>[]) {
      for (const field of fields) item[field] = numeric(item[field], nullable.has(field));
      if (key === "performance") {
        if (![5, 20, 60].includes(item.horizon as number) || !Array.isArray(item.examples)) {
          throw new Error("성과 분석 형식이 올바르지 않습니다.");
        }
        for (const example of item.examples as Record<string, unknown>[]) {
          example.return_pct = numeric(example.return_pct);
          example.excess_return = numeric(example.excess_return);
        }
      }
    }
  }
  return data as unknown as MarketInsights;
}

export async function fetchMarketInsights(days: InsightWindow, signal: AbortSignal): Promise<MarketInsights> {
  const { data, error } = await supabase.rpc("get_dashboard_market_insights", { window_days: days }).abortSignal(signal);
  if (error) throw new Error(`수급 인사이트를 불러오지 못했습니다: ${error.message}`);
  signal.throwIfAborted();
  return normalizeInsights(data);
}
