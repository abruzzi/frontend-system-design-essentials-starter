import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useState } from "react";
import { server } from "../../../../../test/msw-server.ts";
import { renderWithProviders } from "../../../../../test/renderWithProviders.tsx";
import {
  buildNormalizedBoard,
  sampleUser,
} from "../../../../../test/fixtures/board.ts";
import { useBoardContext } from "../../../../../shared/BoardContext.tsx";
import { CardEditModal } from "../CardEditModal.tsx";

vi.mock("../../UserSelect.tsx", () => ({
  UserSelect: ({ selected }: { selected: { name: string } | null }) => (
    <div data-testid="user-select">{selected?.name ?? "Unassigned"}</div>
  ),
}));

function CardEditModalHarness({
  cardId = "TICKET-2",
  initialOpen = true,
}: {
  cardId?: string;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const { state } = useBoardContext();
  const card = state.cardsById[cardId];

  return (
    <>
      <CardEditModal
        cardId={cardId}
        title={card?.title ?? "Assigned task"}
        description={card?.description}
        assignee={
          card?.assigneeId ? state.usersById[card.assigneeId] : undefined
        }
        open={open}
        onOpenChange={setOpen}
      />
      <span data-testid="modal-open">{open ? "open" : "closed"}</span>
      <span data-testid="card-title">{state.cardsById[cardId]?.title}</span>
    </>
  );
}

describe("CardEditModal", () => {
  beforeEach(() => {
    server.use(
      http.patch("/api/cards/:id", async ({ params, request }) => {
        const id = String(params.id);
        const payload = (await request.json()) as {
          title?: string;
          description?: string;
        };

        if (id === "TICKET-1") {
          return HttpResponse.json(
            { error: "Internal server error" },
            { status: 500 },
          );
        }

        return HttpResponse.json({
          id,
          title: payload.title ?? "Updated",
          description: payload.description,
        });
      }),
    );
  });

  it("renders the edit form when open", () => {
    renderWithProviders(<CardEditModalHarness />, {
      boardState: buildNormalizedBoard(),
    });

    expect(screen.getByText("Edit Card Details")).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue("Assigned task");
  });

  it("saves changes and closes the modal on success", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CardEditModalHarness cardId="TICKET-2" />, {
      boardState: buildNormalizedBoard(),
    });

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Observability update");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId("modal-open")).toHaveTextContent("closed");
    });

    expect(screen.getByTestId("card-title")).toHaveTextContent(
      "Observability update",
    );
  });

  it("keeps the modal open when TICKET-1 returns a server error", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => {});

    const state = buildNormalizedBoard();
    state.cardsById["TICKET-1"] = {
      id: "TICKET-1",
      title: "Fix the bug",
    };
    if (!state.columnsById["col-1"].cardIds.includes("TICKET-1")) {
      state.columnsById["col-1"].cardIds.unshift("TICKET-1");
    }

    renderWithProviders(<CardEditModalHarness cardId="TICKET-1" />, {
      boardState: state,
    });

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Should not persist");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save changes/i })).toBeEnabled();
    });

    expect(screen.getByTestId("modal-open")).toHaveTextContent("open");
    expect(screen.getByTestId("card-title")).toHaveTextContent("Fix the bug");
    vi.restoreAllMocks();
  });

  it("disables save when the title is empty", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CardEditModalHarness />, {
      boardState: buildNormalizedBoard(),
    });

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);

    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("syncs assignee display from props", () => {
    renderWithProviders(<CardEditModalHarness />, {
      boardState: buildNormalizedBoard(),
    });

    expect(screen.getByTestId("user-select")).toHaveTextContent(
      sampleUser.name,
    );
  });
});
