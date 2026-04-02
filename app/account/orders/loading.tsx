export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl bg-gray-200 h-[140px] md:h-[180px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-7 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-1/4 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
