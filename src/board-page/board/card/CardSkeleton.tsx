export const CardSkeleton = () => {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        {/* Title skeleton */}
        <div className="flex-1">
          <div className="h-6 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Menu button skeleton */}
        <div className="h-7 w-7 bg-neutral-200 rounded-md animate-pulse" />
      </div>

      <div className="mt-3 flex items-start justify-between">
        {/* ID badge skeleton */}
        <div className="h-6 w-16 bg-neutral-200 rounded-md animate-pulse" />

        {/* Avatar skeleton */}
        <div className="ml-2 h-6 w-6 bg-neutral-200 rounded-full animate-pulse" />
      </div>
    </article>
  );
};
