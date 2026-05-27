type CardIdBadgeProps = {
  id: string;
  useNewIdBadge: boolean;
};

export function CardIdBadge({ id, useNewIdBadge }: CardIdBadgeProps) {
  if (useNewIdBadge) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-50 px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-800 shadow-sm">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-emerald-600">
          ID
        </span>
        {id}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[12px] font-mono text-indigo-700">
      {id}
    </span>
  );
}
