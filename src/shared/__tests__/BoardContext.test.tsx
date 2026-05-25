import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  BoardProvider,
  EMPTY_BOARD_STATE,
  useBoardContext,
} from "../BoardContext.tsx";
import {
  buildNormalizedBoard,
  sampleBoardPayload,
} from "../../test/fixtures/board.ts";
import { normalizeBoard } from "../../utils/index.ts";

function wrapper(initialState = EMPTY_BOARD_STATE) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <BoardProvider initialState={initialState}>{children}</BoardProvider>
    );
  };
}

describe("BoardContext", () => {
  it("ingestBoard merges normalized board data into state", () => {
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.ingestBoard(sampleBoardPayload);
    });

    expect(result.current.state.columnOrder).toEqual(["col-1", "col-2"]);
    expect(result.current.state.cardsById["TICKET-1"]?.title).toBe(
      "Fix the bug",
    );
  });

  it("addCard appends a card to the target column", () => {
    const initial = buildNormalizedBoard();
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(initial),
    });

    act(() => {
      result.current.addCard("col-1", {
        id: "TICKET-99",
        title: "New card",
      });
    });

    expect(result.current.state.cardsById["TICKET-99"]?.title).toBe("New card");
    expect(result.current.state.columnsById["col-1"]?.cardIds).toContain(
      "TICKET-99",
    );
  });

  it("moveCard reorders cards within the same column", () => {
    const initial = buildNormalizedBoard();
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(initial),
    });

    act(() => {
      result.current.moveCard("TICKET-2", "col-1", "col-1", 1, 0);
    });

    expect(result.current.state.columnsById["col-1"]?.cardIds).toEqual([
      "TICKET-2",
      "TICKET-1",
    ]);
  });

  it("removeCard deletes the card from state and column cardIds", () => {
    const initial = buildNormalizedBoard();
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(initial),
    });

    act(() => {
      result.current.removeCard("TICKET-1");
    });

    expect(result.current.state.cardsById["TICKET-1"]).toBeUndefined();
    expect(result.current.state.columnsById["col-1"]?.cardIds).not.toContain(
      "TICKET-1",
    );
  });

  it("toggleAssigneeFilter adds and removes assignee ids", () => {
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.toggleAssigneeFilter(2);
    });
    expect(result.current.state.selectedAssigneeIds).toEqual([2]);

    act(() => {
      result.current.toggleAssigneeFilter(2);
    });
    expect(result.current.state.selectedAssigneeIds).toEqual([]);
  });

  it("updateCard patches card fields", () => {
    const initial = buildNormalizedBoard();
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(initial),
    });

    act(() => {
      result.current.updateCard("TICKET-1", {
        title: "Updated title",
        assigneeId: 1,
      });
    });

    expect(result.current.state.cardsById["TICKET-1"]?.title).toBe(
      "Updated title",
    );
    expect(result.current.state.cardsById["TICKET-1"]?.assigneeId).toBe(1);
  });

  it("ingestUsers merges users into usersById", () => {
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.ingestUsers([
        {
          id: 9,
          name: "New User",
          description: "",
          avatar_url: "",
        },
      ]);
    });

    expect(result.current.state.usersById[9]?.name).toBe("New User");
  });

  it("normalizeBoard via ingestBoard preserves assignee users", () => {
    const { result } = renderHook(() => useBoardContext(), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.ingestBoard(sampleBoardPayload);
    });

    const normalized = normalizeBoard(sampleBoardPayload);
    expect(result.current.state.usersById[1]?.name).toBe(
      normalized.usersById[1]?.name,
    );
  });
});
