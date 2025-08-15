export const Card = ({ id, title }: { id: string; title: string }) => (
  <article className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-base font-medium leading-6">{title}</h3>
    </div>
    <div className="mt-3 flex items-start justify-between">
      <span className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[12px] font-mono text-indigo-700">
        {id}
      </span>
      <span
        className="ml-2 inline-block h-6 w-6 rounded-full bg-neutral-300"
        aria-label="assignee placeholder"
      />
    </div>
  </article>
);
