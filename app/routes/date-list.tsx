import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
} from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/date-list";
import { useDateListData } from "~/hooks/useDateListData";
import { formatCompactAmount, formatDateWithWeekday } from "~/lib/format";
import Month from "~/components/dashboard/day/month";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  Money,
  PageHeading,
  Panel,
} from "~/components/dashboard/shared";
export function meta({}: Route.MetaArgs) {
  return [{ title: "거래 캘린더 · NPS today" }];
}
export default function DateListRoute() {
  const { availableDates, dailyTotals, loading, error } = useDateListData();
  const months = useMemo(
    () =>
      [...new Set(availableDates.map((date) => date.slice(0, 6)))].sort(
        (a, b) => b.localeCompare(a),
      ),
    [availableDates],
  );
  const [selected, setSelected] = useState("");
  const month = selected || months[0] || "";
  const index = months.indexOf(month);
  const dates = availableDates
    .filter((date) => date.startsWith(month))
    .sort((a, b) => b.localeCompare(a));
  const net = dates.reduce((sum, date) => sum + (dailyTotals[date] || 0), 0);
  const buyDays = dates.filter((date) => dailyTotals[date] > 0).length;
  const sellDays = dates.filter((date) => dailyTotals[date] < 0).length;
  const title = `${month.slice(0, 4)}년 ${Number(month.slice(4))}월`;
  return (
    <main className="dashboard-page">
      <PageHeading
        eyebrow="THE MARKET, DAY BY DAY"
        title="매일의 수급을 펼쳐보세요"
        description="달력에서 자금의 흐름을 보고, 궁금한 날짜를 선택하세요."
        actions={
          months.length > 0 ? (
            <select
              className="select-field"
              value={month}
              aria-label="조회 연월 선택"
              onChange={(event) => setSelected(event.target.value)}
            >
              {months.map((value) => (
                <option key={value} value={value}>
                  {value.slice(0, 4)}년 {Number(value.slice(4))}월
                </option>
              ))}
            </select>
          ) : undefined
        }
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : !months.length ? (
        <div className="panel">
          <EmptyState title="아직 거래일 데이터가 없습니다" />
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <MetricCard
              featured
              label="월간 순매수 합계"
              value={formatCompactAmount(net)}
              detail={`${title} · ${dates.length}거래일 기준`}
              icon={<ChartNoAxesCombined size={16} />}
            />
            <MetricCard
              label="매수 우위 거래일"
              value={
                <>
                  {buyDays}
                  <span className="metric-unit">일</span>
                </>
              }
              detail="전체 순매수 금액이 양수인 날"
              icon={<ArrowUpRight size={16} />}
            />
            <MetricCard
              label="매도 우위 거래일"
              value={
                <>
                  {sellDays}
                  <span className="metric-unit">일</span>
                </>
              }
              detail="전체 순매수 금액이 음수인 날"
              icon={<ArrowDownLeft size={16} />}
            />
            <MetricCard
              label="수집된 거래일"
              value={
                <>
                  {dates.length}
                  <span className="metric-unit">일</span>
                </>
              }
              detail="선택한 달에 거래 내역이 있는 날"
              icon={<CalendarDays size={16} />}
            />
          </div>
          <div className="calendar-layout">
            <Panel
              title={title}
              description="날짜를 선택하면 일별 상세 분석으로 이동합니다."
              action={
                <div className="date-controls">
                  <button
                    className="icon-button"
                    aria-label="이전 데이터 월"
                    disabled={index + 1 >= months.length}
                    onClick={() => setSelected(months[index + 1])}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="다음 데이터 월"
                    disabled={index <= 0}
                    onClick={() => setSelected(months[index - 1])}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              }
            >
              <Month
                year={month.slice(0, 4)}
                month={month.slice(4)}
                dates={dates}
                dailyTotals={dailyTotals}
                maxAbsAmount={1}
              />
              <div className="calendar-legend">
                <span>
                  <i className="legend-dot" /> 순매수
                </span>
                <span>
                  <i className="legend-dot sell" /> 순매도
                </span>
                <span>숫자는 해당일의 순매수 금액입니다.</span>
              </div>
            </Panel>
            <Panel
              title="이달의 거래일"
              description={`${dates.length}거래일 · 최근 날짜순`}
            >
              <div className="trading-date-list">
                {dates.map((date) => (
                  <Link key={date} to={`/date/${date}`}>
                    <span>
                      {formatDateWithWeekday(date).replace(
                        `${month.slice(0, 4)}년 `,
                        "",
                      )}
                    </span>
                    <Money amount={dailyTotals[date] || 0} />
                    <ChevronRight size={12} />
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
          <div className="data-note">
            <CircleHelp size={12} />
            <span>
              색상이 없는 날짜는 휴장일 또는 미수집일입니다. 보합인 날은
              회색으로 표시됩니다.
            </span>
          </div>
        </>
      )}
    </main>
  );
}
