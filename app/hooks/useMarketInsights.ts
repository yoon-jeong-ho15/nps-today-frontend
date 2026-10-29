import { useCallback } from "react";
import { fetchMarketInsights } from "~/services/insightService";
import type { InsightWindow, MarketInsights } from "~/types/insights";
import { useAsyncData } from "./useAsyncData";

export function useMarketInsights(days: InsightWindow) {
  const load = useCallback((signal: AbortSignal) => fetchMarketInsights(days, signal), [days]);
  return useAsyncData<MarketInsights | null>(load, null);
}
