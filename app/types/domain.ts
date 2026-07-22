export interface Company {
  id: string;
  name: string;
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
