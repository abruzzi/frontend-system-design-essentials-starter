import React from "react";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { axe } from "jest-axe";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { User } from "../../../../types.ts";
import { renderWithProviders } from "../../../../test/renderWithProviders.tsx";
import { server } from "../../../../test/msw-server.ts";

import { Card } from "../Card.tsx";

const defaultCardProps = { columnId: "col-1", index: 0 };

let deleteCalls = 0;

describe("Card Component", () => {
  beforeEach(() => {
    deleteCalls = 0;
    server.use(
      http.delete("/api/cards/:id", ({ params }) => {
        deleteCalls += 1;
        if (params.id === "TICKET-99") {
          return new HttpResponse(null, { status: 204 });
        }
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      }),
      http.patch("/api/cards/:id", () =>
        HttpResponse.json({ success: true }),
      ),
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("Rendering", () => {
    it("should render card with title and ID", () => {
      renderWithProviders(
        <Card id="TICKET-1" title="Fix the bug" {...defaultCardProps} />,
      );

      expect(screen.getByText("Fix the bug")).toBeVisible();
      expect(screen.getByText("TICKET-1")).toBeVisible();
    });

    it("should render as semantic article element", () => {
      renderWithProviders(
        <Card id="TICKET-1" title="Test card" {...defaultCardProps} />,
      );

      const article = screen.getByRole("article");
      expect(article).toBeVisible();
    });
  });

  describe("Assignee Display", () => {
    it('should show "?" placeholder when no assignee', () => {
      renderWithProviders(
        <Card id="TICKET-1" title="Unassigned" {...defaultCardProps} />,
      );

      expect(screen.getByText("?")).toBeVisible();
    });

    it("should show assignee first initial", () => {
      const assignee: User = {
        id: 1,
        name: "John Doe",
        avatar_url: "",
      };

      renderWithProviders(
        <Card
          id="TICKET-1"
          title="Assigned task"
          assignee={assignee}
          {...defaultCardProps}
        />,
      );

      expect(screen.getByText("J")).toBeVisible();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible menu button", () => {
      renderWithProviders(
        <Card id="TICKET-1" title="Test" {...defaultCardProps} />,
      );

      const button = screen.getByLabelText(/open card menu/i);
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("title", "More actions");
    });

    it("should have proper semantic structure", () => {
      renderWithProviders(
        <Card id="TICKET-1" title="Test Card" {...defaultCardProps} />,
      );

      const article = screen.getByRole("article");
      expect(article).toBeVisible();

      const heading = screen.getByRole("heading", { name: /test card/i });
      expect(heading).toBeVisible();

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Card accessibility", () => {
    it("has no WCAG violations (default state)", async () => {
      const assignee: User = {
        id: 1,
        name: "Juntao",
        avatar_url: "",
      };

      const { container } = renderWithProviders(
        <Card
          id="42"
          title="Refactor drag handle"
          assignee={assignee}
          {...defaultCardProps}
        />,
      );

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Delete Interaction (with real context!)", () => {
    it("should call delete API when archive is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <Card id="TICKET-99" title="To Delete" {...defaultCardProps} />,
      );

      const menuButton = await screen.findByLabelText(/open card menu/i);
      await user.click(menuButton);

      const archiveButton = await screen.findByText(/archive card/i);
      await user.click(archiveButton);

      await waitFor(() => {
        expect(deleteCalls).toBe(1);
      });
    });

    it("should handle delete failure gracefully", async () => {
      const user = userEvent.setup();

      server.use(
        http.delete("/api/cards/:id", () =>
          HttpResponse.json({ error: "Server error" }, { status: 500 }),
        ),
      );

      renderWithProviders(
        <Card id="TICKET-99" title="Fail Delete" {...defaultCardProps} />,
      );

      const menuButton = await screen.findByLabelText(/open card menu/i);
      await user.click(menuButton);

      const archiveButton = await screen.findByText(/archive card/i);
      await user.click(archiveButton);

      await waitFor(() => {
        expect(screen.getByText("Fail Delete")).toBeVisible();
      });
    });
  });
});
