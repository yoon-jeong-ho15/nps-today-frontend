import type { Route } from "./+types/company-list";
import { Link } from "react-router";
import { Search, X } from "lucide-react";
import { useCompanyListData } from "~/hooks/useCompanyListData";
import { CompanyCard } from "~/components/dashboard/company/CompanyCard";

export function meta({ }: Route.MetaArgs) {
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Search Bar & Stats Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="기업명 또는 종목코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="검색어 초기화"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-xs font-medium text-muted-foreground self-end sm:self-center">
            총 <span className="text-emerald-600 dark:text-emerald-400 font-bold">{filteredCompanies.length}</span>개 종목
          </div>
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
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl mt-2">
            검색 결과가 없습니다.
          </div>
        ) : (
          <section className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs transition-colors">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
              {filteredCompanies.map((c) => (
                <CompanyCard key={c.id} company={c} layout="dense" hoverColor="emerald" />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
