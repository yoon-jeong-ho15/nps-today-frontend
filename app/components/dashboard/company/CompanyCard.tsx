import { Link } from "react-router";
import { CompanyLogo } from "~/components/CompanyLogo";
import type { Company } from "~/types/domain";

export interface CompanyCardProps {
  company: Company;
  rightAction?: React.ReactNode;
  layout?: "dense" | "default";
  hoverColor?: "emerald" | "rose" | "default";
}

export function CompanyCard({
  company,
  rightAction,
  layout = "default",
  hoverColor = "emerald",
}: CompanyCardProps) {
  const isDense = layout === "dense";
  
  const baseCardClasses = "group flex items-center border border-border rounded-xl transition-all duration-200 cursor-pointer min-w-0";
  
  const bgClasses = isDense ? "bg-background" : "bg-card";
  
  const paddingClasses = isDense 
    ? "p-2.5 sm:p-3 gap-2.5 sm:gap-3" 
    : "px-4 py-3 gap-3 justify-between";

  const hoverClasses = hoverColor === "emerald" 
    ? "hover:bg-emerald-500/[0.04] hover:border-emerald-500/35 hover:shadow-xs"
    : hoverColor === "rose"
    ? "hover:bg-rose-500/[0.04] hover:border-rose-500/35 hover:shadow-xs"
    : "hover:bg-muted/50 hover:border-foreground/20 hover:shadow-xs";

  const textHoverClasses = hoverColor === "emerald"
    ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
    : hoverColor === "rose"
    ? "group-hover:text-rose-600 dark:group-hover:text-rose-400"
    : "group-hover:text-foreground";

  return (
    <Link
      to={`/company/${company.id}`}
      className={`${baseCardClasses} ${bgClasses} ${paddingClasses} ${hoverClasses}`}
    >
      <div className={`flex items-center ${isDense ? 'gap-2.5 sm:gap-3 min-w-0 flex-1' : 'gap-3 min-w-0 flex-1'}`}>
        <CompanyLogo company={company} />
        
        <div className={`flex flex-col ${isDense ? 'justify-center min-w-0' : 'gap-0.5 justify-center min-w-0'}`}>
          <span className={`font-semibold text-foreground truncate transition-colors leading-tight ${isDense ? 'text-xs sm:text-sm' : ''} ${textHoverClasses}`}>
            {company.name}
          </span>
          <span className={`font-mono text-muted-foreground truncate leading-snug ${isDense ? 'text-[11px]' : 'text-xs'}`}>
            {company.id}
          </span>
        </div>
      </div>
      
      {rightAction && (
        <div className="flex items-center gap-3 shrink-0">
          {rightAction}
        </div>
      )}
    </Link>
  );
}
