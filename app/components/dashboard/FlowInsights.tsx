import { useState, type ReactNode } from "react";
import { ArrowLeftRight, ChartNoAxesCombined, CircleHelp, Compass, Gauge, Layers, ScanLine, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { useFlowInsights } from "~/hooks/useFlowInsights";
import { formatCompactAmount, shortDate } from "~/lib/format";
import type { FlowCategory, FlowInsights, FlowSignalKey, FlowStock } from "~/types/flowInsights";
import type { InsightWindow } from "~/types/insights";
import { CompanyLogo } from "./company/CompanyLogo";
import { EmptyState, Panel, SegmentedControl } from "./shared";

const tone = (n: number | null) => n === null || n === 0 ? "muted" : n > 0 ? "positive" : "negative";
const pct = (n: number | null, signed = false) => n === null ? "—" : `${n > 0 && signed ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;
const money = formatCompactAmount;
type Mode = "transition" | "speed" | "rank" | "unusual" | "persistence" | "contrary";
const settings: Record<Mode, {
  title: string; description: string; context: string; note: string; icon: ReactNode;
  options: { value: FlowSignalKey; label: string }[];
}> = {
  transition: {
    title: "팔던 종목을 다시 사기 시작했나?", description: "직전 기간과 최근 기간의 순매수 방향 전환",
    context: "계속 팔던 종목을 사기 시작하거나, 사던 종목을 팔기 시작한 곳이에요. 누적 금액의 방향이 달라진 종목을 찾아볼 수 있어요.",
    note: "겹치지 않는 같은 길이의 두 기간을 비교합니다. 순매수·순매도가 0인 구간은 방향 전환에 포함하지 않습니다. 최근 금액의 절댓값 순입니다.", icon: <ArrowLeftRight size={18} />,
    options: [{ value: "transition_buy", label: "매수로 전환" }, { value: "transition_sell", label: "매도로 전환" }],
  },
  speed: {
    title: "사는 속도, 파는 속도가 달라졌나?", description: "하루 평균 순매수·순매도 금액의 변화",
    context: "계속 사고 있어도 매수 금액이 줄어들 수 있어요. 이전과 같은 방향을 유지하면서 하루 평균 얼마를 더 사거나 덜 사는지 비교해요.",
    note: "방향이 같은 두 기간만 비교하며, 하루 평균 금액 변화의 절댓값이 큰 순입니다. +는 순매수 쪽, −는 순매도 쪽으로의 변화예요.", icon: <Gauge size={18} />,
    options: [{ value: "buy_faster", label: "매수 강화" }, { value: "buy_slower", label: "매수 둔화" }, { value: "sell_faster", label: "매도 강화" }, { value: "sell_slower", label: "매도 둔화" }],
  },
  rank: {
    title: "순매수 상위권의 얼굴이 바뀌었나?", description: "순매수 금액 상위 20위 진입·이탈",
    context: "큰 금액이 들어오는 종목이 이전과 같을까요? 새로 상위권에 들어온 종목과 밀려난 종목을 보면 관심이 어디로 옮겨가는지 살펴볼 수 있어요.",
    note: "두 기간 모두 기록이 있는 같은 종목 집합의 순위입니다. ‘진입’은 이번 기간의 상위 20위 진입이며, 처음 주식을 샀다는 뜻은 아닙니다.", icon: <TrendingUp size={18} />,
    options: [{ value: "rank_enter", label: "상위권 진입" }, { value: "rank_exit", label: "상위권 이탈" }],
  },
  unusual: {
    title: "평소보다 유난히 큰 거래가 있었나?", description: "기준일 하루의 수급 · 직전 60거래일과 비교",
    context: "금액 순위가 낮아도 그 종목에는 드문 큰 거래일 수 있어요. 기준일 하루의 순매수·순매도 규모가 그 종목의 평소 기록보다 얼마나 컸는지 살펴봐요.",
    note: "직전 60거래일의 95% 이상보다 수급 금액의 절댓값이 큰 종목입니다. 기준일을 제외한 60일 기록이 모두 있어야 하며, 기준일 하루 금액의 절댓값 순입니다.", icon: <Sparkles size={18} />,
    options: [{ value: "unusual", label: "이례적인 수급" }],
  },
  persistence: {
    title: "하루 반짝 거래일까, 꾸준한 흐름일까?", description: "기간의 80% 이상 같은 방향 · 하루에 몰리지 않은 수급",
    context: "하루의 큰 거래로 누적 금액이 커진 종목과, 여러 날에 걸쳐 꾸준히 거래한 종목을 구분해요. 매일 연속으로 사지 않았더라도 이어지는 흐름을 볼 수 있어요.",
    note: "기간의 80% 이상 같은 방향이며 누적 방향도 일치해야 합니다. 같은 방향 금액 중 가장 큰 하루의 비중이 50% 이하인 종목만 표시합니다. 누적 금액의 절댓값 순입니다.", icon: <Layers size={18} />,
    options: [{ value: "persistent_buy", label: "꾸준한 순매수" }, { value: "persistent_sell", label: "꾸준한 순매도" }],
  },
  contrary: {
    title: "전체 흐름과 다르게 거래한 종목은?", description: "추적 종목 전체의 수급과 반대로 움직인 종목",
    context: "추적 종목 전체에서 판 금액이 더 많았던 날에도 사들인 종목을 찾아봐요. 전체 흐름이 약할 때도 반복해서 매수가 이어졌는지 살펴볼 수 있어요.",
    note: "전체가 해당 방향인 날이 2거래일 이상이고, 그 모든 날에 반대 수급을 기록해야 합니다. 종목의 기간 누적 방향도 일치해야 해요. 전체 흐름은 주가지수가 아닌 추적 종목 수급 합계입니다.", icon: <Compass size={18} />,
    options: [{ value: "contrary_buy", label: "전체 매도 속 매수" }, { value: "contrary_sell", label: "전체 매수 속 매도" }],
  },
};

function Identity({ stock, detail }: { stock: Pick<FlowStock, "company_id" | "name">; detail?: ReactNode }) {
  return <Link to={`/company/${stock.company_id}`} className="market-stock-identity"><CompanyLogo company={{ id: stock.company_id, name: stock.name }} /><span><strong>{stock.name}</strong>{detail && <small>{detail}</small>}</span></Link>;
}
function rankText(rank: number | null, amount: number) { return rank === null ? amount < 0 ? "순매도" : "순매수 없음" : `${rank}위`; }

function SignalPanel({ mode, data }: { mode: Mode; data: FlowInsights }) {
  const config = settings[mode];
  const [key, setKey] = useState<FlowSignalKey>(config.options[0].value);
  const rows = data.lists[key] ?? [];
  const count = data.counts[key] ?? 0;
  const sell = key.endsWith("sell");
  return <Panel className="flow-signal-panel" title={config.title} description={config.description} action={<span className="market-card-icon">{config.icon}</span>}>
    <div className="market-card-content">
      <div className="market-question-context"><p>{config.context}</p></div>
      {config.options.length > 1 && <div className="flow-panel-controls"><SegmentedControl value={key} onChange={setKey} options={config.options} label={`${mode} 분석 구분`} /></div>}
      <div className="flow-list-caption"><strong>{count}개 종목</strong><span>{mode === "unusual" ? `60일 비교 가능 ${data.history_coverage_count}종목` : mode === "contrary" ? `전체 순매도 ${data.bear_days}일 · 순매수 ${data.bull_days}일` : "조건 충족 종목 중 상위 5개"}</span></div>
      {rows.length ? <div>{rows.map((stock) => {
        let detail: ReactNode = stock.sector_name;
        let primary: ReactNode = money(stock.net_amount);
        let secondary: ReactNode = `직전 ${money(stock.previous_amount)}`;
        let color = tone(stock.net_amount);
        if (mode === "speed") {
          primary = money(stock.change_amount / data.window_days); color = tone(stock.change_amount);
          detail = `일평균 ${money(stock.previous_amount / data.window_days)} → ${money(stock.net_amount / data.window_days)}`;
          secondary = "하루 평균 금액 변화";
        } else if (mode === "rank") {
          primary = rankText(stock.current_rank, stock.net_amount);
          detail = `직전 ${rankText(stock.previous_rank, stock.previous_amount)}`;
          secondary = money(stock.net_amount);
        } else if (mode === "persistence") {
          primary = `${sell ? stock.sell_days : stock.buy_days}/${data.window_days}일`;
          detail = `하루 최대 비중 ${pct(stock.dominant_day_pct)}`;
          secondary = money(stock.net_amount);
        } else if (mode === "unusual") {
          primary = money(stock.today_amount); color = tone(stock.today_amount);
          detail = `과거 ${pct(stock.larger_than_pct)}의 날보다 큰 수급`;
          secondary = `평소 하루 평균 ${money(stock.prior_avg_abs, false)}`;
        } else if (mode === "contrary") {
          primary = `${sell ? stock.bull_sell_days : stock.bear_buy_days}/${sell ? data.bull_days : data.bear_days}일`;
          secondary = money(stock.net_amount);
        }
        return <div className="market-stock flow-stock" key={stock.company_id}>
          <Identity stock={stock} detail={detail} /><div className="market-stock-values"><strong className={color}>{primary}</strong><small>{secondary}</small></div>
        </div>;
      })}</div> : <EmptyState title="조건에 맞는 종목이 없습니다" description={mode === "contrary" ? "전체가 해당 방향인 날이 2일 이상이고, 그 모든 날에 반대로 거래한 종목이 필요해요." : mode === "unusual" ? "60거래일 기록이 충분하고, 평소보다 드문 큰 수급이 발생한 종목을 표시해요." : "다른 분석 구분이나 조회 기간을 선택해 보세요."} />}
      <p className="market-card-note">{config.note}</p>
    </div>
  </Panel>;
}

function BreadthPanel({ data }: { data: FlowInsights }) {
  const current = data.buy_count / data.coverage_count * 100;
  const previous = data.previous_buy_count / data.coverage_count * 100;
  const maxDay = Math.max(1, data.coverage_count);
  return <Panel title="매수가 여러 종목으로 퍼지고 있나?" description="같은 종목 집합에서 순매수 종목 비율 비교" action={<span className="market-card-icon"><Layers size={18} /></span>}>
    <div className="market-card-content">
      <div className="market-question-context"><p>합계 금액이 커도 일부 종목만 많이 샀을 수 있어요. <strong>매수가 더 많은 종목으로 넓어지는지</strong> 함께 보면 자금 흐름의 폭을 알 수 있어요.</p></div>
      <div className="flow-breadth-head"><strong>{pct(current)}</strong><span>최근 순매수 종목 비율<br /><b className={tone(current - previous)}>{current - previous >= 0 ? "+" : "−"}{Math.abs(current - previous).toFixed(1)}%p</b> 직전 기간 대비</span></div>
      <div className="flow-distribution" role="img" aria-label={`순매수 ${data.buy_count}종목, 순매도 ${data.sell_count}종목, 중립 ${data.neutral_count}종목`}>
        <span className="flow-buy" style={{ width: `${data.buy_count / maxDay * 100}%` }} /><span className="flow-sell" style={{ width: `${data.sell_count / maxDay * 100}%` }} /><span className="flow-neutral" style={{ width: `${data.neutral_count / maxDay * 100}%` }} />
      </div>
      <div className="flow-distribution-legend"><span className="positive">순매수 {data.buy_count}</span><span className="negative">순매도 {data.sell_count}</span><span>중립 {data.neutral_count}</span></div>
      <div className="flow-breadth-comparison"><span>직전 기간 순매수 <strong>{data.previous_buy_count}종목 · {pct(previous)}</strong></span><span>최근 기간 순매수 <strong>{data.buy_count}종목 · {pct(current)}</strong></span></div>
      <div className="market-column-labels"><span>거래일별 수급의 폭</span><span>각 날짜의 순매수 / 순매도</span></div>
      <div className="flow-daily-bars">{data.daily.map((day) => <div key={day.date} title={`${shortDate(day.date)} · 순매수 ${day.buy_count} / 순매도 ${day.sell_count} / 중립 ${day.neutral_count}`}><div><i className="flow-sell" style={{ height: `${day.sell_count / maxDay * 100}%` }} /><i className="flow-buy" style={{ height: `${day.buy_count / maxDay * 100}%` }} /></div><span>{day.date.slice(4, 6)}.{day.date.slice(6)}</span></div>)}</div>
      <p className="market-card-note">큰 비율은 더 많은 종목이 순매수였다는 뜻입니다. 위 비율은 기간 누적, 아래 막대는 각 하루의 수급입니다. 누락을 0으로 채우지 않고 두 기간이 완전한 같은 {data.coverage_count}종목으로 비교합니다.</p>
    </div>
  </Panel>;
}

function ConcentrationPanel({ data }: { data: FlowInsights }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const item = data.concentration[side];
  return <Panel title="자금이 몇 종목에 몰리고 있나?" description="순매수·순매도 규모 중 상위 5종목의 몫" action={<span className="market-card-icon"><ScanLine size={18} /></span>}>
    <div className="market-card-content">
      <div className="market-question-context"><p>상위 5종목이 차지하는 몫이 크면 <strong>일부 종목에 집중된 흐름</strong>이에요. 순매수 종목 비율과 함께 보면 ‘넓게 사고 있는지, 소수에 몰리는지’를 구분할 수 있어요.</p></div>
      <div className="flow-panel-controls"><SegmentedControl value={side} onChange={setSide} options={[{ value: "buy", label: "순매수 집중도" }, { value: "sell", label: "순매도 집중도" }]} label="자금 집중도 구분" /></div>
      {item ? <>
        <div className="flow-concentration-head"><strong>{pct(item.top5_pct)}</strong><span>상위 5종목의 비중</span></div>
        <div className="flow-concentration-track" role="img" aria-label={`상위 5종목 비중 ${pct(item.top5_pct)}`}><span style={{ width: `${item.top5_pct}%` }} /></div>
        <div className="flow-concentration-caption"><span>상위 5종목 {money(item.top5_amount, false)}</span><span>전체 {money(item.total_amount, false)}</span></div>
        {item.leaders.map((stock, index) => <div className="market-stock flow-stock" key={stock.company_id}><span className="flow-rank">{String(index + 1).padStart(2, "0")}</span><Identity stock={stock} /><div className="market-stock-values"><strong className={tone(stock.net_amount)}>{money(stock.net_amount)}</strong><small>{pct(Math.abs(stock.net_amount) / item.total_amount * 100)} 비중</small></div></div>)}
      </> : <EmptyState title={`순${side === "buy" ? "매수" : "매도"} 종목이 없습니다`} description="해당 방향의 금액이 있을 때 집중도를 계산합니다." />}
      <p className="market-card-note">종목별 기간 순매수를 계산한 뒤, 양수 금액과 음수 금액의 절댓값을 각각 따로 합산합니다. 매수·매도를 상계한 전체 순매수 합계를 분모로 쓰지 않습니다. 실제 총매수·총매도 비중은 아닙니다.</p>
    </div>
  </Panel>;
}

const quadrants: { key: FlowSignalKey; label: string; explanation: string }[] = [
  { key: "rise_buy", label: "주가 상승 · 순매수", explanation: "가격 상승과 순매수가 함께 나타난 종목이에요." },
  { key: "rise_sell", label: "주가 상승 · 순매도", explanation: "가격은 올랐지만 순매도가 나타난 종목이에요. 매도의 이유까지 알 수 있는 것은 아니에요." },
  { key: "fall_buy", label: "주가 하락 · 순매수", explanation: "가격은 내렸지만 기간 전체로는 순매수한 종목이에요. 매일 연속으로 샀다는 뜻은 아니에요." },
  { key: "fall_sell", label: "주가 하락 · 순매도", explanation: "가격 하락과 순매도가 함께 나타난 종목이에요." },
];
function PriceFlowPanel({ data }: { data: FlowInsights }) {
  const [selected, setSelected] = useState<FlowSignalKey>("rise_buy");
  const quadrant = quadrants.find((row) => row.key === selected)!;
  const rows = data.lists[selected] ?? [];
  return <Panel className="flow-price-map" title="가격과 자금은 같은 방향으로 움직이나?" description="주가의 상승·하락과 누적 수급의 네 가지 조합" action={<span className="market-card-icon"><ChartNoAxesCombined size={18} /></span>}>
    <div className="market-card-content">
      <div className="market-question-context"><p>주가가 올랐다고 반드시 사고 있는 것은 아니에요. <strong>가격의 방향과 실제 수급을 함께</strong> 보면 서로 같은 방향인지, 엇갈리는지 구분할 수 있어요. 아래 조합을 눌러 종목을 확인하세요.</p></div>
      <div className="flow-map-layout">
        <div><div className="flow-quadrants" role="group" aria-label="가격과 수급 조합">{quadrants.map((row) => <button type="button" key={row.key} aria-pressed={selected === row.key} onClick={() => setSelected(row.key)}><span>{row.label}</span><strong>{data.counts[row.key] ?? 0}<small>종목</small></strong></button>)}</div><p className="flow-map-explanation">{quadrant.explanation}</p></div>
        <div><div className="market-column-labels"><span>누적 수급 절댓값 상위 5개</span><span>주가 변화 / 순매수</span></div>{rows.length ? rows.map((stock) => <div className="market-stock flow-stock" key={stock.company_id}><Identity stock={stock} detail={stock.sector_name} /><div className="market-stock-values"><strong className={tone(stock.price_change)}>{pct(stock.price_change, true)}</strong><small className={tone(stock.net_amount)}>{money(stock.net_amount)}</small></div></div>) : <EmptyState title="이 조합에 해당하는 종목이 없습니다" description="다른 가격·수급 조합을 선택해 보세요." />}</div>
      </div>
      <p className="market-card-note">수정 종가로 기간 직전 거래일과 기준일을 비교합니다. 가격 비교 가능 {data.price_coverage_count}종목 · 보합 또는 누적 수급 0인 {data.flat_price_count}종목은 네 조합에서 제외합니다. 가격 누락·수정 기준 불일치 {data.coverage_count - data.price_coverage_count}종목.</p>
    </div>
  </Panel>;
}

export function FlowInsightCards({ data, category }: { data: FlowInsights; category: FlowCategory }) {
  const show = (name: FlowCategory) => category === "all" || category === name;
  return <div className="market-insights-grid flow-insights-grid">
    {show("direction") && <><SignalPanel mode="transition" data={data} /><SignalPanel mode="speed" data={data} /><SignalPanel mode="rank" data={data} /></>}
    {show("behavior") && <><SignalPanel mode="unusual" data={data} /><SignalPanel mode="persistence" data={data} /><SignalPanel mode="contrary" data={data} /></>}
    {show("market") && <><BreadthPanel data={data} /><ConcentrationPanel data={data} /><PriceFlowPanel data={data} /></>}
  </div>;
}

export function FlowInsightsSection({ days, onDaysChange }: { days: InsightWindow; onDaysChange?: (days: InsightWindow) => void }) {
  const [category, setCategory] = useState<FlowCategory>("all");
  const [retry, setRetry] = useState(0);
  return <section className="flow-insights" aria-labelledby="flow-insights-title">
    <div className="flow-section-heading"><div><div className="eyebrow">FOLLOW THE CHANGES</div><h2 id="flow-insights-title">놓치기 쉬운 수급의 변화</h2><p>방향이 바뀌는 순간부터, 평소와 다른 거래와 전체 자금의 분포까지.</p></div>{onDaysChange ? <SegmentedControl value={days} onChange={onDaysChange} options={[{ value: 5, label: "최근 5거래일" }, { value: 20, label: "최근 20거래일" }]} label="추가 수급 비교 기간" /> : <span className="flow-period-label">최근 {days}거래일 기준</span>}</div>
    <div className="flow-category-controls"><SegmentedControl value={category} onChange={setCategory} options={[{ value: "all", label: "전체 9가지" }, { value: "direction", label: "방향과 강도" }, { value: "behavior", label: "평소와 다른 매매" }, { value: "market", label: "전체 흐름" }]} label="추가 인사이트 종류" /></div>
    <FlowInsightsLoader key={retry} days={days} category={category} onRetry={() => setRetry((value) => value + 1)} />
  </section>;
}

function FlowInsightsLoader({ days, category, onRetry }: { days: InsightWindow; category: FlowCategory; onRetry: () => void }) {
  const { data, loading, error } = useFlowInsights(days);
  if (loading) return <div className="market-insights-grid" role="status" aria-label="추가 수급 인사이트를 분석하는 중">{[1,2].map((key) => <div key={key} className="skeleton market-insight-skeleton" />)}</div>;
  if (error) return <div role="alert" className="market-insight-error"><CircleHelp size={20} /><div><strong>추가 수급 분석을 불러오지 못했어요</strong><p>{error}</p></div><button className="button button-secondary" onClick={onRetry}>추가 분석 다시 시도</button></div>;
  if (!data?.as_of || data.coverage_count === 0) return <Panel title="추가 수급 인사이트"><EmptyState title="두 기간을 비교할 데이터가 부족합니다" description="선택한 기간과 직전 같은 기간의 기록이 모두 쌓여야 분석할 수 있어요." /></Panel>;
  return <>
    <div className="market-insights-meta"><span>{data.period_start && shortDate(data.period_start)}~{shortDate(data.as_of)} · 비교 가능 {data.coverage_count}/{data.company_count}종목</span><span>직전 {data.previous_start && shortDate(data.previous_start)}~{data.previous_end && shortDate(data.previous_end)}와 비교</span></div>
    <div className="flow-summary-strip"><div><span>순매수로 전환</span><strong>{data.counts.transition_buy ?? 0}<small>종목</small></strong></div><div><span>순매도로 전환</span><strong>{data.counts.transition_sell ?? 0}<small>종목</small></strong></div><div><span>기준일의 이례적 수급</span><strong>{data.counts.unusual ?? 0}<small>종목</small></strong></div><div><span>최근 순매수 종목 비율</span><strong>{pct(data.buy_count / data.coverage_count * 100)}</strong></div></div>
    <FlowInsightCards data={data} category={category} />
  </>;
}
