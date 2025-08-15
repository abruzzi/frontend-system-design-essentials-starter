import { BoardColumn } from "./BoardColumn.tsx";
import { BoardControl } from "./BoardControl.tsx";

export const Board = () => (
  <>
    <BoardControl />

    <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BoardColumn
          cards={[
            { id: "TICKET-1", title: "This is a ticket" },
            { id: "TICKET-1", title: "This is a ticket" },
            { id: "TICKET-1", title: "This is a ticket" },
          ]}
        />
        <BoardColumn cards={[{ id: "TICKET-1", title: "This is a ticket" }]} />
        <BoardColumn
          cards={[
            { id: "TICKET-1", title: "This is a ticket" },
            { id: "TICKET-1", title: "This is a ticket" },
          ]}
        />
      </div>
    </main>
  </>
);
