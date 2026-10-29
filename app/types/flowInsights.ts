import type { InsightWindow } from "./insights";

export const FLOW_SIGNAL_KEYS = [
  "transition_buy", "transition_sell", "buy_faster", "buy_slower", "sell_faster", "sell_slower",
  "persistent_buy", "persistent_sell", "contrary_buy", "contrary_sell", "rank_enter", "rank_exit",
  "unusual", "rise_buy", "rise_sell", "fall_buy", "fall_sell",
] as const;
export type FlowSignalKey = typeof FLOW_SIGNAL_KEYS[number];
export type FlowCategory = "all" | "direction" | "behavior" | "market";
export interface FlowStock {
  company_id: string; name: string; sector_name: string;
  net_amount: number; previous_amount: number; change_amount: number;
  buy_days: number; sell_days: number; dominant_day_pct: number | null;
  current_rank: number | null; previous_rank: number | null; price_change: number | null;
  bear_buy_days: number; bull_sell_days: number;
  today_amount: number; history_days: number; prior_avg_abs: number; larger_than_pct: number;
}
export const FOCUS_REASONS = ["transition", "persistent", "unusual", "size"] as const;
export type FocusReason = typeof FOCUS_REASONS[number];
export interface FocusStock extends FlowStock {
  turnover_pct: number | null;
  reasons: FocusReason[];
}
export interface SectorBriefing {
  sector_name: string; company_count: number; buy_count: number; sell_count: number;
  current_amount: number; previous_amount: number; change_amount: number;
}
export interface Concentration {
  total_amount: number; top5_amount: number; top5_pct: number;
  company_count: number;
  leaders: { company_id: string; name: string; net_amount: number }[];
}
export interface FlowInsights {
  as_of: string | null; window_days: InsightWindow; period_start: string | null;
  previous_start: string | null; previous_end: string | null;
  company_count: number; coverage_count: number; history_coverage_count: number;
  bear_days: number; bull_days: number; buy_count: number; sell_count: number; neutral_count: number;
  previous_buy_count: number; previous_sell_count: number; net_amount: number | null;
  previous_net_amount: number | null;
  focus: { buy: FocusStock[]; sell: FocusStock[]; buy_count: number; sell_count: number };
  sector_flows: SectorBriefing[];
  price_coverage_count: number; flat_price_count: number;
  daily: { date: string; net_amount: number; buy_count: number; sell_count: number; neutral_count: number }[];
  lists: Partial<Record<FlowSignalKey, FlowStock[]>>;
  counts: Partial<Record<FlowSignalKey, number>>;
  concentration: { buy?: Concentration; sell?: Concentration };
}
