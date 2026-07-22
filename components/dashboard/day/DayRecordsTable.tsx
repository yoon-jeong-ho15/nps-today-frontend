import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Building2, Search, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatAmount, formatQuantity } from "~/lib/format";

import type { RecordWithCompany } from "~/types/domain";

interface DayRecordsTableProps {
  selectedRecords: RecordWithCompany[];
}

export function DayRecordsTable({ selectedRecords }: DayRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"amountDesc" | "amountAsc">("amountDesc");

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...selectedRecords];

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.company_name.toLowerCase().includes(term) ||
          r.company_id.includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "amountDesc":
          if (b.amount !== a.amount) {
            return b.amount - a.amount;
          }
          return b.quantity - a.quantity;
        case "amountAsc":
          if (a.amount !== b.amount) {
            return a.amount - b.amount;
          }
          return a.quantity - b.quantity;
        default:
          return 0;
      }
    });

    return result;
  }, [selectedRecords, searchTerm, sortBy]);

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-md transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" /> 전체 순매수 기록
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="종목명 또는 코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">
              정렬 기준
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 cursor-pointer font-medium"
            >
              <option value="amountDesc">순매수 금액 높은 순</option>
              <option value="amountAsc">순매수 금액 낮은 순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <Table className="w-full text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sm:w-[80px]">순위</TableHead>
              <TableHead>종목명</TableHead>
              <TableHead className="hidden md:table-cell">종목코드</TableHead>
              <TableHead className="hidden md:table-cell text-right">순매수 수량</TableHead>
              <TableHead className="text-right">순매수 금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRecords.length > 0 ? (
              filteredAndSortedRecords.map((item, idx) => {
                const isNetBuy = item.quantity >= 0;
                const isNonTouched = item.quantity === 0 && item.amount === 0;

                return (
                  <TableRow key={item.company_id} className={isNonTouched ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-bold">
                      <Link
                        to={`/company/${item.company_id}`}
                        className="hover:underline hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        {item.company_name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-muted-foreground">
                      {item.company_id}
                    </TableCell>
                    <TableCell
                      className={`hidden md:table-cell text-right font-medium font-mono ${
                        isNonTouched
                          ? "text-muted-foreground"
                          : item.quantity >= 0
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      {formatQuantity(item.quantity)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold font-mono ${
                        isNonTouched
                          ? "text-muted-foreground"
                          : isNetBuy
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
                <TableCell colSpan={5} className="h-24 text-center">
                  일치하는 종목 정보가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
