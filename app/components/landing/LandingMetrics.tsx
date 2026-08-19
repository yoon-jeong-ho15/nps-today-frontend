import { Coins, Building2, Clock, Activity } from "lucide-react";

export function LandingMetrics() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs sm:text-sm font-medium">국민연금 기금 규모</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            1,100조+ 원
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            세계 3대 연기금 운용 자산
          </p>
        </div>
      </div>

      <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs sm:text-sm font-medium">코스피 추적 종목</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            200+ 종목
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            국민연금 거래 데이터 완벽 수집
          </p>
        </div>
      </div>

      <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-blue-500/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs sm:text-sm font-medium">장마감 매일 업데이트</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Daily D+0
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            한국거래소(KRX) 공식 공시 기준
          </p>
        </div>
      </div>

      <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-purple-500/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs sm:text-sm font-medium">연속 매집 트렌드</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Streak 레이더
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            5일·30일 다차원 수급 이상 징후
          </p>
        </div>
      </div>
    </section>
  );
}
