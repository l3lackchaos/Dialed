import { useCallback, useEffect, useState } from "react";

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Minimal data-fetching hook: runs `fn` on mount and whenever `refetch` is
 * called. Keeps previous data visible while refetching to avoid flicker.
 */
export function useQuery<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Hold the latest fn in a ref-free way: callers pass a stable fn or accept
  // re-runs. We intentionally depend only on an internal tick.
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setState((s) => ({ ...s, loading: false, error: message }));
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { ...state, refetch };
}
