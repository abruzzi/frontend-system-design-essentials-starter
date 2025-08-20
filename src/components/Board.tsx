import { BoardColumn } from "./BoardColumn.tsx";
import { BoardControl } from "./BoardControl.tsx";
import { useEffect, useState } from "react";

export const Board = ({ id }) => {
  const [board, setBoard] = useState();

  useEffect(() => {
    fetch(`/api/board/${id}`)
      .then((r) => r.json())
      .then((data) => setBoard(data));
  }, []);

  return (
    <>
      <BoardControl />

      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">

        {board && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {board.columns.map((col) => (
              <section key={col.id} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">{col.title}</h2>
                <BoardColumn cards={col.cards} />
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
};
