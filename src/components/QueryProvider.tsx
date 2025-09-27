import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";

const inFlightRequests = new Set<string>();

interface CacheEntry<T = any> {
  data: T | null;
  timestamp: number;
  isLoading: boolean;
  error: Error | null;
}

interface QueryContextType {
  cache: Map<string, CacheEntry>;
  updateCache: (key: string, entry: Partial<CacheEntry>) => void;
  prefetch: <T>(key: string, queryFn: () => Promise<T>, staleTimeMs?: number) => Promise<void>;
}

const QueryContext = createContext<QueryContextType | null>(null);

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

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

  const prefetch = useCallback(
    async <T>(key: string, queryFn: () => Promise<T>, staleTimeMs = 60000) => {
      // Get current cache state directly from the Map
      const entry = cache.get(key) || {
        data: null,
        timestamp: 0,
        isLoading: false,
        error: null,
      };

      const now = Date.now();
      const isStale = now - entry.timestamp > staleTimeMs;
      const shouldFetch = (!entry.data && !entry.isLoading) || (isStale && !entry.isLoading);

      if (!shouldFetch) {
        console.log(`📋 Cache hit for prefetch: ${key}`);
        return;
      }

      if (inFlightRequests.has(key)) {
        console.log(`⏳ Request already in flight for prefetch: ${key}`);
        return;
      }

      if (entry.isLoading) {
        console.log(`⏳ Cache shows loading for prefetch: ${key}`);
        return;
      }

      console.log(`🔄 Prefetching data for: ${key}`);

      inFlightRequests.add(key);
      updateCache(key, { isLoading: true, error: null });

      try {
        const data = await queryFn();
        console.log(`✅ Prefetch successful for: ${key}`);

        updateCache(key, {
          data,
          timestamp: Date.now(),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error(`❌ Prefetch error for: ${key}`, error);

        updateCache(key, {
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      } finally {
        inFlightRequests.delete(key);
      }
    },
    [updateCache, cache],
  );

  return (
    <QueryContext.Provider value={{ cache, updateCache, prefetch }}>
      {children}
    </QueryContext.Provider>
  );
};

export function useQuery<T = any>(
  key: string,
  queryFn: () => Promise<T>,
  staleTimeMs = 60000,
) {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }

  const { cache, updateCache } = context;

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
      console.log(
        `⏳ Request already in flight for: ${key}, skipping duplicate`,
      );
      return;
    }

    const currentEntry = cache.get(key);
    if (currentEntry?.isLoading) {
      console.log(`⏳ Cache shows loading for: ${key}, skipping duplicate`);
      return;
    }

    console.log(`🚀 Fetching data for: ${key}`);

    inFlightRequests.add(key);

    updateCache(key, { isLoading: true, error: null });

    try {
      const data = await queryFn();
      console.log(`✅ Data fetched successfully for: ${key}`);

      updateCache(key, {
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error(`❌ Error fetching data for: ${key}`, error);

      updateCache(key, {
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    } finally {
      inFlightRequests.delete(key);
    }
  }, [key, queryFn, updateCache, cache]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [fetchData, key, shouldFetch]);

  return {
    data: entry.data,
    isLoading: entry.isLoading,
    error: entry.error,
    isStale,
    refetch: fetchData,
  };
}

// Hook to access prefetch functionality
export function usePrefetch() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("usePrefetch must be used within QueryProvider");
  }
  return context.prefetch;
}