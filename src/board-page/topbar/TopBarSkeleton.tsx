export const TopBarSkeleton = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-end">
        {/* Avatar skeleton */}
        <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
      </div>
    </header>
  );
};
