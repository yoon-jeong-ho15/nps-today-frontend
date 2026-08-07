import type { Route } from "./+types/trend";
import { TrendingUp } from "lucide-react";
import { StreakTrendGrid } from "~/components/dashboard/trend/StreakTrendGrid";
import { VolumeTrendGrid } from "~/components/dashboard/trend/VolumeTrendGrid";
import { useTrendData } from "~/hooks/useTrendData";
import { useVolumeTrendData } from "~/hooks/useVolumeTrendData";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS Today - 시장 트렌드" },
    { name: "description", content: "국민연금공단의 최근 연속 순매수 및 순매도 종목 트렌드를 확인하세요." },
  ];
}

export default function TrendRoute() {
  const days = 5;
  const volumeDays = 30;
  const { buyers, sellers, loading, error } = useTrendData(days);
  const { topBuyers, topSellers, loadingVolume, errorVolume } = useVolumeTrendData(volumeDays);

  if (error || errorVolume) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col pt-12">
        <div className="max-w-md mx-auto text-center bg-card border border-border p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-bold text-foreground mb-2">오류 발생</h3>
          <p className="text-muted-foreground text-sm mb-4">{error || errorVolume}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col transition-colors duration-300">
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
                시장 트렌드
              </h1>
              <p className="text-muted-foreground mt-1">
                최근 {days}거래일 연속 순매수/순매도 종목을 확인하세요.
              </p>
            </div>
          </div>

          {/* Continuous Streak Trend Grid */}
          <StreakTrendGrid
            buyers={buyers}
            sellers={sellers}
            loading={loading}
            days={days}
          />

          {/* Volume Trend Grid */}
          <VolumeTrendGrid
            topBuyers={topBuyers}
            topSellers={topSellers}
            loadingVolume={loadingVolume}
            volumeDays={volumeDays}
          />
        </div>
      </main>
    </div>
  );
}
