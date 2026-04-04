import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { sendBackInStockNotification } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  product_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { product_id } = parsed.data;
  const db = createAdminClient();

  // Look up product slug
  const { data: product, error: productError } = await db
    .from("products")
    .select("slug, name")
    .eq("id", product_id)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Fetch all un-notified requests for this product
  const { data: requests, error: fetchError } = await db
    .from("back_in_stock_requests")
    .select("id, email, product_name")
    .eq("product_id", product_id)
    .eq("notified", false);

  if (fetchError) {
    logger.error("Failed to fetch back-in-stock requests", { error: fetchError.message });
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!requests || requests.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Send notifications
  let sent = 0;
  for (const request of requests) {
    try {
      await sendBackInStockNotification(
        request.email,
        request.product_name,
        product.slug
      );
      sent++;
    } catch (err) {
      logger.error("Back-in-stock email failed", {
        email: request.email,
        product_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Mark all as notified
  const ids = requests.map((r) => r.id);
  const { error: updateError } = await db
    .from("back_in_stock_requests")
    .update({ notified: true })
    .in("id", ids);

  if (updateError) {
    logger.error("Failed to mark back-in-stock requests as notified", {
      error: updateError.message,
    });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "back_in_stock.notify",
    entity_type: "product",
    entity_id: product_id,
    details: { notifications_sent: sent, total_requests: requests.length },
  });

  logger.info("Back-in-stock notifications sent", {
    product_id,
    product_name: product.name,
    sent,
  });

  return NextResponse.json({ sent });
}
