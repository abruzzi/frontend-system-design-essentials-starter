import { Board } from "./Board.tsx";
import { TopBar } from "./TopBar.tsx";
import { useEffect } from "react";
import { useBoardContext } from "./BoardContext.tsx";

export const KanbanMockup = ({ id }: { id: string }) => {
  const { state, ingestBoard } = useBoardContext();
  const currentUser = state.usersById[2];

  useEffect(() => {
    const url = `/api/board/${id}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => ingestBoard(data));
  }, [id]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      {currentUser && <TopBar user={currentUser} />}
      <Board id={id} />
    </div>
  );
};
