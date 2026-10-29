export function downloadCsv(
  filename: string,
  headings: string[],
  rows: (string | number)[][],
) {
  const escape = (value: string | number) => {
    const text = String(value);
    const safe =
      /^[=+@\-\t\r]/.test(text) && typeof value === "string"
        ? `\t${text}`
        : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const csv =
    "\uFEFF" +
    [headings, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
