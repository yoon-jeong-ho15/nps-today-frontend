import { FLOW_SIGNAL_KEYS, type FlowInsights, type FlowSignalKey, type FlowStock } from "~/types/flowInsights";

function stock(key: FlowSignalKey): FlowStock {
  const sell = key.includes("sell");
  const amount = sell ? -1000 : 1000;
  return {
    company_id: "005930", name: "테스트전자", sector_name: "전기·전자", net_amount: amount,
    previous_amount: key.startsWith("transition") ? -amount : amount / 2,
    change_amount: key.startsWith("transition") ? amount * 2 : amount / 2,
    buy_days: sell ? 1 : 4, sell_days: sell ? 4 : 1, dominant_day_pct: 40,
    current_rank: sell ? null : 2, previous_rank: key === "rank_enter" ? 25 : 1,
    bear_buy_days: 2, bull_sell_days: 3, today_amount: amount, history_days: 60,
    prior_avg_abs: 100, larger_than_pct: 98.333, price_change: key.startsWith("fall") ? -3 : 3,
  };
}
export function flowFixture(): FlowInsights {
  return {
    as_of: "20261029", window_days: 5, period_start: "20261023", previous_start: "20261016", previous_end: "20261022",
    company_count: 10, coverage_count: 10, history_coverage_count: 9, bear_days: 2, bull_days: 3,
    buy_count: 4, sell_count: 5, neutral_count: 1, previous_buy_count: 6, previous_sell_count: 4,
    net_amount: 100, previous_net_amount: -50, price_coverage_count: 9, flat_price_count: 5,
    focus: {
      buy_count: 1, sell_count: 1,
      buy: [{ ...stock("persistent_buy"), turnover_pct: 12, reasons: ["persistent", "size"] }],
      sell: [{ ...stock("transition_sell"), turnover_pct: -8, reasons: ["transition", "size"] }],
    },
    sector_flows: [
      { sector_name: "전기·전자", company_count: 5, buy_count: 1, sell_count: 4, current_amount: 300, previous_amount: -100, change_amount: 400 },
      { sector_name: "화학", company_count: 5, buy_count: 3, sell_count: 1, current_amount: -200, previous_amount: 50, change_amount: -250 },
    ],
    daily: [{ date: "20261029", net_amount: -100, buy_count: 4, sell_count: 5, neutral_count: 1 }],
    lists: Object.fromEntries(FLOW_SIGNAL_KEYS.map((key) => [key, [stock(key)]])),
    counts: Object.fromEntries(FLOW_SIGNAL_KEYS.map((key) => [key, 1])),
    concentration: {
      buy: { total_amount: 1000, top5_amount: 850, top5_pct: 85, company_count: 7,
        leaders: [300,200,150,100,100].map((amount,index) => ({ company_id: String(index).padStart(6,"0"), name: `매수 종목 ${index}`, net_amount: amount })) },
      sell: { total_amount: 450, top5_amount: 400, top5_pct: 400/450*100, company_count: 6,
        leaders: [100,90,80,70,60].map((amount,index) => ({ company_id: String(index+10).padStart(6,"0"), name: `매도 종목 ${index}`, net_amount: -amount })) },
    },
  };
}
