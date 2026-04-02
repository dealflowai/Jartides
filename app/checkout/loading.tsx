export default function CheckoutLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl bg-gray-200 h-[140px] md:h-[180px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form skeleton */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact section */}
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>

            {/* Shipping section */}
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>

            {/* Payment section */}
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-40 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>

          {/* Order summary skeleton */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="h-6 w-1/2 bg-gray-200 rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
