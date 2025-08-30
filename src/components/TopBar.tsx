import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { User } from "../types.ts";

export const TopBar = () => {
  const [user, setUser] = useState<User>();
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/users/2")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setNewName(data.name);
      });
  }, []);

  const handleSaveName = async () => {
    if (!user) return;

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
    } else {
      console.error("Failed to update user");
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-end">
        {user && (
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
            </Popover.Content>
          </Popover.Root>
        )}
      </div>
    </header>
  );
};
