export default function ProductLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl bg-gray-200 h-[140px] md:h-[180px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image skeleton */}
          <div className="aspect-square rounded-xl bg-gray-200" />

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-5 w-1/4 bg-gray-200 rounded" />
            <div className="h-10 w-1/3 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
