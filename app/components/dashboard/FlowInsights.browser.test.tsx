import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { hook } = vi.hoisted(() => ({ hook: vi.fn() }));
vi.mock("~/hooks/useFlowInsights", () => ({ useFlowInsights: hook }));
import { FlowInsightsSection, FlowInsightCards } from "./FlowInsights";
import { flowFixture } from "./flowInsights.fixture";

let root: Root, container: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container); hook.mockReset();
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
async function press(group: string, label: string) {
  const element = [...container.querySelectorAll<HTMLButtonElement>(`[aria-label="${group}"] button`)].find((node) => node.textContent === label);
  expect(element).toBeDefined(); await act(async () => element!.click());
}

it("shows all nine cards and filters by kind without another data request", async () => {
  const changePeriod = vi.fn();
  hook.mockReturnValue({ data: flowFixture(), loading: false, error: null });
  await act(async () => root.render(<MemoryRouter><FlowInsightsSection days={5} onDaysChange={changePeriod} /></MemoryRouter>));
  expect(container.querySelectorAll(".panel")).toHaveLength(9);
  await press("추가 수급 비교 기간", "최근 20거래일");
  expect(changePeriod).toHaveBeenCalledWith(20);
  await press("추가 인사이트 종류", "방향과 강도");
  expect(container.querySelectorAll(".panel")).toHaveLength(3);
  expect(container.textContent).toContain("팔던 종목을 다시");
  expect(container.textContent).not.toContain("평소보다 유난히");
  await press("transition 분석 구분", "매도로 전환");
  const first = container.querySelector(".flow-signal-panel")!;
  expect(first.querySelector(".market-stock-values")?.textContent).toContain("−10억원");
  expect(first.querySelector("a")?.getAttribute("href")).toBe("/company/005930");
});

it("separates buy/sell concentration and changes the price-flow selection", async () => {
  await act(async () => root.render(<MemoryRouter><FlowInsightCards data={flowFixture()} category="market" /></MemoryRouter>));
  expect(container.textContent).toContain("85%");
  await press("자금 집중도 구분", "순매도 집중도");
  expect(container.textContent).toContain("88.9%");
  expect(container.textContent).toContain("매도 종목 0");
  await press("가격과 수급 조합", "주가 하락 · 순매수1종목");
  expect(container.querySelector(".flow-price-map .market-stock-values")?.textContent).toContain("−3%");
  expect(container.textContent).toContain("매일 연속으로 샀다는 뜻은 아니에요");
});

it("preserves empty and unavailable states without false zero ratios", async () => {
  const data = { ...flowFixture(), lists: {}, counts: {}, concentration: {} };
  await act(async () => root.render(<MemoryRouter><FlowInsightCards data={data} category="behavior" /></MemoryRouter>));
  expect(container.querySelectorAll(".empty-state")).toHaveLength(3);
  expect(container.textContent).not.toContain("NaN");
  expect(container.textContent).not.toContain("Infinity");
});

it("retries only the additional insight area and receives changed periods", async () => {
  hook.mockReturnValue({ data: null, loading: false, error: "unavailable" });
  await act(async () => root.render(<MemoryRouter><FlowInsightsSection days={20} /></MemoryRouter>));
  expect(hook).toHaveBeenLastCalledWith(20);
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("unavailable");
  hook.mockReturnValue({ data: flowFixture(), loading: false, error: null });
  await act(async () => container.querySelector<HTMLButtonElement>(".market-insight-error button")!.click());
  expect(container.querySelectorAll(".panel")).toHaveLength(9);
  expect(container.querySelector('[role="alert"]')).toBeNull();
});
