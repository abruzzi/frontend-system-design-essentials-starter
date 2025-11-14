import * as Popover from "@radix-ui/react-popover";
import { lazy, LegacyRef, Suspense, useEffect, useRef, useState } from "react";
import { fetchUsers, UserSelect } from "./UserSelect.tsx";
import type { User } from "../../../types.ts";
import { useBoardContext } from "../../../shared/BoardContext.tsx";
import { MoreHorizontal, Archive, ArrowRight } from "lucide-react";
import { useHydrated } from "../../../hooks/useHydrated.ts";
import { usePrefetch } from "../../../shared/QueryProvider.tsx";
import { CardEditModalSkeleton } from "./edit-modal/CardEditModalSkeleton.tsx";

type CardProps = {
  id: string;
  title: string;
  assignee?: User;
  columnId: string;
  index: number;
};

const CardEditModal = lazy(() =>
  import("./edit-modal/CardEditModal.tsx").then((mod) => ({
    default: mod.CardEditModal,
  })),
);

export const Card = ({ id, title, assignee, columnId, index }: CardProps) => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { removeCard, updateCard, upsertUser, columns, moveCard } =
    useBoardContext();
  const isHydrated = useHydrated();

  const [isModalOpen, setModalOpen] = useState(false);

  const cardRef = useRef<HTMLElement | null>(null);

  const handleCardClick = (e: MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    const target = e.target as HTMLElement;

    if (
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest('[class*="rs__"]') || // react-select components (uses double underscore)
      target.closest('[id*="react-select"]') || // react-select input
      target.closest('[class*="rs-"]') // fallback for other react-select patterns
    ) {
      return;
    }

    if (!isUpdating && !isDeleting) {
      setModalOpen(true);
    }
  };

  const handleCardKeyDown = (e: KeyboardEvent) => {
    // Open modal on Enter or Space
    const target = e.target as HTMLElement;

    if (
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest('[class*="rs__"]') || // react-select components (uses double underscore)
      target.closest('[id*="react-select"]') || // react-select input
      target.closest('[class*="rs-"]') // fallback for other react-select patterns
    ) {
      return;
    }

    if ((e.key === "Enter" || e.key === " ") && !isUpdating && !isDeleting) {
      e.preventDefault();
      setModalOpen(true);
    }
  };

  // Focus back to card when modal closes
  useEffect(() => {
    if (!isModalOpen && cardRef.current) {
      // Use setTimeout to ensure focus happens after modal unmounts
      setTimeout(() => {
        cardRef.current?.focus();
      }, 0);
    }
  }, [isModalOpen]);

  async function handleAssignUser(user: User | null) {
    if (isUpdating) return;

    const previousAssignee = assignee;
    setIsUpdating(true);

    // Update local state
    if (user) {
      upsertUser(user); // Ensure user is in our local state
      updateCard(id, { assigneeId: user.id });
    } else {
      updateCard(id, { assigneeId: undefined });
    }

    setOpen(false);

    try {
      const payload = { assignee: user };
      const res = await fetch(`/api/cards/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update card ${id}`);
      }
    } catch (err) {
      console.error(err);
      // Update local state
      if (previousAssignee) {
        upsertUser(previousAssignee); // Ensure user is in our local state
        updateCard(id, { assigneeId: previousAssignee.id });
      } else {
        updateCard(id, { assigneeId: undefined });
      }
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete card ${id}`);
      }

      removeCard(id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const prefetch = usePrefetch();

  const prefetchUsers = () => {
    console.log("Prefetching users...");
    prefetch(`users::5:0`, () => fetchUsers(0, 5, ""), 60_000);
  };

  function handleMoveToColumn(targetColumnId: string) {
    if (!columnId || index === undefined || !columns) return;

    const targetColumn = columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) return;

    // Move to the end of the target column
    const targetIndex = targetColumn.cardIds.length;

    // Update UI optimistically
    moveCard(id, columnId, targetColumnId, index, targetIndex);

    // Sync with backend
    fetch(`/api/cards/${id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromColumnId: columnId,
        toColumnId: targetColumnId,
        fromIndex: index,
        toIndex: targetIndex,
      }),
    }).catch((err) => {
      console.error("Failed to move card:", err);
      // Could add error handling/revert logic here
    });

    setMenuOpen(false);
  }

  return (
    <article
      ref={cardRef}
      tabIndex={0}
      className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium leading-6">{title}</h3>
        {isHydrated ? (
          <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Open card menu"
                title="More actions"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isDeleting}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                align="end"
                side="bottom"
                sideOffset={8}
                collisionPadding={8}
                className="z-50 w-40 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl outline-none"
              >
                {columns && columnId && index !== undefined && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Move to column
                    </div>
                    {columns.map((column) => {
                      const isCurrentColumn = column.id === columnId;
                      return (
                        <button
                          key={column.id}
                          type="button"
                          onClick={() => handleMoveToColumn(column.id)}
                          disabled={isCurrentColumn}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="h-4 w-4" aria-hidden />
                          {column.title}
                        </button>
                      );
                    })}
                    <div className="my-1 h-px bg-neutral-200" />
                  </>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await handleDelete();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Archive className="h-4 w-4" aria-hidden />
                  Archive card
                </button>
                <Popover.Arrow className="fill-white drop-shadow" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <button
            type="button"
            aria-label="Open context menu"
            title="More actions"
            disabled={isDeleting}
            className="inline-flex h-7 w-7 items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4"></MoreHorizontal>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <span className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[12px] font-mono text-indigo-700">
          {id}
        </span>

        {isHydrated ? (
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Open assignee picker"
                disabled={isUpdating}
                onMouseEnter={prefetchUsers}
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300 text-[11px] font-medium
               hover:ring-2 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {assignee?.avatar_url ? (
                  <img
                    src={assignee.avatar_url}
                    alt={assignee.name}
                    title={assignee.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  // fallback: initials or first letter
                  <span>{assignee?.name?.[0] ?? "?"}</span>
                )}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                align="end"
                side="bottom"
                sideOffset={8}
                collisionPadding={8}
                className="z-50 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl outline-none"
              >
                <div className="mb-2 text-sm font-medium text-neutral-700">
                  Assign user
                </div>

                <UserSelect
                  selected={assignee ?? null}
                  handleChange={handleAssignUser}
                />

                <Popover.Arrow className="fill-white drop-shadow" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <div />
        )}
      </div>

      {isModalOpen && (
        <Suspense fallback={<CardEditModalSkeleton />}>
          <CardEditModal
            cardId={id}
            title={title}
            description={""}
            assignee={assignee}
            open={isModalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </article>
  );
};
