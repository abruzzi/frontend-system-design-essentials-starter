import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw-server.ts";
import { renderWithProviders } from "../../../test/renderWithProviders.tsx";
import { emptyColumnBoardState } from "../../../test/fixtures/board.ts";
import { useBoardContext } from "../../../shared/BoardContext.tsx";
import type { CardType } from "../../../types.ts";
import { BoardColumn } from "../BoardColumn.tsx";

vi.mock("../card/DraggableCard.tsx", () => ({
  DraggableCard: ({ title, id }: { title: string; id: string }) => (
    <article>
      <h3>{title}</h3>
      <span className="font-mono">{id}</span>
    </article>
  ),
}));

function BoardColumnFromContext({ columnId }: { columnId: string }) {
  const { state } = useBoardContext();
  const column = state.columnsById[columnId];
  const cards: CardType[] = column.cardIds.map((cardId) => {
    const card = state.cardsById[cardId];
    const assignee = card.assigneeId
      ? state.usersById[card.assigneeId]
      : undefined;
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      assignee,
    };
  });

  return <BoardColumn columnId={columnId} cards={cards} />;
}

describe("BoardColumn", () => {
  beforeEach(() => {
    server.use(
      http.post("/api/cards", async ({ request }) => {
        const payload = (await request.json()) as {
          title: string;
          columnId: string;
        };
        return HttpResponse.json(
          { id: "TICKET-NEW", title: payload.title.trim() },
          { status: 201 },
        );
      }),
    );
  });

  it("renders existing cards", () => {
    const state = emptyColumnBoardState("col-1");
    state.cardsById["TICKET-1"] = { id: "TICKET-1", title: "Existing card" };
    state.columnsById["col-1"].cardIds = ["TICKET-1"];

    renderWithProviders(<BoardColumnFromContext columnId="col-1" />, {
      boardState: state,
    });

    expect(screen.getByText("Existing card")).toBeInTheDocument();
  });

  it("creates a card when the user submits the add-card form", async () => {
    const user = userEvent.setup();

    renderWithProviders(<BoardColumnFromContext columnId="col-1" />, {
      boardState: emptyColumnBoardState("col-1"),
    });

    const input = screen.getByLabelText(/add a new card/i);
    await user.type(input, "Observability demo card");
    await user.click(screen.getByRole("button", { name: /add card/i }));

    expect(await screen.findByText("Observability demo card")).toBeInTheDocument();
    expect(screen.getByText("TICKET-NEW")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("creates a card when the user presses Enter", async () => {
    const user = userEvent.setup();

    renderWithProviders(<BoardColumnFromContext columnId="col-1" />, {
      boardState: emptyColumnBoardState("col-1"),
    });

    const input = screen.getByLabelText(/add a new card/i);
    await user.type(input, "Card from Enter{Enter}");

    expect(await screen.findByText("Card from Enter")).toBeInTheDocument();
  });

  it("does not submit when the title is only whitespace", async () => {
    const user = userEvent.setup();

    renderWithProviders(<BoardColumnFromContext columnId="col-1" />, {
      boardState: emptyColumnBoardState("col-1"),
    });

    const button = screen.getByRole("button", { name: /add card/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/add a new card/i), "   ");
    expect(button).toBeDisabled();
  });
});
