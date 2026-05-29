import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {
    Calendar,
    Search,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    Building2,
    ChevronRight,
    Info,
    DollarSign
} from "lucide-react";

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

interface DayDashboardProps {
    data: NetBuyRecord[];
    companies: Company[];
    selectedDate: string;
    availableDates: string[];
    onChangeDate: (date: string) => void;
    todayDate: string;
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

export default function DayDashboard({
    data,
    companies,
    selectedDate,
    availableDates,
    onChangeDate,
    todayDate,
    dataLoading = false,
}: DayDashboardProps) {

    // 1. Map company IDs to names
    const companyMap = useMemo(() => {
        return new Map(companies.map((c) => [c.id, c.name]));
    }, [companies]);

    // 2. Filter records for the selected date
    const selectedRecords = useMemo<(NetBuyRecord & { company_name: string })[]>(() => {
        return data
            .filter((r) => r.date === selectedDate)
            .map((r) => ({
                ...r,
                company_name: companyMap.get(r.company_id) || `회사 (${r.company_id})`,
            }));
    }, [data, selectedDate, companyMap]);

    // 3. Search and sort
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"amountDesc" | "amountAsc">("amountDesc");

    const filteredAndSortedRecords = useMemo(() => {
        let result = [...selectedRecords];

        // Filter by search term
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (r) =>
                    r.company_name.toLowerCase().includes(term) ||
                    r.company_id.includes(term)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "amountDesc":
                    if (b.amount !== a.amount) {
                        return b.amount - a.amount;
                    }
                    return b.quantity - a.quantity;
                case "amountAsc":
                    if (a.amount !== b.amount) {
                        return a.amount - b.amount;
                    }
                    return a.quantity - b.quantity;
                default:
                    return 0;
            }
        });

        return result;
    }, [selectedRecords, searchTerm, sortBy]);

    // 4. Metrics calculation
    const metrics = useMemo<{
        totalBuyAmount: number;
        totalSellAmount: number;
        netAmount: number;
        buyCount: number;
        sellCount: number;
    }>(() => {
        let totalBuyAmount = 0;
        let totalSellAmount = 0;
        let buyCount = 0;
        let sellCount = 0;

        selectedRecords.forEach((r) => {
            if (r.amount > 0) {
                totalBuyAmount += r.amount;
                buyCount += 1;
            } else if (r.amount < 0) {
                totalSellAmount += r.amount;
                sellCount += 1;
            }
        });

        return {
            totalBuyAmount,
            totalSellAmount,
            netAmount: totalBuyAmount + totalSellAmount,
            buyCount,
            sellCount,
        };
    }, [selectedRecords]);

    const isTodaySelected = selectedDate === todayDate;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
            {/* Dropdown Date Selector (Vanilla HTML select styled beautifully) */}
            <div className="flex gap-2 min-w-[240px]">
                <label className="text-muted-foreground text-sm font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 거래일 선택
                </label>
                <div className="relative">
                    <select
                        value={selectedDate}
                        onChange={(e) => onChangeDate(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 cursor-pointer font-medium"
                    >
                        {availableDates.map((d) => (
                            <option key={d} value={d}>
                                {formatDate(d)}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="relative">
                {dataLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
                        <div className="bg-card/90 border border-border backdrop-blur-sm px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                            <span className="text-foreground text-sm font-medium">거래 데이터 불러오는 중...</span>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-8 transition-all duration-300 ${dataLoading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"}`}>

                    {/* Key Metrics Cards (Shadcn UI) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Net Total Card */}
                        <Card className="bg-card border-border shadow-lg relative overflow-hidden group hover:border-primary/50 transition-all duration-300 rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    일일 순매수 합계
                                </CardDescription>
                                <CardTitle className={`text-3xl font-extrabold tracking-tight mt-2 flex items-baseline gap-1.5 ${metrics.netAmount >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                    {formatAmount(metrics.netAmount)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <DollarSign className="w-24 h-24 text-foreground" />
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs font-semibold border-t border-border/50 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">총 매수</span>
                                        <span className="text-emerald-500 dark:text-emerald-400 font-bold mt-0.5">
                                            {formatAmount(metrics.totalBuyAmount)}
                                        </span>
                                    </div>
                                    <div className="h-6 w-px bg-border"></div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">총 매도</span>
                                        <span className="text-rose-500 dark:text-rose-400 font-bold mt-0.5">
                                            {formatAmount(metrics.totalSellAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buy/Sell Counts Card */}
                        <Card className="bg-card border-border shadow-lg hover:border-primary/50 transition-all duration-300 rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 매수/매도 종목 수
                                </CardDescription>
                                <div className="mt-2 flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs mb-1">매수 종목</span>
                                        <span className="text-emerald-500 dark:text-emerald-400 font-bold text-3xl tracking-tight">{metrics.buyCount}<span className="text-sm text-emerald-500/70 dark:text-emerald-400/70 ml-1">개</span></span>
                                    </div>
                                    <div className="h-10 w-px bg-border"></div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs mb-1">매도 종목</span>
                                        <span className="text-rose-500 dark:text-rose-400 font-bold text-3xl tracking-tight">{metrics.sellCount}<span className="text-sm text-rose-500/70 dark:text-rose-400/70 ml-1">개</span></span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 border-t border-border/50 pt-3 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">전체 거래 종목</span>
                                    <span className="text-foreground font-mono font-semibold">{metrics.buyCount + metrics.sellCount}개</span>
                                </div>
                            </CardContent>
                        </Card>

                    </section>

                    {/* Interactive Full Table Section */}
                    <section className="bg-card border border-border rounded-2xl p-6 shadow-md transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" /> 전체 순매수 기록
                            </h3>



                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="종목명 또는 코드 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                                    />
                                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">정렬 기준</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e: any) => setSortBy(e.target.value)}
                                        className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 cursor-pointer font-medium"
                                    >
                                        <option value="amountDesc">순매수 금액 높은 순</option>
                                        <option value="amountAsc">순매수 금액 낮은 순</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">순위</TableHead>
                                        <TableHead>종목명</TableHead>
                                        <TableHead>종목코드</TableHead>
                                        <TableHead className="text-right">순매수 수량</TableHead>
                                        <TableHead className="text-right">순매수 금액</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedRecords.length > 0 ? (
                                        filteredAndSortedRecords.map((item, idx) => {
                                            const isNetBuy = item.quantity >= 0;
                                            const isNonTouched = item.quantity === 0 && item.amount === 0;

                                            return (
                                                <TableRow
                                                    key={item.company_id}
                                                    className={
                                                        isNonTouched ? "bg-muted/50" : ""
                                                    }
                                                >
                                                    <TableCell className="font-medium text-muted-foreground">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className="font-bold">
                                                        <Link
                                                            to={`/company?id=${item.company_id}`}
                                                            className="hover:underline hover:text-primary flex items-center gap-1 transition-colors"
                                                        >
                                                            {item.company_name}
                                                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">
                                                        {item.company_id}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-medium font-mono ${isNonTouched
                                                            ? "text-muted-foreground"
                                                            : item.quantity >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                                            }`}
                                                    >
                                                        {formatQuantity(item.quantity)}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-bold font-mono ${isNonTouched
                                                            ? "text-muted-foreground"
                                                            : isNetBuy ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                                            }`}
                                                    >
                                                        {formatAmount(item.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                일치하는 종목 정보가 없습니다.
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