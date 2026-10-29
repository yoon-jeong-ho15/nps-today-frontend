import { useEffect, useRef } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCompanyListData } from "~/hooks/useCompanyListData";
import { CompanyLogo } from "./dashboard/company/CompanyLogo";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const { filteredCompanies, searchTerm, setSearchTerm, loading, error } =
    useCompanyListData();
  const results = filteredCompanies.slice(0, 7);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="search-dialog"
      aria-labelledby="search-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="search-dialog-input">
        <Search size={21} />
        <input
          autoFocus
          aria-label="종목 검색"
          placeholder="기업명 또는 종목코드를 입력하세요"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) {
              navigate(`/company/${results[0].id}`);
              onClose();
            }
          }}
        />
        <button
          className="icon-button"
          aria-label="검색 닫기"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="search-results">
        <h2 id="search-title">{searchTerm ? "검색 결과" : "종목 찾아보기"}</h2>
        {loading ? (
          <p>기업 목록을 불러오는 중...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : !results.length ? (
          <p>검색 결과가 없습니다. 기업명이나 6자리 코드를 확인해주세요.</p>
        ) : (
          results.map((company) => (
            <Link
              to={`/company/${company.id}`}
              onClick={onClose}
              key={company.id}
            >
              <CompanyLogo company={company} />
              <span>
                <strong>{company.name}</strong>
                <small>{company.id}</small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          ))
        )}
      </div>
      <div className="search-dialog-footer">
        <span>Enter로 첫 번째 종목 열기</span>
        <span>ESC 닫기</span>
      </div>
    </dialog>
  );
}
