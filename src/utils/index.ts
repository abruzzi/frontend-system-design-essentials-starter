import type {
  BoardPayload,
  NormalizedBoard,
  NormalizedCard,
  NormalizedColumn,
  User,
} from "../types.ts";

export function normalizeBoard(payload: BoardPayload): NormalizedBoard {
  const usersById: Record<number, User> = {};
  const cardsById: Record<string, NormalizedCard> = {};
  const columnsById: Record<string, NormalizedColumn> = {};
  const columnOrder: string[] = [];

  for (const col of payload.columns) {
    const cardIds: string[] = [];

    for (const c of col.cards) {
      let assigneeId: number | undefined;

      if (c.assignee) {
        usersById[c.assignee.id] = c.assignee;
        assigneeId = c.assignee.id;
      }

      cardsById[c.id] = {
        id: c.id,
        title: c.title,
        assigneeId,
      };

      cardIds.push(c.id);
    }

    columnsById[col.id] = {
      id: col.id,
      title: col.title,
      cardIds,
    };

    columnOrder.push(col.id);
  }

  const normalised = { usersById, cardsById, columnsById, columnOrder };

  console.log(normalised);

  return normalised;
}
