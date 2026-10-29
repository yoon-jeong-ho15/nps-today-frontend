import { afterEach, expect, it, vi } from "vitest";
import { formatDateWithWeekday, getTodayDate } from "./format";

afterEach(() => vi.useRealTimers());

it("uses the Korean trading date across the UTC date boundary", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T16:00:00Z"));
  expect(getTodayDate()).toBe("20261029");
});

it("formats a weekday independently of the machine timezone", () => {
  expect(formatDateWithWeekday("20261029")).toBe("2026년 10월 29일 (목요일)");
});
