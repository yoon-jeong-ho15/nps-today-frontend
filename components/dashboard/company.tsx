import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";

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
    return `${sign}${amount.toLocaleString()} 백만원`;
}

function formatQuantity(qty: number) {
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

    // 2. SVG Chart Configuration
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const svgWidth = 1000;
    const svgHeight = 280;
    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const maxAbsAmount = useMemo(() => {
        if (chronologicalData.length === 0) return 1;
        const maxVal = Math.max(...chronologicalData.map((d) => Math.abs(d.amount)), 1);
        return maxVal;
    }, [chronologicalData]);

    // Map index to X coordinate
    const getX = (index: number) => {
        if (chronologicalData.length <= 1) return paddingX + chartWidth / 2;
        return paddingX + (index / (chronologicalData.length - 1)) * chartWidth;
    };

    // Map amount value to Y coordinate (symmetrical around zero in center)
    const getY = (amount: number) => {
        const center = paddingY + chartHeight / 2;
        // Map ratio: amount / maxAbsAmount
        // Since Y goes down as coordinate increases:
        // amount = maxAbsAmount maps to paddingY
        // amount = -maxAbsAmount maps to paddingY + chartHeight
        return center - (amount / maxAbsAmount) * (chartHeight / 2);
    };

    const zeroY = getY(0);

    // Build area & line path coordinates
    const { linePath, areaPath } = useMemo(() => {
        if (chronologicalData.length === 0) return { linePath: "", areaPath: "" };

        const points = chronologicalData.map((d, idx) => ({
            x: getX(idx),
            y: getY(d.amount),
        }));

        const lPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        
        // Area closed to the zero baseline
        let aPath = "";
        if (points.length > 0) {
            aPath = `M ${points[0].x} ${zeroY} ` + 
                    points.map((p) => `L ${p.x} ${p.y}`).join(" ") + 
                    ` L ${points[points.length - 1].x} ${zeroY} Z`;
        }

        return { linePath: lPath, areaPath: aPath };
    }, [chronologicalData, zeroY]);

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        if (id) {
            navigate(`/company?id=${id}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
            {/* Header / Top Panel */}
            <header className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white rounded-full text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold tracking-wider uppercase">
                            Company Analysis
                        </span>
                    </div>
                    
                    <div className="mt-2">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-3">
                            <span>{companyName}</span>
                            <span className="text-lg font-mono font-semibold text-slate-500">{companyId}</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            National Pension Service (NPS) transaction trends over the recent {rangeDays} trading days.
                        </p>
                    </div>
                </div>

                {/* Range and Selector Panel */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-4">
                    {/* Time Range Selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Analysis Window</label>
                        <div className="inline-flex bg-slate-950 border border-slate-800/80 rounded-xl p-1 gap-1">
                            {[30, 90, 180, 365].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => onRangeChange(days)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        rangeDays === days
                                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                                    }`}
                                >
                                    {days}D
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Switcher */}
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Select Another Company</label>
                        <select
                            value={companyId}
                            onChange={handleCompanyChange}
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all duration-200 cursor-pointer"
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
                        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
                            <span className="text-slate-200 text-sm font-medium">Updating analysis data...</span>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-8 transition-all duration-300 ${dataLoading ? "opacity-25 pointer-events-none blur-[1px]" : "opacity-100"}`}>
                    
                    {/* Key Metrics Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Cumulative Net Buy Amount */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition-all duration-300">
                            <div>
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    Cumulative Net Amount
                                </span>
                                <h3 className={`text-2xl font-extrabold tracking-tight mt-2 ${metrics.totalAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {formatAmount(metrics.totalAmount)}
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs mt-4">
                                Sum of daily transactions over the last {metrics.totalDays} trading days.
                            </p>
                        </div>

                        {/* Cumulative Net Buy Quantity */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition-all duration-300">
                            <div>
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    Cumulative Quantity
                                </span>
                                <h3 className={`text-2xl font-extrabold tracking-tight mt-2 ${metrics.totalQuantity >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {formatQuantity(metrics.totalQuantity)}
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs mt-4">
                                Total net shares purchased (+) or sold (-).
                            </p>
                        </div>

                        {/* Average Daily Amount */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition-all duration-300">
                            <div>
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    Average Daily Flow
                                </span>
                                <h3 className={`text-2xl font-extrabold tracking-tight mt-2 ${metrics.avgAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {formatAmount(Math.round(metrics.avgAmount))}
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs mt-4">
                                Mean transactional value per trading day.
                            </p>
                        </div>

                        {/* Buying Days Ratio */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition-all duration-300">
                            <div>
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    Net Buying Ratio
                                </span>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-2xl font-extrabold tracking-tight text-white">
                                        {metrics.buyRatio.toFixed(1)}%
                                    </h3>
                                    <span className="text-xs text-slate-400 font-semibold">
                                        ({metrics.buyDays} of {metrics.totalDays} days)
                                    </span>
                                </div>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full" 
                                        style={{ width: `${metrics.buyRatio}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chart Panel */}
                    <section className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 shadow-md flex flex-col gap-4 relative">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Net Buying Amount Trend</h3>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Daily net buy amount trend over the selected period
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></span>
                                    <span className="text-slate-400">Net Buy</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500"></span>
                                    <span className="text-slate-400">Net Sell</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom Interactive SVG Graph */}
                        <div className="relative bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4 min-h-[300px] flex items-center justify-center">
                            {chronologicalData.length > 0 ? (
                                <div className="w-full relative group/chart">
                                    <svg 
                                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                        className="w-full h-auto overflow-visible select-none"
                                    >
                                        <defs>
                                            {/* Glow Filters */}
                                            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="6" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                            
                                            {/* Symmetrical Gradient */}
                                            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                                                <stop offset="50%" stopColor="#10b981" stopOpacity="0.0" />
                                                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.0" />
                                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.18" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid lines & Y Axis labels */}
                                        {[maxAbsAmount, maxAbsAmount / 2, 0, -maxAbsAmount / 2, -maxAbsAmount].map((val, idx) => {
                                            const y = getY(val);
                                            const isZero = val === 0;
                                            return (
                                                <g key={idx}>
                                                    <line 
                                                        x1={paddingX} 
                                                        y1={y} 
                                                        x2={svgWidth - paddingX} 
                                                        y2={y} 
                                                        className={isZero 
                                                            ? "stroke-slate-600 stroke-1" 
                                                            : "stroke-slate-800/60 stroke-1 stroke-dasharray-[4_4]"
                                                        }
                                                        strokeDasharray={isZero ? undefined : "4 4"}
                                                    />
                                                    <text 
                                                        x={paddingX - 10} 
                                                        y={y + 4} 
                                                        className="text-[10px] font-semibold text-slate-500 fill-current font-mono text-right"
                                                        textAnchor="end"
                                                    >
                                                        {Math.round(val).toLocaleString()}M
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Chart Fill Area */}
                                        <path 
                                            d={areaPath} 
                                            fill="url(#area-gradient)"
                                        />

                                        {/* Zero Reference Baseline */}
                                        <line 
                                            x1={paddingX} 
                                            y1={zeroY} 
                                            x2={svgWidth - paddingX} 
                                            y2={zeroY} 
                                            className="stroke-slate-700/60 stroke-[1.5]"
                                        />

                                        {/* Trend Line */}
                                        <path 
                                            d={linePath} 
                                            fill="none" 
                                            stroke="url(#line-grad)"
                                            className="stroke-[2.5] stroke-linecap-round"
                                        />
                                        <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="50%" stopColor="#10b981" />
                                            <stop offset="50%" stopColor="#f43f5e" />
                                            <stop offset="100%" stopColor="#fb7185" />
                                        </linearGradient>

                                        {/* Vertical line indicator on hover */}
                                        {hoveredIndex !== null && (
                                            <line
                                                x1={getX(hoveredIndex)}
                                                y1={paddingY}
                                                x2={getX(hoveredIndex)}
                                                y2={svgHeight - paddingY}
                                                className="stroke-slate-600/80 stroke-1 stroke-dasharray-[2_2]"
                                                strokeDasharray="2 2"
                                            />
                                        )}

                                        {/* Data points markers */}
                                        {chronologicalData.map((d, idx) => {
                                            const cx = getX(idx);
                                            const cy = getY(d.amount);
                                            const isSelected = hoveredIndex === idx;
                                            const isPositive = d.amount >= 0;
                                            
                                            // Render only some markers to prevent clutter if range is large, but always render on hover
                                            const shouldRenderMarker = isSelected || chronologicalData.length < 50 || idx === 0 || idx === chronologicalData.length - 1;

                                            if (!shouldRenderMarker) return null;

                                            return (
                                                <circle
                                                    key={idx}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={isSelected ? 6 : 3}
                                                    className={`transition-all duration-150 cursor-pointer ${
                                                        isSelected 
                                                            ? isPositive 
                                                                ? "fill-emerald-400 stroke-slate-950 stroke-[3px]" 
                                                                : "fill-rose-400 stroke-slate-950 stroke-[3px]"
                                                            : isPositive 
                                                                ? "fill-emerald-500/80 stroke-none" 
                                                                : "fill-rose-500/80 stroke-none"
                                                    }`}
                                                />
                                            );
                                        })}

                                        {/* X-axis date labels */}
                                        {(() => {
                                            const totalPoints = chronologicalData.length;
                                            if (totalPoints === 0) return null;

                                            // Determine interval for labels based on period size
                                            let step = Math.ceil(totalPoints / 6);
                                            if (step === 0) step = 1;

                                            const labels = [];
                                            for (let i = 0; i < totalPoints; i += step) {
                                                labels.push(i);
                                            }
                                            // Always include last item if not already included
                                            if (labels[labels.length - 1] !== totalPoints - 1) {
                                                labels.push(totalPoints - 1);
                                            }

                                            return labels.map((idx) => {
                                                const d = chronologicalData[idx];
                                                if (!d) return null;
                                                return (
                                                    <text
                                                        key={idx}
                                                        x={getX(idx)}
                                                        y={svgHeight - paddingY + 18}
                                                        className="text-[9px] font-bold text-slate-500 fill-current font-mono text-center"
                                                        textAnchor="middle"
                                                    >
                                                        {d.date.substring(4, 6)}/{d.date.substring(6, 8)}
                                                    </text>
                                                );
                                            });
                                        })()}

                                        {/* Interactive Hover Overlay Bars */}
                                        {chronologicalData.map((d, idx) => {
                                            const barWidth = chartWidth / Math.max(chronologicalData.length, 1);
                                            const cx = getX(idx);
                                            return (
                                                <rect
                                                    key={idx}
                                                    x={cx - barWidth / 2}
                                                    y={paddingY}
                                                    width={barWidth}
                                                    height={chartHeight}
                                                    fill="transparent"
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredIndex(idx)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* HTML Tooltip relative to container */}
                                    {hoveredIndex !== null && chronologicalData[hoveredIndex] && (
                                        <div 
                                            className="absolute bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-xl p-3 shadow-2xl z-20 pointer-events-none flex flex-col gap-1 w-48 text-xs transition-all duration-75"
                                            style={{
                                                left: `${Math.min(
                                                    Math.max(10, (getX(hoveredIndex) / svgWidth) * 100 - 10), // offset left by 10%
                                                    80 // limit right edge overflow
                                                )}%`,
                                                top: `${Math.max(10, (getY(chronologicalData[hoveredIndex].amount) / svgHeight) * 100 - 32)}%`, // position above the point
                                            }}
                                        >
                                            <span className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">
                                                {formatDate(chronologicalData[hoveredIndex].date)}
                                            </span>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Amount:</span>
                                                <span className={`font-bold font-mono ${chronologicalData[hoveredIndex].amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {formatAmount(chronologicalData[hoveredIndex].amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Quantity:</span>
                                                <span className={`font-medium font-mono ${chronologicalData[hoveredIndex].quantity >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {formatQuantity(chronologicalData[hoveredIndex].quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm font-semibold">No history data available.</p>
                            )}
                        </div>
                    </section>

                    {/* Historical Table */}
                    <section className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 shadow-md">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white">Daily Net Buy Logs</h3>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Showing trading history records in chronological detail
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/30">
                                        <th className="py-4 px-6">Trading Date</th>
                                        <th className="py-4 px-6 text-right">Net Buy Quantity</th>
                                        <th className="py-4 px-6 text-right">Net Buy Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {data.length > 0 ? (
                                        data.map((item) => {
                                            const isNetBuy = item.amount >= 0;
                                            return (
                                                <tr
                                                    key={item.date}
                                                    className="hover:bg-slate-800/30 transition-colors group duration-150"
                                                >
                                                    <td className="py-3.5 px-6 font-semibold text-slate-300 group-hover:text-white">
                                                        {formatDate(item.date)}
                                                    </td>
                                                    <td className={`py-3.5 px-6 text-right font-medium font-mono ${item.quantity >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                        {formatQuantity(item.quantity)}
                                                    </td>
                                                    <td className={`py-3.5 px-6 text-right font-bold font-mono ${isNetBuy ? "text-emerald-400" : "text-rose-400"}`}>
                                                        {formatAmount(item.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-500 font-medium">
                                                No trading data found for this company.
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