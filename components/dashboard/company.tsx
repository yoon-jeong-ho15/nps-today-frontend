import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
    ArrowLeft,
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Percent,
    DollarSign,
    ArrowUpDown,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { ThemeToggle } from "~/components/theme-toggle";

interface NetBuyRecord {
    date: string;
    company_id: string;
    quantity: number;
    amount: number;
}

interface Company {
    id: string;
    name: string;
}

interface CompanyDashboardProps {
    companyId: string;
    companyName: string;
    allCompanies: Company[];
    data: NetBuyRecord[];
    rangeDays: number;
    onRangeChange: (days: number) => void;
    dataLoading?: boolean;
}

function formatDate(dateStr: string) {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);
    return `${year}년 ${month}월 ${day}일`;
}

function formatAmount(amount: number) {
    if (amount === 0) return "0 백만원";
    const sign = amount > 0 ? "+" : "";
    return `${sign}${amount.toLocaleString()} 백만원`;
}

function formatQuantity(qty: number) {
    if (qty === 0) return "0 주";
    const sign = qty > 0 ? "+" : "";
    return `${sign}${qty.toLocaleString()} 주`;
}

export default function CompanyDashboard({
    companyId,
    companyName,
    allCompanies,
    data,
    rangeDays,
    onRangeChange,
    dataLoading = false,
}: CompanyDashboardProps) {
    const navigate = useNavigate();

    // Sort all companies alphabetically for the selector
    const sortedCompanies = useMemo(() => {
        return [...allCompanies].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }, [allCompanies]);

    // Data for the chart needs to be in chronological order (oldest to newest)
    const chronologicalData = useMemo(() => {
        return [...data].reverse();
    }, [data]);

    // 1. Calculate Metrics over the selected range
    const metrics = useMemo(() => {
        let totalAmount = 0;
        let totalQuantity = 0;
        let buyDays = 0;
        let sellDays = 0;

        data.forEach((r) => {
            totalAmount += r.amount;
            totalQuantity += r.quantity;
            if (r.amount > 0) buyDays++;
            else if (r.amount < 0) sellDays++;
        });

        const totalDays = data.length;
        const buyRatio = totalDays > 0 ? (buyDays / totalDays) * 100 : 0;
        const avgAmount = totalDays > 0 ? totalAmount / totalDays : 0;

        return {
            totalAmount,
            totalQuantity,
            buyDays,
            sellDays,
            buyRatio,
            avgAmount,
            totalDays
        };
    }, [data]);

    // 2. Chart Configuration
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
            }
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

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        if (id) {
            navigate(`/company/${id}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
            {/* Header / Top Panel */}
            <header className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-xl transition-colors">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 rounded-full text-xs font-semibold tracking-wider">
                            기업별 상세 분석
                        </span>
                    </div>

                    <div className="mt-2">
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-3">
                            <span>{companyName}</span>
                            <span className="text-lg font-mono font-semibold text-muted-foreground">{companyId}</span>
                        </h1>

                    </div>
                </div>

                {/* Range and Selector Panel */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-4">
                    {/* Time Range Selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">조회 기간 설정</label>
                        <div className="inline-flex bg-background border border-border rounded-xl p-1 gap-1">
                            {[30, 90, 180, 365].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => onRangeChange(days)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${rangeDays === days
                                        ? "bg-yellow-500 text-white dark:text-zinc-950 shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    {days}일
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Switcher */}
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">분석 종목 변경</label>
                        <select
                            value={companyId}
                            onChange={handleCompanyChange}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 cursor-pointer font-medium"
                        >
                            {sortedCompanies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.id})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Dashboard Content Grid */}
            <div className="relative">
                {dataLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
                        <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500"></div>
                            <span className="text-foreground text-sm font-medium">분석 결과 업데이트 중...</span>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-8 transition-all duration-300 ${dataLoading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"}`}>

                    {/* Key Metrics Cards (Shadcn UI) */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Cumulative Net Buy Amount */}
                        <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> 누적 순매수 금액
                                </CardDescription>
                                <CardTitle className={`text-2xl font-extrabold tracking-tight mt-2.5 ${metrics.totalAmount >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                    {formatAmount(metrics.totalAmount)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-xs mt-2">
                                    최근 {metrics.totalDays} 거래일 동안의 일일 순매수 누적 합계 금액입니다.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Cumulative Net Buy Quantity */}
                        <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" /> 누적 순매수 수량
                                </CardDescription>
                                <CardTitle className={`text-2xl font-extrabold tracking-tight mt-2.5 ${metrics.totalQuantity >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                    {formatQuantity(metrics.totalQuantity)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-xs mt-2">
                                    해당 기간 동안 순매수(+) 또는 순매도(-)한 주식 수의 총합입니다.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Chart Panel */}
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

                        {/* Shadcn Area Chart */}
                        <div className="relative bg-background rounded-xl border border-border p-4 min-h-[300px] flex items-center justify-center transition-colors">
                            {chronologicalData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <AreaChart data={chronologicalData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
                                            cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={
                                                <ChartTooltipContent
                                                    className="bg-card border-border shadow-xl text-foreground"
                                                    formatter={(value, name, item, index) => (
                                                        <div className="flex flex-col gap-1.5 w-full min-w-[140px]">
                                                            <div className="flex justify-between items-center w-full">
                                                                <span className="text-muted-foreground">순매수액:</span>
                                                                <span className={`font-bold font-mono ${item.payload.amount >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                                                    {formatAmount(item.payload.amount)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center w-full">
                                                                <span className="text-muted-foreground">순매수량:</span>
                                                                <span className={`font-medium font-mono ${Number(value) >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
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

                    {/* Historical Table */}
                    <section className="bg-card border border-border rounded-2xl p-6 shadow-md transition-colors">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <History className="w-4 h-4 text-muted-foreground" /> 일자별 매매 상세 기록
                            </h3>
                            <p className="text-muted-foreground text-xs mt-1">
                                해당 분석 기간 동안의 일별 거래 현황입니다.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>거래일자</TableHead>
                                        <TableHead className="text-right">순매수 수량</TableHead>
                                        <TableHead className="text-right">순매수 금액</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length > 0 ? (
                                        data.map((item) => {
                                            const isNetBuy = item.amount >= 0;
                                            return (
                                                <TableRow key={item.date}>
                                                    <TableCell className="font-medium text-muted-foreground">
                                                        {formatDate(item.date)}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-medium font-mono ${item.quantity >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                                        {formatQuantity(item.quantity)}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold font-mono ${isNetBuy ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                                        {formatAmount(item.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                해당 기간 내 국민연금 거래 상세 정보가 존재하지 않습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}