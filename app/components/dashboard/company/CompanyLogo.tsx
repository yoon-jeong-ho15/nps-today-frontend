import { useState } from "react";
import type { Company } from "~/types/domain";

export function CompanyLogo({ company }: { company: Company }) {
  const [failedSource, setFailedSource] = useState("");
  const source =
    company.logo_url || company.logoUrl || `/logos/${company.id}.png`;
  return (
    <span className="stock-logo">
      {failedSource !== source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span>{company.name.slice(0, 1)}</span>
      )}
    </span>
  );
}
