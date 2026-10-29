import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RecordsTable } from "./RecordsTable";
import { useWatchlist } from "~/hooks/useWatchlist";

const records = Array.from({ length: 12 }, (_, i) => ({
  date: "20261029",
  company_id: String(i).padStart(6, "0"),
  company_name: `테스트 기업 ${i}`,
  amount: i % 2 ? -i * 100 : i * 100,
  quantity: i * 10,
}));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.removeItem("nps-watchlist");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.removeItem("nps-watchlist");
});
async function click(label: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  expect(button).not.toBeNull();
  await act(async () => button!.click());
}

describe("dashboard stock table", () => {
  it("paginates records and filters buy/sell without mixing directions", async () => {
    await act(async () =>
      root.render(
        <MemoryRouter>
          <RecordsTable records={records} />
        </MemoryRouter>,
      ),
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(10);
    await click("다음 페이지");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    const sell = [
      ...container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="거래 필터"] button',
      ),
    ].find((button) => button.textContent === "순매도");
    await act(async () => sell!.click());
    expect(container.querySelectorAll("tbody tr")).toHaveLength(6);
    expect(
      [...container.querySelectorAll("tbody .badge")].every(
        (badge) => badge.textContent === "순매도",
      ),
    ).toBe(true);
  });
  it("saves favorites and immediately shows them in the favorites filter", async () => {
    await act(async () =>
      root.render(
        <MemoryRouter>
          <RecordsTable records={records} />
        </MemoryRouter>,
      ),
    );
    await click("테스트 기업 10 관심 종목 추가");
    expect(JSON.parse(localStorage.getItem("nps-watchlist")!)).toEqual([
      "000010",
    ]);
    const favorites = [
      ...container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="거래 필터"] button',
      ),
    ].find((button) => button.textContent === "관심 종목");
    await act(async () => favorites!.click());
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(container.querySelector("tbody")?.textContent).toContain(
      "테스트 기업 10",
    );
  });
});

it("keeps favorite selections synchronized across components", async () => {
  function FavoriteProbe({ id }: { id: string }) {
    const { ids, toggle } = useWatchlist();
    return (
      <button aria-label={id} onClick={() => toggle("005930")}>
        {ids.includes("005930") ? "saved" : "empty"}
      </button>
    );
  }
  await act(async () =>
    root.render(
      <>
        <FavoriteProbe id="first" />
        <FavoriteProbe id="second" />
      </>,
    ),
  );
  await click("first");
  expect(container.querySelector('[aria-label="second"]')?.textContent).toBe(
    "saved",
  );
  await click("second");
  expect(container.querySelector('[aria-label="first"]')?.textContent).toBe(
    "empty",
  );
});
