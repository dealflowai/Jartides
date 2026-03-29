import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { Order } from "@/lib/types";

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_id } = await searchParams;
  let order: Order | null = null;

  if (order_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order_id)
      .single();
    order = data as Order | null;
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc] py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        {/* Green Checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-[#0b3d7a]">
          Thank you for your order!
        </h1>
        <p className="mb-8 text-gray-600">
          {order
            ? "Your order has been placed and is being processed."
            : "Your order has been received successfully."}
        </p>

        {order && (
          <div className="mb-8 rounded-xl bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
              <Package className="h-5 w-5 text-[#1a6de3]" />
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-bold text-[#0b3d7a]">
                  {order.order_number}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium capitalize text-yellow-800">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.tax)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-[#0b3d7a]">Total</span>
                <span className="font-bold text-[#0b3d7a]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-[#0b3d7a]">
              Estimated delivery: 5-7 business days
            </div>
          </div>
        )}

        {!order && !order_id && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              If you have any questions about your order, please contact our
              support team.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/shop" variant="fill" size="lg">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          {order && (
            <Button
              href={`/account/orders/${order.id}`}
              variant="ghost"
              size="lg"
            >
              View Order
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
