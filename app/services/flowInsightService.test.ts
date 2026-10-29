import { beforeEach, describe, expect, it, vi } from "vitest";
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn<typeof fetch>() }));
vi.mock("~/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return { supabase: createClient("https://test.supabase.co", "test-key", {
    global: { fetch: fetchMock }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) };
});
import { fetchFlowInsights, normalizeFlowInsights } from "./flowInsightService";
import { flowFixture } from "~/components/dashboard/flowInsights.fixture";
beforeEach(() => fetchMock.mockReset());

describe("additional flow insights", () => {
  it("normalizes numbers without inventing missing prices, ranks, or concentration", () => {
    const input = JSON.parse(JSON.stringify(flowFixture()));
    input.lists.rank_enter[0].previous_rank = null;
    input.lists.rank_enter[0].price_change = null;
    input.lists.rank_enter[0].net_amount = "1000";
    input.concentration = {};
    const output = normalizeFlowInsights(input);
    expect(output.lists.rank_enter?.[0].previous_rank).toBeNull();
    expect(output.lists.rank_enter?.[0].price_change).toBeNull();
    expect(output.lists.rank_enter?.[0].net_amount).toBe(1000);
    expect(output.concentration.buy).toBeUndefined();
  });
  it("supports valid empty signal groups and refuses corrupt payloads", () => {
    const data = flowFixture();
    expect(normalizeFlowInsights({ ...data, lists: {}, counts: {} }).lists.unusual).toEqual([]);
    expect(() => normalizeFlowInsights({ ...data, coverage_count: null })).toThrow();
    expect(() => normalizeFlowInsights({ ...data, lists: { unusual: null } })).toThrow();
    expect(() => normalizeFlowInsights({ ...data, concentration: { buy: { ...data.concentration.buy, top5_pct: 120 } } })).toThrow();
    expect(() => normalizeFlowInsights({ ...data, daily: [{ ...data.daily[0], net_amount: "NaN" }] })).toThrow();
    expect(() => normalizeFlowInsights({ ...data, focus: { ...data.focus, buy: [{ ...data.focus.buy[0], reasons: ["size"] }] } })).toThrow();
    expect(() => normalizeFlowInsights({ ...data, focus: { ...data.focus, buy: [{ ...data.focus.buy[0], reasons: ["size", "made_up"] }] } })).toThrow();
  });
  it("uses the requested period and propagates API failures", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ...flowFixture(), window_days: 20 })));
    await expect(fetchFlowInsights(20, new AbortController().signal)).resolves.toMatchObject({ window_days: 20 });
    expect(String(fetchMock.mock.calls[0][0])).toContain("/rpc/get_dashboard_flow_insights");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ window_days: 20 });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: "offline" }), { status: 503 }));
    await expect(fetchFlowInsights(5, new AbortController().signal)).rejects.toThrow("offline");
  });
  it("cancels stale period requests", async () => {
    const controller = new AbortController(); controller.abort();
    await expect(fetchFlowInsights(5, controller.signal)).rejects.toThrow();
  });
});
