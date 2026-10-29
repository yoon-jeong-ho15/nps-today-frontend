import { useState } from "react";
import type { NetBuyRecord } from "~/types/domain";
import { FlowChart } from "../FlowChart";
import { Panel, SegmentedControl } from "../shared";
export function CompanyChart({
  chronologicalData,
}: {
  chronologicalData: NetBuyRecord[];
}) {
  const [mode, setMode] = useState("amount");
  return (
    <Panel
      title="매일의 수급 흐름"
      description={`최근 ${chronologicalData.length}거래일 · 일별 순매수 ${mode === "amount" ? "금액" : "수량"}`}
      action={
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "amount", label: "금액" },
            { value: "quantity", label: "수량" },
          ]}
          label="차트 지표"
        />
      }
    >
      <FlowChart
        data={chronologicalData.map((row) => ({
          date: row.date,
          amount: mode === "amount" ? row.amount : row.quantity,
        }))}
        quantity={mode === "quantity"}
      />
      <div className="chart-footer">
        <div className="chart-legend">
          <span>
            <i className="legend-dot" /> 순매수
          </span>
          <span>
            <i className="legend-dot sell" /> 순매도
          </span>
        </div>
        <span>
          {mode === "amount"
            ? "금액은 원화 단위로 환산해 표시"
            : "수량 단위: 주"}
        </span>
      </div>
    </Panel>
  );
}
