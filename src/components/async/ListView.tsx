import { useBoardContext } from "../BoardContext.tsx";

export const ListView = () => {
  const { state } = useBoardContext();

  const rows = state.columnOrder.flatMap((colId) => {
    const col = state.columnsById[colId];
    return col.cardIds.map((cardId) => {
      const card = state.cardsById[cardId];
      const assignee = card.assigneeId
        ? state.usersById[card.assigneeId]
        : undefined;
      return {
        columnId: col.id,
        columnTitle: col.title,
        ...card,
        assignee,
      };
    });
  });

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="grid grid-cols-12 gap-2 border-b bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-600">
        <div className="col-span-3">Title</div>
        <div className="col-span-2">Ticket ID</div>
        <div className="col-span-3">Column</div>
        <div className="col-span-4">Assignee</div>
      </div>

      <ul className="divide-y divide-neutral-200">
        {rows.map((row) => (
          <li
            key={row.id}
            className="grid grid-cols-12 items-center gap-2 px-4 py-3"
          >
            <div className="col-span-3">
              <div className="text-sm font-medium text-neutral-900">
                {row.title}
              </div>
            </div>

            <div className="col-span-2">
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs text-neutral-700">
                {row.id}
              </code>
            </div>

            <div className="col-span-3">
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                {row.columnTitle}
              </span>
            </div>

            <div className="col-span-4">
              {row.assignee ? (
                <div className="flex items-center gap-2">
                  <img
                    src={row.assignee.avatar_url}
                    alt={row.assignee.name}
                    className="h-6 w-6 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="text-sm text-neutral-800">
                    {row.assignee.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-neutral-500">Unassigned</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
