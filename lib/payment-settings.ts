/**
 * Server-only helper to read the admin-editable payment settings from
 * `site_settings`. Kept separate from `lib/payment-config.ts` (which is
 * client-safe) so the supabase server import never leaks into the client bundle.
 *
 * Uses the anon server client, which is fine because `site_settings` has a
 * public-read RLS policy and these values are shown to every customer anyway.
 */
import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_SETTING_KEYS,
  resolvePaymentSettings,
  type PaymentSettings,
} from "@/lib/payment-config";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", Object.values(PAYMENT_SETTING_KEYS));

    const map = Object.fromEntries(
      (data ?? []).map((row) => [row.key, row.value])
    );
    return resolvePaymentSettings(map);
  } catch {
    // Fall back to defaults if Supabase is unreachable.
    return resolvePaymentSettings({});
  }
}
