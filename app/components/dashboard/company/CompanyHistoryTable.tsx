import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router";
import type { NetBuyRecord } from "~/types/domain";
import { Money, Panel, EmptyState } from "../shared";
import { shortDate } from "~/lib/format";
import { downloadCsv } from "~/lib/download";
export function CompanyHistoryTable({ data }: { data: NetBuyRecord[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(data.length / 10));
  const current = Math.min(page, pages - 1);
  return (
    <Panel
      title="일자별 거래 내역"
      description="날짜를 선택하면 해당일 전체 종목 수급으로 이동합니다."
      action={
        <button
          className="button button-secondary"
          disabled={!data.length}
          onClick={() =>
            downloadCsv(
              `nps-${data[0]?.company_id || "company"}.csv`,
              ["거래일", "종목코드", "순매수 금액(백만원)", "순매수 수량(주)"],
              data.map((row) => [
                shortDate(row.date),
                row.company_id,
                row.amount,
                row.quantity,
              ]),
            )
          }
        >
          <Download size={13} /> CSV 다운로드
        </button>
      }
    >
      {!data.length ? (
        <EmptyState />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>거래일</th>
                <th>매매 구분</th>
                <th className="align-right">순매수 금액</th>
                <th className="align-right">순매수 수량</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(current * 10, (current + 1) * 10).map((row) => (
                <tr key={row.date}>
                  <td>
                    <Link className="history-date" to={`/date/${row.date}`}>
                      {shortDate(row.date)}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`badge ${row.amount > 0 ? "badge-buy" : row.amount < 0 ? "badge-sell" : ""}`}
                    >
                      {row.amount > 0
                        ? "순매수"
                        : row.amount < 0
                          ? "순매도"
                          : "보합"}
                    </span>
                  </td>
                  <td className="align-right">
                    <Money amount={row.amount} />
                  </td>
                  <td
                    className={`align-right ${row.quantity > 0 ? "positive" : row.quantity < 0 ? "negative" : "muted"}`}
                  >
                    {row.quantity > 0 ? "+" : ""}
                    {row.quantity.toLocaleString()}주
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-pagination">
        <span>총 {data.length}거래일</span>
        <div className="pagination-controls">
          <button
            className="icon-button"
            aria-label="이전 거래 내역 페이지"
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={13} />
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            className="icon-button"
            aria-label="다음 거래 내역 페이지"
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
