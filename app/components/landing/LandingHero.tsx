import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  TrendingUp,
  Calendar,
  Building2,
  Search,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronRight,
  X,
} from "lucide-react";
import { useCompanyListData } from "~/hooks/useCompanyListData";
import { CompanyLogo } from "~/components/dashboard/company/CompanyLogo";
import { FEATURED_COMPANIES } from "./constants";

export function LandingHero() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load company list for autocomplete search
  const { filteredCompanies, loading, error } = useCompanyListData();

  // Filter top matches for hero search dropdown
  const searchResults = useMemo(() => {
    const term = searchInput.toLowerCase().trim();
    if (!term) return [];
    return filteredCompanies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term)
      )
      .slice(0, 6);
  }, [searchInput, filteredCompanies]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCompany = (companyId: string) => {
    navigate(`/company/${companyId}`);
    setSearchInput("");
    setIsSearchFocused(false);
  };

  return (
    <section className="flex flex-col items-center text-center pt-4 sm:pt-10">
      {/* Top Live Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-xs animate-fade-in">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>국민연금 코스피 실시간 수급 인텔리전스</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      </div>

      {/* Main Hero Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-6 max-w-5xl">
        1,000조 기금의 나침반,
        <br />
        <span className="bg-linear-to-r from-amber-500 via-yellow-500 to-emerald-500 bg-clip-text text-transparent">
          국민연금 수급 트렌드
        </span>
        를 한눈에
      </h1>

      {/* Subheading */}
      <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-3xl mb-10 leading-relaxed font-normal">
        대한민국 최대 기관투자자 국민연금(NPS)의 코스피 일별 순매수·순매도 동향,
        <br className="hidden sm:inline" />
        연속 매집(Streak) 주도주 및 개별 기업 누적 거래를 직관적으로 분석하세요.
      </p>

      {/* Interactive Hero Search Bar */}
      <div
        ref={searchContainerRef}
        className="w-full max-w-2xl relative mb-6 z-30 text-left"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-emerald-500 rounded-2xl blur-sm opacity-25 group-hover:opacity-60 transition duration-300"></div>
          <div className="relative flex items-center bg-card border border-border/80 rounded-2xl shadow-lg p-1.5 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <div className="pl-4 pr-2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="기업명 또는 종목코드 검색 (예: 삼성전자, 005930, SK하이닉스)"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="flex-1 bg-transparent border-0 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                aria-label="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (searchResults.length > 0) {
                  handleSelectCompany(searchResults[0].id);
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <span>분석하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchInput.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2.5 border-b border-border/50 text-xs font-semibold text-muted-foreground bg-muted/30 flex justify-between items-center">
              <span>검색 결과 ({searchResults.length})</span>
              <span>클릭 시 기업 분석으로 이동</span>
            </div>
            {loading || error ? (
              <div role={error ? "alert" : "status"} className="p-6 text-center text-sm text-muted-foreground">
                {error || "기업 목록을 불러오는 중입니다."}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                검색된 코스피 상장사가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
                {searchResults.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => handleSelectCompany(company.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/60 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CompanyLogo company={company} />
                      <div>
                        <div className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {company.name}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {company.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      <span>상세보기</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Filter Tag Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mb-10">
        <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          인기 종목:
        </span>
        {FEATURED_COMPANIES.slice(0, 6).map((c) => (
          <Link
            key={c.id}
            to={`/company/${c.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 hover:border-amber-500/50 hover:bg-amber-500/5 text-xs font-medium text-foreground transition-all duration-200 shadow-2xs hover:shadow-xs group"
          >
            <span>{c.name}</span>
            <span className="text-[10px] text-muted-foreground/70 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-mono">
              {c.id}
            </span>
          </Link>
        ))}
      </div>

      {/* Primary Action Button Row */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/trend"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-semibold text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <TrendingUp className="w-5 h-5" />
          <span>연속 매매 트렌드 탐색</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/date"
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-card hover:bg-muted/70 border border-border text-foreground font-semibold text-base shadow-xs hover:border-foreground/20 transition-all duration-200"
        >
          <Calendar className="w-5 h-5 text-yellow-500" />
          <span>일별 거래 캘린더</span>
        </Link>

        <Link
          to="/company"
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-card hover:bg-muted/70 border border-border text-foreground font-semibold text-base shadow-xs hover:border-foreground/20 transition-all duration-200"
        >
          <Building2 className="w-5 h-5 text-emerald-500" />
          <span>전체 기업 목록</span>
        </Link>
      </div>
    </section>
  );
}
