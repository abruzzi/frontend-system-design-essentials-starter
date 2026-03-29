import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  BoardProvider,
  EMPTY_BOARD_STATE,
} from "../../../shared/BoardContext.tsx";
import { ListView } from "../ListView.tsx";

function renderListViewWithBoardState() {
  const initialState = {
    ...EMPTY_BOARD_STATE,
    usersById: {
      1: { id: 1, name: "John Doe", avatar_url: "https://example.com/a.png" },
    },
    cardsById: {
      "TICKET-1": { id: "TICKET-1", title: "Fix the bug", assigneeId: 1 },
    },
    columnsById: {
      "col-1": { id: "col-1", title: "Todo", cardIds: ["TICKET-1"] },
    },
    columnOrder: ["col-1"],
  } satisfies typeof EMPTY_BOARD_STATE;

  return render(
    <BoardProvider initialState={initialState}>
      <ListView />
    </BoardProvider>,
  );
}

describe("ListView", () => {
  it("hides the assignee column", () => {
    // given
    renderListViewWithBoardState();

    // then
    expect(screen.queryByText(/assignee/i)).not.toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });
});

