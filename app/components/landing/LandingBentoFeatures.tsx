import { Link } from "react-router";
import { TrendingUp, Calendar, Building2, ChevronRight } from "lucide-react";

export function LandingBentoFeatures() {
  return (
    <section className="flex flex-col gap-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
          핵심 기능 둘러보기
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          투자 결정을 돕는 3가지 차별화된 수급 뷰
        </p>
        <p className="text-muted-foreground text-sm sm:text-base mt-3">
          단순한 거래 표를 넘어, 투자자가 즉각적으로 행동할 수 있는 인사이트로 가공합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Card 1: Trend Radar */}
        <Link
          to="/trend"
          className="group relative bg-card hover:bg-muted/30 border border-border hover:border-blue-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
              스마트 머니 트랙
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              연속 매매 & 대량 수급 트렌드
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              최근 5일 연속 순매수·순매도 종목과 30일 누적 거래량 상위 종목을 실시간 랭킹으로 감지하여 주도주를 포착합니다.
            </p>
          </div>

          {/* Visual Mini Mockup */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-3.5 space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground">SK하이닉스</span>
              <span className="text-emerald-500 font-bold">5일 연속 순매수</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-4/5" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>누적 거래대금</span>
              <span className="font-mono font-semibold">+1,420 억원</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <span>트렌드 레이더 바로가기</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Bento Card 2: Date Flow Calendar */}
        <Link
          to="/date"
          className="group relative bg-card hover:bg-muted/30 border border-border hover:border-yellow-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 mb-3">
              마켓 플로우
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-2">
              일별 거래 히트맵 & 캘린더
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              월별 캘린더 히트맵을 통해 날짜별 코스피 전체 순매수 총액 규모를 확인하고 특정일의 기관 수급을 역추적합니다.
            </p>
          </div>

          {/* Visual Mini Mockup */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-3.5 mb-6">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1.5">
              <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <div className="h-6 rounded-md bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">+</div>
              <div className="h-6 rounded-md bg-emerald-500/60 border border-emerald-500/70 flex items-center justify-center text-[10px] font-bold text-white">++</div>
              <div className="h-6 rounded-md bg-rose-500/30 border border-rose-500/40 flex items-center justify-center text-[10px] font-bold text-rose-700 dark:text-rose-300">-</div>
              <div className="h-6 rounded-md bg-emerald-500/80 border border-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">+++</div>
              <div className="h-6 rounded-md bg-emerald-500/40 border border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">+</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
            <span>거래일 캘린더 바로가기</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Bento Card 3: Deep-dive Stock Analysis */}
        <Link
          to="/company"
          className="group relative bg-card hover:bg-muted/30 border border-border hover:border-green-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-3">
              종목 심층 데이터
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2">
              기업별 30일 누적 거래 추이
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              개별 상장사의 일별 매매 수량 및 금액, 매수 비중 비율, 30거래일 누적 축적 그래프를 정밀하게 분석합니다.
            </p>
          </div>

          {/* Visual Mini Mockup */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-3.5 space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">30일 매수 비율</span>
              <span className="font-bold text-emerald-500">76.4%</span>
            </div>
            <div className="h-2 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "76.4%" }}></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
              <span>누적 순매수 수량</span>
              <span className="font-mono font-semibold text-foreground">+2,340,000 주</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
            <span>기업 목록 검색하기</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  );
}
