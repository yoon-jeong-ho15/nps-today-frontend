import { useState } from "react";
import {
  Search,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/company-list";
import { useCompanyListData } from "~/hooks/useCompanyListData";
import { useWatchlist } from "~/hooks/useWatchlist";
import { CompanyLogo } from "~/components/dashboard/company/CompanyLogo";
import {
  EmptyState,
  ErrorState,
  FavoriteButton,
  LoadingState,
  PageHeading,
  SegmentedControl,
} from "~/components/dashboard/shared";

export function meta({}: Route.MetaArgs) {
  return [{ title: "종목 탐색 · NPS today" }];
}
export default function CompanyListRoute() {
  const { filteredCompanies, searchTerm, setSearchTerm, loading, error } =
    useCompanyListData();
  const { ids, toggle } = useWatchlist();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "watchlist" ? "watchlist" : "all";
  const [page, setPage] = useState(0);
  const companies =
    view === "watchlist"
      ? filteredCompanies.filter((company) => ids.includes(company.id))
      : filteredCompanies;
  const pages = Math.max(1, Math.ceil(companies.length / 36));
  const current = Math.min(page, pages - 1);
  return (
    <main className="dashboard-page">
      <PageHeading
        eyebrow="EXPLORE COMPANIES"
        title="어떤 종목이 궁금하세요?"
        description="기업명이나 종목코드로 검색하고, 관심 종목을 모아보세요."
        actions={
          <span className="badge">
            <Star size={12} /> 관심 종목 {ids.length}개
          </span>
        }
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="explore-toolbar">
            <SegmentedControl
              value={view}
              onChange={(value) => {
                setParams(value === "watchlist" ? { view: "watchlist" } : {});
                setPage(0);
              }}
              options={[
                { value: "all", label: "전체 종목" },
                { value: "watchlist", label: "내 관심 종목" },
              ]}
              label="종목 목록"
            />
            <label className="search-field">
              <Search size={15} />
              <input
                aria-label="기업명 또는 종목코드 검색"
                placeholder="기업명 또는 종목코드 검색"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(0);
                }}
              />
            </label>
          </div>
          <div className="results-label">
            총 <strong>{companies.length}</strong>개 종목{" "}
            <span>기업명 가나다순</span>
          </div>
          {!companies.length ? (
            <div className="panel">
              <EmptyState
                title={
                  view === "watchlist" && !searchTerm
                    ? "아직 관심 종목이 없어요"
                    : "검색 결과가 없습니다"
                }
                description={
                  view === "watchlist"
                    ? "전체 종목에서 별표를 눌러 나만의 관심 목록을 만들어보세요."
                    : "기업명이나 6자리 종목코드를 확인해주세요."
                }
              />
            </div>
          ) : (
            <div className="company-grid">
              {companies
                .slice(current * 36, (current + 1) * 36)
                .map((company) => (
                  <div className="company-tile" key={company.id}>
                    <Link to={`/company/${company.id}`}>
                      <CompanyLogo company={company} />
                      <span className="stock-row-title">
                        <strong>{company.name}</strong>
                        <small>
                          {company.id} <span className="muted">· KOSPI</span>
                        </small>
                      </span>
                    </Link>
                    <FavoriteButton
                      name={company.name}
                      selected={ids.includes(company.id)}
                      onClick={() => toggle(company.id)}
                    />
                  </div>
                ))}
            </div>
          )}
          {pages > 1 && (
            <div className="explore-pagination">
              <button
                className="button button-secondary"
                disabled={!current}
                onClick={() => {
                  setPage(current - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ChevronLeft size={14} /> 이전
              </button>
              <span>
                {current + 1} / {pages}
              </span>
              <button
                className="button button-secondary"
                disabled={current + 1 >= pages}
                onClick={() => {
                  setPage(current + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                다음 <ChevronRight size={14} />
              </button>
            </div>
          )}
          <div className="insight-banner">
            <ArrowUpRight size={18} />
            <p>
              여러 종목의 매수·매도 흐름을 함께 보고 싶다면{" "}
              <strong>수급 트렌드</strong>를 확인해보세요.
            </p>
            <Link to="/trend">
              트렌드 보기 <ArrowUpRight size={13} />
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
