import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw-server.ts";
import { renderWithProviders } from "../../test/renderWithProviders.tsx";
import { YourWorkPage } from "../YourWorkPage.tsx";

describe("YourWorkPage", () => {
  it("renders board summaries from the API", async () => {
    server.use(
      http.get("/api/boards", () =>
        HttpResponse.json([
          {
            id: "1",
            name: "Product Development",
            description: "Main board",
            cardCount: 12,
            lastUpdated: "2024-01-15T10:30:00Z",
          },
        ]),
      ),
      http.get("/api/activities", () =>
        HttpResponse.json([
          { name: "Moved card TICKET-3 to Done", timestamp: Date.now() },
        ]),
      ),
    );

    renderWithProviders(<YourWorkPage />, { route: "/your-work" });

    expect(await screen.findByText("Your Work")).toBeInTheDocument();
    expect(screen.getByText("Product Development")).toBeInTheDocument();
    expect(screen.getByText("Main board")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /product development/i })).toHaveAttribute(
      "href",
      "/board/1",
    );
    expect(
      await screen.findByText("Moved card TICKET-3 to Done"),
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no boards", async () => {
    server.use(
      http.get("/api/boards", () => HttpResponse.json([])),
      http.get("/api/activities", () => HttpResponse.json([])),
    );

    renderWithProviders(<YourWorkPage />, { route: "/your-work" });

    expect(await screen.findByText("No boards found")).toBeInTheDocument();
    expect(await screen.findByText("No recent activity")).toBeInTheDocument();
  });

  it("shows an error message when activities fail to load", async () => {
    server.use(
      http.get("/api/boards", () =>
        HttpResponse.json([
          {
            id: "1",
            name: "Solo board",
            description: "Only board",
            cardCount: 1,
            lastUpdated: "2024-01-15T10:30:00Z",
          },
        ]),
      ),
      http.get("/api/activities", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    renderWithProviders(<YourWorkPage />, { route: "/your-work" });

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong loading activity/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Solo board")).toBeInTheDocument();
  });
});
