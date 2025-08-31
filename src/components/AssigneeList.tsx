import { useBoardContext } from "./BoardContext";

export const AssigneeList = () => {
    const { state } = useBoardContext();
    const users = Object.values(state.usersById).slice(0, 3);

    return (
      <div className="flex items-center gap-2">
          {users.map((u) =>
              u.avatar_url ? (
                <img
                  key={u.id}
                  src={u.avatar_url}
                  alt={u.name}
                  title={u.name}
                  aria-label={`assignee-${u.id}`}
                  className="inline-block h-7 w-7 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span
                  key={u.id}
                  aria-label={`assignee-${u.id}`}
                  title={u.name}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-[11px] font-medium"
                >
            {u.name?.[0] ?? "?"}
          </span>
              )
          )}
      </div>
    );
};
