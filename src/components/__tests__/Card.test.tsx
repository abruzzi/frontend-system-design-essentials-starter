import React from "react";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { axe } from 'jest-axe';
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BoardProvider, EMPTY_BOARD_STATE } from "../BoardContext";
import { QueryProvider } from "../QueryProvider";

import { Card } from "../Card";

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

  describe("Assignee Display", () => {
    it('should show "?" placeholder when no assignee', () => {
      renderWithProviders(<Card id="TICKET-1" title="Unassigned" />);

      expect(screen.getByText("?")).toBeVisible();
    });

    it("should show assignee first initial", () => {
      const assignee: User = {
        id: 1,
        name: "John Doe",
        avatar_url: "",
      };

      renderWithProviders(
        <Card id="TICKET-1" title="Assigned task" assignee={assignee} />,
      );

      expect(screen.getByText("J")).toBeVisible();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible menu button", () => {
      renderWithProviders(<Card id="TICKET-1" title="Test" />);

      const button = screen.getByLabelText(/open card menu/i);
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("title", "More actions");
    });

    it("should have proper semantic structure", () => {
      renderWithProviders(<Card id="TICKET-1" title="Test Card" />);

      // Card should be an article
      const article = screen.getByRole("article");
      expect(article).toBeVisible();

      // Title should be a heading
      const heading = screen.getByRole("heading", { name: /test card/i });
      expect(heading).toBeVisible();

      // Should have buttons (menu and assignee)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Card accessibility', () => {
    it('has no WCAG violations (default state)', async () => {
      const { container } = renderWithProviders(
        <Card id="42" title="Refactor drag handle" assignee="Juntao" />
      );

      const results = await axe(container, {
        rules: {
          // Example: enable/disable rules if you have known patterns
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Delete Interaction (with real context!)", () => {
    it("should call delete API when archive is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Card id="TICKET-99" title="To Delete" />);

      // Open menu
      const menuButton = await screen.findByLabelText(/open card menu/i);
      await user.click(menuButton);

      // Click archive button
      const archiveButton = await screen.findByText(/archive card/i);
      await user.click(archiveButton);

      // Verify fetch was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/cards/TICKET-99",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("should handle delete failure gracefully", async () => {
      const user = userEvent.setup();

      // Mock fetch to fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      renderWithProviders(<Card id="TICKET-99" title="Fail Delete" />);

      // Open menu and attempt delete
      const menuButton = await screen.findByLabelText(/open card menu/i);
      await user.click(menuButton);

      const archiveButton = await screen.findByText(/archive card/i);
      await user.click(archiveButton);

      // Give it time to process
      await waitFor(() => {
        // Card should still be visible (delete failed)
        expect(screen.getByText("Fail Delete")).toBeVisible();
      });
    });
  });
});
