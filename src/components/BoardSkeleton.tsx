import { CardSkeleton } from "./CardSkeleton";

export const BoardSkeleton = () => {
  return (
    <>
      {/* Board Control Skeleton */}
      <div className="w-full bg-neutral-100 border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="inline-flex items-center gap-4 py-2">
            {/* Search input skeleton */}
            <div className="relative w-72">
              <div className="h-10 bg-neutral-200 rounded-md animate-pulse" />
            </div>

            {/* View toggle skeleton */}
            <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />

            {/* Assignee list skeleton */}
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Board View Skeleton */}
      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <section className="flex flex-col gap-4">
            {/* Column title skeleton */}
            <div className="h-7 w-24 bg-neutral-200 rounded animate-pulse" />

            {/* Column container */}
            <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
              <div className="flex flex-col gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />

                {/* Add card input skeleton */}
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-10 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </section>
          </section>

          {/* Column 2 */}
          <section className="flex flex-col gap-4">
            {/* Column title skeleton */}
            <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />

            {/* Column container */}
            <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
              <div className="flex flex-col gap-4">
                <CardSkeleton />
                <CardSkeleton />

                {/* Add card input skeleton */}
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-10 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </section>
          </section>

          {/* Column 3 */}
          <section className="flex flex-col gap-4">
            {/* Column title skeleton */}
            <div className="h-7 w-20 bg-neutral-200 rounded animate-pulse" />

            {/* Column container */}
            <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
              <div className="flex flex-col gap-4">
                <CardSkeleton />

                {/* Add card input skeleton */}
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-10 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    </>
  );
};
