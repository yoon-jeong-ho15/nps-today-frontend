import type { ReactNode } from "react";
import {
  ChevronRight,
  CircleHelp,
  RefreshCw,
  SearchX,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import { CompanyLogo } from "./company/CompanyLogo";
import { formatCompactAmount } from "~/lib/format";
import type { RecordWithCompany } from "~/types/domain";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
  featured = false,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  tone?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  featured?: boolean;
}) {
  return (
    <div className={`metric-card ${featured ? "metric-featured" : ""}`}>
      <div className="metric-label">
        {label}
        <span className="metric-icon">{icon}</span>
      </div>
      <div className={`metric-value ${featured ? "" : tone}`}>{value}</div>
      <div className="metric-detail">{detail}</div>
      {featured && (
        <svg
          className="metric-decoration"
          viewBox="0 0 100 65"
          aria-hidden="true"
        >
          <path d="M0 60 15 42 27 49 40 25 52 34 66 13 78 22 100 0" />
        </svg>
      )}
    </div>
  );
}
export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
export function EmptyState({
  title = "표시할 데이터가 없습니다",
  description = "다른 날짜나 조건을 선택해보세요.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <SearchX size={23} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-state" role="alert">
      <CircleHelp size={24} />
      <div>
        <h3>데이터를 불러오지 못했어요</h3>
        <p>{message}</p>
      </div>
      <button
        className="button button-secondary"
        onClick={() => window.location.reload()}
      >
        <RefreshCw size={15} /> 다시 불러오기
      </button>
    </div>
  );
}
export function LoadingState() {
  return (
    <div
      className="loading-state"
      role="status"
      aria-label="데이터를 불러오는 중"
    >
      <div className="metrics-grid">
        {[0, 1, 2, 3].map((id) => (
          <div className="skeleton skeleton-metric" key={id} />
        ))}
      </div>
      <div className="skeleton skeleton-chart" />
      <span className="sr-only">데이터를 불러오는 중입니다.</span>
    </div>
  );
}
export function FavoriteButton({
  selected,
  onClick,
  name,
}: {
  selected: boolean;
  onClick: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      className={`favorite-button ${selected ? "is-favorite" : ""}`}
      aria-label={`${name} 관심 종목 ${selected ? "해제" : "추가"}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <Star size={17} fill={selected ? "currentColor" : "none"} />
    </button>
  );
}
export function Money({ amount }: { amount: number }) {
  return (
    <span
      className={`money ${amount > 0 ? "positive" : amount < 0 ? "negative" : ""}`}
    >
      {formatCompactAmount(amount)}
    </span>
  );
}
export function RankingList({
  records,
  side = "buy",
  limit = 5,
}: {
  records: RecordWithCompany[];
  side?: "buy" | "sell";
  limit?: number;
}) {
  const sorted = records
    .filter((row) => (side === "buy" ? row.amount > 0 : row.amount < 0))
    .sort((a, b) =>
      side === "buy" ? b.amount - a.amount : a.amount - b.amount,
    )
    .slice(0, limit);
  const max = Math.abs(sorted[0]?.amount || 1);
  if (!sorted.length)
    return (
      <EmptyState
        title={`순${side === "buy" ? "매수" : "매도"} 종목이 없습니다`}
      />
    );
  return (
    <div className="ranking-list">
      {sorted.map((row, index) => (
        <Link
          className="ranking-row"
          to={`/company/${row.company_id}`}
          key={row.company_id}
        >
          <span className="ranking-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <CompanyLogo
            company={{ id: row.company_id, name: row.company_name }}
          />
          <span className="ranking-company">
            <strong>{row.company_name}</strong>
            <small>{row.company_id}</small>
          </span>
          <span className="ranking-value">
            <Money amount={row.amount} />
            <span
              className={`ranking-bar ${side}`}
              style={{ width: `${(Math.abs(row.amount) / max) * 100}%` }}
            />
          </span>
          <ChevronRight size={14} className="muted" />
        </Link>
      ))}
    </div>
  );
}
