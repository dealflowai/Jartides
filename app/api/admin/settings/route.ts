import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { writeAuditLog } from "@/lib/audit";
import { PAYMENT_SETTING_KEYS, validatePaymentFields } from "@/lib/payment-config";

const ALLOWED_KEY_PREFIXES = [
  "hero_",
  "cta_",
  "how_",
  "trust_",
  "featured_",
  "footer_",
  "contact_",
  "coa_explanation_",
  "faq_",
  "fda_",
  "agegate_",
  "ticker_",
  "instagram_",
  "tiktok_",
  "business_",
  "site_",
  "meta_",
  "social_",
  "seo_",
  "payment_",
];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  // Validate payment fields if any are present, so checkout can never end up
  // with a malformed email / blank PayPal username / junk phone number.
  const touchesPayment = Object.values(PAYMENT_SETTING_KEYS).some(
    (k) => k in payload
  );
  if (touchesPayment) {
    const paymentErrors = validatePaymentFields({
      paypalUsername: payload[PAYMENT_SETTING_KEYS.paypalUsername] as string,
      etransferEmail: payload[PAYMENT_SETTING_KEYS.etransferEmail] as string,
      confirmationPhone: payload[PAYMENT_SETTING_KEYS.confirmationPhone] as string,
      paypalEnabled: payload[PAYMENT_SETTING_KEYS.paypalEnabled] as boolean,
      etransferEnabled: payload[PAYMENT_SETTING_KEYS.etransferEnabled] as boolean,
    });
    if (Object.keys(paymentErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(paymentErrors)[0], fieldErrors: paymentErrors },
        { status: 400 }
      );
    }
  }

  const db = createAdminClient();

  const entries = Object.entries(payload);
  for (const [key, value] of entries) {
    if (!ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      return NextResponse.json(
        { error: `Setting key not allowed: ${key}` },
        { status: 400 }
      );
    }

    const { error } = await db
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Record who changed which settings. Payment-detail changes in particular
  // control where customer money is sent, so an audit trail matters.
  writeAuditLog({
    admin_id: admin.id,
    action: "settings.update",
    entity_type: "site_settings",
    details: { keys: entries.map(([key]) => key) },
  });

  return NextResponse.json({ success: true });
}
