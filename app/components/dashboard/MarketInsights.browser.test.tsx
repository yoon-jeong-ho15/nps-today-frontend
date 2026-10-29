import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
const { hook, flowHook } = vi.hoisted(() => ({ hook: vi.fn(), flowHook: vi.fn() }));
vi.mock("~/hooks/useMarketInsights", () => ({ useMarketInsights: hook }));
vi.mock("~/hooks/useFlowInsights", () => ({ useFlowInsights: flowHook }));
import { MarketInsightCards, MarketInsightsSection } from "./MarketInsights";
import { insightFixture } from "./marketInsights.fixture";
import { flowFixture } from "./flowInsights.fixture";
import type { ReturnHorizon } from "~/types/insights";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container); hook.mockReset(); flowHook.mockReset();
  flowHook.mockReturnValue({ data: flowFixture(), loading: false, error: null });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

it("keeps evidence and past results collapsed until requested", async () => {
  hook.mockReturnValue({ data: insightFixture(), loading: false, error: null });
  await act(async () => root.render(<MemoryRouter><MarketInsightsSection /></MemoryRouter>));
  expect(container.querySelectorAll(".dashboard-briefing .panel")).toHaveLength(3);
  expect(container.querySelector(".market-performance-hero")).toBeNull();
  expect(container.querySelector(".flow-insights-grid")).toBeNull();
  const details = container.querySelectorAll<HTMLDetailsElement>(".briefing-disclosure");
  await act(async () => { details[0].open = true; details[0].dispatchEvent(new Event("toggle")); });
  expect(container.querySelector(".market-performance-hero")?.textContent).toContain("−2.5%");
  expect(container.querySelector(".flow-insights-grid")).toBeNull();
  await act(async () => { details[1].open = true; details[1].dispatchEvent(new Event("toggle")); });
  expect(container.querySelector(".flow-insights-grid")).not.toBeNull();
  expect(container.textContent).toContain("주가가 내리는데도 계속 사고 있나?");
});

it("changes the return horizon and expands all sectors with working company links", async () => {
  function Probe() {
    const [horizon, setHorizon] = useState<ReturnHorizon>(20);
    return <MarketInsightCards data={insightFixture()} horizon={horizon} onHorizonChange={setHorizon} />;
  }
  await act(async () => root.render(<MemoryRouter><Probe /></MemoryRouter>));
  expect(container.querySelectorAll(".market-sector")).toHaveLength(6);
  expect(container.querySelector(".market-performance-hero")?.textContent).toContain("−2.5%");
  const button = container.querySelector<HTMLButtonElement>('[aria-label="패턴 이후 관찰 기간"] button');
  await act(async () => button!.click());
  expect(container.querySelector(".market-performance-hero")?.textContent).toContain("+1.25%");
  expect(button?.getAttribute("aria-pressed")).toBe("true");
  await act(async () => container.querySelector<HTMLButtonElement>(".market-show-sectors")!.click());
  expect(container.querySelectorAll(".market-sector")).toHaveLength(7);
  expect(container.querySelector(".market-show-sectors")?.getAttribute("aria-expanded")).toBe("true");
  expect(container.querySelector(".market-stock-identity")?.getAttribute("href")).toBe("/company/005930");
  expect(container.textContent).toContain("−2%");
});

it("shows pending observations as unavailable, not a fabricated zero return", async () => {
  const data = insightFixture();
  data.performance = data.performance.map((row) => ({ ...row, sample_count: 0, average_return: null, median_return: null, excess_return: null, positive_rate: null, examples: [] }));
  await act(async () => root.render(<MemoryRouter><MarketInsightCards data={data} horizon={20} onHorizonChange={() => {}} /></MemoryRouter>));
  expect(container.textContent).toContain("아직 관찰이 끝난 사례가 없습니다");
  expect(container.querySelector(".market-performance-hero")).toBeNull();
  expect(container.textContent).toContain("관찰 중 3건");
});

it("switches the analysis period, displays a lagging data date, and retries errors", async () => {
  hook.mockReturnValue({ data: { ...insightFixture(), flow_latest: "20261030" }, loading: false, error: null });
  await act(async () => root.render(<MemoryRouter><MarketInsightsSection /></MemoryRouter>));
  expect(container.querySelector(".market-data-lag")?.textContent).toContain("2026.10.30");
  const period = container.querySelectorAll<HTMLButtonElement>('[aria-label="인사이트 분석 기간"] button')[1];
  await act(async () => period.click());
  expect(hook).toHaveBeenLastCalledWith(20);
  hook.mockReturnValue({ data: null, loading: false, error: "network down" });
  flowHook.mockReturnValue({ data: null, loading: false, error: "network down" });
  await act(async () => root.render(<MemoryRouter><MarketInsightsSection /></MemoryRouter>));
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("network down");
  hook.mockReturnValue({ data: null, loading: true, error: null });
  flowHook.mockReturnValue({ data: null, loading: true, error: null });
  await act(async () => container.querySelector<HTMLButtonElement>(".market-insight-error button")!.click());
  expect(container.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe("수급 인사이트를 분석하는 중");
});
