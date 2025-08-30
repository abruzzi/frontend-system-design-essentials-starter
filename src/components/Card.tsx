import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { UserSelect } from "./UserSelect.tsx";
import type { User } from "../types.ts";

type CardProps = {
  id: string;
  title: string;
  assignee?: User;
};

export const Card = ({ id, title, assignee }: CardProps) => {
  const [open, setOpen] = useState(false);

  function handleAssignUser(user: User) {
    if (!user) return;
    console.log(user);
    setOpen(false);
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium leading-6">{title}</h3>
      </div>

      <div className="mt-3 flex items-start justify-between">
        <span className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[12px] font-mono text-indigo-700">
          {id}
        </span>

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Open assignee picker"
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300 text-[11px] font-medium
               hover:ring-2 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              <UserSelect selected={assignee} handleChange={handleAssignUser} />
              <Popover.Arrow className="fill-white drop-shadow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </article>
  );
};
