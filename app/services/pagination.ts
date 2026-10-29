export const PAGE_SIZE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: { message: string } | null;
}

export async function forEachPage<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  consume: (rows: T[]) => void,
  errorMessage: string,
  signal?: AbortSignal,
) {
  for (let from = 0; ; from += PAGE_SIZE) {
    signal?.throwIfAborted();
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    signal?.throwIfAborted();
    if (error) throw new Error(`${errorMessage}: ${error.message}`);
    const rows = data || [];
    consume(rows);
    if (rows.length < PAGE_SIZE) return;
  }
}
