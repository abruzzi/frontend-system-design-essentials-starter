import { LayoutGrid, List } from "lucide-react";

type ViewToggleProps = {
  view: "board" | "list";
  onToggle: (v: "board" | "list") => void;
};

export const ViewToggle = ({ view, onToggle }: ViewToggleProps) => (
  <div
    role="group"
    aria-label="Toggle board or list view"
    className="inline-flex rounded-md shadow-sm border border-neutral-300 overflow-hidden"
  >
    <button
      type="button"
      onClick={() => onToggle("board")}
      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition 
          ${view === "board" ? "bg-indigo-600 text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"}`}
      aria-pressed={view === "board"}
    >
      <LayoutGrid className="h-4 w-4" />
      Board
    </button>
    <button
      type="button"
      onClick={() => onToggle("list")}
      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition 
          ${view === "list" ? "bg-indigo-600 text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"}`}
      aria-pressed={view === "list"}
    >
      <List className="h-4 w-4" />
      List
    </button>
  </div>
);
