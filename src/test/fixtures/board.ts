import type { BoardPayload, NormalizedBoard, User } from "../../types.ts";
import { EMPTY_BOARD_STATE } from "../../shared/BoardContext.tsx";

export const sampleUser: User = {
  id: 1,
  name: "John Doe",
  description: "Engineer",
  avatar_url: "https://example.com/a.png",
};

export const sampleBoardPayload: BoardPayload = {
  columns: [
    {
      id: "col-1",
      title: "Todo",
      cards: [
        { id: "TICKET-1", title: "Fix the bug" },
        {
          id: "TICKET-2",
          title: "Assigned task",
          assignee: { id: 1, name: "John Doe", avatar_url: sampleUser.avatar_url },
        },
      ],
    },
    {
      id: "col-2",
      title: "Done",
      cards: [{ id: "TICKET-3", title: "Ship it" }],
    },
  ],
};

export function buildNormalizedBoard(
  overrides: Partial<NormalizedBoard> = {},
): NormalizedBoard {
  return {
    ...EMPTY_BOARD_STATE,
    usersById: { 1: sampleUser },
    cardsById: {
      "TICKET-1": { id: "TICKET-1", title: "Fix the bug" },
      "TICKET-2": { id: "TICKET-2", title: "Assigned task", assigneeId: 1 },
      "TICKET-3": { id: "TICKET-3", title: "Ship it" },
    },
    columnsById: {
      "col-1": { id: "col-1", title: "Todo", cardIds: ["TICKET-1", "TICKET-2"] },
      "col-2": { id: "col-2", title: "Done", cardIds: ["TICKET-3"] },
    },
    columnOrder: ["col-1", "col-2"],
    ...overrides,
  };
}

export function emptyColumnBoardState(columnId = "col-1"): NormalizedBoard {
  return {
    ...EMPTY_BOARD_STATE,
    cardsById: {},
    columnsById: {
      [columnId]: { id: columnId, title: "Todo", cardIds: [] },
    },
    columnOrder: [columnId],
  };
}
