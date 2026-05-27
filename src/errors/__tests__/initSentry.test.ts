import { describe, expect, it, vi } from "vitest";

const initMock = vi.fn();
const reactRouterV7BrowserTracingIntegrationMock = vi.fn(() => ({
  name: "react-router-v7-tracing",
}));

vi.mock("@sentry/react", () => ({
  init: initMock,
  reactRouterV7BrowserTracingIntegration:
    reactRouterV7BrowserTracingIntegrationMock,
  withSentryReactRouterV7Routing: (component: unknown) => component,
}));

describe("initSentry", () => {
  it("does nothing when VITE_SENTRY_DSN is missing", async () => {
    vi.stubEnv("VITE_SENTRY_DSN", "");

    const { initSentry } = await import("../initSentry.ts");
    initSentry();

    expect(initMock).not.toHaveBeenCalled();
  });

  it("initializes Sentry with react-router tracing when DSN is set", async () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://examplePublicDsn@ingest.sentry.io/1");

    const { initSentry } = await import("../initSentry.ts");
    initSentry();

    expect(reactRouterV7BrowserTracingIntegrationMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://examplePublicDsn@ingest.sentry.io/1",
        integrations: [expect.any(Object)],
      }),
    );
  });
});

