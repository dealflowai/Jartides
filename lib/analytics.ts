// Google Analytics event helpers

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

export function trackPurchase(transactionId: string, value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", "purchase", {
      transaction_id: transactionId,
      value,
      currency: "CAD",
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

export function trackAddToCart(itemId: string, itemName: string, price: number, quantity: number) {
  trackEvent("add_to_cart", "ecommerce", itemName, price * quantity);
}

export function trackBeginCheckout(value: number) {
  trackEvent("begin_checkout", "ecommerce", undefined, value);
}
