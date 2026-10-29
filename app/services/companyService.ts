import { supabase } from "~/lib/supabase";
import { COMPANY_LIST_TABLE } from "~/constants";
import type { Company } from "~/types/domain";
import { forEachPage } from "./pagination";

let companyListRequest: Promise<Company[]> | undefined;

async function loadCompanyList(): Promise<Company[]> {
  const companies: Company[] = [];
  await forEachPage<Company>(
    (from, to) =>
      supabase.from(COMPANY_LIST_TABLE).select("*").order("id").range(from, to),
    (rows) => companies.push(...rows),
    "기업 목록을 불러오지 못했습니다",
  );
  return companies;
}

// Concurrent consumers share the request; one unmount must not cancel it for others.
export function fetchCompanyList(): Promise<Company[]> {
  companyListRequest ??= loadCompanyList().finally(() => {
    companyListRequest = undefined;
  });
  return companyListRequest;
}

export async function fetchCompanyInfo(
  companyId: string,
  signal = new AbortController().signal,
): Promise<Company | null> {
  const { data, error } = await supabase
    .from(COMPANY_LIST_TABLE)
    .select("*")
    .eq("id", companyId)
    .abortSignal(signal)
    .maybeSingle();
  if (error)
    throw new Error(`기업 정보를 불러오지 못했습니다: ${error.message}`);
  return data;
}
