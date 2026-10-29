import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import type { RecordWithCompany } from "~/types/domain";
import { shortDate } from "~/lib/format";
import { downloadCsv } from "~/lib/download";
import { useWatchlist } from "~/hooks/useWatchlist";
import { CompanyLogo } from "./company/CompanyLogo";
import {
  EmptyState,
  FavoriteButton,
  Money,
  Panel,
  SegmentedControl,
} from "./shared";

export function RecordsTable({
  records,
  title = "종목별 수급 현황",
  description = "종목을 선택하면 상세 거래 내역을 확인할 수 있습니다.",
}: {
  records: RecordWithCompany[];
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(0);
  const { ids, toggle } = useWatchlist();
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records
      .filter(
        (row) =>
          (row.company_name.toLowerCase().includes(term) ||
            row.company_id.includes(term)) &&
          (filter === "all" ||
            (filter === "buy" && row.amount > 0) ||
            (filter === "sell" && row.amount < 0) ||
            (filter === "favorites" && ids.includes(row.company_id))),
      )
      .sort((a, b) => (descending ? b.amount - a.amount : a.amount - b.amount));
  }, [records, query, filter, descending, ids]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 10, (currentPage + 1) * 10);
  function download() {
    downloadCsv(
      `nps-${records[0]?.date || "trades"}.csv`,
      [
        "거래일",
        "종목코드",
        "기업명",
        "순매수 금액(백만원)",
        "순매수 수량(주)",
      ],
      filtered.map((row) => [
        shortDate(row.date),
        row.company_id,
        row.company_name,
        row.amount,
        row.quantity,
      ]),
    );
  }
  return (
    <Panel
      title={title}
      description={description}
      action={
        <button
          className="button button-secondary"
          disabled={!filtered.length}
          onClick={download}
        >
          <Download size={13} /> CSV 다운로드
        </button>
      }
    >
      <div className="table-toolbar">
        <SegmentedControl
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(0);
          }}
          options={[
            { value: "all", label: "전체" },
            { value: "buy", label: "순매수" },
            { value: "sell", label: "순매도" },
            { value: "favorites", label: "관심 종목" },
          ]}
          label="거래 필터"
        />
        <label className="search-field">
          <Search size={14} />
          <input
            placeholder="기업명 · 종목코드 검색"
            aria-label="거래 종목 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
      </div>
      {!visible.length ? (
        <EmptyState
          title="조건에 맞는 종목이 없습니다"
          description="검색어나 필터를 바꿔보세요. 별표를 눌러 관심 종목을 추가할 수 있습니다."
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>관심</th>
                <th>종목명</th>
                <th>매매 구분</th>
                <th
                  className="align-right"
                  aria-sort={descending ? "descending" : "ascending"}
                >
                  <button
                    className="sort-button"
                    onClick={() => {
                      setDescending(!descending);
                      setPage(0);
                    }}
                    aria-label={`순매수 금액 ${descending ? "오름차순" : "내림차순"} 정렬`}
                  >
                    순매수 금액 <ArrowDownUp size={12} />
                  </button>
                </th>
                <th className="align-right">순매수 수량</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.company_id}>
                  <td>
                    <FavoriteButton
                      name={row.company_name}
                      selected={ids.includes(row.company_id)}
                      onClick={() => toggle(row.company_id)}
                    />
                  </td>
                  <td>
                    <Link
                      className="table-company"
                      to={`/company/${row.company_id}`}
                    >
                      <CompanyLogo
                        company={{ id: row.company_id, name: row.company_name }}
                      />
                      <span>
                        <strong>{row.company_name}</strong>
                        <small>{row.company_id}</small>
                      </span>
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
                    {row.quantity.toLocaleString("ko-KR")}주
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-pagination">
        <span>
          총 {filtered.length.toLocaleString()}개 종목
          {filtered.length > 0
            ? ` 중 ${currentPage * 10 + 1}–${Math.min((currentPage + 1) * 10, filtered.length)}`
            : ""}
        </span>
        <div className="pagination-controls">
          <button
            className="icon-button"
            aria-label="이전 페이지"
            disabled={!currentPage}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={13} />
          </button>
          <span>
            {currentPage + 1} / {pageCount}
          </span>
          <button
            className="icon-button"
            aria-label="다음 페이지"
            disabled={currentPage + 1 >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
