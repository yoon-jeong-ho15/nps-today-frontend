import { supabase } from "~/lib/supabase";
import { FUND_NET_BUY_TABLE } from "../constants";
import type { NetBuyRecord } from "~/types/domain";

export async function fetchCompanyNetBuyHistory(
  companyId: string,
  limitDays: number = 30
): Promise<NetBuyRecord[]> {
  const { data, error } = await supabase
    .from(FUND_NET_BUY_TABLE)
    .select("date, company_id, quantity, amount")
    .eq("company_id", companyId)
    .order("date", { ascending: false })
    .limit(limitDays);

  if (error) {
    throw new Error(`Failed to load company transaction history: ${error.message}`);
  }

  return data || [];
}

export async function fetchDateNetBuyRecords(dateStr: string): Promise<NetBuyRecord[]> {
  const { data, error } = await supabase
    .from(FUND_NET_BUY_TABLE)
    .select("date, company_id, quantity, amount")
    .eq("date", dateStr);

  if (error) {
    throw new Error(`Failed to load transaction records for date ${dateStr}: ${error.message}`);
  }

  return data || [];
}

export async function fetchAvailableTradingDates(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_distinct_trading_dates");

  if (error) {
    throw new Error(`Failed to load trading dates: ${error.message}`);
  }

  return data ? data.map((item: { date: string }) => item.date) : [];
}

export interface VolumeTrendRecord {
  id: string;
  name: string;
  total_amount: number;
}

export async function fetchVolumeTrend(days: number = 30): Promise<VolumeTrendRecord[]> {
  const { data, error } = await supabase.rpc("get_volume_trend", {
    days_count: days,
  });

  if (error) {
    throw new Error(`Failed to load volume trend: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    total_amount: Number(item.total_amount),
  }));
}

export async function fetchRecordsByDates(dates: string[]): Promise<NetBuyRecord[]> {
  if (!dates || dates.length === 0) return [];

  const allRecords: NetBuyRecord[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(FUND_NET_BUY_TABLE)
      .select("date, company_id, quantity, amount")
      .in("date", dates)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to load transaction records for selected dates: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    allRecords.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRecords;
}

export async function fetchDailyTotalAmounts(): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  
  const { count, error: countError } = await supabase
    .from(FUND_NET_BUY_TABLE)
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to count records: ${countError.message}`);
  }

  const totalCount = count || 0;
  const limit = 1000;
  const promises = [];

  for (let offset = 0; offset < totalCount; offset += limit) {
    promises.push(
      supabase
        .from(FUND_NET_BUY_TABLE)
        .select('date, amount')
        .range(offset, offset + limit - 1)
    );
  }

  const results = await Promise.all(promises);

  results.forEach(({ data, error }) => {
    if (error) {
      console.error("Error fetching chunk:", error);
      return;
    }
    if (data) {
      data.forEach(row => {
        if (!totals[row.date]) totals[row.date] = 0;
        totals[row.date] += row.amount;
      });
    }
  });

  return totals;
}
