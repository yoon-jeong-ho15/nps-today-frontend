import { useState } from "react";
import { ArrowRight, ChartNoAxesCombined, Layers, ScanLine } from "lucide-react";
import { Link } from "react-router";
import { formatCompactAmount as money, shortDate } from "~/lib/format";
import type { FlowInsights, FocusReason, FocusStock, SectorBriefing } from "~/types/flowInsights";
import { CompanyLogo } from "./company/CompanyLogo";
import { EmptyState, Panel, SegmentedControl } from "./shared";

const tone = (n: number | null) => n === null || n === 0 ? "muted" : n > 0 ? "positive" : "negative";
const percent = (n: number | null, signed = false) => n === null ? "—" : `${n < 0 ? "−" : signed && n > 0 ? "+" : ""}${Math.abs(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;

export function overallHeadline(data: FlowInsights) {
  if (data.net_amount === null) return "전체 금액을 비교할 기록이 부족해요";
  if (data.net_amount === 0) return "전체 매수와 매도 금액이 같아요";
  if (data.net_amount > 0 && data.sell_count > data.buy_count) return "합계는 순매수, 더 많은 종목은 순매도";
  if (data.net_amount < 0 && data.buy_count > data.sell_count) return "합계는 순매도, 더 많은 종목은 순매수";
  if (data.net_amount > 0 && data.buy_count > data.previous_buy_count) return "순매수와 함께, 매수 종목도 늘었어요";
  if (data.net_amount < 0 && data.buy_count < data.previous_buy_count) return "순매도와 함께, 매수 종목도 줄었어요";
  return data.net_amount > 0 ? "선택한 기간에는 매수 금액이 더 많았어요" : "선택한 기간에는 매도 금액이 더 많았어요";
}

function Overview({ data }: { data: FlowInsights }) {
  const breadth = data.buy_count / data.coverage_count * 100;
  const delta = (data.buy_count - data.previous_buy_count) / data.coverage_count * 100;
  const concentrationSide = data.net_amount !== null && data.net_amount < 0 ? "sell" : "buy";
  const concentration = data.concentration[concentrationSide];
  const max = Math.max(1, ...data.daily.map((d) => Math.abs(d.net_amount)));
  return <Panel className="briefing-overview" title="전체적으로 사고 있나, 팔고 있나?" description="금액의 방향과 매수한 종목의 폭을 함께 봅니다." action={<span className="market-card-icon"><ChartNoAxesCombined size={18} /></span>}>
    <div className="market-card-content">
      <div className="briefing-overview-top"><div><span className="briefing-kicker">최근 {data.window_days}거래일의 흐름</span><h3>{overallHeadline(data)}</h3><p>추적 {data.coverage_count}종목 중 <strong>{data.buy_count}종목은 순매수</strong>, {data.sell_count}종목은 순매도예요. 순매수 종목은 직전 {data.previous_buy_count}종목에서 {data.buy_count > data.previous_buy_count ? "늘었어요" : data.buy_count < data.previous_buy_count ? "줄었어요" : "같아요"}.</p></div><div className="briefing-daily" role="img" aria-label="거래일별 전체 순매수 금액">{data.daily.map((d) => <div key={d.date} title={`${shortDate(d.date)} ${money(d.net_amount)}`}><div><i className={d.net_amount < 0 ? "flow-sell" : "flow-buy"} style={{ height: `${Math.abs(d.net_amount) / max * 100}%` }} /></div><small>{d.date.slice(4, 6)}.{d.date.slice(6)}</small></div>)}</div></div>
      <div className="briefing-metrics">
        <div><span>기간 전체 순매수</span><strong className={tone(data.net_amount)}>{data.net_amount === null ? "—" : money(data.net_amount)}</strong><small>직전 {data.previous_net_amount === null ? "비교 불가" : money(data.previous_net_amount)}</small></div>
        <div><span>순매수 종목 비율</span><strong>{percent(breadth)}</strong><small><b className={tone(delta)}>{delta > 0 ? "+" : delta < 0 ? "−" : ""}{Math.abs(delta).toFixed(1)}%p</b> 직전 기간 대비</small></div>
        <div><span>{concentrationSide === "buy" ? "순매수" : "순매도"} 상위 5종목의 몫</span><strong>{percent(concentration?.top5_pct ?? null)}</strong><small>{concentrationSide === "buy" ? "순매수한 종목들의 금액" : "순매도한 종목들의 금액 절댓값"} 중 비중</small></div>
      </div>
      <p className="briefing-footnote">순매수는 판 금액보다 산 금액이 많다는 뜻이에요. 합계가 순매수여도 소수 종목에 집중됐을 수 있어요. 위 금액은 추적 종목의 합계이며, 시장 전체 거래나 보유 지분을 뜻하지 않아요.</p>
    </div>
  </Panel>;
}

const reasonLabels: Record<FocusReason, string> = { transition: "방향 전환", persistent: "여러 날 지속", unusual: "평소와 다른 거래", size: "거래대금 대비 5% 이상" };
function reasonText(stock: FocusStock, days: number) {
  const side = stock.net_amount > 0 ? "순매수" : "순매도";
  return stock.reasons.filter((r) => r !== "size").map((reason) => {
    if (reason === "transition") return `직전 ${money(stock.previous_amount)}에서 ${side}로 전환`;
    if (reason === "persistent") return `${days}일 중 ${stock.net_amount > 0 ? stock.buy_days : stock.sell_days}일 ${side}, 하루에 몰리지 않은 흐름`;
    return `기준일 ${side} 규모가 직전 60일 중 ${percent(stock.larger_than_pct)}의 날보다 큼`;
  }).join(" · ");
}

function FocusStocks({ data }: { data: FlowInsights }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [expanded, setExpanded] = useState(false);
  const rows = data.focus[side];
  return <Panel className="briefing-focus" title="어떤 종목에서 의미 있는 변화가 생겼나?" description="여러 근거가 함께 나타난 종목과, 주목한 이유를 확인하세요." action={<span className="market-card-icon"><ScanLine size={18} /></span>}>
    <div className="market-card-content">
      <div className="briefing-focus-toolbar"><SegmentedControl value={side} onChange={(value) => { setSide(value); setExpanded(false); }} options={[{ value: "buy", label: `매수 흐름 ${data.focus.buy_count}` }, { value: "sell", label: `매도 흐름 ${data.focus.sell_count}` }]} label="주목할 종목 방향" /><span>거래대금 대비 비율 순 · 상위 3종목 먼저</span></div>
      {rows.length ? <div className="briefing-focus-list">{(expanded ? rows : rows.slice(0, 3)).map((stock) => <article className="briefing-stock" key={stock.company_id}>
        <div className="briefing-stock-top"><Link to={`/company/${stock.company_id}`} className="market-stock-identity"><CompanyLogo company={{ id: stock.company_id, name: stock.name }} /><span><strong>{stock.name}</strong><small>{stock.sector_name}</small></span><ArrowRight size={14} /></Link><div className="briefing-reasons">{stock.reasons.map((reason) => <span key={reason}>{reasonLabels[reason]}</span>)}</div></div>
        <p className="briefing-stock-reason">{reasonText(stock, data.window_days)}</p>
        <dl className="briefing-stock-metrics"><div><dt>누적 {side === "buy" ? "순매수" : "순매도"}</dt><dd className={tone(stock.net_amount)}>{money(stock.net_amount)}</dd></div><div><dt>전체 거래대금 대비</dt><dd className={tone(stock.turnover_pct)}>{percent(stock.turnover_pct, true)}</dd></div><div><dt>{side === "buy" ? "순매수" : "순매도"}한 날</dt><dd>{side === "buy" ? stock.buy_days : stock.sell_days}<small> / {data.window_days}일</small></dd></div><div><dt>같은 기간 주가</dt><dd className={tone(stock.price_change)}>{percent(stock.price_change, true)}</dd></div></dl>
      </article>)}</div> : <EmptyState title="여러 근거가 겹치는 종목이 없습니다" description="단일 조건만 충족한 종목은 세부 지표에서 확인할 수 있어요." />}
      {rows.length > 3 && <button className="market-show-sectors briefing-more-stocks" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "상위 3종목만 보기" : "상위 5종목 모두 보기"}</button>}
      <details className="briefing-method"><summary>어떤 기준으로 골랐나요?</summary><p>비교 가능한 전체 {data.coverage_count}종목에서 아래 조건 중 2가지 이상을 충족한 종목을 골라, 기간 순매수·순매도 금액의 전체 거래대금 대비 비율 절댓값 순으로 표시해요. 거래대금이 없으면 뒤에 표시합니다.</p><ul><li>방향 전환: 직전 같은 기간과 누적 수급의 부호가 바뀜</li><li>여러 날 지속: 기간의 80% 이상 같은 방향, 같은 방향 금액 중 최대 하루 비중 50% 이하</li><li>평소와 다른 거래: 기준일 수급의 절댓값이 직전 60일의 95% 이상보다 크고, 기간 누적과 같은 방향</li><li>규모: 기간 누적 수급의 절댓값이 전체 거래대금의 5% 이상</li></ul><p>5%는 이 화면의 선별 기준이에요. 실제 주가에 미친 영향이나 향후 수익을 보장하는 기준은 아니에요.</p></details>
    </div>
  </Panel>;
}

function sectorStatus(s: SectorBriefing) {
  if (s.current_amount > 0 && s.previous_amount < 0) return "순매수로 전환";
  if (s.current_amount < 0 && s.previous_amount > 0) return "순매도로 전환";
  if (s.current_amount > 0) return s.change_amount > 0 ? "순매수 확대" : s.change_amount < 0 ? "순매수 축소" : "순매수 유지";
  if (s.current_amount < 0) return s.change_amount < 0 ? "순매도 확대" : s.change_amount > 0 ? "순매도 축소" : "순매도 유지";
  return "누적 수급 0";
}

function Sectors({ data }: { data: FlowInsights }) {
  const [expanded, setExpanded] = useState(false);
  const improving = data.sector_flows.filter((s) => s.change_amount > 0).sort((a, b) => b.change_amount - a.change_amount);
  const weakening = data.sector_flows.filter((s) => s.change_amount < 0).sort((a, b) => a.change_amount - b.change_amount);
  const unchanged = data.sector_flows.filter((s) => s.change_amount === 0);
  const group = (title: string, rows: SectorBriefing[]) => <div><h3>{title}</h3>{rows.length ? (expanded ? rows : rows.slice(0, 3)).map((s) => <div className="briefing-sector" key={s.sector_name}><div><strong>{s.sector_name}</strong><span className={tone(s.change_amount)}>{money(s.change_amount)}<small> 변화</small></span></div><p>{sectorStatus(s)}<span>직전 {money(s.previous_amount)} → 최근 {money(s.current_amount)}</span></p><div className="briefing-sector-spread"><span>순매수 {s.buy_count}/{s.company_count}종목</span><div role="img" aria-label={`${s.sector_name} 순매수 ${s.buy_count}, 순매도 ${s.sell_count}, 전체 ${s.company_count}종목`}><i className="flow-buy" style={{ width: `${s.buy_count / s.company_count * 100}%` }} /><i className="flow-sell" style={{ width: `${s.sell_count / s.company_count * 100}%` }} /></div></div></div>) : <p className="briefing-footnote">해당하는 업종이 없습니다.</p>}</div>;
  return <Panel title="관심이 어느 업종으로 이동하고 있나?" description={`직전 ${data.window_days}거래일과 비교한 변화 · 변화가 큰 업종부터`} action={<span className="market-card-icon"><Layers size={18} /></span>}>
    <div className="market-card-content"><p className="briefing-explanation">업종별 합계와 순매수한 종목 수를 함께 보세요. 금액이 늘어도 일부 종목만 샀을 수 있어요. ‘순매수 쪽 변화’에는 순매도가 줄어든 경우도 포함돼요.</p><div className="briefing-sector-columns">{group("순매수 쪽으로 변화", improving)}{group("순매도 쪽으로 변화", weakening)}</div>{expanded && unchanged.length > 0 && <div className="briefing-sector-unchanged">{group("금액 변화 없음", unchanged)}</div>}{data.sector_flows.length > 0 ? <button className="market-show-sectors" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "주요 업종만 보기" : `${data.sector_flows.length}개 업종 전체 보기`}</button> : <EmptyState title="업종을 비교할 기록이 부족합니다" description="최근과 직전 두 기간의 기록이 필요합니다." />}<p className="briefing-footnote">현재 업종 분류로 과거 수급을 묶은 결과예요. 같은 {data.coverage_count}종목으로 두 기간을 비교하며, 업종 간에 자금이 직접 이동했음을 뜻하지 않아요.</p></div>
  </Panel>;
}

export function DashboardBriefing({ data }: { data: FlowInsights }) {
  return <div className="dashboard-briefing"><Overview data={data} /><FocusStocks key={data.window_days} data={data} /><Sectors key={`sectors-${data.window_days}`} data={data} /></div>;
}
