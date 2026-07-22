export function formatDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);
  return `${year}년 ${month}월 ${day}일`;
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
