import { useEffect, useState } from "react";
import type { User } from "../types.ts";

export const TopBar = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    fetch("/api/users/4")
      .then((r) => r.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-end">
        <div className="h-10 w-10 rounded-full" aria-label="profile">
          <img
            src={user?.avatar_url ?? ""}
            alt={user?.name ?? ""}
            title={user?.name ?? ""}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
