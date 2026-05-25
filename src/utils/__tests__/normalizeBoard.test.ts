import { describe, it, expect } from "vitest";
import { normalizeBoard } from "../index.ts";
import { sampleBoardPayload } from "../../test/fixtures/board.ts";

describe("normalizeBoard", () => {
  it("normalizes columns, cards, and assignees into lookup maps", () => {
    const result = normalizeBoard(sampleBoardPayload);

    expect(result.columnOrder).toEqual(["col-1", "col-2"]);
    expect(result.cardsById["TICKET-1"]).toEqual({
      id: "TICKET-1",
      title: "Fix the bug",
    });
    expect(result.cardsById["TICKET-2"]?.assigneeId).toBe(1);
    expect(result.usersById[1]?.name).toBe("John Doe");
    expect(result.columnsById["col-1"]?.cardIds).toEqual([
      "TICKET-1",
      "TICKET-2",
    ]);
  });

  it("returns empty maps for an empty board", () => {
    const result = normalizeBoard({ columns: [] });

    expect(result.columnOrder).toEqual([]);
    expect(result.cardsById).toEqual({});
    expect(result.usersById).toEqual({});
  });
});
