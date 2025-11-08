import { useBoardContext } from "../../shared/BoardContext.tsx";
import { useHydrated } from "../../hooks/useHydrated.ts";
import { TopBarSkeleton } from "./TopBarSkeleton.tsx";

import { lazy, Suspense } from "react";
import type {User} from "../../types.ts";

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
  const { state, upsertUser } = useBoardContext();
  const user = state.usersById[userId];
  const isHydrated = useHydrated();

  if (!user) return <TopBarSkeleton />;

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-end">
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
    </header>
  );
};
