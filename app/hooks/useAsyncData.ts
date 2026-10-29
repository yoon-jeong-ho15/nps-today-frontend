import { useEffect, useState } from "react";

type Loader<T> = (signal: AbortSignal) => Promise<T>;

// Keep load stable with useCallback when it depends on route parameters.
export function useAsyncData<T>(load: Loader<T>, initialData: T) {
  const [state, setState] = useState({
    data: initialData,
    loader: load,
    loading: true,
    hasLoaded: false,
    error: null as string | null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({
      ...previous,
      loader: load,
      loading: true,
      error: null,
    }));

    async function run() {
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) {
          setState({
            data,
            loader: load,
            loading: false,
            hasLoaded: true,
            error: null,
          });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "데이터를 불러오지 못했습니다.",
          }));
          controller.abort();
        }
      }
    }

    void run();
    return () => controller.abort();
  }, [load]);

  // Parameter changes start loading immediately, before the next effect runs.
  const loading = state.loader !== load || state.loading;
  return {
    data: state.data,
    loading,
    initialLoading: !state.hasLoaded && loading,
    dataLoading: state.hasLoaded && loading,
    error: state.loader === load ? state.error : null,
  };
}
