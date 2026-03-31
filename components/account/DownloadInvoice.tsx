"use client";

import { FileDown } from "lucide-react";
import type { Order, OrderItem } from "@/lib/types";

interface Props {
  order: Order;
  items: OrderItem[];
}

export default function DownloadInvoice({ order, items }: Props) {
  function handleDownload() {
    const itemRows = items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.product_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${(item.unit_price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 28px; color: #0b3d7a; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .invoice-info { text-align: right; font-size: 13px; color: #666; }
    .invoice-info strong { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    thead th { background: #f8f9fa; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
    .totals td { padding: 6px 12px; font-size: 14px; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
    .address { font-size: 13px; line-height: 1.6; color: #555; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #999; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>JARTIDES</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#1a6de3;letter-spacing:1px;">RESEARCH PEPTIDES</p>
    </div>
    <div class="invoice-info">
      <p><strong>Invoice</strong></p>
      <p>Order #${order.order_number}</p>
      <p>${new Date(order.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </div>

  <div style="margin-bottom:24px;">
    <strong style="font-size:13px;color:#666;">Ship To:</strong>
    <div class="address">
      ${order.shipping_name}<br/>
      ${order.shipping_line1}<br/>
      ${order.shipping_line2 ? order.shipping_line2 + "<br/>" : ""}
      ${order.shipping_city}, ${order.shipping_province} ${order.shipping_postal}<br/>
      ${order.shipping_country}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <table class="totals" style="width:300px;margin-left:auto;">
    <tr><td style="color:#666;">Subtotal</td><td style="text-align:right;">$${order.subtotal.toFixed(2)}</td></tr>
    <tr><td style="color:#666;">Shipping</td><td style="text-align:right;">${order.shipping_cost === 0 ? "Free" : "$" + order.shipping_cost.toFixed(2)}</td></tr>
    <tr><td style="color:#666;">Tax</td><td style="text-align:right;">$${order.tax.toFixed(2)}</td></tr>
    <tr class="total-row"><td>Total</td><td style="text-align:right;">$${order.total.toFixed(2)} ${order.currency.toUpperCase()}</td></tr>
  </table>

  <div class="footer">
    <p>Jartides &middot; Windsor, Ontario, Canada &middot; jartidesofficial@gmail.com</p>
    <p style="margin-top:8px;"><strong>For Research Use Only.</strong> Products are intended solely for laboratory research purposes.</p>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Small delay for content to render, then trigger print
      setTimeout(() => printWindow.print(), 300);
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <FileDown className="h-4 w-4" />
      Download Invoice
    </button>
  );
}
