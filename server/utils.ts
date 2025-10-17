import { BoardPayload, Column } from "./types.ts";

export function variableDelay(q: string): number {
  const base = q.startsWith("inst") ? 150 : q.startsWith("ins") ? 650 : 300;
  const jitter = Math.floor(Math.random() * 120); // 0-119ms
  return base + jitter;
}

export function findCardById(boardData: BoardPayload, id: string) {
  for (const col of boardData.columns) {
    const card = col.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (card) return { card, column: { id: col.id, title: col.title } };
  }
  return null;
}

export function filterBoard(
  data: BoardPayload,
  q: string,
  assigneeIds: number[] = [],
): BoardPayload {
  const filteredColumns: Column[] = data.columns.map((col) => ({
    ...col,
    cards: col.cards.filter((c) => {
      // Text search filter
      let matchesTextSearch = true;
      if (q) {
        const needle = q.trim().toLowerCase();
        const inTitle = c.title.toLowerCase().includes(needle);
        const inId = c.id.toLowerCase().includes(needle);
        const inAssignee =
          c.assignee?.name?.toLowerCase().includes(needle) ?? false;
        matchesTextSearch = inTitle || inId || inAssignee;
      }

      // Assignee filter
      let matchesAssigneeFilter = true;
      if (assigneeIds.length > 0) {
        matchesAssigneeFilter = c.assignee
          ? assigneeIds.includes(c.assignee.id)
          : false;
      }

      return matchesTextSearch && matchesAssigneeFilter;
    }),
  }));

  return { columns: filteredColumns };
}