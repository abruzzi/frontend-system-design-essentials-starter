import type { CardType } from "../../types.ts";
import { useEffect, useState, type KeyboardEvent } from "react";
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
  const [createCardError, setCreateCardError] = useState<string | null>(null);
  const [moveCardToast, setMoveCardToast] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { addCard } = useBoardContext();

  const handleCreateCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;

    setIsCreating(true);
    setCreateCardError(null);

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

      if (!response.ok) {
        throw new Error(`Failed to create card: ${response.status}`);
      }

      const newCard = await response.json();

      addCard(columnId, {
        id: newCard.id,
        title: newCard.title,
      });

      setNewCardTitle("");
    } catch (error) {
      console.error("Error creating card:", error);

      setCreateCardError("We couldn’t create this card. Please try again.");
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

  useEffect(() => {
    if (!moveCardToast) return;
    const t = setTimeout(() => setMoveCardToast(null), 3500);
    return () => clearTimeout(t);
  }, [moveCardToast]);

  const handleMove = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    // Update UI optimistically
    moveCard(cardId, fromColumnId, toColumnId, fromIndex, toIndex);
    setMoveCardToast(null);

    // Sync with backend
    fetch(`/api/cards/${cardId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromColumnId, toColumnId, fromIndex, toIndex }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to move card (${res.status})`);
        }
      })
      .catch((err) => {
        console.error("Failed to move card:", err);
        moveCard(cardId, toColumnId, fromColumnId, toIndex, fromIndex);
        setMoveCardToast("Move failed. Your card was put back.");
      });
  };

  return (
    <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
      <div className="flex flex-col gap-4">
        {cards.map((c, idx) => (
          <ErrorBoundary
            key={c.id}
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
            id={`new-card-${columnId}`}
            aria-label="Add a new card"
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

        {createCardError && (
          <div
            role="alert"
            className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="leading-5">{createCardError}</p>
              <button
                type="button"
                onClick={() => setCreateCardError(null)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="Dismiss error"
                title="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>

      {moveCardToast && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div
            role="status"
            className="w-full max-w-md rounded-xl border border-red-200 bg-white shadow-lg"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm text-neutral-900 leading-5 flex-1">
                {moveCardToast}
              </p>
              <button
                type="button"
                onClick={() => setMoveCardToast(null)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Dismiss notification"
                title="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
