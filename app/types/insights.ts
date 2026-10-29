export type InsightWindow = 5 | 20;
export type ReturnHorizon = 5 | 20 | 60;

export interface InsightStock {
  company_id: string;
  name: string;
  sector_name: string;
  net_amount: number;
  turnover_pct: number | null;
}
export interface PullbackStock extends InsightStock {
  price_change: number;
}
export interface SectorFlow {
  sector_name: string;
  current_amount: number;
  previous_amount: number;
  change_amount: number;
  company_count: number;
}
export interface ReturnExample {
  company_id: string;
  name: string;
  signal_date: string;
  entry_date: string;
  exit_date: string;
  return_pct: number;
  excess_return: number;
}
export interface PatternPerformance {
  horizon: ReturnHorizon;
  signal_count: number;
  sample_count: number;
  pending_count: number;
  excluded_count: number;
  average_return: number | null;
  median_return: number | null;
  excess_return: number | null;
  positive_rate: number | null;
  examples: ReturnExample[];
}
export interface MarketInsights {
  as_of: string | null;
  flow_latest: string | null;
  window_days: InsightWindow;
  period_start: string | null;
  previous_start: string | null;
  previous_end: string | null;
  history_start: string | null;
  classification_as_of: string | null;
  company_count: number;
  coverage_count: number;
  pullback_count: number;
  sector_coverage_count: number;
  pullbacks: PullbackStock[];
  influence: InsightStock[];
  sectors: SectorFlow[];
  performance: PatternPerformance[];
}
