import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";
import { BoardProvider, EMPTY_BOARD_STATE } from "../BoardContext";
import { QueryProvider } from "../QueryProvider";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryProvider>
      <BoardProvider initialState={EMPTY_BOARD_STATE}>{ui}</BoardProvider>
    </QueryProvider>,
  );
}

describe("Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch to return successful responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
  });

  describe("Rendering", () => {
    it("should render card with title and ID", () => {
      renderWithProviders(<Card id="TICKET-1" title="Fix the bug" />);

      expect(screen.getByText("Fix the bug")).toBeVisible();
      expect(screen.getByText("TICKET-1")).toBeVisible();
    });

    it("should render as semantic article element", () => {
      renderWithProviders(<Card id="TICKET-1" title="Test card" />);

      const article = screen.getByRole("article");
      expect(article).toBeVisible();
    });
  });
});
