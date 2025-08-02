export default function AdminRootLoading() {
  return (
    <section className="p-4 space-y-4" role="status" aria-live="polite" aria-busy="true">
      <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      </div>
    </section>
  );
}