import { useState, useMemo } from "react";
import { Link } from "react-router";

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
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const mIdx = parseInt(month, 10) - 1;
    const mName = mIdx >= 0 && mIdx < 12 ? months[mIdx] : month;
    return `${mName} ${parseInt(day, 10)}, ${year}`;
}

function formatAmount(amount: number) {
    const sign = amount > 0 ? "+" : "";
    // amount is typically in 100M KRW or 1M KRW. Let's format it nicely.
    return `${sign}${amount.toLocaleString()} 백만원`;
}

function formatQuantity(qty: number) {
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

    // 1. Map company IDs to names for O(1) lookup
    const companyMap = useMemo(() => {
        return new Map(companies.map((c) => [c.id, c.name]));
    }, [companies]);

    // 2. Filter records for the selected date
    const selectedRecords = useMemo(() => {
        return data
            .filter((r) => r.date === selectedDate)
            .map((r) => ({
                ...r,
                company_name: companyMap.get(r.company_id) || `Company (${r.company_id})`,
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
    const metrics = useMemo(() => {
        let totalBuyAmount = 0;
        let totalSellAmount = 0;
        let topBuy: (typeof selectedRecords[0]) | null = null;
        let topSell: (typeof selectedRecords[0]) | null = null;

        selectedRecords.forEach((r) => {
            if (r.amount > 0) {
                totalBuyAmount += r.amount;
                if (!topBuy || r.amount > (topBuy as any).amount) {
                    topBuy = r;
                }
            } else {
                totalSellAmount += r.amount;
                if (!topSell || r.amount < (topSell as any).amount) {
                    topSell = r;
                }
            }
        });

        return {
            totalBuyAmount,
            totalSellAmount,
            netAmount: totalBuyAmount + totalSellAmount,
            topBuy,
            topSell,
        };
    }, [selectedRecords]);

    const isTodaySelected = selectedDate === todayDate;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
            {/* Header Panel */}
            <header className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold tracking-wider uppercase">
                            NPS Today
                        </span>
                        {isTodaySelected ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Live Today
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-slate-400">Historical View</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
                        KOSPI Net Buying Trends
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Tracking the National Pension Service (NPS) daily net buy actions on KOSPI stocks.
                    </p>
                </div>

                {/* Date Tabs Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Trading Date</label>
                    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {availableDates.map((d) => (
                            <button
                                key={d}
                                onClick={() => onChangeDate(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${selectedDate === d
                                    ? "bg-emerald-500 text-slate-950 border-transparent shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                                    : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                    />
                                </svg>
                                {formatDate(d)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="relative">
                {dataLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center min-h-[400px]">
                        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
                            <span className="text-slate-200 text-sm font-medium">Fetching trading data...</span>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-8 transition-all duration-300 ${dataLoading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"
                    }`}>

                    {/* Key Metrics Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Net Total Card */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-24 h-24 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                                    />
                                </svg>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    Total Day Net Buying
                                </span>
                                <h3
                                    className={`text-3xl font-extrabold tracking-tight mt-2 flex items-baseline gap-1.5 ${metrics.netAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                >
                                    {formatAmount(metrics.netAmount)}
                                </h3>
                            </div>
                            <div className="mt-6 flex items-center gap-4 text-xs font-semibold border-t border-slate-800/60 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-500">TOTAL BUY</span>
                                    <span className="text-emerald-400/90 font-bold mt-0.5">
                                        {formatAmount(metrics.totalBuyAmount)}
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-slate-800/60"></div>
                                <div className="flex flex-col">
                                    <span className="text-slate-500">TOTAL SELL</span>
                                    <span className="text-rose-400/90 font-bold mt-0.5">
                                        {formatAmount(metrics.totalSellAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Interactive Full Table Section */}
                    <section className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Full Net Buy Records</h3>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Showing {filteredAndSortedRecords.length} of {selectedRecords.length} records
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search company or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-slate-500 absolute left-3 top-3"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                        />
                                    </svg>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs font-medium whitespace-nowrap">Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e: any) => setSortBy(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="amountDesc">Net Buy Amount (High → Low)</option>
                                        <option value="amountAsc">Net Buy Amount (Low → High)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/30">
                                        <th className="py-4 px-6">Rank</th>
                                        <th className="py-4 px-6">Company</th>
                                        <th className="py-4 px-6">Code</th>
                                        <th className="py-4 px-6 text-right">Net Buy Quantity</th>
                                        <th className="py-4 px-6 text-right">Net Buy Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredAndSortedRecords.length > 0 ? (
                                        filteredAndSortedRecords.map((item, index) => {
                                            const isNetBuy = item.amount >= 0;
                                            return (
                                                <tr
                                                    key={item.company_id}
                                                    className="hover:bg-slate-800/30 transition-colors group duration-150"
                                                >
                                                    <td className="py-3.5 px-6 font-semibold text-slate-500 group-hover:text-slate-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3.5 px-6 font-bold text-slate-200 group-hover:text-white">
                                                        <Link
                                                            to={`/company?id=${item.company_id}`}
                                                            className="hover:text-emerald-450 hover:underline transition-colors"
                                                        >
                                                            {item.company_name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3.5 px-6 text-slate-400 font-mono text-xs">
                                                        {item.company_id}
                                                    </td>
                                                    <td
                                                        className={`py-3.5 px-6 text-right font-medium font-mono ${item.quantity >= 0 ? "text-emerald-400" : "text-rose-400"
                                                            }`}
                                                    >
                                                        {formatQuantity(item.quantity)}
                                                    </td>
                                                    <td
                                                        className={`py-3.5 px-6 text-right font-bold font-mono ${isNetBuy ? "text-emerald-400" : "text-rose-400"
                                                            }`}
                                                    >
                                                        {formatAmount(item.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                                No matching records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}