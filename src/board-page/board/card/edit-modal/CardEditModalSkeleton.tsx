export const CardEditModalSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-2xl p-6 overflow-y-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-5 w-5 bg-neutral-200 rounded animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          {/* Title field skeleton */}
          <div>
            <div className="h-4 w-16 bg-neutral-200 rounded mb-2 animate-pulse" />
            <div className="h-10 w-full bg-neutral-200 rounded-lg animate-pulse" />
          </div>

          {/* Description field skeleton */}
          <div>
            <div className="h-4 w-24 bg-neutral-200 rounded mb-2 animate-pulse" />
            <div className="h-32 w-full bg-neutral-200 rounded-lg animate-pulse" />
          </div>

          {/* Assignee field skeleton */}
          <div>
            <div className="h-4 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
            <div className="h-10 w-full bg-neutral-200 rounded-lg animate-pulse" />
          </div>

          {/* Button group skeleton */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <div className="h-10 w-20 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-indigo-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};