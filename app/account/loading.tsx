export default function AccountLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl bg-gray-200 h-[140px] md:h-[180px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-7 w-1/3 bg-gray-200 rounded" />
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
