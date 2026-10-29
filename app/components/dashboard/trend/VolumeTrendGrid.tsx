import type { VolumeTrendCompany } from "~/types/domain";
import { Panel, RankingList } from "../shared";
interface Props {
  topBuyers: VolumeTrendCompany[];
  topSellers: VolumeTrendCompany[];
  loadingVolume: boolean;
  volumeDays: number;
}
export function VolumeTrendGrid({
  topBuyers,
  topSellers,
  loadingVolume,
  volumeDays,
}: Props) {
  const rows = [...topBuyers, ...topSellers].map((company) => ({
    date: "",
    company_id: company.id,
    company_name: company.name,
    amount: company.totalAmount,
    quantity: 0,
  }));
  return (
    <div className="two-columns">
      {(["buy", "sell"] as const).map((side) => (
        <Panel
          key={side}
          title={`누적 순${side === "buy" ? "매수" : "매도"} TOP 10`}
          description={`최근 ${volumeDays}거래일의 순매수 금액 합계 기준`}
        >
          {loadingVolume ? (
            <div className="panel-body">
              <div
                className="skeleton skeleton-chart"
                role="status"
                aria-label="누적 매매 분석 중"
              />
            </div>
          ) : (
            <RankingList records={rows} side={side} limit={10} />
          )}
        </Panel>
      ))}
    </div>
  );
}
