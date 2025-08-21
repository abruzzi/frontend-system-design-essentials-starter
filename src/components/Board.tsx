import { BoardControl } from "./BoardControl.tsx";
import { useEffect, useState } from "react";
import { ListView } from "./ListView.tsx";
import { BoardView } from "./BoardView.tsx";

type ViewType = "board" | "list";

export const Board = ({ id }: { id: string }) => {
  const [board, setBoard] = useState();
  const [view, setView] = useState<ViewType>("board");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const url = `/api/board/${id}${search ? `?q=${encodeURIComponent(search)}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setBoard(data));
  }, [id, search]);

  return (
    <>
      <BoardControl
        view={view}
        onToggleView={() => setView((v) => (v === "board" ? "list" : "board"))}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        {board && (
          <>
            {view === "board" ? (
              <BoardView board={board} />
            ) : (
              <ListView board={board} />
            )}
          </>
        )}
      </main>
    </>
  );
};
