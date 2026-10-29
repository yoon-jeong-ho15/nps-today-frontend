import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Command,
  LayoutDashboard,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./SearchDialog";

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "수급 트렌드", href: "/trend", icon: TrendingUp },
  { name: "거래 캘린더", href: "/date", icon: CalendarDays },
  { name: "종목 탐색", href: "/company", icon: BarChart3 },
];
export default function Header() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const current = navigation.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;
      if (
        element.matches("input, textarea, select") ||
        element.isContentEditable
      )
        return;
      if (
        event.key === "/" ||
        ((event.metaKey || event.ctrlKey) && event.key === "k")
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <BarChart3 size={21} strokeWidth={2.4} />
          </span>
          <span>
            NPS<span className="brand-light"> today</span>
            <small>오늘의 수급, 내일의 인사이트</small>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="주 메뉴">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={19} />
              <span>{item.name}</span>
              <ChevronRight size={14} />
            </NavLink>
          ))}
        </nav>
        <div className="nav-divider" />
        <div className="nav-label">MY SPACE</div>
        <Link to="/company?view=watchlist" className="nav-item">
          <Star size={18} />
          <span>관심 종목</span>
        </Link>
        <div className="sidebar-bottom">
          <div className="guide-card">
            <span className="guide-icon">
              <TrendingUp size={19} />
            </span>
            <h3>숫자 너머의 흐름을 읽다</h3>
            <p>
              연속 매매와 누적 수급으로
              <br />
              시장의 움직임을 살펴보세요.
            </p>
            <Link to="/trend">
              트렌드 살펴보기 <ArrowUpRight size={14} />
            </Link>
          </div>
          <details className="help-details">
            <summary>
              <CircleHelp size={17} /> 데이터 이용 안내
            </summary>
            <p>
              거래일별로 수집한 기금 수급 데이터입니다. 실시간 시세가 아니며,
              투자 판단의 참고 자료로 활용해주세요. 관심 종목은 현재 브라우저에
              저장됩니다.
            </p>
          </details>
          <div className="sidebar-caption">
            <span className="status-dot" /> KOREA EQUITY DATA
          </div>
        </div>
      </aside>
      <header className="topbar">
        <div className="breadcrumb">
          <span className="mobile-brand">
            <BarChart3 size={19} />
          </span>
          <span className="breadcrumb-workspace">워크스페이스</span>
          <ChevronRight size={13} className="breadcrumb-workspace" />
          <strong>{current?.name || "페이지 안내"}</strong>
          {pathname.split("/").filter(Boolean).length > 1 && (
            <>
              <ChevronRight size={13} />
              <span>상세 분석</span>
            </>
          )}
        </div>
        <div className="topbar-actions">
          <button
            className="global-search"
            aria-label="종목 검색 열기"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            <span>어떤 종목이 궁금하세요?</span>
            <kbd>
              <Command size={10} /> K
            </kbd>
          </button>
          <ThemeToggle />
          <span className="workspace-avatar" title="개인 워크스페이스">
            N
          </span>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="모바일 메뉴">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
