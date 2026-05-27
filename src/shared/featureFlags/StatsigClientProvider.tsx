import type { ReactNode } from "react";
import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { useMemo } from "react";

const STORAGE_KEY = "statsig_anon_user_id";

function getOrCreateAnonymousUserID(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const newId =
      globalThis.crypto?.randomUUID?.() ??
      `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;

    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    return `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}

export function StatsigClientProvider(props: { children: ReactNode }) {
  const sdkKey = import.meta.env.VITE_STATSIG_CLIENT_KEY;

  // Keep app functional if Statsig isn't configured.
  if (!sdkKey) return props.children;

  const userID = useMemo(() => getOrCreateAnonymousUserID(), []);
  const user = useMemo(() => ({ userID }), [userID]);

  // Expose the ID for demo targeting.
  if (typeof window !== "undefined") {
    (window as any).__STATSIG_USER_ID__ = userID;
  }

  const { client } = useClientAsyncInit(sdkKey, user);

  return (
    <StatsigProvider client={client} loadingComponent={null}>
      {props.children}
    </StatsigProvider>
  );
}

