export const YourWorkPageSkeleton = () => {
  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-neutral-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

