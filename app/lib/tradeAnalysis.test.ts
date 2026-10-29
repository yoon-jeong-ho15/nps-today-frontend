import { describe, expect, it } from "vitest";
import { calculateStreakTrends } from "./tradeAnalysis";

const dates = ["20261028", "20261027"];
const trade = (company_id: string, date: string, amount: number) => ({
  company_id,
  date,
  amount,
  quantity: 1,
});

describe("continuous trading trends", () => {
  it("requires a record for each distinct target date, even with duplicate or unordered rows", () => {
    const records = [
      trade("buy", dates[1], 10),
      trade("sell", dates[0], -5),
      trade("missing", dates[0], 1),
      trade("missing", dates[0], 1),
      trade("buy", dates[0], 20),
      trade("sell", dates[1], -10),
      trade("zero", dates[0], 0),
      trade("zero", dates[1], 10),
      trade("mixed", dates[0], 5),
      trade("mixed", dates[1], -5),
    ];
    const result = calculateStreakTrends(
      records,
      [{ id: "buy", name: "매수 기업" }],
      dates,
    );
    expect(result.buyers).toEqual([
      { id: "buy", name: "매수 기업", streakDays: 2 },
    ]);
    expect(result.sellers).toEqual([
      { id: "sell", name: "sell", streakDays: 2 },
    ]);
  });

  it("does not report streaks when there are no target dates", () => {
    expect(calculateStreakTrends([trade("buy", dates[0], 1)], [], [])).toEqual({
      buyers: [],
      sellers: [],
    });
  });
});
