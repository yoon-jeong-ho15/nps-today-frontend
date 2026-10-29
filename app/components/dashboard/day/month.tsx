import { Link } from "react-router";
import { formatCompactAmount, formatDate } from "~/lib/format";
interface Props {
  year?: string;
  month: string;
  dates: string[];
  dailyTotals: Record<string, number>;
  maxAbsAmount: number;
}
export default function Month({ year, month, dates, dailyTotals }: Props) {
  const yearNumber = Number(
    year || dates[0]?.slice(0, 4) || new Date().getFullYear(),
  );
  const monthNumber = Number(month);
  const start = new Date(Date.UTC(yearNumber, monthNumber - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(yearNumber, monthNumber, 0)).getUTCDate();
  const available = new Set(dates);
  return (
    <div className="calendar-grid">
      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
        <div className="calendar-weekday" key={day}>
          {day}
        </div>
      ))}
      {Array.from({ length: start }, (_, index) => (
        <div key={`blank-${index}`} />
      ))}
      {Array.from({ length: count }, (_, index) => {
        const day = index + 1;
        const date = `${yearNumber}${String(monthNumber).padStart(2, "0")}${String(day).padStart(2, "0")}`;
        const amount = dailyTotals[date];
        return available.has(date) ? (
          <Link
            key={date}
            className={`calendar-cell available ${amount > 0 ? "buy" : amount < 0 ? "sell" : ""}`}
            to={`/date/${date}`}
            aria-label={`${formatDate(date)} ${amount === undefined ? "거래 내역" : formatCompactAmount(amount)}`}
            title={
              amount === undefined
                ? formatDate(date)
                : `${formatDate(date)} ${formatCompactAmount(amount)}`
            }
          >
            <span>{day}</span>
            {amount !== undefined && (
              <>
                <small className="calendar-amount-full">
                  {formatCompactAmount(amount)}
                </small>
                <small className="calendar-amount-short">
                  {formatCompactAmount(amount)
                    .replace(/원$/, "")
                    .replace(/\.\d+(?=억)/, "")}
                </small>
              </>
            )}
          </Link>
        ) : (
          <div className="calendar-cell unavailable" key={date}>
            <span>{day}</span>
          </div>
        );
      })}
    </div>
  );
}
