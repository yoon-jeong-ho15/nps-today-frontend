import { afterEach, expect, it, vi } from "vitest";
import {
  formatCompactAmount,
  formatDateWithWeekday,
  getTodayDate,
  shortDate,
} from "./format";

afterEach(() => vi.useRealTimers());

it("uses the Korean trading date across the UTC date boundary", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T16:00:00Z"));
  expect(getTodayDate()).toBe("20261029");
});

it("formats a weekday independently of the machine timezone", () => {
  expect(formatDateWithWeekday("20261029")).toBe("2026년 10월 29일 (목요일)");
});

it("converts stored million-won amounts without changing their scale", () => {
  expect(formatCompactAmount(1234)).toBe("+12.3억원");
  expect(formatCompactAmount(-1234)).toBe("−12.3억원");
  expect(formatCompactAmount(1_250_000)).toBe("+1.3조원");
  expect(formatCompactAmount(25)).toBe("+25백만원");
  expect(formatCompactAmount(0)).toBe("0백만원");
  expect(formatCompactAmount(1234, false)).toBe("12.3억원");
  expect(shortDate("20261029")).toBe("2026.10.29");
});
