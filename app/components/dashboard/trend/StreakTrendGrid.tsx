import type { TrendCompany } from "~/types/domain";
import { useState } from "react";
import { Link } from "react-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { CompanyLogo } from "../company/CompanyLogo";
import { EmptyState, FavoriteButton, Panel } from "../shared";
import { useWatchlist } from "~/hooks/useWatchlist";
interface Props {
  buyers: TrendCompany[];
  sellers: TrendCompany[];
  loading: boolean;
  days: number;
}
export function StreakTrendGrid({ buyers, sellers, loading, days }: Props) {
  const { ids, toggle } = useWatchlist();
  const [expanded, setExpanded] = useState({ buy: false, sell: false });
  return (
    <div className="two-columns">
      {(
        [
          { rows: buyers, side: "buy", name: "순매수" },
          { rows: sellers, side: "sell", name: "순매도" },
        ] as const
      ).map(({ rows, side, name }) => (
        <Panel
          key={side}
          title={`${days}거래일 연속 ${name}`}
          description={`최근 ${days}거래일 모두 ${name}한 종목`}
          action={
            <span className={`badge badge-${side}`}>{rows.length}개 종목</span>
          }
        >
          {loading ? (
            <div className="panel-body">
              <div
                className="skeleton skeleton-chart"
                role="status"
                aria-label="연속 매매 분석 중"
              />
            </div>
          ) : !rows.length ? (
            <EmptyState
              title="조건에 맞는 종목이 없습니다"
              description="조회 기간을 바꿔 다른 흐름도 확인해보세요."
            />
          ) : (
            rows.slice(0, expanded[side] ? undefined : 10).map((company) => (
              <div className="stock-row" key={company.id}>
                <Link to={`/company/${company.id}`}>
                  <CompanyLogo company={company} />
                  <span className="stock-row-title">
                    <strong>{company.name}</strong>
                    <small>{company.id}</small>
                  </span>
                </Link>
                <span className={`badge badge-${side}`}>
                  {side === "buy" ? (
                    <ArrowUpRight size={11} />
                  ) : (
                    <ArrowDownLeft size={11} />
                  )}
                  {days}일 연속
                </span>
                <FavoriteButton
                  name={company.name}
                  selected={ids.includes(company.id)}
                  onClick={() => toggle(company.id)}
                />
              </div>
            ))
          )}
          {!loading && rows.length > 10 && (
            <button
              className="show-more-button"
              onClick={() =>
                setExpanded((value) => ({ ...value, [side]: !value[side] }))
              }
            >
              {expanded[side] ? "접기" : `${rows.length}개 종목 모두 보기`}
            </button>
          )}
        </Panel>
      ))}
    </div>
  );
}
