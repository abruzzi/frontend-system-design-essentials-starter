import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { fetchUsers, UserSelect } from "./UserSelect.tsx";
import type { User } from "../types.ts";
import { useBoardContext } from "./BoardContext.tsx";
import { MoreHorizontal, Archive } from "lucide-react";
import { useHydrated } from "../hooks/useHydrated.ts";
import { usePrefetch } from "./QueryProvider.tsx";

type CardProps = {
  id: string;
  title: string;
  assignee?: User;
};

export const Card = ({ id, title, assignee }: CardProps) => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { removeCard, updateCard, upsertUser } = useBoardContext();
  const isHydrated = useHydrated();

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

  return (
    <article className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5">
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
    </article>
  );
};
