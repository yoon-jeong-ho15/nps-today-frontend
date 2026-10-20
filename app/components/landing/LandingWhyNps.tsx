export function LandingWhyNps() {
  return (
    <section className="bg-linear-to-b from-card to-card/60 border border-border/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
      <div className="max-w-3xl mb-10">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
          왜 국민연금 수급인가?
        </h2>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          시장의 최대 큰손이 보내는 펀더멘털 시그널
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          개인 투자자가 간과하기 쉬운 장기 기관 자금의 유입 흐름은 확실한 투자 기준점이 됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-background/70 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
            01
          </div>
          <h4 className="text-base font-bold text-foreground">
            변동성 시장의 하방 지지선
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            국민연금의 지속적인 순매수는 주가 조정 시 강력한 하방 경직성을 확보해주며 밸류에이션 매력을 증명합니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-background/70 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
            02
          </div>
          <h4 className="text-base font-bold text-foreground">
            중장기 리밸런싱 포착
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            단기 단타 매매가 아닌 포트폴리오 차원의 구조적 비중 확대 종목을 5일·30일 연속 지표로 명확하게 확인합니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-background/70 border border-border/60">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
            03
          </div>
          <h4 className="text-base font-bold text-foreground">
            정제된 신뢰 데이터
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            증권사별 흩어진 공시 데이터를 하나로 통합하여 코스피 전 종목의 거래량 및 거래대금을 일관된 형식으로 제공합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
