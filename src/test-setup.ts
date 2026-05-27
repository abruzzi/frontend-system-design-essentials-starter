import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { server } from "./test/msw-server.ts";

expect.extend(toHaveNoViolations);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Statsig: tests run without StatsigProvider; gate checks default to off.
vi.mock("@statsig/react-bindings", () => ({
  StatsigProvider: ({ children }: { children: ReactNode }) => children,
  useClientAsyncInit: () => ({
    client: { checkGate: () => false },
  }),
  useStatsigClient: () => ({
    client: { checkGate: () => false },
  }),
}));

// Mock ResizeObserver (used by Radix UI Popover)
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
