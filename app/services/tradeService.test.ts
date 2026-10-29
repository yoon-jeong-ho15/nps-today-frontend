import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn<typeof fetch>() }));
vi.mock("~/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://test.supabase.co", "test-key", {
      global: { fetch: fetchMock },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  };
});

import { fetchDailyTotalAmounts, fetchRecordsByDates } from "./tradeService";
import { fetchCompanyList } from "./companyService";

beforeEach(() => fetchMock.mockReset());
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });

describe("trade service", () => {
  it("sums numeric strings across pages and uses a stable composite order", async () => {
    fetchMock
      .mockResolvedValueOnce(
        response(
          Array.from({ length: 1000 }, () => ({
            date: "20261029",
            amount: "10",
          })),
        ),
      )
      .mockResolvedValueOnce(
        response([
          { date: "20261029", amount: -20 },
          { date: "20261028", amount: null },
        ]),
      );
    await expect(fetchDailyTotalAmounts()).resolves.toEqual({
      "20261029": 9980,
      "20261028": 0,
    });
    const urls = fetchMock.mock.calls.map(([url]) => new URL(String(url)));
    expect(urls.map((url) => url.searchParams.get("offset"))).toEqual([
      "0",
      "1000",
    ]);
    expect(
      urls.every(
        (url) => url.searchParams.get("order") === "date.desc,company_id.asc",
      ),
    ).toBe(true);
  });

  it("rejects a failed page instead of presenting incomplete totals", async () => {
    fetchMock
      .mockResolvedValueOnce(
        response(
          Array.from({ length: 1000 }, () => ({ date: "20261029", amount: 1 })),
        ),
      )
      .mockResolvedValueOnce(
        response({ message: "database unavailable" }, 400),
      );
    await expect(fetchDailyTotalAmounts()).rejects.toThrow(
      "database unavailable",
    );
  });

  it("rejects invalid amounts instead of returning NaN", async () => {
    fetchMock.mockResolvedValueOnce(
      response([{ date: "20261029", amount: "invalid" }]),
    );
    await expect(fetchDailyTotalAmounts()).rejects.toThrow(
      "일별 거래 금액이 올바르지 않습니다.",
    );
  });

  it("avoids a query for an empty date selection", async () => {
    await expect(fetchRecordsByDates([])).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("company list requests", () => {
  it("shares concurrent requests and reloads after completion", async () => {
    fetchMock.mockImplementation(async () =>
      response([{ id: "005930", name: "삼성전자" }]),
    );
    const first = fetchCompanyList();
    const second = fetchCompanyList();
    expect(first).toBe(second);
    await Promise.all([first, second]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await fetchCompanyList();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed request", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ message: "failed" }, 400))
      .mockResolvedValueOnce(response([]));
    await expect(fetchCompanyList()).rejects.toThrow("failed");
    await expect(fetchCompanyList()).resolves.toEqual([]);
  });
});
