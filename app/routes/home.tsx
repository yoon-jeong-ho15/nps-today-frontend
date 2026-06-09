import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Calendar, Building2, TrendingUp, ChevronRight } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NPS today - 국민연금 코스피 거래 동향" },
    {
      name: "description",
      content:
        "국민연금공단(NPS)의 코스피 주식 거래 동향 및 기업별 매매 분석 대시보드",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30 font-sans antialiased flex flex-col transition-colors duration-300">
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="animate-fade-in flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-none mb-6">
            오늘의{" "}
            <span className="bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
              국민연금
            </span>{" "}
            동향
          </h1>
          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mb-12 leading-relaxed">
            국민연금공단(NPS)의 코스피 시장 일별 매수/매도 규모를 파악하고,{" "}
            <br className="hidden sm:inline" />
            개별 기업에 대한 국민연금의 실시간 누적 매매 추이를 한눈에 분석해
            보세요.
          </p>
        </div>
      </main>
    </div>
  );
}
