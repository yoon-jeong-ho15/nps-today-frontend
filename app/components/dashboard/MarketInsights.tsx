import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, CircleHelp, Layers, ScanLine, TrendingDown } from "lucide-react";
import { Link } from "react-router";
import { useMarketInsights } from "~/hooks/useMarketInsights";
import { formatCompactAmount, shortDate } from "~/lib/format";
import type { InsightStock, InsightWindow, MarketInsights, ReturnHorizon } from "~/types/insights";
import { CompanyLogo } from "./company/CompanyLogo";
import { EmptyState, Panel, SegmentedControl } from "./shared";
import { FlowInsightCards } from "./FlowInsights";
import { useFlowInsights } from "~/hooks/useFlowInsights";
import type { FlowCategory } from "~/types/flowInsights";
import { DashboardBriefing } from "./DashboardBriefing";

function percent(value: number | null, unit = "%") {
  if (value === null) return "—";
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${unit}`;
}
const tone = (value: number | null) => value === null || value === 0 ? "muted" : value > 0 ? "positive" : "negative";
const day = (value: string | null) => value ? shortDate(value) : "—";

function StockIdentity({ stock }: { stock: InsightStock }) {
  return <Link to={`/company/${stock.company_id}`} className="market-stock-identity">
    <CompanyLogo company={{ id: stock.company_id, name: stock.name }} />
    <span><strong>{stock.name}</strong><small>{stock.sector_name}</small></span>
  </Link>;
}

export function MarketInsightCards({ data, horizon, onHorizonChange, view = "all" }: {
  data: MarketInsights; horizon: ReturnHorizon; onHorizonChange: (horizon: ReturnHorizon) => void; view?: "all" | "signals" | "performance";
}) {
  const [allSectors, setAllSectors] = useState(false);
  const performance = data.performance.find((row) => row.horizon === horizon);
  const sectorMax = Math.max(1, ...data.sectors.flatMap((row) => [Math.abs(row.current_amount), Math.abs(row.previous_amount)]));
  const sectors = allSectors ? data.sectors : data.sectors.slice(0, 6);
  return <div className={`market-insights-grid ${view === "performance" ? "market-performance-only" : ""}`}>
    {view !== "performance" && <><Panel title="주가가 내리는데도 계속 사고 있나?" description={`${data.window_days}거래일 연속 순매수 · 같은 기간 수정주가 하락`} action={<span className="market-card-icon"><TrendingDown size={18} /></span>}>
      <div className="market-card-content">
        <div className="market-question-context">
          <p>주가는 떨어졌지만, 연기금·기금이 매일 <strong>판 금액보다 산 금액이 많은 종목</strong>이에요. 가격이 약한 상황에서도 매수가 꾸준히 이어지는 곳을 찾아볼 수 있어요.</p>
        </div>
        <div className="market-spotlight"><strong>{data.pullback_count}<small>개 종목</small></strong><span>하락 속에서도 이어진 순매수</span></div>
        {data.pullbacks.length ? <>
          <div className="market-column-labels"><span>누적 순매수 상위 5개</span><span>주가 변화 / 순매수</span></div>
          <div className="market-stock-list">{data.pullbacks.map((stock) => <div className="market-stock" key={stock.company_id}>
            <StockIdentity stock={stock} />
            <div className="market-stock-values"><strong className="negative">{percent(stock.price_change)}</strong><small className="positive">{formatCompactAmount(stock.net_amount)}</small></div>
          </div>)}</div>
        </> : <EmptyState title="조건에 맞는 종목이 없습니다" description="선택한 기간에 매일 순매수하면서 주가가 하락한 종목을 찾습니다." />}
        <p className="market-card-note">기간 직전 거래일 종가와 기준일 종가를 비교합니다. 수정 기준이 다른 가격과 수급 누락 구간은 제외합니다.</p>
      </div>
    </Panel>

    <Panel title="그 종목에서 영향력 있는 규모인가?" description="전체 거래대금 대비 순매수·순매도 비율" action={<span className="market-card-icon"><ScanLine size={18} /></span>}>
      <div className="market-card-content">
        <div className="market-question-context">
          <p>같은 10억원을 사도, 거래가 적은 종목에서는 더 큰 움직임일 수 있어요. <strong>그 종목의 전체 거래 금액과 비교</strong>해 매수·매도 규모를 가늠해요.</p>
          <p className="market-context-example">예를 들어 +10%는 전체 100억원이 거래되는 동안, 판 금액보다 산 금액이 10억원 많았다는 뜻이에요.</p>
        </div>
        <div className="market-column-labels"><span>비율 절댓값 상위 5개</span><span>거래대금 대비 / 순매수</span></div>
        {data.influence.length ? <div className="market-stock-list">{data.influence.map((stock) => <div className="market-stock" key={stock.company_id}>
          <StockIdentity stock={stock} />
          <div className="market-stock-values"><strong className={tone(stock.turnover_pct)}>{percent(stock.turnover_pct)}</strong><small>{formatCompactAmount(stock.net_amount)}</small></div>
        </div>)}</div> : <EmptyState title="비율을 계산할 데이터가 없습니다" description="기간 전체의 수급과 거래대금이 필요합니다." />}
        <p className="market-card-note">{data.window_days}거래일 누적 기준. +는 순매수, −는 순매도입니다. 실제 주가에 미친 인과적 영향력을 뜻하지는 않습니다.</p>
      </div>
    </Panel>

    </>}
    {view === "all" && <Panel title="어떤 업종으로 순매수가 이동하나?" description="직전 같은 기간과 비교한 업종별 수급 변화" action={<span className="market-card-icon"><Layers size={18} /></span>}>
      <div className="market-card-content">
        <div className="market-question-context">
          <p>종목을 금융·제약 같은 업종끼리 묶어 보면, <strong>어느 분야에서 매수가 늘거나 줄었는지</strong> 볼 수 있어요. 개별 종목만 볼 때 놓치기 쉬운 자금의 흐름을 살펴보는 거예요.</p>
          <p className="market-context-example">‘변화 +’는 직전 기간보다 순매수가 늘었거나 순매도가 줄었다는 뜻이에요.</p>
        </div>
        <div className="market-sector-legend"><span><i />최근 {data.window_days}거래일</span><span><i className="previous" />직전 {data.window_days}거래일</span><small>변화 규모 순</small></div>
        {sectors.length ? <div className="market-sectors">{sectors.map((sector) => {
          const bar = (value: number) => ({ width: `${Math.abs(value) / sectorMax * 50}%`, left: value < 0 ? `${50 - Math.abs(value) / sectorMax * 50}%` : "50%" });
          return <div className="market-sector" key={sector.sector_name}>
            <div className="market-sector-title"><strong>{sector.sector_name}<small>{sector.company_count}종목</small></strong><span className={tone(sector.change_amount)}>{sector.change_amount >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{formatCompactAmount(sector.change_amount)}<small>변화</small></span></div>
            <div className="market-sector-track" role="img" aria-label={`${sector.sector_name}: 최근 ${formatCompactAmount(sector.current_amount)}, 직전 ${formatCompactAmount(sector.previous_amount)}`}>
              <i className="market-sector-zero" /><i className="market-sector-previous" style={bar(sector.previous_amount)} /><i className={`market-sector-current ${sector.current_amount < 0 ? "sell" : ""}`} style={bar(sector.current_amount)} />
            </div>
            <div className="market-sector-amounts"><span>직전 {formatCompactAmount(sector.previous_amount)}</span><strong className={tone(sector.current_amount)}>최근 {formatCompactAmount(sector.current_amount)}</strong></div>
          </div>;
        })}</div> : <EmptyState title="업종을 비교할 기록이 부족합니다" description="최근과 직전 두 기간의 수급이 모두 필요합니다." />}
        {data.sectors.length > 6 && <button type="button" className="market-show-sectors" aria-expanded={allSectors} onClick={() => setAllSectors(!allSectors)}>{allSectors ? "주요 업종만 보기" : `${data.sectors.length}개 업종 전체 보기`}</button>}
        <p className="market-card-note">직전 {day(data.previous_start)}~{day(data.previous_end)}와 비교 · {data.sector_coverage_count}종목.<br />{data.classification_as_of} 현재 업종 분류로 과거 수급을 묶은 결과입니다.</p>
      </div>
    </Panel>
    }
    {view !== "signals" && <Panel title="이 패턴 이후 주가는 실제로 어땠나?" description={`${data.window_days}일 연속 순매수 + 주가 하락 패턴의 과거 결과`} action={<span className="market-card-icon"><ChartNoAxesCombined size={18} /></span>}>
      <div className="market-card-content">
        <div className="market-question-context">
          <p>앞의 <strong>‘주가 하락 중 연속 순매수’가 과거에 나타난 뒤</strong>, 실제 주가가 어땠는지 모아 봐요. 눈에 띄는 매수 흐름이 이후 주가 상승으로도 이어졌는지 확인할 수 있어요.</p>
        </div>
        <div className="market-performance-toolbar"><span>진입 후 관찰 기간</span><SegmentedControl value={horizon} onChange={onHorizonChange} options={[5, 20, 60].map((value) => ({ value: value as ReturnHorizon, label: `${value}거래일` }))} label="패턴 이후 관찰 기간" /></div>
        {performance && performance.sample_count > 0 ? <>
          <div className="market-performance-hero"><span>평균 주가 수익률</span><strong className={tone(performance.average_return)}>{percent(performance.average_return)}</strong><small>관찰 완료 {performance.sample_count.toLocaleString()}건</small></div>
          <div className="market-performance-metrics">
            <div><span>KOSPI 대비</span><strong className={tone(performance.excess_return)}>{percent(performance.excess_return, "%p")}</strong></div>
            <div><span>중앙값</span><strong className={tone(performance.median_return)}>{percent(performance.median_return)}</strong></div>
            <div><span>상승 비율</span><strong>{performance.positive_rate?.toFixed(1) ?? "—"}%</strong></div>
          </div>
          <details className="market-reading-guide">
            <summary>이 숫자들은 어떻게 읽나요?</summary>
            <dl>
              <div><dt>평균 수익률</dt><dd>관찰이 끝난 사례들의 주가 수익률을 더해 사례 수로 나눈 값이에요.</dd></div>
              <div><dt>KOSPI 대비</dt><dd>같은 기간 코스피 지수보다 수익률이 얼마나 높거나 낮았는지예요. +2%p라면 2%포인트 더 높았다는 뜻이에요.</dd></div>
              <div><dt>중앙값</dt><dd>수익률을 순서대로 놓았을 때 가운데 값이에요. 일부 크게 오르거나 내린 사례에 평균이 치우쳤는지 함께 볼 수 있어요.</dd></div>
              <div><dt>상승 비율</dt><dd>주가가 오른 사례의 비율이에요. 60%라면 관찰한 10건 중 6건에서 주가가 올랐다는 뜻이에요.</dd></div>
            </dl>
          </details>
          <div className="market-column-labels"><span>최근 관찰 완료 사례</span><span>주가 수익률</span></div>
          <div className="market-examples">{performance.examples.map((example) => <Link key={`${example.company_id}-${example.signal_date}`} to={`/company/${example.company_id}`} title={`진입 ${day(example.entry_date)} · 관찰 종료 ${day(example.exit_date)}`}><span><strong>{example.name}</strong><small>{day(example.signal_date)} 신호</small></span><strong className={tone(example.return_pct)}>{percent(example.return_pct)}</strong></Link>)}</div>
        </> : <EmptyState title="아직 관찰이 끝난 사례가 없습니다" description={`${horizon}거래일 이후 가격까지 확보되면 성과를 표시합니다.`} />}
        <p className="market-observation-count">전체 신호 {performance?.signal_count ?? 0}건 · 관찰 중 {performance?.pending_count ?? 0}건 · 가격 누락·거래정지 등 제외 {performance?.excluded_count ?? 0}건</p>
        <p className="market-card-note">{day(data.history_start)}부터 추적한 현재 코스피 종목 기준. 조건이 연속 발생한 구간의 첫날만 집계하며, 다음 거래일 수정 시가로 진입해 {horizon}거래일 뒤 수정 종가와 비교합니다. 거래비용·배당 미반영. 사례 간 기간 중복과 생존 편향이 있어 매매 전략의 수익률을 뜻하지 않습니다.</p>
      </div>
    </Panel>}
  </div>;
}

export function MarketInsightsSection() {
  const [days, setDays] = useState<InsightWindow>(5);
  const [retry, setRetry] = useState(0);
  return <section className="market-insights" aria-labelledby="market-insights-title">
    <div className="market-insights-heading"><div><div className="eyebrow">FOLLOW THE MEANINGFUL CHANGES</div><h2 id="market-insights-title">주목할 수급의 변화</h2><p>전체 흐름을 읽고, 이유가 있는 종목과 업종의 변화를 살펴보세요.</p></div><SegmentedControl value={days} onChange={setDays} options={[{ value: 5, label: "최근 5거래일" }, { value: 20, label: "최근 20거래일" }]} label="인사이트 분석 기간" /></div>
    <p className="briefing-source">한국투자증권의 연기금·기금 수급 기준 · 국민연금 단독 거래와 구분됩니다.</p>
    <BriefingLoader key={retry} days={days} onRetry={() => setRetry((value) => value + 1)} />
  </section>;
}

function BriefingLoader({ days, onRetry }: { days: InsightWindow; onRetry: () => void }) {
  const flow = useFlowInsights(days);
  const market = useMarketInsights(days);
  const [horizon, setHorizon] = useState<ReturnHorizon>(20);
  const [category, setCategory] = useState<FlowCategory>("direction");
  const [pastOpen, setPastOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  if (flow.loading) return <div role="status" aria-label="수급 인사이트를 분석하는 중"><div className="skeleton market-insight-skeleton" /><span className="sr-only">수급 인사이트를 분석하는 중입니다.</span></div>;
  if (flow.error) return <div role="alert" className="market-insight-error"><CircleHelp size={20} /><div><strong>수급 인사이트를 불러오지 못했어요</strong><p>{flow.error}</p></div><button className="button button-secondary" onClick={onRetry}>다시 시도</button></div>;
  const data = flow.data;
  if (!data?.as_of || !data.period_start || !data.coverage_count) return <Panel title="수급 인사이트"><EmptyState title="분석에 필요한 데이터가 아직 부족합니다" description="선택한 기간과 직전 같은 기간의 기록이 쌓이면 분석을 표시합니다." /></Panel>;
  const marketView = (view: "signals" | "performance") => {
    if (market.loading) return <p role="status" className="briefing-footnote">가격과 과거 패턴을 분석하고 있어요.</p>;
    if (market.error) return <div role="alert" className="market-insight-error"><p>{market.error}</p><button className="button button-secondary" onClick={onRetry}>다시 시도</button></div>;
    if (!market.data?.as_of) return <EmptyState title="가격과 과거 패턴의 기록이 부족합니다" description="가격과 지수 기록이 쌓이면 분석을 표시합니다." />;
    return <><p className="briefing-footnote">{day(market.data.period_start)}~{day(market.data.as_of)} 기준 · {market.data.coverage_count}/{market.data.company_count}종목</p><MarketInsightCards data={market.data} horizon={horizon} onHorizonChange={setHorizon} view={view} /></>;
  };
  return <>
    <div className="market-insights-meta"><span><i className="status-dot" />{day(data.period_start)}~{day(data.as_of)} 기준 · 비교 가능 {data.coverage_count}/{data.company_count}종목</span><span>직전 {day(data.previous_start)}~{day(data.previous_end)}와 비교</span></div>
    {market.data?.flow_latest && market.data.as_of && market.data.flow_latest !== market.data.as_of && <p className="market-data-lag">최신 수급은 {day(market.data.flow_latest)} 기준입니다. 가격·지수까지 확보된 {day(data.as_of)}를 기준으로 분석합니다.</p>}
    <DashboardBriefing data={data} />
    <details className="briefing-disclosure" open={pastOpen} onToggle={(event) => setPastOpen(event.currentTarget.open)}><summary><span><strong>이런 패턴, 과거에는 어땠을까?</strong><small>주가 하락 중 연속 순매수 패턴의 이후 수익률과 사례 수</small></span><span className="briefing-disclosure-action">{pastOpen ? "접기" : "과거 성과 보기"}</span></summary>{pastOpen && <div className="briefing-disclosure-content">{marketView("performance")}</div>}</details>
    <details className="briefing-disclosure" open={detailOpen} onToggle={(event) => setDetailOpen(event.currentTarget.open)}><summary><span><strong>근거를 더 자세히 살펴보기</strong><small>방향 전환·매수 속도·꾸준함·거래 규모 등 개별 지표</small></span><span className="briefing-disclosure-action">{detailOpen ? "접기" : "세부 지표 보기"}</span></summary>{detailOpen && <div className="briefing-disclosure-content"><div className="flow-category-controls"><SegmentedControl value={category} onChange={setCategory} options={[{ value: "direction", label: "방향과 강도" }, { value: "behavior", label: "평소와 다른 매매" }, { value: "market", label: "전체 분포" }]} label="세부 인사이트 종류" /></div><FlowInsightCards data={data} category={category} /><div className="briefing-secondary-signals">{marketView("signals")}</div></div>}</details>
  </>;
}
