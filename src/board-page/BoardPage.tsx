import { Board } from "./board/Board.tsx";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useBoardContext } from "../shared/BoardContext.tsx";
import { BoardSkeleton } from "./board/BoardSkeleton.tsx";

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
}

export const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = id || "1";
  const { state, ingestBoard, ingestUsers, upsertUser, updateCard } =
    useBoardContext();

  useEffect(() => {
    const ctrl = new AbortController();

    async function loadBoard() {
      try {
        const [user, board] = await Promise.all([
          fetchJson(`/api/users/2`, ctrl.signal),
          fetchJson(`/api/board/${boardId}`, ctrl.signal),
        ]);
        ingestUsers([user]);
        ingestBoard(board);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("fetch failed", err);
      }
    }

    loadBoard();
    return () => ctrl.abort();
  }, [boardId, ingestUsers, ingestBoard]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const es = new EventSource(`/api/board/${boardId}/events`);

    const parseEventData = (raw: string) => {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch (err) {
        console.error("Failed to parse SSE payload", err);
        return null;
      }
    };

    es.addEventListener("card-assigned", (event) => {
      const data = parseEventData(event.data);
      if (!data) return;

      const cardId = data.id as string;
      const user = data.assignee as { id: number } | undefined;
      if (user) {
        upsertUser(user);
        updateCard(cardId, { assigneeId: user.id });
      } else {
        updateCard(cardId, { assigneeId: undefined });
      }
    });

    es.addEventListener("card-updated", (event) => {
      const data = parseEventData(event.data);
      if (!data) return;

      const cardId = data.id as string;
      const title = data.title as string | undefined;
      const description = data.description as string | undefined;
      const user = data.assignee as { id: number } | undefined;

      if (user) {
        upsertUser(user);
      }

      updateCard(cardId, {
        title,
        description,
        assigneeId: user?.id,
      });
    });

    es.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      es.close();
    };
  }, [boardId, upsertUser, updateCard]);

  if (state.columnOrder.length === 0) {
    return <BoardSkeleton />;
  }

  return <Board id={boardId} />;
};
