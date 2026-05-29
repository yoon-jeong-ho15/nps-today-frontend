import { ThemeToggle } from "~/components/theme-toggle";

export default function Header() {
    return (
        <header className="bg-card/70 border-b-2 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 transition-colors">
            <div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25 rounded-full text-xs font-semibold tracking-wider">
                        NPS Today
                    </span>
                </div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-3">
                    오늘의 국민연금
                </h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                    국민연금공단(NPS)의 코스피 시장 일별 매수 및 매도 금액/수량 변화 추이를 분석합니다.
                </p>
            </div>
            <div className="flex items-center justify-end">
                <ThemeToggle />
            </div>
        </header>
    )
}