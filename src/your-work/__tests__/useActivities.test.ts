import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw-server.ts";
import { useActivities } from "../useActivities.ts";

describe("useActivities", () => {
  it("loads activities from the API", async () => {
    server.use(
      http.get("/api/activities", () =>
        HttpResponse.json([
          { name: "Created card TICKET-10", timestamp: 1_700_000_000_000 },
          { name: "Updated board settings", timestamp: 1_700_000_100_000 },
        ]),
      ),
    );

    const { result } = renderHook(() => useActivities());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.activities).toHaveLength(2);
    expect(result.current.activities[0].name).toBe("Created card TICKET-10");
  });

  it("sets error when the request fails", async () => {
    server.use(
      http.get("/api/activities", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.activities).toEqual([]);
  });

  it("does not set error when the request is aborted", async () => {
    server.use(
      http.get("/api/activities", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json([]);
      }),
    );

    const { result, unmount } = renderHook(() => useActivities());

    unmount();

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });
});
