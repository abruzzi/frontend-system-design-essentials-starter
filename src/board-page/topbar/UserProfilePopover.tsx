import type { User } from "../../types.ts";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";

export const UserProfilePopover = ({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: (user: User) => void;
}) => {
  const [newName, setNewName] = useState(user.name);
  const location = useLocation();

  const handleSaveName = async () => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    } else {
      console.error("Failed to update user");
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label="profile"
          className="h-10 w-10 rounded-full overflow-hidden"
        >
          <img
            src={user.avatar_url}
            alt={user.name}
            title={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        </button>
      </Popover.Trigger>

      <Popover.Content
        sideOffset={5}
        className="rounded-lg border border-neutral-200 bg-white p-4 shadow-md w-60"
      >
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-500">User Profile</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Popover.Close asChild>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
                location.pathname === "/settings"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Popover.Close>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Update name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring"
          />

          <div className="mt-3 flex justify-end gap-2">
            <Popover.Close asChild>
              <button className="px-3 py-1 rounded-md border text-sm">
                Cancel
              </button>
            </Popover.Close>
            <Popover.Close asChild>
              <button
                onClick={handleSaveName}
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
              >
                Save
              </button>
            </Popover.Close>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
