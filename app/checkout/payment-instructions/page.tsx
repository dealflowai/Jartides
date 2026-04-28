import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import ClearCart from "@/components/checkout/ClearCart";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";
import type { Order } from "@/lib/types";

interface Props {
  searchParams: Promise<{
    order_id?: string;
    account_created?: string;
  }>;
}

export const metadata = {
  title: "Complete Your Payment",
  description: "Finish your Jartides order by completing payment via PayPal.",
};

export default async function PaymentInstructionsPage({ searchParams }: Props) {
  const { order_id, account_created } = await searchParams;
  if (!order_id) notFound();

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single<Order>();

  if (!order) notFound();

  return (
    <main className="min-h-screen bg-[#f8f9fc] py-8 sm:py-12">
      <ClearCart />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#0b3d7a]">
            Order placed — one step left
          </h1>
          <p className="mt-2 text-gray-600">
            Your order is reserved. Complete payment via PayPal below to start processing and shipping.
          </p>
        </div>

        {account_created === "1" && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">Account created</p>
            <p className="mt-1 text-sm text-green-700">
              Check your email for a verification link. Once verified, you can{" "}
              <Link href="/login" className="font-medium underline">
                sign in
              </Link>{" "}
              to track this order.
            </p>
          </div>
        )}

        <PaymentInstructions
          orderNumber={order.order_number}
          total={order.total}
          currency={order.currency}
          email={order.guest_email ?? ""}
        />

        {/* Footer actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            href={`/account/orders/${order.id}`}
            className="text-sm font-medium text-[#1a6de3] hover:underline"
          >
            View this order
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Questions? Email{" "}
          <a href="mailto:jartidesofficial@gmail.com" className="text-[#1a6de3] underline">
            jartidesofficial@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
