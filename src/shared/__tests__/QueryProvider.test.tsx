import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw-server.ts";
import { QueryProvider, useQuery, usePrefetch } from "../QueryProvider.tsx";

function DataViewer({ queryKey }: { queryKey: string }) {
  const { data, isLoading, error } = useQuery(queryKey, async () => {
    const res = await fetch(`/api/query-fixture/${queryKey}`);
    if (!res.ok) throw new Error("Request failed");
    return res.json() as Promise<{ message: string }>;
  });

  if (isLoading) return <div>Loading</div>;
  if (error) return <div>Error</div>;
  if (!data) return <div>Empty</div>;
  return <div>{data.message}</div>;
}

function PrefetchButton() {
  const prefetch = usePrefetch();
  return (
    <button
      type="button"
      onClick={() =>
        prefetch("prefetch-key", async () => {
          const res = await fetch("/api/query-fixture/prefetch-key");
          return res.json();
        })
      }
    >
      Prefetch
    </button>
  );
}

function PrefetchResult() {
  const { data, isLoading } = useQuery("prefetch-key", async () => {
    const res = await fetch("/api/query-fixture/prefetch-key");
    return res.json() as Promise<{ message: string }>;
  });
  if (isLoading) return <div>Loading prefetch</div>;
  return <div>{data?.message ?? "No data"}</div>;
}

describe("QueryProvider", () => {
  it("fetches data and renders the result", async () => {
    server.use(
      http.get("/api/query-fixture/hello", () =>
        HttpResponse.json({ message: "Hello from API" }),
      ),
    );

    render(
      <QueryProvider>
        <DataViewer queryKey="hello" />
      </QueryProvider>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(await screen.findByText("Hello from API")).toBeInTheDocument();
  });

  it("shows error state when the request fails", async () => {
    server.use(
      http.get("/api/query-fixture/fail", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    render(
      <QueryProvider>
        <DataViewer queryKey="fail" />
      </QueryProvider>,
    );

    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it("prefetch populates the cache for useQuery", async () => {
    server.use(
      http.get("/api/query-fixture/prefetch-key", () =>
        HttpResponse.json({ message: "Prefetched data" }),
      ),
    );

    const user = userEvent.setup();

    render(
      <QueryProvider>
        <PrefetchButton />
        <PrefetchResult />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Prefetch" }));

    await waitFor(() => {
      expect(screen.getByText("Prefetched data")).toBeInTheDocument();
    });
  });
});
