import { BoardColumn } from "./BoardColumn.tsx";
import type { BoardPayload } from "../types.ts";

export const BoardView = ({ board }: { board: BoardPayload }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {board.columns.map((col) => (
        <section key={col.id} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{col.title}</h2>
          <BoardColumn cards={col.cards} />
        </section>
      ))}
    </div>
  );
};
