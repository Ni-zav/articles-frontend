export default function CreateArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6" role="status" aria-live="polite" aria-busy="true">
      <div className="h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
      <div className="space-y-3">
        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-40 w-full bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  );
}