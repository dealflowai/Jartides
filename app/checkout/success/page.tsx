import { CheckCircle, AlertTriangle, Clock, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ClearCart from "@/components/checkout/ClearCart";
import type { Order } from "@/lib/types";

interface Props {
  searchParams: Promise<{
    order_id?: string;
    redirect_status?: string;
    account_created?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_id, redirect_status, account_created } = await searchParams;
  let order: Order | null = null;

  if (order_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order_id)
      .limit(50, { foreignTable: "order_items" })
      .single();
    order = data as Order | null;
  }

  const isFailed = redirect_status === "failed" || redirect_status === "requires_payment_method";
  const isProcessing = redirect_status === "processing";

  return (
    <main className="min-h-screen bg-[#f8f9fc] py-16">
      <ClearCart />
      <div className="mx-auto max-w-lg px-4 text-center">
        {/* Status Icon */}
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isFailed
              ? "bg-red-100"
              : isProcessing
                ? "bg-yellow-100"
                : "bg-green-100"
          }`}
        >
          {isFailed ? (
            <AlertTriangle className="h-10 w-10 text-red-600" />
          ) : isProcessing ? (
            <Clock className="h-10 w-10 text-yellow-600" />
          ) : (
            <CheckCircle className="h-10 w-10 text-green-600" />
          )}
        </div>

        <h1
          className={`mb-2 text-3xl font-bold ${
            isFailed ? "text-red-700" : "text-[#0b3d7a]"
          }`}
        >
          {isFailed
            ? "Payment Failed"
            : isProcessing
              ? "Payment Processing"
              : "Thank you for your order!"}
        </h1>
        <p className="mb-8 text-gray-600">
          {isFailed
            ? "Your payment could not be processed. Please try again or use a different payment method."
            : isProcessing
              ? "Your payment is being processed. You will receive a confirmation email once it completes."
              : "Your order has been placed and is being processed."}
        </p>

        {isFailed && (
          <div className="mb-8">
            <Button href="/checkout" variant="fill" size="lg">
              Try Again
            </Button>
          </div>
        )}

        {order && !isFailed && (
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
              Estimated delivery: 3-8 business days
            </div>
          </div>
        )}

        {!order && !order_id && !isFailed && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              If you have any questions about your order, please contact our
              support team.
            </p>
          </div>
        )}

        {account_created === "1" && (
          <div className="mb-8 rounded-xl bg-green-50 border border-green-200 p-5 text-left">
            <p className="text-sm font-semibold text-green-800 mb-1">Account created!</p>
            <p className="text-sm text-green-700">
              Check your email for a verification link to activate your account. Once verified, you can <a href="/login" className="font-medium underline">sign in</a> to track orders and save addresses.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/shop" variant="fill" size="lg">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          {order && !isFailed && (
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
