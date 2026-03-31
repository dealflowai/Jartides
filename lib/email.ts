import type { Order, OrderItem } from "@/lib/types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export async function sendEmail(options: {
  from?: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const domain = process.env.RESEND_DOMAIN || "jartides.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from ?? `Jartides <noreply@${domain}>`,
      to: options.to,
      reply_to: options.replyTo,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend API error:", text);
    return { success: false, error: text };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Order confirmation email to customer
// ---------------------------------------------------------------------------

export async function sendOrderConfirmation(
  order: Order,
  items: OrderItem[]
): Promise<void> {
  const customerEmail = order.guest_email;
  if (!customerEmail) {
    console.warn(
      `Order ${order.order_number}: no customer email available — skipping confirmation`
    );
    return;
  }

  const safeOrderNumber = escapeHtml(order.order_number);
  const safeName = escapeHtml(order.shipping_name);
  const safeLine1 = escapeHtml(order.shipping_line1);
  const safeLine2 = order.shipping_line2
    ? escapeHtml(order.shipping_line2)
    : "";
  const safeCity = escapeHtml(order.shipping_city);
  const safeProvince = escapeHtml(order.shipping_province);
  const safePostal = escapeHtml(order.shipping_postal);
  const safeCountry = escapeHtml(order.shipping_country);

  const currency = order.currency || "USD";

  const itemRows = items
    .map((item) => {
      const name = escapeHtml(item.product_name);
      const qty = item.quantity;
      const unitPrice = formatCurrency(item.unit_price, currency);
      const lineTotal = formatCurrency(item.unit_price * item.quantity, currency);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;">${name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${unitPrice}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${lineTotal}</td>
        </tr>`;
    })
    .join("");

  const addressBlock = [
    safeName,
    safeLine1,
    safeLine2,
    `${safeCity}, ${safeProvince} ${safePostal}`,
    safeCountry,
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">JARTIDES</h1>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:32px 24px 8px;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#111;">Order Confirmed</h2>
            <p style="margin:0;color:#666;font-size:14px;">Order #${safeOrderNumber}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;">
              Thank you for your order! We have received your payment and your order is now being processed.
            </p>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#666;border-bottom:1px solid #eee;">Item</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px;color:#666;border-bottom:1px solid #eee;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:1px solid #eee;">Price</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:1px solid #eee;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;font-size:14px;color:#666;">Subtotal</td>
                <td style="padding:4px 0;font-size:14px;text-align:right;">${formatCurrency(order.subtotal, currency)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:14px;color:#666;">Shipping</td>
                <td style="padding:4px 0;font-size:14px;text-align:right;">${formatCurrency(order.shipping_cost, currency)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:14px;color:#666;">Tax</td>
                <td style="padding:4px 0;font-size:14px;text-align:right;">${formatCurrency(order.tax, currency)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0 0;font-size:16px;font-weight:bold;border-top:2px solid #111;">Total</td>
                <td style="padding:8px 0 0;font-size:16px;font-weight:bold;text-align:right;border-top:2px solid #111;">${formatCurrency(order.total, currency)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping address -->
        <tr>
          <td style="padding:0 24px 24px;">
            <h3 style="margin:0 0 8px;font-size:14px;color:#111;">Shipping Address</h3>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">${addressBlock}</p>
          </td>
        </tr>

        <!-- Disclaimer -->
        <tr>
          <td style="padding:16px 24px;background:#fdf6e3;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#856404;line-height:1.5;text-align:center;">
              <strong>For Research Use Only.</strong> Products sold by Jartides are intended solely for
              laboratory and research purposes. They are not intended for human or animal consumption,
              medical, therapeutic, or diagnostic use.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;background:#fafafa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              If you have questions about your order, reply to this email or contact us at
              <a href="mailto:jartidesofficial@gmail.com" style="color:#666;">jartidesofficial@gmail.com</a>.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#bbb;">&copy; Jartides. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: [customerEmail],
    replyTo: "jartidesofficial@gmail.com",
    subject: `Order Confirmation #${safeOrderNumber}`,
    html,
  });

  if (!result.success) {
    throw new Error(`Failed to send order confirmation: ${result.error}`);
  }

  console.log(`Order confirmation email sent for order #${order.order_number}`);
}

// ---------------------------------------------------------------------------
// Admin notification email
// ---------------------------------------------------------------------------

export async function sendAdminOrderNotification(
  order: Order,
  items: OrderItem[]
): Promise<void> {
  const safeOrderNumber = escapeHtml(order.order_number);
  const customerEmail = order.guest_email
    ? escapeHtml(order.guest_email)
    : "N/A (logged-in user)";
  const currency = order.currency || "USD";

  const itemSummary = items
    .map((item) => {
      const name = escapeHtml(item.product_name);
      return `<li>${name} &times; ${item.quantity} &mdash; ${formatCurrency(item.unit_price * item.quantity, currency)}</li>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <tr>
          <td style="background:#0d6efd;padding:20px 24px;">
            <h2 style="margin:0;color:#fff;font-size:18px;">New Order Received</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;font-weight:bold;width:140px;">Order Number</td>
                <td style="padding:6px 0;">#${safeOrderNumber}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-weight:bold;">Customer Email</td>
                <td style="padding:6px 0;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-weight:bold;">Total</td>
                <td style="padding:6px 0;font-size:16px;font-weight:bold;color:#0d6efd;">${formatCurrency(order.total, currency)}</td>
              </tr>
            </table>

            <h3 style="margin:20px 0 8px;font-size:14px;">Items</h3>
            <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
              ${itemSummary}
            </ul>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">Jartides Admin Notification</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: ["jartidesofficial@gmail.com"],
    subject: `New Order #${safeOrderNumber} — ${formatCurrency(order.total, currency)}`,
    html,
  });

  if (!result.success) {
    throw new Error(`Failed to send admin notification: ${result.error}`);
  }

  console.log(`Admin notification sent for order #${order.order_number}`);
}

