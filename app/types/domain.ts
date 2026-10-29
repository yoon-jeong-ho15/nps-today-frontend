export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  logoUrl?: string;
}

export interface NetBuyRecord {
  date: string;
  company_id: string;
  quantity: number;
  amount: number;
}

export interface RecordWithCompany extends NetBuyRecord {
  company_name: string;
}

export interface TrendCompany extends Company {
  streakDays: number;
}

export interface VolumeTrendCompany extends Company {
  totalAmount: number;
}

export interface VolumeTrendRecord {
  id: string;
  name: string;
  total_amount: number;
}

export interface DayDashboardMetrics {
  totalBuyAmount: number;
  totalSellAmount: number;
  netAmount: number;
  buyCount: number;
  sellCount: number;
}

export interface CompanyDashboardMetrics {
  totalAmount: number;
  totalQuantity: number;
  buyDays: number;
  sellDays: number;
  buyRatio: number;
  avgAmount: number;
  totalDays: number;
}
