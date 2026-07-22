import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";
import { formatAmount, formatQuantity } from "~/lib/format";

import type { NetBuyRecord } from "~/types/domain";

interface CompanyChartProps {
  chronologicalData: NetBuyRecord[];
}

export function CompanyChart({ chronologicalData }: CompanyChartProps) {
  // Chart Configuration
  const chartConfig = useMemo(() => {
    return {
      quantity: {
        label: "순매수 수량",
      },
      positive: {
        label: "순매수",
        color: "#10b981", // emerald-500
      },
      negative: {
        label: "순매도",
        color: "#f43f5e", // rose-500
      },
    };
  }, []);

  // Calculate gradient offset for split color
  const gradientOffset = useMemo(() => {
    if (chronologicalData.length === 0) return 0;
    const dataMax = Math.max(...chronologicalData.map((i) => i.quantity));
    const dataMin = Math.min(...chronologicalData.map((i) => i.quantity));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  }, [chronologicalData]);

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col gap-4 relative transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-foreground">순매수 수량 변동 추이</h3>
          <p className="text-muted-foreground text-xs mt-1">
            선택한 분석 기간 동안의 일별 국민연금 순매수 수량 변동 그래프
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></span>
            <span className="text-muted-foreground">순매수</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500"></span>
            <span className="text-muted-foreground">순매도</span>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="relative bg-background rounded-xl border border-border p-4 min-h-[300px] flex items-center justify-start sm:justify-center transition-colors overflow-x-auto">
        {chronologicalData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-[500px]">
            <AreaChart
              data={chronologicalData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
                  <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value.substring(4, 6)}/${value.substring(6, 8)}`}
                stroke="#64748b"
                fontSize={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value.toLocaleString()}`}
                stroke="#64748b"
                fontSize={10}
              />
              <ChartTooltip
                cursor={{ stroke: "#64748b", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    className="bg-card border-border shadow-xl text-foreground"
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1.5 w-full min-w-[140px]">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-muted-foreground">순매수액:</span>
                          <span
                            className={`font-bold font-mono ${
                              item.payload.amount >= 0
                                ? "text-emerald-500 dark:text-emerald-400"
                                : "text-rose-500 dark:text-rose-400"
                            }`}
                          >
                            {formatAmount(item.payload.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-muted-foreground">순매수량:</span>
                          <span
                            className={`font-medium font-mono ${
                              Number(value) >= 0
                                ? "text-emerald-500 dark:text-emerald-400"
                                : "text-rose-500 dark:text-rose-400"
                            }`}
                          >
                            {formatQuantity(Number(value))}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="quantity"
                stroke="url(#splitStroke)"
                strokeWidth={2}
                fill="url(#splitColor)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="text-slate-500 text-sm font-semibold">거래 데이터가 존재하지 않습니다.</p>
        )}
      </div>
    </section>
  );
}
