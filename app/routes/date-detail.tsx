import { useMemo } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/date-detail";
import { useDateDetailData } from "~/hooks/useDateDetailData";
import { useTradingDates } from "~/hooks/useTradingDates";
import { formatDateWithWeekday, shortDate } from "~/lib/format";
import { DayMetricsGrid } from "~/components/dashboard/day/DayMetricsGrid";
import { DayTopTrades } from "~/components/dashboard/day/DayTopTrades";
import { DayRecordsTable } from "~/components/dashboard/day/DayRecordsTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from "~/components/dashboard/shared";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${shortDate(params.date || "")} 일별 수급 · NPS today` }];
}
export default function DateDetailRoute() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { data, companies, selectedDate, initialLoading, dataLoading, error } =
    useDateDetailData(date);
  const { dates } = useTradingDates();
  const older = dates.find((day) => day < selectedDate);
  const newer = dates.filter((day) => day > selectedDate).at(-1);
  const records = useMemo(() => {
    const names = new Map(
      companies.map((company) => [company.id, company.name]),
    );
    return data
      .filter((row) => row.date === selectedDate)
      .map((row) => ({
        ...row,
        company_name: names.get(row.company_id) || row.company_id,
      }));
  }, [data, companies, selectedDate]);
  const metrics = useMemo(() => {
    let totalBuyAmount = 0,
      totalSellAmount = 0,
      buyCount = 0,
      sellCount = 0;
    records.forEach((row) => {
      if (row.amount > 0) {
        totalBuyAmount += row.amount;
        buyCount++;
      } else if (row.amount < 0) {
        totalSellAmount += row.amount;
        sellCount++;
      }
    });
    return {
      totalBuyAmount,
      totalSellAmount,
      buyCount,
      sellCount,
      netAmount: totalBuyAmount + totalSellAmount,
    };
  }, [records]);
  return (
    <main className="dashboard-page">
      <Link className="back-link" to="/date">
        <ArrowLeft size={14} /> 거래 캘린더로 돌아가기
      </Link>
      <PageHeading
        eyebrow="DAILY FLOW"
        title={formatDateWithWeekday(selectedDate)}
        description="이날의 매수·매도 흐름과 주요 종목을 살펴보세요."
        actions={
          <div className="date-controls">
            <button
              className="icon-button"
              aria-label="이전 거래일"
              disabled={!older}
              onClick={() => navigate(`/date/${older}`)}
            >
              <ChevronLeft size={17} />
            </button>
            <input
              type="date"
              className="date-input"
              aria-label="거래일 선택"
              value={`${selectedDate.slice(0, 4)}-${selectedDate.slice(4, 6)}-${selectedDate.slice(6, 8)}`}
              onChange={(event) => {
                if (event.target.value)
                  navigate(`/date/${event.target.value.replaceAll("-", "")}`);
              }}
            />
            <button
              className="icon-button"
              aria-label="다음 거래일"
              disabled={!newer}
              onClick={() => navigate(`/date/${newer}`)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        }
      />
      {initialLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {dataLoading && (
            <div className="refresh-indicator" role="status">
              <RefreshCw size={13} /> 거래일 데이터를 불러오는 중...
            </div>
          )}
          <div
            className={`detail-content ${dataLoading ? "is-refreshing" : ""}`}
            aria-busy={dataLoading}
          >
            {!records.length ? (
              <div className="panel">
                <EmptyState
                  title="이 날짜에는 수집된 거래가 없어요"
                  description="휴장일이거나 아직 수집 전일 수 있습니다. 이전·다음 거래일을 선택해보세요."
                />
              </div>
            ) : (
              <>
                <DayMetricsGrid metrics={metrics} />
                <DayTopTrades selectedRecords={records} />
                <DayRecordsTable selectedRecords={records} />
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
