/**
 * Loading fallback component for lazy-loaded pages.
 * Shows a skeleton UI for the page content only.
 * TopBar is already rendered by AppLayout, so we don't need to show it here.
 */
export const PageLoadingFallback = () => {
  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

