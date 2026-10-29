import { useCallback } from "react";
import { fetchFlowInsights } from "~/services/flowInsightService";
import type { FlowInsights } from "~/types/flowInsights";
import type { InsightWindow } from "~/types/insights";
import { useAsyncData } from "./useAsyncData";

export function useFlowInsights(days: InsightWindow) {
  const load = useCallback((signal: AbortSignal) => fetchFlowInsights(days, signal), [days]);
  return useAsyncData<FlowInsights | null>(load, null);
}
