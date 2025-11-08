import type { CardType } from "../../types.ts";
import { useState, type KeyboardEvent } from "react";
import { useBoardContext } from "../../shared/BoardContext.tsx";
import { Plus } from "lucide-react";
import { ErrorBoundary } from "../../shared/ErrorBoundary.tsx";
import { DraggableCard } from "./card/DraggableCard.tsx";

type BoardColumnProps = {
  cards: CardType[];
  columnId: string;
};

export const BoardColumn = ({ cards, columnId }: BoardColumnProps) => {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { addCard } = useBoardContext();

  const handleCreateCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          columnId,
        }),
      });

      if (response.ok) {
        const newCard = await response.json();

        addCard(columnId, {
          id: newCard.id,
          title: newCard.title,
        });
        setNewCardTitle("");
      } else {
        console.error("Failed to create card");
      }
    } catch (error) {
      console.error("Error creating card:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateCard();
    }
  };

  const { moveCard } = useBoardContext();

  const handleMove = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    // Update UI optimistically
    moveCard(cardId, fromColumnId, toColumnId, fromIndex, toIndex);

    // Sync with backend
    fetch(`/api/cards/${cardId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromColumnId, toColumnId, fromIndex, toIndex }),
    }).catch((err) => {
      console.error("Failed to move card:", err);
      // Could add error handling/revert logic here
    });
  };

  return (
    <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
      <div className="flex flex-col gap-4">
        {cards.map((c, idx) => (
          <ErrorBoundary
            key={idx}
            fallback={
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">Card failed to load</p>
                <p className="text-xs text-neutral-500 mt-1">ID: {c.id}</p>
              </div>
            }
          >
            <DraggableCard
              id={c.id}
              title={c.title}
              description={c.description}
              assignee={c.assignee}
              columnId={columnId}
              index={idx}
              onMove={handleMove}
            />
          </ErrorBoundary>
        ))}

        {/* Add new card UI */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Add a new card..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-neutral-200 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleCreateCard}
            disabled={isCreating || !newCardTitle.trim()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
            title="Add card"
          >
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
