import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Company } from "~/types/domain";

export function CompanyLogo({ company }: { company: Company }) {
  const [hasError, setHasError] = useState(false);
  const logoSrc = company.logo_url || company.logoUrl || `/logos/${company.id}.png`;

  return (
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/70 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all duration-200 overflow-hidden">
      {!hasError ? (
        <img
          src={logoSrc}
          alt={`${company.name} 로고`}
          className="w-full h-full object-contain p-1"
          onError={() => setHasError(true)}
        />
      ) : (
        <Building2 className="w-4 h-4 text-muted-foreground/60 group-hover:text-emerald-500 transition-colors" />
      )}
    </div>
  );
}
