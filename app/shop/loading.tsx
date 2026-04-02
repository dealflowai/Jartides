export default function ShopLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl bg-gray-200 h-[140px] md:h-[180px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Category tabs skeleton */}
        <div className="flex gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-5 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
