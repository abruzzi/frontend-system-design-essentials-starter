import { BoardControl } from "./BoardControl.tsx";
import { useEffect, useState } from "react";
import { ListView } from "./ListView.tsx";
import { BoardView } from "./BoardView.tsx";
import { useBoardContext } from "./BoardContext.tsx";

type ViewType = "board" | "list";

export const Board = ({ id }: { id: string }) => {
  const [view, setView] = useState<ViewType>("board");
  const [search, setSearch] = useState("");

  const { ingestBoard, state } = useBoardContext();
  const selectedAssigneeIds = state.selectedAssigneeIds;


  useEffect(() => {
    const ctrl = new AbortController();

    const params = new URLSearchParams();
    if (search) {
      params.append('q', search);
    }
    if (selectedAssigneeIds.length > 0) {
      params.append('assigneeIds', selectedAssigneeIds.join(','));
    }
    
    const url = `/api/board/${id}${params.toString() ? `?${params.toString()}` : ""}`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => ingestBoard(data))
      .catch(e => {
        console.error(e);
      });

    return () => ctrl.abort("query changed");
  }, [id, search, selectedAssigneeIds, ingestBoard]);

  return (
    <>
      <BoardControl
        view={view}
        onToggleView={() => setView((v) => (v === "board" ? "list" : "board"))}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        {view === "board" ? <BoardView /> : <ListView />}
      </main>
    </>
  );
};
