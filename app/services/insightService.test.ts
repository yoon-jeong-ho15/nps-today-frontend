import { describe, it, expect, vi, beforeEach } from "vitest";
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn<typeof fetch>() }));
vi.mock("~/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return { supabase: createClient("https://test.supabase.co", "test-key", {
    global: { fetch: fetchMock }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) };
});
import { fetchMarketInsights, normalizeInsights } from "./insightService";
import { insightFixture } from "~/components/dashboard/marketInsights.fixture";

beforeEach(() => fetchMock.mockReset());

describe("market insight data", () => {
  it("converts numeric strings while preserving unavailable returns", () => {
    const data = insightFixture();
    const input = JSON.parse(JSON.stringify(data));
    input.pullbacks[0].net_amount = "1000";
    input.performance[0].average_return = null;
    input.performance[0].examples[0].return_pct = "3.2";
    const normalized = normalizeInsights(input);
    expect(normalized.pullbacks[0].net_amount).toBe(1000);
    expect(normalized.performance[0].average_return).toBeNull();
    expect(normalized.performance[0].examples[0].return_pct).toBe(3.2);
  });
  it("rejects missing or invalid amounts instead of displaying zero", () => {
    const data = insightFixture();
    expect(() => normalizeInsights(null)).toThrow();
    expect(() => normalizeInsights({ ...data, coverage_count: undefined })).toThrow();
    expect(() => normalizeInsights({ ...data, influence: [{ ...data.influence[0], turnover_pct: "NaN" }] })).toThrow();
    expect(() => normalizeInsights({ ...data, performance: null })).toThrow();
  });
  it("requests the selected period with one compact RPC", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ...insightFixture(), window_days: 20 })));
    const result = await fetchMarketInsights(20, new AbortController().signal);
    expect(result.window_days).toBe(20);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/rpc/get_dashboard_market_insights");
    expect(JSON.parse(String(init?.body))).toEqual({ window_days: 20 });
  });
  it("surfaces RPC failure and respects cancellation", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: "unavailable" }), { status: 503 }));
    await expect(fetchMarketInsights(5, new AbortController().signal)).rejects.toThrow("unavailable");
    const controller = new AbortController();
    controller.abort();
    await expect(fetchMarketInsights(5, controller.signal)).rejects.toThrow();
  });
});
