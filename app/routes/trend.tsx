import { useState } from "react";
import { Flame, Layers, CircleHelp } from "lucide-react";
import type { Route } from "./+types/trend";
import { useTrendData } from "~/hooks/useTrendData";
import { useVolumeTrendData } from "~/hooks/useVolumeTrendData";
import { StreakTrendGrid } from "~/components/dashboard/trend/StreakTrendGrid";
import { VolumeTrendGrid } from "~/components/dashboard/trend/VolumeTrendGrid";
import {
  ErrorState,
  PageHeading,
  SegmentedControl,
} from "~/components/dashboard/shared";
export function meta({}: Route.MetaArgs) {
  return [{ title: "수급 트렌드 · NPS today" }];
}
export default function TrendRoute() {
  const [tab, setTab] = useState("streak");
  const [days, setDays] = useState(5);
  const [volumeDays, setVolumeDays] = useState(30);
  const { buyers, sellers, loading, error } = useTrendData(days);
  const { topBuyers, topSellers, loadingVolume, errorVolume } =
    useVolumeTrendData(volumeDays);
  return (
    <main className="dashboard-page">
      <PageHeading
        eyebrow="FOLLOW THE FLOW"
        title="꾸준한 움직임에는 이유가 있죠"
        description="연속 매매와 누적 금액으로 수급의 방향을 살펴보세요."
      />
      <div className="trend-tabs" role="group" aria-label="트렌드 분석 방식">
        <button
          aria-pressed={tab === "streak"}
          onClick={() => setTab("streak")}
        >
          <Flame size={17} /> 연속 매매<span>매일 같은 방향으로</span>
        </button>
        <button
          aria-pressed={tab === "volume"}
          onClick={() => setTab("volume")}
        >
          <Layers size={17} /> 누적 수급<span>기간 동안 얼마나</span>
        </button>
      </div>
      <div className="explore-toolbar">
        <div>
          <h2 className="section-title">
            {tab === "streak"
              ? "꾸준히 사고, 꾸준히 파는 종목"
              : "큰 자금이 움직인 종목"}
          </h2>
          <p className="section-description">
            {tab === "streak"
              ? "선택한 거래일마다 순매수·순매도가 이어진 종목입니다."
              : "기간 내 순매수 금액을 모두 합산해 비교합니다."}
          </p>
        </div>
        {tab === "streak" ? (
          <SegmentedControl
            value={days}
            onChange={setDays}
            options={[3, 5, 10].map((value) => ({
              value,
              label: `${value}거래일`,
            }))}
            label="연속 매매 기간"
          />
        ) : (
          <SegmentedControl
            value={volumeDays}
            onChange={setVolumeDays}
            options={[5, 20, 30, 60].map((value) => ({
              value,
              label: `${value}거래일`,
            }))}
            label="누적 수급 기간"
          />
        )}
      </div>
      {tab === "streak" ? (
        error ? (
          <ErrorState message={error} />
        ) : (
          <StreakTrendGrid
            buyers={buyers}
            sellers={sellers}
            loading={loading}
            days={days}
          />
        )
      ) : errorVolume ? (
        <ErrorState message={errorVolume} />
      ) : (
        <VolumeTrendGrid
          topBuyers={topBuyers}
          topSellers={topSellers}
          loadingVolume={loadingVolume}
          volumeDays={volumeDays}
        />
      )}
      <div className="data-note">
        <CircleHelp size={12} />
        <span>
          연속 매매는 해당 거래일 모두에 기록이 있는 종목을 기준으로 합니다.
          누적 수급은 순매수와 순매도를 상계한 금액입니다.
        </span>
      </div>
    </main>
  );
}
