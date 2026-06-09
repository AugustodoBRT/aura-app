import { useState, useCallback } from "react";

// REQUISITO 3: hook customizado de escrita (useMutation genérico)
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false); // REQUISITO 8: loading
  const [error, setError] = useState<string | null>(null); // REQUISITO 8: erro

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        return await mutationFn(...args);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro na operação");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error };
}
