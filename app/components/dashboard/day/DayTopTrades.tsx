import { useMemo } from "react";
import { Link } from "react-router";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { formatAmount, formatQuantity } from "~/lib/format";

import type { RecordWithCompany } from "~/types/domain";

interface DayTopTradesProps {
  selectedRecords: RecordWithCompany[];
}

export function DayTopTrades({ selectedRecords }: DayTopTradesProps) {
  const { topBuys, topSells } = useMemo(() => {
    // Sort all records by amount descending
    const sorted = [...selectedRecords].sort((a, b) => b.amount - a.amount);
    
    // Top 10 Buys (Positive amount, sorted desc)
    const buys = sorted.filter(r => r.amount > 0).slice(0, 10);
    
    // Top 10 Sells (Negative amount, sorted asc i.e., largest negative first)
    const sells = [...selectedRecords]
      .filter(r => r.amount < 0)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 10);

    return { topBuys: buys, topSells: sells };
  }, [selectedRecords]);

  if (topBuys.length === 0 && topSells.length === 0) {
    return null;
  }

  const renderList = (items: RecordWithCompany[], type: "buy" | "sell") => (
    <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-md transition-colors">
      <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${type === 'buy' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
        {type === 'buy' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        {type === 'buy' ? '순매수 Top 10' : '순매도 Top 10'}
      </h3>
      <div className="space-y-1">
        {items.length > 0 ? items.map((item, idx) => (
          <div key={item.company_id} className="flex items-center justify-between group hover:bg-muted/50 p-2 px-3 -mx-3 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-mono text-sm w-5">{idx + 1}</span>
              <Link to={`/company/${item.company_id}`} className="font-bold hover:underline hover:text-primary flex items-center gap-1">
                {item.company_name}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
            <div className="text-right">
              <div className={`font-bold font-mono text-sm ${type === 'buy' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {formatAmount(item.amount)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatQuantity(item.quantity)}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-sm text-muted-foreground text-center py-8">해당 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {renderList(topBuys, "buy")}
      {renderList(topSells, "sell")}
    </div>
  );
}
