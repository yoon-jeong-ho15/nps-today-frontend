import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { CompanyLogo } from "~/components/dashboard/company/CompanyLogo";
import { useCompanyListData } from "~/hooks/useCompanyListData";
import { FEATURED_COMPANIES } from "./constants";

export function LandingPopularStocks() {
  const { filteredCompanies } = useCompanyListData();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            주요 관심 종목 바로가기
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            국민연금 수급 관심도가 높은 코스피 대표 종목들입니다.
          </p>
        </div>
        <Link
          to="/company"
          className="text-xs sm:text-sm font-semibold text-foreground hover:text-amber-500 flex items-center gap-1 transition-colors"
        >
          <span>전체 {filteredCompanies.length || 800}+ 종목 보기</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {FEATURED_COMPANIES.map((c) => (
          <Link
            key={c.id}
            to={`/company/${c.id}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 hover:border-amber-500/40 hover:bg-amber-500/[0.03] transition-all duration-200 group shadow-2xs hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center shrink-0 group-hover:border-amber-500/40 transition-colors">
              <CompanyLogo company={c} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate transition-colors">
                {c.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-mono">{c.id}</span>
                <span>•</span>
                <span className="truncate">{c.tag}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
