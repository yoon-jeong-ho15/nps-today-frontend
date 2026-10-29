import { useEffect, useState } from "react";

const STORAGE_KEY = "nps-watchlist";
const EVENT = "nps-watchlist-change";
function readWatchlist(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    );
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readWatchlist());
    const onChange = (event: Event) =>
      setIds((event as CustomEvent<string[]>).detail);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || !event.key) setIds(readWatchlist());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  function toggle(id: string) {
    const next = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : [...ids, id];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Keep the selection for this session. */
    }
    setIds(next);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }
  return { ids, toggle };
}
