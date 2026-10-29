import type { Company } from "~/types/domain";
import { CompanyLogo } from "./CompanyLogo";
import { FavoriteButton, SegmentedControl } from "../shared";
import { useWatchlist } from "~/hooks/useWatchlist";
interface Props {
  companyId: string;
  companyName: string;
  sortedCompanies: Company[];
  rangeDays: number;
  onRangeChange: (days: number) => void;
  onCompanyChange: (id: string) => void;
}
export function CompanyDashboardHeader({
  companyId,
  companyName,
  sortedCompanies,
  rangeDays,
  onRangeChange,
  onCompanyChange,
}: Props) {
  const { ids, toggle } = useWatchlist();
  return (
    <header className="company-hero">
      <div className="company-hero-identity">
        <CompanyLogo company={{ id: companyId, name: companyName }} />
        <div>
          <h1>{companyName}</h1>
          <p>
            {companyId} <span className="footer-divider">·</span> KOSPI{" "}
            <span className="footer-divider">·</span> 기업별 수급 분석
          </p>
        </div>
        <FavoriteButton
          name={companyName}
          selected={ids.includes(companyId)}
          onClick={() => toggle(companyId)}
        />
      </div>
      <div className="company-controls">
        <label>
          분석 종목
          <select
            className="select-field"
            value={companyId}
            onChange={(event) => onCompanyChange(event.target.value)}
            aria-label="분석 종목 변경"
          >
            {sortedCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.id})
              </option>
            ))}
          </select>
        </label>
        <SegmentedControl
          value={rangeDays}
          onChange={onRangeChange}
          options={[30, 90, 180, 365].map((value) => ({
            value,
            label: `${value}거래일`,
          }))}
          label="기업 분석 조회 기간"
        />
      </div>
    </header>
  );
}
