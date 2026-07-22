import { History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatDate, formatAmount, formatQuantity } from "~/lib/format";

import type { NetBuyRecord } from "~/types/domain";

interface CompanyHistoryTableProps {
  data: NetBuyRecord[];
}

export function CompanyHistoryTable({ data }: CompanyHistoryTableProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-md transition-colors">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" /> 일자별 매매 상세 기록
        </h3>
        <p className="text-muted-foreground text-xs mt-1">
          해당 분석 기간 동안의 일별 거래 현황입니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <Table className="w-full text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>거래일자</TableHead>
              <TableHead className="text-right">순매수 수량</TableHead>
              <TableHead className="text-right">순매수 금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => {
                const isNetBuy = item.amount >= 0;
                return (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-muted-foreground">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium font-mono ${
                        item.quantity >= 0
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      {formatQuantity(item.quantity)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold font-mono ${
                        isNetBuy
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      {formatAmount(item.amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  해당 기간 내 국민연금 거래 상세 정보가 존재하지 않습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
