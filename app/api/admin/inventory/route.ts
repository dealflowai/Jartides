import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { sendBackInStockNotification } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

const stockSchema = z.object({
  id: z.string().uuid(),
  stock_quantity: z.number().int().min(0),
});

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("products")
    .update({
      stock_quantity: parsed.data.stock_quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "inventory.update",
    entity_type: "product",
    entity_id: parsed.data.id,
    details: { stock_quantity: parsed.data.stock_quantity },
  });

  // If stock is now > 0, send back-in-stock notifications
  if (parsed.data.stock_quantity > 0) {
    try {
      const { data: requests } = await db
        .from("back_in_stock_requests")
        .select("id, email, product_name")
        .eq("product_id", parsed.data.id)
        .eq("notified", false);

      if (requests && requests.length > 0) {
        const productSlug = data.slug as string;
        let sent = 0;

        for (const request of requests) {
          try {
            await sendBackInStockNotification(
              request.email,
              request.product_name,
              productSlug
            );
            sent++;
          } catch (err) {
            logger.error("Back-in-stock email failed", {
              email: request.email,
              product_id: parsed.data.id,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // Mark all as notified
        const ids = requests.map((r) => r.id);
        await db
          .from("back_in_stock_requests")
          .update({ notified: true })
          .in("id", ids);

        logger.info("Back-in-stock notifications auto-sent on restock", {
          product_id: parsed.data.id,
          sent,
          total: requests.length,
        });
      }
    } catch (err) {
      // Don't fail the inventory update if notifications fail
      logger.error("Back-in-stock auto-notify failed", {
        product_id: parsed.data.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json(data);
}
