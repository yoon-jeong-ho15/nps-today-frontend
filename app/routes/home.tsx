import type { Route } from "./+types/home";
import { StockChartBackground } from "~/components/ui/stock-chart-background";
import {
  LandingHero,
  LandingMetrics,
  LandingMarketPulse,
  LandingBentoFeatures,
  LandingWhyNps,
  LandingPopularStocks,
  LandingCtaBanner,
} from "~/components/landing";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NPS Today - 국민연금 코스피 거래 동향 및 수급 인텔리전스" },
    {
      name: "description",
      content:
        "대한민국 최대 기관투자자 국민연금공단(NPS)의 코스피 실시간 순매수/순매도 동향, 연속 매집 트렌드, 종목별 누적 거래 분석 대시보드",
    },
  ];
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased overflow-hidden transition-colors duration-300">
      {/* Background Decorator: Glowing Ambient Orbs & Financial Grid */}
      <StockChartBackground />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-20 sm:gap-28">
        {/* 1. Hero with search autocomplete & quick actions */}
        <LandingHero />

        {/* 2. Key scale & reliability metrics */}
        <LandingMetrics />

        {/* 3. Live 5-day continuous streak buyers & sellers */}
        <LandingMarketPulse />

        {/* 4. 3 Core Feature Bento Cards */}
        <LandingBentoFeatures />

        {/* 5. Value Proposition: Why Track NPS */}
        <LandingWhyNps />

        {/* 6. Popular stocks quick directory */}
        <LandingPopularStocks />

        {/* 7. Bottom high-converting CTA Banner */}
        <LandingCtaBanner />
      </main>
    </div>
  );
}
