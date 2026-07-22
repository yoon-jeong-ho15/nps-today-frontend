import type { Route } from "./+types/company-list";
import { Link } from "react-router";
import { Search, ChevronRight } from "lucide-react";
import { useCompanyListData } from "~/hooks/useCompanyListData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NPS Today - 기업 목록" },
    { name: "description", content: "국민연금공단(NPS) 거래 데이터를 확인할 수 있는 코스피 상장 기업 목록입니다." },
  ];
}

export default function CompanyListRoute() {
  const {
    filteredCompanies,
    searchTerm,
    setSearchTerm,
    loading,
    error,
  } = useCompanyListData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">기업 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 font-sans antialiased flex flex-col transition-colors duration-300">
      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="기업명 또는 종목코드 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 shadow-xs transition-all duration-200"
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-3.5" />
        </div>

        {error ? (
          <div className="max-w-md mx-auto text-center bg-card border border-border p-6 rounded-2xl shadow-md mt-6">
            <h3 className="text-lg font-bold text-foreground mb-2">오류 발생</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-3xl mt-6">
            검색 결과가 없습니다.
          </div>
        ) : (
          <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm transition-colors mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCompanies.map((c) => (
                <Link
                  key={c.id}
                  to={`/company/${c.id}`}
                  className="group flex items-center justify-between bg-background hover:bg-emerald-500/5 border border-border hover:border-emerald-500/35 rounded-2xl px-5 py-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {c.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {c.id}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
