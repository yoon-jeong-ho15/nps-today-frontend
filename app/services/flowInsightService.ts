import { supabase } from "~/lib/supabase";
import { FLOW_SIGNAL_KEYS, FOCUS_REASONS, type FlowInsights, type FlowStock } from "~/types/flowInsights";
import type { InsightWindow } from "~/types/insights";

function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("수급 변화 데이터 형식이 올바르지 않습니다.");
  return input as Record<string, unknown>;
}
function num(input: unknown, nullable = false): number | null {
  if (nullable && input === null) return null;
  if ((typeof input !== "number" && typeof input !== "string") || input === "" || !Number.isFinite(Number(input))) {
    throw new Error("수급 변화 데이터의 숫자가 올바르지 않습니다.");
  }
  return Number(input);
}
function array(input: unknown): unknown[] {
  if (!Array.isArray(input)) throw new Error("수급 변화 목록이 올바르지 않습니다.");
  return input;
}
function text(input: unknown): string {
  if (typeof input !== "string") throw new Error("수급 변화 데이터의 이름이 올바르지 않습니다.");
  return input.trim();
}
function date(input: unknown, nullable = true): string | null {
  if (input === null && nullable) return null;
  if (typeof input !== "string" || !/^\d{8}$/.test(input)) throw new Error("수급 변화 기준일이 올바르지 않습니다.");
  return input;
}
function normalizeStock(input: unknown): FlowStock {
  const row = { ...object(input) };
  for (const key of ["company_id", "name", "sector_name"]) row[key] = text(row[key]);
  for (const key of ["net_amount", "previous_amount", "change_amount", "buy_days", "sell_days", "bear_buy_days", "bull_sell_days", "today_amount", "history_days", "prior_avg_abs", "larger_than_pct"]) row[key] = num(row[key]);
  for (const key of ["dominant_day_pct", "current_rank", "previous_rank", "price_change"]) row[key] = num(row[key], true);
  return row as unknown as FlowStock;
}
export function normalizeFlowInsights(input: unknown): FlowInsights {
  const data = { ...object(input) };
  if (data.window_days !== 5 && data.window_days !== 20) throw new Error("수급 변화 분석 기간이 올바르지 않습니다.");
  for (const key of ["as_of", "period_start", "previous_start", "previous_end"]) data[key] = date(data[key]);
  for (const key of ["company_count", "coverage_count", "history_coverage_count", "bear_days", "bull_days", "buy_count", "sell_count", "neutral_count", "previous_buy_count", "previous_sell_count", "price_coverage_count", "flat_price_count"]) {
    const value = num(data[key])!;
    if (!Number.isInteger(value) || value < 0) throw new Error("수급 변화 집계 건수가 올바르지 않습니다.");
    data[key] = value;
  }
  data.net_amount = num(data.net_amount, true);
  data.previous_net_amount = num(data.previous_net_amount, true);
  const focus = object(data.focus);
  data.focus = {
    buy_count: num(focus.buy_count), sell_count: num(focus.sell_count),
    ...Object.fromEntries((["buy", "sell"] as const).map((side) => [side, array(focus[side]).map((input) => {
      const row = object(input);
      const reasons = array(row.reasons);
      if (reasons.length < 2 || new Set(reasons).size !== reasons.length || reasons.some((reason) => !FOCUS_REASONS.includes(reason as typeof FOCUS_REASONS[number]))) throw new Error("주목할 종목의 선정 근거가 올바르지 않습니다.");
      return { ...normalizeStock(row), turnover_pct: num(row.turnover_pct, true), reasons };
    })])),
  };
  data.sector_flows = array(data.sector_flows).map((input) => {
    const row: Record<string, unknown> = { ...object(input), sector_name: text(object(input).sector_name) };
    for (const key of ["company_count", "buy_count", "sell_count", "current_amount", "previous_amount", "change_amount"]) row[key] = num(row[key]);
    return row;
  });
  const lists = object(data.lists), counts = object(data.counts);
  data.lists = Object.fromEntries(FLOW_SIGNAL_KEYS.map((key) => [key, key in lists ? array(lists[key]).map(normalizeStock) : []]));
  data.counts = Object.fromEntries(FLOW_SIGNAL_KEYS.map((key) => [key, key in counts ? num(counts[key]) : 0]));
  data.daily = array(data.daily).map((input) => {
    const row = { ...object(input) }; row.date = date(row.date, false);
    for (const key of ["net_amount", "buy_count", "sell_count", "neutral_count"]) row[key] = num(row[key]);
    return row;
  });
  const concentration = object(data.concentration);
  data.concentration = Object.fromEntries((["buy", "sell"] as const).filter((side) => side in concentration).map((side) => {
    const row = { ...object(concentration[side]) };
    for (const key of ["total_amount", "top5_amount", "top5_pct", "company_count"]) row[key] = num(row[key]);
    if (Number(row.top5_pct) < 0 || Number(row.top5_pct) > 100) throw new Error("자금 집중도 비율이 올바르지 않습니다.");
    row.leaders = array(row.leaders).map((input) => { const leader = object(input); return { company_id: text(leader.company_id), name: text(leader.name), net_amount: num(leader.net_amount) }; });
    return [side, row];
  }));
  return data as unknown as FlowInsights;
}
export async function fetchFlowInsights(days: InsightWindow, signal: AbortSignal): Promise<FlowInsights> {
  const { data, error } = await supabase.rpc("get_dashboard_flow_insights", { window_days: days }).abortSignal(signal);
  if (error) throw new Error(`추가 수급 분석을 불러오지 못했습니다: ${error.message}`);
  signal.throwIfAborted();
  return normalizeFlowInsights(data);
}
