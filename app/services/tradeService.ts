import { supabase } from "~/lib/supabase";
import { FUND_NET_BUY_TABLE } from "~/constants";
import type { NetBuyRecord, VolumeTrendRecord } from "~/types/domain";
import { forEachPage } from "./pagination";

const TRADE_COLUMNS = "date, company_id, quantity, amount";

function normalizeRecord(record: NetBuyRecord): NetBuyRecord {
  const quantity = Number(record.quantity ?? 0);
  const amount = Number(record.amount ?? 0);
  if (!Number.isFinite(quantity) || !Number.isFinite(amount)) {
    throw new Error("거래 데이터에 유효하지 않은 숫자가 포함되어 있습니다.");
  }
  return { ...record, quantity, amount };
}

export async function fetchCompanyNetBuyHistory(
  companyId: string,
  limitDays: number = 30,
  signal = new AbortController().signal,
): Promise<NetBuyRecord[]> {
  const { data, error } = await supabase
    .from(FUND_NET_BUY_TABLE)
    .select(TRADE_COLUMNS)
    .eq("company_id", companyId)
    .order("date", { ascending: false })
    .limit(limitDays)
    .abortSignal(signal);
  if (error)
    throw new Error(`기업 거래 내역을 불러오지 못했습니다: ${error.message}`);
  return (data || []).map(normalizeRecord);
}

export async function fetchDateNetBuyRecords(
  date: string,
  signal = new AbortController().signal,
): Promise<NetBuyRecord[]> {
  const records: NetBuyRecord[] = [];
  await forEachPage<NetBuyRecord>(
    (from, to) =>
      supabase
        .from(FUND_NET_BUY_TABLE)
        .select(TRADE_COLUMNS)
        .eq("date", date)
        .order("company_id")
        .range(from, to)
        .abortSignal(signal),
    (rows) => records.push(...rows.map(normalizeRecord)),
    "일별 거래 내역을 불러오지 못했습니다",
    signal,
  );
  return records;
}

export async function fetchAvailableTradingDates(
  signal = new AbortController().signal,
): Promise<string[]> {
  const { data, error } = await supabase
    .rpc("get_distinct_trading_dates")
    .abortSignal(signal);
  if (error)
    throw new Error(`거래일 목록을 불러오지 못했습니다: ${error.message}`);
  return data ? data.map((item: { date: string }) => item.date) : [];
}

export async function fetchVolumeTrend(
  days: number = 30,
  signal = new AbortController().signal,
): Promise<VolumeTrendRecord[]> {
  const { data, error } = await supabase
    .rpc("get_volume_trend", { days_count: days })
    .abortSignal(signal);
  if (error)
    throw new Error(`누적 거래 동향을 불러오지 못했습니다: ${error.message}`);
  return (data || []).map((item: VolumeTrendRecord) => {
    const total_amount = Number(item.total_amount ?? 0);
    if (!Number.isFinite(total_amount))
      throw new Error("누적 거래 금액이 올바르지 않습니다.");
    return { ...item, total_amount };
  });
}

export async function fetchRecordsByDates(
  dates: string[],
  signal = new AbortController().signal,
): Promise<NetBuyRecord[]> {
  if (dates.length === 0) return [];
  const records: NetBuyRecord[] = [];
  await forEachPage<NetBuyRecord>(
    (from, to) =>
      supabase
        .from(FUND_NET_BUY_TABLE)
        .select(TRADE_COLUMNS)
        .in("date", dates)
        .order("date", { ascending: false })
        .order("company_id")
        .range(from, to)
        .abortSignal(signal),
    (rows) => records.push(...rows.map(normalizeRecord)),
    "선택한 거래일의 내역을 불러오지 못했습니다",
    signal,
  );
  return records;
}

export async function fetchDailyTotalAmounts(
  signal = new AbortController().signal,
): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  // Consume one page at a time instead of retaining every trade or launching all requests at once.
  await forEachPage<Pick<NetBuyRecord, "date" | "amount">>(
    (from, to) =>
      supabase
        .from(FUND_NET_BUY_TABLE)
        .select("date, amount")
        .order("date", { ascending: false })
        .order("company_id")
        .range(from, to)
        .abortSignal(signal),
    (rows) => {
      for (const row of rows) {
        const amount = Number(row.amount ?? 0);
        if (!Number.isFinite(amount))
          throw new Error("일별 거래 금액이 올바르지 않습니다.");
        totals[row.date] = (totals[row.date] ?? 0) + amount;
      }
    },
    "일별 합계를 불러오지 못했습니다",
    signal,
  );
  return totals;
}
