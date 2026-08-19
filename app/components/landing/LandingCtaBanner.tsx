import { Link } from "react-router";
import { Zap, ArrowRight } from "lucide-react";

export function LandingCtaBanner() {
  return (
    <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 text-center border border-amber-500/30 bg-linear-to-b from-amber-500/10 via-card to-background shadow-xl">
      {/* Ambient Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
          <Zap className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
          오늘 국민연금이 사들인 종목은?
        </h2>

        <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
          지금 바로 시장 트렌드와 일별 캘린더에서 스마트 머니의 움직임을 확인해보세요.
          모든 데이터는 무료로 제공됩니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/trend"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>트렌드 대시보드 시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/date"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-card hover:bg-muted/80 border border-border text-foreground font-semibold text-base transition-all duration-200"
          >
            <span>거래일 캘린더 보기</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
