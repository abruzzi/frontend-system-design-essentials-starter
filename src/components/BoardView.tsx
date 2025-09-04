import { BoardColumn } from "./BoardColumn.tsx";
import type { CardType } from "../types.ts";
import { useBoardContext } from "./BoardContext.tsx";

export const BoardView = () => {
  const { state } = useBoardContext();

  console.log(state);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {state.columnOrder.map((colId) => {
        const column = state.columnsById[colId];

        const hydratedCards: CardType[] = column.cardIds.map((cardId) => {
          const card = state.cardsById[cardId];
          const assignee = card.assigneeId
            ? state.usersById[card.assigneeId]
            : undefined;
          return { ...card, assignee };
        });

        return (
          <section key={column.id} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{column.title}</h2>
            <BoardColumn cards={hydratedCards} />
          </section>
        );
      })}
    </div>
  );
};
