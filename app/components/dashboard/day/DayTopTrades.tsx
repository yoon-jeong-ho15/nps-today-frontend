import { Panel, RankingList } from "../shared";
import type { RecordWithCompany } from "~/types/domain";
export function DayTopTrades({
  selectedRecords,
}: {
  selectedRecords: RecordWithCompany[];
}) {
  if (!selectedRecords.length) return null;
  return (
    <div className="two-columns">
      <Panel title="순매수 TOP 5" description="매수 우위가 가장 큰 종목">
        <RankingList records={selectedRecords} />
      </Panel>
      <Panel title="순매도 TOP 5" description="매도 우위가 가장 큰 종목">
        <RankingList records={selectedRecords} side="sell" />
      </Panel>
    </div>
  );
}
