import React from "react";

import type { Company } from "~/types/domain";

interface CompanyDashboardHeaderProps {
  companyId: string;
  companyName: string;
  sortedCompanies: Company[];
  rangeDays: number;
  onRangeChange: (days: number) => void;
  onCompanyChange: (id: string) => void;
}

export function CompanyDashboardHeader({
  companyId,
  companyName,
  sortedCompanies,
  rangeDays,
  onRangeChange,
  onCompanyChange,
}: CompanyDashboardHeaderProps) {
  const handleCompanySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      onCompanyChange(id);
    }
  };

  return (
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
            <span className="text-lg font-mono font-semibold text-muted-foreground">
              {companyId}
            </span>
          </h1>
        </div>
      </div>

      {/* Range and Selector Panel */}
      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-4">
        {/* Time Range Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
            조회 기간 설정
          </label>
          <div className="inline-flex bg-background border border-border rounded-xl p-1 gap-1">
            {[30, 90, 180, 365].map((days) => (
              <button
                key={days}
                onClick={() => onRangeChange(days)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rangeDays === days
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
          <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
            분석 종목 변경
          </label>
          <select
            value={companyId}
            onChange={handleCompanySelectChange}
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
  );
}
