import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";

const mergeSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1).max(100),
  includePackingSlips: z.boolean().optional(),
});

interface OrderRow {
  id: string;
  order_number: string;
  guest_email: string | null;
  shipping_label_url: string | null;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  carrier: string | null;
  tracking_number: string | null;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  created_at: string;
}

interface OrderItemRow {
  order_id: string;
  product_name: string;
  variant_size: string | null;
  quantity: number;
  unit_price: number;
}

// Truncate long text to fit on a single packing-slip line
function clip(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// Strip characters Helvetica can't render (it only covers WinAnsi).
// Common offenders: smart quotes, em/en dashes, ellipsis. Replace them
// with ASCII equivalents so pdf-lib doesn't throw "WinAnsi cannot encode".
function ascii(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, "?");
}

function formatMoney(amount: number, currency: string) {
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}

async function buildPackingSlipPage(
  doc: PDFDocument,
  order: OrderRow,
  items: OrderItemRow[]
) {
  const page = doc.addPage([612, 792]); // US Letter
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);

  const margin = 48;
  let y = 760;

  // Header
  page.drawText("PACKING SLIP", { x: margin, y, size: 22, font: helvBold, color: black });
  y -= 26;
  page.drawText(`Order ${ascii(order.order_number)}`, { x: margin, y, size: 13, font: helvBold, color: black });
  const dateStr = new Date(order.created_at).toLocaleDateString();
  const dateText = `Date: ${dateStr}`;
  const dateWidth = helv.widthOfTextAtSize(dateText, 11);
  page.drawText(dateText, { x: 612 - margin - dateWidth, y: y + 1, size: 11, font: helv, color: gray });

  y -= 18;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // Two columns: Ship To / Customer
  y -= 22;
  const colLeftX = margin;
  const colRightX = 320;

  page.drawText("SHIP TO", { x: colLeftX, y, size: 9, font: helvBold, color: gray });
  page.drawText("CUSTOMER", { x: colRightX, y, size: 9, font: helvBold, color: gray });

  y -= 14;
  const leftLines = [
    order.shipping_name,
    order.shipping_line1,
    order.shipping_line2,
    [order.shipping_city, order.shipping_province, order.shipping_postal].filter(Boolean).join(", "),
    order.shipping_country,
    order.shipping_phone ? `Phone: ${order.shipping_phone}` : null,
  ].filter(Boolean) as string[];

  const rightLines = [
    order.guest_email || "—",
    order.carrier ? `Carrier: ${order.carrier}` : null,
    order.tracking_number ? `Tracking: ${order.tracking_number}` : null,
  ].filter(Boolean) as string[];

  let leftY = y;
  for (const line of leftLines) {
    page.drawText(clip(ascii(line), 60), { x: colLeftX, y: leftY, size: 11, font: helv, color: black });
    leftY -= 14;
  }
  let rightY = y;
  for (const line of rightLines) {
    page.drawText(clip(ascii(line), 45), { x: colRightX, y: rightY, size: 11, font: helv, color: black });
    rightY -= 14;
  }

  y = Math.min(leftY, rightY) - 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // Items table
  y -= 22;
  page.drawText("ITEMS", { x: margin, y, size: 9, font: helvBold, color: gray });
  y -= 16;

  const colItem = margin;
  const colQty = 430;
  const colPrice = 480;
  const colSubtotal = 540;

  page.drawText("Product", { x: colItem, y, size: 10, font: helvBold, color: black });
  page.drawText("Qty", { x: colQty, y, size: 10, font: helvBold, color: black });
  page.drawText("Price", { x: colPrice, y, size: 10, font: helvBold, color: black });
  page.drawText("Total", { x: colSubtotal, y, size: 10, font: helvBold, color: black });

  y -= 6;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 14;

  for (const item of items) {
    if (y < 120) {
      // run out of space — skip remaining items rather than overflow
      page.drawText("...", { x: colItem, y, size: 10, font: helv, color: gray });
      break;
    }
    const name = item.variant_size
      ? `${item.product_name} (${item.variant_size})`
      : item.product_name;
    page.drawText(clip(ascii(name), 50), { x: colItem, y, size: 10, font: helv, color: black });
    page.drawText(String(item.quantity), { x: colQty, y, size: 10, font: helv, color: black });
    page.drawText(formatMoney(item.unit_price, order.currency), { x: colPrice, y, size: 9, font: helv, color: black });
    page.drawText(formatMoney(item.unit_price * item.quantity, order.currency), {
      x: colSubtotal,
      y,
      size: 9,
      font: helv,
      color: black,
    });
    y -= 14;
  }

  // Totals
  y -= 8;
  page.drawLine({
    start: { x: 360, y },
    end: { x: 612 - margin, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 14;

  const drawTotalRow = (label: string, value: string, bold = false) => {
    const font = bold ? helvBold : helv;
    page.drawText(label, { x: 380, y, size: 10, font, color: black });
    const w = font.widthOfTextAtSize(value, 10);
    page.drawText(value, { x: 612 - margin - w, y, size: 10, font, color: black });
    y -= 14;
  };

  drawTotalRow("Subtotal", formatMoney(order.subtotal, order.currency));
  drawTotalRow("Shipping", formatMoney(order.shipping_cost, order.currency));
  drawTotalRow("Tax", formatMoney(order.tax, order.currency));
  drawTotalRow("Total", formatMoney(order.total, order.currency), true);

  // Footer
  page.drawText("Thank you for your order!", {
    x: margin,
    y: 60,
    size: 11,
    font: helvBold,
    color: gray,
  });
  page.drawText("Research use only. Not for human consumption.", {
    x: margin,
    y: 46,
    size: 9,
    font: helv,
    color: gray,
  });
}

// Merge labels + packing slips into a single PDF for batch printing/fulfillment.
export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  try {
    const staff = await requireStaff();
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = mergeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderIds, includePackingSlips = true } = parsed.data;
    const db = createAdminClient();

    const { data: orders, error: ordersErr } = await db
      .from("orders")
      .select(
        "id, order_number, guest_email, shipping_label_url, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_province, shipping_postal, shipping_country, shipping_phone, carrier, tracking_number, subtotal, shipping_cost, tax, total, currency, created_at"
      )
      .in("id", orderIds);

    if (ordersErr || !orders) {
      logger.error("merge: failed to fetch orders", { error: ordersErr?.message });
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const { data: items } = await db
      .from("order_items")
      .select("order_id, product_name, variant_size, quantity, unit_price")
      .in("order_id", orderIds);

    const itemsByOrder = new Map<string, OrderItemRow[]>();
    for (const it of (items as OrderItemRow[] | null) ?? []) {
      const list = itemsByOrder.get(it.order_id) ?? [];
      list.push(it);
      itemsByOrder.set(it.order_id, list);
    }

    // Preserve caller's order
    const orderById = new Map((orders as OrderRow[]).map((o) => [o.id, o]));
    const ordered = orderIds
      .map((id) => orderById.get(id))
      .filter((o): o is OrderRow => !!o);

    const merged = await PDFDocument.create();

    for (const order of ordered) {
      // Append the label PDF (if available)
      if (order.shipping_label_url) {
        try {
          const res = await fetch(order.shipping_label_url);
          if (res.ok) {
            const bytes = new Uint8Array(await res.arrayBuffer());
            const labelDoc = await PDFDocument.load(bytes);
            const pages = await merged.copyPages(labelDoc, labelDoc.getPageIndices());
            pages.forEach((p) => merged.addPage(p));
          } else {
            logger.warn("merge: label fetch failed", {
              orderId: order.id,
              status: res.status,
            });
          }
        } catch (e) {
          logger.warn("merge: label load failed", {
            orderId: order.id,
            error: String(e),
          });
        }
      }

      // Append the packing slip
      if (includePackingSlips) {
        try {
          await buildPackingSlipPage(merged, order, itemsByOrder.get(order.id) ?? []);
        } catch (e) {
          logger.warn("merge: packing slip failed", {
            orderId: order.id,
            error: String(e),
          });
        }
      }
    }

    if (merged.getPageCount() === 0) {
      return NextResponse.json(
        { error: "No labels or packing slips could be generated" },
        { status: 502 }
      );
    }

    const out = await merged.save();
    return new NextResponse(out as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="labels-${Date.now()}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error("Label merge error", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to merge labels" },
      { status: 500 }
    );
  }
}
