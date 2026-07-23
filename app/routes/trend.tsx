import type { Route } from "./+types/trend";
import TrendDashboard from "~/components/dashboard/trend/trend";
import { useTrendData } from "~/hooks/useTrendData";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS Today - 시장 트렌드" },
    { name: "description", content: "국민연금공단의 최근 연속 순매수 및 순매도 종목 트렌드를 확인하세요." },
  ];
}

export default function TrendRoute() {
  const days = 5;
  const { buyers, sellers, loading, error } = useTrendData(days);

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col pt-12">
        <div className="max-w-md mx-auto text-center bg-card border border-border p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-bold text-foreground mb-2">오류 발생</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
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
        <TrendDashboard
          buyers={buyers}
          sellers={sellers}
          loading={loading}
          days={days}
        />
      </main>
    </div>
  );
}
