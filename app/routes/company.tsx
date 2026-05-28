import type { Route } from "./+types/company";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import CompanyDashboard from "../../components/dashboard/company";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export function meta({ data }: any) {
    return [
        { title: "NPS Today - Company Dashboard" },
        { name: "description", content: "Company-specific National Pension Service (NPS) Net Buying Trends" },
    ];
}

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

export default function CompanyRoute() {
    const [searchParams] = useSearchParams();
    const companyId = searchParams.get("id");

    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [historicalData, setHistoricalData] = useState<NetBuyRecord[]>([]);
    const [rangeDays, setRangeDays] = useState<number>(30); // Default to 30 days
    const [companyName, setCompanyName] = useState<string>("");

    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Load the initial company list (done once)
    useEffect(() => {
        async function loadCompanies() {
            try {
                const { data, error: companyErr } = await supabase
                    .from("company_list")
                    .select();

                if (companyErr) throw companyErr;
                setAllCompanies(data || []);
            } catch (err: any) {
                console.error("Error loading company list:", err);
            }
        }
        loadCompanies();
    }, []);

    // 2. Load company info and full history (up to 365 records) when companyId changes
    useEffect(() => {
        if (!companyId) {
            setError("No company ID provided. Please select a company from the homepage.");
            setInitialLoading(false);
            return;
        }

        async function loadCompanyData() {
            try {
                setInitialLoading(true);
                setError(null);

                // Fetch company details
                const { data: companyData, error: nameErr } = await supabase
                    .from("company_list")
                    .select("name")
                    .eq("id", companyId)
                    .maybeSingle();

                if (nameErr) throw nameErr;
                
                if (companyData) {
                    setCompanyName(companyData.name);
                } else {
                    setCompanyName(`Unknown Company`);
                }

                // Fetch historical buy/sell records (maximum 365 records)
                const { data: records, error: recordsErr } = await supabase
                    .from("kospi_fund_net_buy")
                    .select()
                    .eq("company_id", companyId)
                    .order("date", { ascending: false })
                    .limit(365);

                if (recordsErr) throw recordsErr;
                setHistoricalData(records || []);
            } catch (err: any) {
                console.error("Error loading company dashboard data:", err);
                setError(err.message || "Failed to load company transactions dashboard");
            } finally {
                setInitialLoading(false);
            }
        }

        loadCompanyData();
    }, [companyId]);

    // 3. Slice the historical data based on the selected range in memory
    const displayedData = useMemo(() => {
        return historicalData.slice(0, rangeDays);
    }, [historicalData, rangeDays]);

    const handleRangeChange = (days: number) => {
        setDataLoading(true);
        setRangeDays(days);
        // Simulate a minor UI transition delay to make it feel responsive and dynamic
        setTimeout(() => {
            setDataLoading(false);
        }, 150);
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">
                        Analyzing company transaction history...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !companyId) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-6 text-center shadow-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">Error Loading Company Dashboard</h3>
                    <p className="text-slate-400 text-sm mt-2 mb-6">{error || "Invalid Company ID"}</p>
                    <Link
                        to="/"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors inline-block"
                    >
                        Go back Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30">
            <CompanyDashboard
                companyId={companyId}
                companyName={companyName}
                allCompanies={allCompanies}
                data={displayedData}
                rangeDays={rangeDays}
                onRangeChange={handleRangeChange}
                dataLoading={dataLoading}
            />
        </div>
    );
}
