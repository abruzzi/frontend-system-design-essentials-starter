import { Board } from "./Board.tsx";
import { TopBar } from "./TopBar.tsx";
import { useEffect } from "react";
import { useBoardContext } from "./BoardContext.tsx";

export const BoardPage = ({ id }: { id: string }) => {
  const { ingestBoard, ingestUsers, upsertUser, updateCard } =
    useBoardContext();

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/2`).then((r) => r.json()),
      fetch(`/api/board/${id}`).then((r) => r.json()),
    ])
      .then(([user, board]) => {
        ingestUsers([user]);
        ingestBoard(board);
      })
      .catch((err) => {
        console.error("fetch failed", err);
      });
  }, [id, ingestUsers, ingestBoard]);

  useEffect(() => {
    const es = new EventSource(`/api/board/${id}/events`);

    es.onopen = () => {
      console.log('sse connection opened');
    }

    es.addEventListener("card-assigned", (event) => {
      const data = JSON.parse(event.data);

      const { id: cardId, assignee: user } = data;
      if (user) {
        upsertUser(user); // Ensure user is in our local state
        updateCard(cardId, { assigneeId: user.id });
      } else {
        updateCard(cardId, { assigneeId: undefined });
      }
    });

    es.onerror = (error) => {
      console.log(`sse error: ${error}`);
    }

    return () => {
      console.log('closing');
      es.close();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <TopBar />
      <Board id={id} />
    </div>
  );
};
