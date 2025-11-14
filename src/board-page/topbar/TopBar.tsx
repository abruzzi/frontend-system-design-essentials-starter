import { useBoardContext } from "../../shared/BoardContext.tsx";
import { useHydrated } from "../../hooks/useHydrated.ts";
import { TopBarSkeleton } from "./TopBarSkeleton.tsx";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { useEffect } from "react";

import { lazy, Suspense } from "react";
import type {User} from "../../types.ts";
import { LayoutGrid } from "lucide-react";

const UserProfilePopover = lazy(() =>
  import("./UserProfilePopover.tsx").then((mod) => ({
    default: mod.UserProfilePopover,
  })),
);

function UserAvatar(props: { user: User }) {
  return (
    <div className="h-10 w-10 rounded-full overflow-hidden">
      <img
        src={props.user.avatar_url}
        alt={props.user.name}
        title={props.user.name}
        className="h-10 w-10 rounded-full object-cover"
      />
    </div>
  );
}

export const TopBar = () => {
  const userId = 2;
  const { state, upsertUser, ingestUsers } = useBoardContext();
  const user = state.usersById[userId];
  const isHydrated = useHydrated();
  const location = useLocation();

  // Fetch user if not already in context (TopBar needs it)
  useEffect(() => {
    if (!user) {
      fetch(`/api/users/${userId}`)
        .then((r) => r.json())
        .then((userData) => {
          ingestUsers([userData]);
        })
        .catch((err) => {
          console.error("Failed to fetch user", err);
        });
    }
  }, [user, userId, ingestUsers]);

  if (!user) return <TopBarSkeleton />;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            to="/your-work"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive("/your-work") || isActive("/")
                ? "bg-indigo-50 text-indigo-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Your Work
          </Link>
        </nav>
        <div>
          {isHydrated ? (
            <Suspense fallback={<UserAvatar user={user} />}>
              <UserProfilePopover
                key={user.id}
                user={user}
                onUpdate={upsertUser}
              />
            </Suspense>
          ) : (
            <UserAvatar user={user} />
          )}
        </div>
      </div>
    </header>
  );
};
