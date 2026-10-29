import type { Company, NetBuyRecord, TrendCompany } from "~/types/domain";

export function calculateStreakTrends(
  records: NetBuyRecord[],
  companies: Company[],
  dates: string[],
) {
  const names = new Map(companies.map((company) => [company.id, company.name]));
  const byCompany = new Map<string, Map<string, NetBuyRecord>>();
  for (const record of records) {
    if (!byCompany.has(record.company_id))
      byCompany.set(record.company_id, new Map());
    byCompany.get(record.company_id)!.set(record.date, record);
  }
  const buyers: TrendCompany[] = [];
  const sellers: TrendCompany[] = [];
  const targetDates = [...new Set(dates)];
  if (targetDates.length === 0) return { buyers, sellers };

  for (const [id, history] of byCompany) {
    const amounts = targetDates.map((date) => history.get(date)?.amount);
    const company = {
      id,
      name: names.get(id) || id,
      streakDays: targetDates.length,
    };
    if (amounts.every((amount) => amount !== undefined && amount > 0))
      buyers.push(company);
    if (amounts.every((amount) => amount !== undefined && amount < 0))
      sellers.push(company);
  }
  buyers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  sellers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return { buyers, sellers };
}
