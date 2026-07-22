import { supabase } from "~/lib/supabase";
import { COMPANY_LIST_TABLE } from "../../constants";
import type { Company } from "~/types/domain";

export async function fetchCompanyList(): Promise<Company[]> {
  const { data, error } = await supabase
    .from(COMPANY_LIST_TABLE)
    .select("id, name");

  if (error) {
    throw new Error(`Failed to load company list: ${error.message}`);
  }

  return data || [];
}

export async function fetchCompanyInfo(companyId: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from(COMPANY_LIST_TABLE)
    .select("id, name")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load company details: ${error.message}`);
  }

  return data;
}
