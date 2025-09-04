import { Board } from "./Board.tsx";
import { TopBar } from "./TopBar.tsx";
import { useEffect } from "react";
import { useBoardContext } from "./BoardContext.tsx";

export const KanbanMockup = ({ id }: { id: string }) => {
  const { ingestBoard, ingestUsers } = useBoardContext();

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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <TopBar />
      <Board id={id} />
    </div>
  );
};
