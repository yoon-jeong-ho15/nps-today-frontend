import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactAmount } from "~/lib/format";
import { EmptyState } from "./shared";

export interface FlowPoint {
  date: string;
  amount: number;
}
export function FlowChart({
  data,
  quantity = false,
}: {
  data: FlowPoint[];
  quantity?: boolean;
}) {
  const format = (value: number) =>
    quantity
      ? `${value.toLocaleString("ko-KR")}주`
      : formatCompactAmount(value);
  if (!data.length) return <EmptyState />;
  return (
    <div
      className="flow-chart"
      role="img"
      aria-label={`${data.length}거래일 ${quantity ? "순매수 수량" : "순매수 금액"} 차트. 녹색은 순매수, 빨간색은 순매도입니다.`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 500, height: 255 }}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 4, bottom: 0, left: -14 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={12}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: string) =>
              `${Number(value.slice(4, 6))}.${value.slice(6, 8)}`
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={76}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) =>
              quantity
                ? Intl.NumberFormat("ko-KR", { notation: "compact" }).format(
                    value,
                  )
                : formatCompactAmount(value).replace("원", "")
            }
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", radius: 5 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="chart-tooltip">
                  <small>
                    {String(label).replace(
                      /^(\d{4})(\d{2})(\d{2})$/,
                      "$1.$2.$3",
                    )}
                  </small>
                  <strong
                    className={
                      Number(payload[0].value) >= 0 ? "positive" : "negative"
                    }
                  >
                    {format(Number(payload[0].value))}
                  </strong>
                </div>
              ) : null
            }
          />
          <ReferenceLine
            y={0}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.3}
          />
          <Bar
            dataKey="amount"
            maxBarSize={28}
            radius={[4, 4, 4, 4]}
            isAnimationActive={false}
          >
            {data.map((point) => (
              <Cell
                key={point.date}
                fill={point.amount >= 0 ? "var(--positive)" : "var(--negative)"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
