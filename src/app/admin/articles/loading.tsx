export default function AdminArticlesLoading() {
  return (
    <section className="p-4 space-y-4" role="status" aria-live="polite" aria-busy="true">
      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="w-full border rounded-md overflow-hidden">
        <div className="bg-gray-50 h-10" />
        <div className="divide-y">
          <div className="h-12 bg-white animate-pulse" />
          <div className="h-12 bg-white animate-pulse" />
          <div className="h-12 bg-white animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
      </div>
    </section>
  );
}