// ---------------------------------------------------------------------------
// Shipping notification email to customer
// ---------------------------------------------------------------------------

export async function sendShippingNotification(
  order: Order
): Promise<void> {
  const customerEmail = order.guest_email;
  if (!customerEmail) {
    console.warn(
      `Order ${order.order_number}: no customer email — skipping shipping notification`
    );
    return;
  }

  const safeOrderNumber = escapeHtml(order.order_number);
  const safeName = escapeHtml(order.shipping_name);
  const trackingNumber = order.tracking_number
    ? escapeHtml(order.tracking_number)
    : null;
  const carrier = order.carrier ? escapeHtml(order.carrier) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.vercel.app";

  const trackingBlock = trackingNumber
    ? `
      <tr>
        <td style="padding:20px 24px;">
          <div style="background:#f0f4ff;border:1px solid #d0daea;border-radius:8px;padding:20px;">
            <h3 style="margin:0 0 8px;font-size:14px;color:#0b3d7a;">Tracking Information</h3>
            ${carrier ? `<p style="margin:0 0 4px;font-size:14px;color:#555;">Carrier: <strong>${carrier}</strong></p>` : ""}
            <p style="margin:0;font-size:14px;color:#555;">Tracking Number: <strong style="font-family:monospace;">${trackingNumber}</strong></p>
          </div>
        </td>
      </tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <tr>
          <td style="background:#111;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">JARTIDES</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 24px 8px;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#111;">Your Order Has Shipped!</h2>
            <p style="margin:0;color:#666;font-size:14px;">Order #${safeOrderNumber}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;">
              Hi ${safeName}, great news! Your order has been shipped and is on its way to you.
            </p>
          </td>
        </tr>

        ${trackingBlock}

        <tr>
          <td style="padding:20px 24px;">
            <a href="${siteUrl}/track" style="display:inline-block;background:#0b3d7a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">
              Track Your Order
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#fdf6e3;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#856404;line-height:1.5;text-align:center;">
              <strong>For Research Use Only.</strong> Products sold by Jartides are intended solely for
              laboratory and research purposes.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 24px;background:#fafafa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              If you have questions, reply to this email or contact us at
              <a href="mailto:jartidesofficial@gmail.com" style="color:#666;">jartidesofficial@gmail.com</a>.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#bbb;">&copy; Jartides. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: [customerEmail],
    replyTo: "jartidesofficial@gmail.com",
    subject: `Your Order #${safeOrderNumber} Has Shipped!`,
    html,
  });

  if (!result.success) {
    throw new Error(`Failed to send shipping notification: ${result.error}`);
  }

  console.log(`Shipping notification sent for order #${order.order_number}`);
}

// ---------------------------------------------------------------------------
// Low stock alert email to admin
// ---------------------------------------------------------------------------

export async function sendLowStockAlert(
  products: { name: string; sku: string | null; stock_quantity: number; low_stock_threshold: number }[]
): Promise<void> {
  if (products.length === 0) return;

  const rows = products
    .map((p) => {
      const name = escapeHtml(p.name);
      const sku = p.sku ? escapeHtml(p.sku) : "—";
      const isOut = p.stock_quantity <= 0;
      const color = isOut ? "#dc2626" : "#d97706";
      const label = isOut ? "OUT OF STOCK" : "LOW STOCK";
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;">${sku}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;">${p.stock_quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">
            <span style="color:${color};font-weight:bold;font-size:12px;">${label}</span>
          </td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <tr>
          <td style="background:#d97706;padding:20px 24px;">
            <h2 style="margin:0;color:#fff;font-size:18px;">Low Stock Alert</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              The following ${products.length} product${products.length > 1 ? "s" : ""} need attention:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;font-size:13px;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #eee;">Product</th>
                  <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #eee;">SKU</th>
                  <th style="padding:8px 12px;text-align:center;border-bottom:1px solid #eee;">Stock</th>
                  <th style="padding:8px 12px;text-align:center;border-bottom:1px solid #eee;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">Jartides Inventory Alert</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: ["jartidesofficial@gmail.com"],
    subject: `Low Stock Alert: ${products.length} product${products.length > 1 ? "s" : ""} need restocking`,
    html,
  });

  if (!result.success) {
    throw new Error(`Failed to send low stock alert: ${result.error}`);
  }

  console.log(`Low stock alert sent for ${products.length} products`);
}
