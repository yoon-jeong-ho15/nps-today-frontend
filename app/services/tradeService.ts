import { supabase } from "~/lib/supabase";
import { FUND_NET_BUY_TABLE } from "../../constants";
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
