import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  Layers,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useDashboardData } from "~/hooks/useDashboardData";
import { useWatchlist } from "~/hooks/useWatchlist";
import { FlowChart } from "~/components/dashboard/FlowChart";
import {
  EmptyState,
  ErrorState,
  FavoriteButton,
  LoadingState,
  MetricCard,
  Money,
  PageHeading,
  Panel,
  RankingList,
  SegmentedControl,
} from "~/components/dashboard/shared";
import { CompanyLogo } from "~/components/dashboard/company/CompanyLogo";
import { RecordsTable } from "~/components/dashboard/RecordsTable";
import { MarketInsightsSection } from "~/components/dashboard/MarketInsights";
import { formatCompactAmount, shortDate } from "~/lib/format";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NPS today · 수급 대시보드" },
    {
      name: "description",
      content:
        "연기금·기금의 전체 수급, 여러 근거가 겹친 종목, 업종별 변화를 함께 확인하세요.",
    },
  ];
}
export default function Home() {
  const {
    latestDate,
    latest,
    daily,
    companies,
    streaks,
    dates,
    loading,
    error,
  } = useDashboardData();
  const { ids, toggle } = useWatchlist();
  const [chartDays, setChartDays] = useState(20);
  const [rankingSide, setRankingSide] = useState("buy");
  const selected = daily.slice(-chartDays);
  const net = latest.reduce((sum, row) => sum + row.amount, 0);
  const buyCount = latest.filter((row) => row.amount > 0).length;
  const sellCount = latest.filter((row) => row.amount < 0).length;
  const chartTotal = selected.reduce((sum, row) => sum + row.amount, 0);
  const notable = useMemo(
    () =>
      [...latest]
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 20),
    [latest],
  );
  const watchlist = companies.filter((company) => ids.includes(company.id));
  return (
    <main className="dashboard-page">
      <PageHeading
        eyebrow="YOUR MARKET AT A GLANCE"
        title="연기금 수급, 무엇이 달라졌나?"
        description="전체 자금 흐름부터 주목할 종목과 업종까지, 변화의 이유를 함께 읽어보세요."
        actions={
          <>
            <span className="data-date">
              <span className="status-dot" />
              {latestDate ? (
                <>
                  <strong>{shortDate(latestDate)}</strong> 기준
                </>
              ) : (
                "거래일 데이터"
              )}
            </span>
            <Link className="button button-secondary" to="/date">
              <CalendarDays size={14} /> 거래일 선택
            </Link>
          </>
        }
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : !latest.length ? (
        <Panel title="수급 대시보드">
          <EmptyState
            title="아직 수집된 거래 데이터가 없습니다"
            description="데이터가 수집되면 최근 수급과 주요 종목이 여기에 표시됩니다."
          />
        </Panel>
      ) : (
        <>
          <MarketInsightsSection />
          <details className="briefing-disclosure briefing-records">
            <summary><span><strong>거래 기록과 관심 종목</strong><small>최근 거래일 순위·일별 차트·연속 매매·내 관심 종목</small></span><span className="briefing-disclosure-action">기록 펼치기</span></summary>
            <div className="briefing-disclosure-content">
          <div className="metrics-grid">
            <MetricCard
              featured
              label="최근 거래일 순매수"
              value={formatCompactAmount(net)}
              detail="수집 종목의 순매수 금액 합계"
              icon={<ChartNoAxesCombined size={16} />}
            />
            <MetricCard
              label="순매수 종목"
              value={
                <>
                  {buyCount}
                  <span className="metric-unit">개</span>
                </>
              }
              detail={
                <>
                  <ArrowUpRight size={11} />
                  <span className="positive">
                    {latest.length
                      ? Math.round((buyCount / latest.length) * 100)
                      : 0}
                    %
                  </span>
                  의 종목에 매수 우위
                </>
              }
              icon={<ArrowUpRight size={16} />}
            />
            <MetricCard
              label="순매도 종목"
              value={
                <>
                  {sellCount}
                  <span className="metric-unit">개</span>
                </>
              }
              detail={
                <>
                  <ArrowDownLeft size={11} />
                  <span className="negative">
                    {latest.length
                      ? Math.round((sellCount / latest.length) * 100)
                      : 0}
                    %
                  </span>
                  의 종목에 매도 우위
                </>
              }
              icon={<ArrowDownLeft size={16} />}
            />
            <MetricCard
              label="분석 중인 종목"
              value={
                <>
                  {latest.length}
                  <span className="metric-unit">개</span>
                </>
              }
              detail={<>최근 {dates.length}거래일의 수급 데이터</>}
              icon={<Layers size={16} />}
            />
          </div>
          <div className="dashboard-columns">
            <Panel
              title="자금은 어디로 흐르고 있을까요?"
              description="거래일별 전체 종목의 순매수 금액"
              action={
                <SegmentedControl
                  value={chartDays}
                  onChange={setChartDays}
                  options={[
                    { value: 7, label: "7거래일" },
                    { value: 20, label: "20거래일" },
                  ]}
                  label="차트 조회 기간"
                />
              }
            >
              <div className="chart-summary">
                <strong>{formatCompactAmount(chartTotal)}</strong>
                <span>최근 {selected.length}거래일 누적</span>
              </div>
              <FlowChart data={selected} />
              <div className="chart-footer">
                <div className="chart-legend">
                  <span>
                    <i className="legend-dot" /> 순매수
                  </span>
                  <span>
                    <i className="legend-dot sell" /> 순매도
                  </span>
                </div>
                <Link to="/date" className="text-link">
                  일별 자세히 보기 <ArrowRight size={12} />
                </Link>
              </div>
            </Panel>
            <Panel
              title="주목할 만한 종목"
              description={`${shortDate(latestDate)} · 순매수 / 순매도 TOP 5`}
              action={
                <SegmentedControl
                  value={rankingSide}
                  onChange={setRankingSide}
                  options={[
                    { value: "buy", label: "매수" },
                    { value: "sell", label: "매도" },
                  ]}
                  label="상위 종목 매매 구분"
                />
              }
            >
              <RankingList
                records={latest}
                side={rankingSide === "buy" ? "buy" : "sell"}
              />
              <div className="chart-footer">
                <span>순매수 금액 기준</span>
                <Link className="text-link" to={`/date/${latestDate}`}>
                  전체 종목 <ChevronRight size={12} />
                </Link>
              </div>
            </Panel>
          </div>
          <div className="insight-banner">
            <Sparkles size={19} />
            <p>
              {dates.length >= 5 ? (
                <>
                  최근 5거래일 동안{" "}
                  <strong>{streaks.buyers.length}개 종목은 연속 순매수</strong>,{" "}
                  <strong>{streaks.sellers.length}개 종목은 연속 순매도</strong>
                  를 기록했어요.
                </>
              ) : (
                <>거래일이 5일 이상 쌓이면 연속 매매 흐름도 확인할 수 있어요.</>
              )}
            </p>
            <Link to="/trend">
              흐름 살펴보기 <ArrowUpRight size={13} />
            </Link>
          </div>
          <RecordsTable
            records={notable}
            title="최근 거래일 주요 수급"
            description="순매수 금액의 절댓값이 큰 20개 종목 · 별표를 눌러 관심 종목에 추가하세요."
          />
          <div className="two-columns">
            <Panel
              title="꾸준히 모으고 있는 종목"
              description="최근 5거래일 모두 순매수를 기록한 종목"
              action={
                <Link className="text-link" to="/trend">
                  트렌드 더보기 <ChevronRight size={12} />
                </Link>
              }
            >
              {streaks.buyers.length ? (
                streaks.buyers.slice(0, 4).map((company) => (
                  <div className="stock-row" key={company.id}>
                    <Link to={`/company/${company.id}`}>
                      <CompanyLogo company={company} />
                      <span className="stock-row-title">
                        <strong>{company.name}</strong>
                        <small>{company.id}</small>
                      </span>
                    </Link>
                    <span className="badge badge-buy">
                      <ArrowUpRight size={11} /> 5일 연속 매수
                    </span>
                    <FavoriteButton
                      selected={ids.includes(company.id)}
                      name={company.name}
                      onClick={() => toggle(company.id)}
                    />
                  </div>
                ))
              ) : (
                <EmptyState
                  title="연속 순매수 종목이 없습니다"
                  description="최근 5거래일 동안 매일 순매수한 종목을 표시합니다."
                />
              )}
            </Panel>
            <Panel
              title="내 관심 종목"
              description="자주 보는 종목의 수급을 빠르게 확인하세요."
              action={
                <Link className="text-link" to="/company?view=watchlist">
                  전체 보기 <ChevronRight size={12} />
                </Link>
              }
            >
              {watchlist.length ? (
                watchlist.slice(0, 4).map((company) => {
                  const record = latest.find(
                    (row) => row.company_id === company.id,
                  );
                  return (
                    <div className="stock-row" key={company.id}>
                      <Link to={`/company/${company.id}`}>
                        <CompanyLogo company={company} />
                        <span className="stock-row-title">
                          <strong>{company.name}</strong>
                          <small>{company.id}</small>
                        </span>
                      </Link>
                      {record ? (
                        <Money amount={record.amount} />
                      ) : (
                        <small className="muted">해당일 데이터 없음</small>
                      )}
                      <FavoriteButton
                        selected
                        name={company.name}
                        onClick={() => toggle(company.id)}
                      />
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="관심 있는 종목을 담아보세요"
                  description="종목 옆 별표를 누르면 이 브라우저에 저장됩니다."
                  action={
                    <Link to="/company" className="button button-secondary">
                      <Star size={13} /> 종목 찾아보기
                    </Link>
                  }
                />
              )}
            </Panel>
          </div>
          </div></details>
          <div className="data-note">
            <CircleHelp size={12} />
            <span>
              거래일별 수집 데이터이며 실시간 시세가 아닙니다. 표시 금액은
              순매수 기준입니다.
            </span>
          </div>
        </>
      )}
    </main>
  );
}
