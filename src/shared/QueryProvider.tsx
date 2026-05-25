import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";

const inFlightRequests = new Set<string>();

interface CacheEntry<T = unknown> {
  data: T | null;
  timestamp: number;
  isLoading: boolean;
  error: Error | null;
}

type PrefetchFn = <T>(
  key: string,
  queryFn: () => Promise<T>,
  staleTimeMs?: number,
) => Promise<void>;

interface QueryContextType {
  cache: Map<string, CacheEntry>;
  updateCache: (key: string, entry: Partial<CacheEntry>) => void;
  prefetch: PrefetchFn;
}

const QueryContext = createContext<QueryContextType | null>(null);

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const updateCache = useCallback(
    (key: string, updates: Partial<CacheEntry>) => {
      setCache((prevCache) => {
        const newCache = new Map(prevCache);
        const existing = newCache.get(key) || {
          data: null,
          timestamp: 0,
          isLoading: false,
          error: null,
        };
        newCache.set(key, { ...existing, ...updates });
        return newCache;
      });
    },
    [],
  );

  const prefetch: PrefetchFn = useCallback(
    async (key, queryFn, staleTimeMs = 60000) => {
      const entry = cacheRef.current.get(key) || {
        data: null,
        timestamp: 0,
        isLoading: false,
        error: null,
      };

      const now = Date.now();
      const isStale = now - entry.timestamp > staleTimeMs;
      const shouldFetch =
        (!entry.data && !entry.isLoading) || (isStale && !entry.isLoading);

      if (!shouldFetch || inFlightRequests.has(key) || entry.isLoading) {
        return;
      }

      inFlightRequests.add(key);
      updateCache(key, { isLoading: true, error: null });

      try {
        const data = await queryFn();
        updateCache(key, {
          data,
          timestamp: Date.now(),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        updateCache(key, {
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      } finally {
        inFlightRequests.delete(key);
      }
    },
    [updateCache],
  );

  return (
    <QueryContext.Provider value={{ cache, updateCache, prefetch }}>
      {children}
    </QueryContext.Provider>
  );
};

export function useQuery<T = unknown>(
  key: string,
  queryFn: () => Promise<T>,
  staleTimeMs = 60000,
) {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }

  const { cache, updateCache } = context;
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const entry = cache.get(key) || {
    data: null,
    timestamp: 0,
    isLoading: false,
    error: null,
  };

  const now = Date.now();
  const isStale = now - entry.timestamp > staleTimeMs;
  const shouldFetch =
    (!entry.data && !entry.isLoading) || (isStale && !entry.isLoading);

  const fetchData = useCallback(async () => {
    if (inFlightRequests.has(key)) {
      return;
    }

    const currentEntry = cacheRef.current.get(key);
    if (currentEntry?.isLoading) {
      return;
    }

    inFlightRequests.add(key);
    updateCache(key, { isLoading: true, error: null });

    try {
      const data = await queryFn();
      updateCache(key, {
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      updateCache(key, {
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    } finally {
      inFlightRequests.delete(key);
    }
  }, [key, queryFn, updateCache]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [fetchData, shouldFetch]);

  return {
    data: entry.data as T | null,
    isLoading: entry.isLoading,
    error: entry.error,
    isStale,
    refetch: fetchData,
  };
}

export function usePrefetch() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("usePrefetch must be used within QueryProvider");
  }
  return context.prefetch;
}
