import { Board } from "./Board.tsx";
import { TopBar } from "./TopBar.tsx";

export const KanbanMockup = () => (
  <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
    <TopBar />
    <Board />
  </div>
);
