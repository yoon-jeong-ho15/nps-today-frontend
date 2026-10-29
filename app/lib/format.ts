export function formatDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);
  return `${year}년 ${month}월 ${day}일`;
}

export function getTodayDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}${get("month")}${get("day")}`;
}

export function formatDateWithWeekday(dateStr: string) {
  if (!/^\d{8}$/.test(dateStr)) return dateStr;
  const year = Number(dateStr.substring(0, 4));
  const month = Number(dateStr.substring(4, 6));
  const day = Number(dateStr.substring(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];
  return `${formatDate(dateStr)} (${weekday}요일)`;
}

export function formatDateDisplay(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const day = parseInt(dateStr.substring(6, 8), 10);
  return `${day}일`;
}

export function formatMonthName(monthStr: string) {
  const month = parseInt(monthStr, 10);
  return `${month}월`;
}

export function formatAmount(amount: number) {
  if (amount === 0) return "0 백만원";
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toLocaleString()} 백만원`;
}

export function formatQuantity(qty: number) {
  if (qty === 0) return "0 주";
  const sign = qty > 0 ? "+" : "";
  return `${sign}${qty.toLocaleString()} 주`;
}

// API amounts are stored in millions of KRW, matching the existing amount display.
export function formatCompactAmount(amount: number, signed = true) {
  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "−" : amount > 0 && signed ? "+" : "";
  const [value, unit] =
    absolute >= 1_000_000
      ? [absolute / 1_000_000, "조원"]
      : absolute >= 100
        ? [absolute / 100, "억원"]
        : [absolute, "백만원"];
  return `${sign}${value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}${unit}`;
}
export function shortDate(date: string) {
  return /^\d{8}$/.test(date)
    ? `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`
    : date;
}
