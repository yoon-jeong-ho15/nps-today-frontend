import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { beforeEach, afterEach, expect, it } from "vitest";
import { DashboardBriefing, overallHeadline } from "./DashboardBriefing";
import { flowFixture } from "./flowInsights.fixture";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

it("explains conflicting money and breadth without turning them into a buy recommendation", () => {
  const data = flowFixture();
  expect(overallHeadline(data)).toBe("합계는 순매수, 더 많은 종목은 순매도");
  expect(overallHeadline({ ...data, net_amount: -100, buy_count: 7, sell_count: 3 })).toContain("합계는 순매도, 더 많은 종목은 순매수");
  expect(overallHeadline({ ...data, net_amount: 0 })).toContain("같아요");
  expect(overallHeadline({ ...data, net_amount: null })).toContain("부족해요");
});

it("shows three core sections and switches to sell evidence with genuine missing values", async () => {
  const data = flowFixture(); data.focus.sell[0].price_change = null; data.focus.sell[0].turnover_pct = null;
  await act(async () => root.render(<MemoryRouter><DashboardBriefing data={data} /></MemoryRouter>));
  expect(container.querySelectorAll(".panel")).toHaveLength(3);
  expect(container.querySelector(".briefing-overview h3")?.textContent).toContain("더 많은 종목은 순매도");
  expect(container.querySelector(".briefing-stock-reason")?.textContent).toContain("5일 중 4일 순매수");
  expect(container.querySelector(".briefing-stock a")?.getAttribute("href")).toBe("/company/005930");
  await act(async () => container.querySelectorAll<HTMLButtonElement>('[aria-label="주목할 종목 방향"] button')[1].click());
  expect(container.querySelector(".briefing-stock-reason")?.textContent).toContain("순매도로 전환");
  expect(container.querySelector(".briefing-stock-metrics")?.textContent).toContain("순매도한 날");
  expect(container.querySelectorAll(".briefing-stock-metrics dd")[1].textContent).toBe("—");
  expect(container.querySelectorAll(".briefing-stock-metrics dd")[3].textContent).toBe("—");
});

it("distinguishes a reduction in selling from net buying and counts sector participation", async () => {
  const data = flowFixture();
  data.sector_flows[0] = { ...data.sector_flows[0], current_amount: -200, previous_amount: -500, change_amount: 300 };
  await act(async () => root.render(<MemoryRouter><DashboardBriefing data={data} /></MemoryRouter>));
  const sector = container.querySelector(".briefing-sector")!;
  expect(sector.textContent).toContain("순매도 축소");
  expect(sector.textContent).toContain("순매수 1/5종목");
  expect(sector.textContent).not.toContain("순매수로 전환");
});

it("starts with three stocks and supports expanded and empty selections", async () => {
  const data = flowFixture();
  data.focus.buy = Array.from({ length: 5 }, (_, index) => ({ ...data.focus.buy[0], company_id: String(index) }));
  data.focus.sell = []; data.focus.sell_count = 0;
  await act(async () => root.render(<MemoryRouter><DashboardBriefing data={data} /></MemoryRouter>));
  expect(container.querySelectorAll(".briefing-stock")).toHaveLength(3);
  await act(async () => container.querySelector<HTMLButtonElement>(".briefing-more-stocks")!.click());
  expect(container.querySelectorAll(".briefing-stock")).toHaveLength(5);
  await act(async () => container.querySelectorAll<HTMLButtonElement>('[aria-label="주목할 종목 방향"] button')[1].click());
  expect(container.textContent).toContain("여러 근거가 겹치는 종목이 없습니다");
});
