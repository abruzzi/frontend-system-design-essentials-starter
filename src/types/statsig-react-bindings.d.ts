// Minimal fallback typings to keep TS unblocked in restricted environments.
declare module "@statsig/react-bindings" {
  import type { ComponentType, ReactNode } from "react";

  export const StatsigProvider: ComponentType<{
    children?: ReactNode;
    client?: unknown;
    sdkKey?: string;
    user?: unknown;
    loadingComponent?: ReactNode | null;
  }>;

  export function useClientAsyncInit(
    sdkKey: string,
    user: unknown,
    options?: unknown,
  ): { client: { checkGate: (gateName: string) => boolean } };

  export function useStatsigClient(): {
    client: { checkGate: (gateName: string) => boolean };
  };
}

