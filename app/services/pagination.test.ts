import { describe, expect, it, vi } from "vitest";
import { forEachPage, PAGE_SIZE } from "./pagination";

describe("pagination", () => {
  it("visits every page, including a final empty page at an exact boundary", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ data: Array(PAGE_SIZE).fill(1), error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    let count = 0;
    await forEachPage<number>(
      fetch,
      (rows) => {
        count += rows.length;
      },
      "load failed",
    );
    expect(count).toBe(PAGE_SIZE);
    expect(fetch.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it("rejects a later page failure instead of returning a partial result", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ data: Array(PAGE_SIZE).fill(1), error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "offline" } });
    await expect(forEachPage(fetch, () => {}, "load failed")).rejects.toThrow(
      "load failed: offline",
    );
  });

  it("stops before consuming a response or fetching another page after cancellation", async () => {
    const controller = new AbortController();
    const consume = vi.fn();
    const fetch = vi.fn(async () => {
      controller.abort();
      return { data: Array(PAGE_SIZE).fill(1), error: null };
    });
    await expect(
      forEachPage(fetch, consume, "load failed", controller.signal),
    ).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consume).not.toHaveBeenCalled();
  });
});
