import { BoardControl } from "./board-control/BoardControl.tsx";
import { lazy, Suspense, useEffect, useState } from "react";
import { BoardView } from "./BoardView.tsx";
import { useBoardContext } from "../../shared/BoardContext.tsx";
import { useDebounced } from "../../utils";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.tsx";

type ViewType = "board" | "list";

const ListView = lazy(() =>
  import("./ListView.tsx").then((mod) => ({ default: mod.ListView })),
);

export const Board = ({ id }: { id: string }) => {
  const [view, setView] = useState<ViewType>("board");
  const [search, setSearch] = useState("");
  const debouncedKeyword = useDebounced(search);

  const { ingestBoard, state } = useBoardContext();
  const selectedAssigneeIds = state.selectedAssigneeIds;

  useKeyboardShortcuts([
    {
      key: "k",
      ctrlKey: true,
      handler: () => {
        // Open command palette / search
        console.log("Open search");
      },
      description: "Open search",
    },
    {
      key: "/",
      handler: () => {
        // Focus search input
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      },
      description: "Focus search",
    },
    {
      key: "?",
      shiftKey: true,
      handler: () => {
        // Show keyboard shortcuts help
        console.log("Show shortcuts");
      },
      description: "Show keyboard shortcuts",
    },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const ctrl = new AbortController();

    const params = new URLSearchParams();
    if (debouncedKeyword) {
      params.append("q", debouncedKeyword);
    }
    if (selectedAssigneeIds.length > 0) {
      params.append("assigneeIds", selectedAssigneeIds.join(","));
    }

    const url = `/api/board/${id}${params.toString() ? `?${params.toString()}` : ""}`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => ingestBoard(data))
      .catch((e) => {
        console.error(e);
      });

    return () => ctrl.abort("query changed");
  }, [id, debouncedKeyword, selectedAssigneeIds, ingestBoard]);

  return (
    <>
      <BoardControl
        view={view}
        onToggleView={() => setView((v) => (v === "board" ? "list" : "board"))}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        {view === "board" ? (
          <BoardView />
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <ListView />
          </Suspense>
        )}
      </main>
    </>
  );
};
