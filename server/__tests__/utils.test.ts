import { describe, it, expect, vi } from "vitest";
import { filterBoard, findCardById, variableDelay } from "../utils.ts";

const boardData = {
  columns: [
    {
      id: "col-1",
      title: "Todo",
      cards: [
        { id: "TICKET-1", title: "Fix login bug" },
        {
          id: "TICKET-2",
          title: "Design board",
          assignee: { id: 2, name: "Charlie Moore", avatar_url: "" },
        },
      ],
    },
  ],
};

describe("server utils", () => {
  describe("findCardById", () => {
    it("finds a card case-insensitively", () => {
      const match = findCardById(boardData, "ticket-1");
      expect(match?.card.id).toBe("TICKET-1");
      expect(match?.column.id).toBe("col-1");
    });

    it("returns null when the card does not exist", () => {
      expect(findCardById(boardData, "missing")).toBeNull();
    });
  });

  describe("filterBoard", () => {
    it("filters cards by title, id, or assignee name", () => {
      const result = filterBoard(boardData, "charlie");
      expect(result.columns[0].cards).toHaveLength(1);
      expect(result.columns[0].cards[0].id).toBe("TICKET-2");
    });

    it("filters by assignee ids", () => {
      const result = filterBoard(boardData, "", [2]);
      expect(result.columns[0].cards).toHaveLength(1);
      expect(result.columns[0].cards[0].id).toBe("TICKET-2");
    });

    it("returns all cards when query and assignee filters are empty", () => {
      const result = filterBoard(boardData, "");
      expect(result.columns[0].cards).toHaveLength(2);
    });
  });

  describe("variableDelay", () => {
    it("uses a shorter base delay for instant-style queries", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      expect(variableDelay("inst")).toBe(150);
      vi.restoreAllMocks();
    });
  });
});
