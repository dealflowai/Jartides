/**
 * Manual payment-method configuration (PayPal Friends & Family + Interac
 * E-Transfer). These values are admin-editable via /admin/settings and stored
 * in the `site_settings` table under the keys below.
 *
 * The defaults are used as fallbacks whenever a setting row is empty/unset, so
 * the checkout never shows a blank PayPal username or E-Transfer address.
 *
 * This module is intentionally free of server-only imports so it can be used in
 * both client components (the admin form) and server components (checkout, FAQ).
 * Server-side fetching lives in `lib/payment-settings.ts`.
 */

export interface PaymentSettings {
  paypalUsername: string;
  etransferEmail: string;
  confirmationPhone: string;
  /** Whether the PayPal (worldwide) method is offered at checkout. */
  paypalEnabled: boolean;
  /** Whether the Interac E-Transfer (Canadian buyers) method is offered. */
  etransferEnabled: boolean;
}

/** Default values used when the matching `site_settings` row is empty. */
export const PAYMENT_DEFAULTS: PaymentSettings = {
  paypalUsername: "JanJTP",
  etransferEmail: "rayanwaleed7788@gmail.com",
  confirmationPhone: "226-344-6897",
  paypalEnabled: true,
  etransferEnabled: true,
};

/** `site_settings` keys backing each payment field. */
export const PAYMENT_SETTING_KEYS = {
  paypalUsername: "payment_paypal_username",
  etransferEmail: "payment_etransfer_email",
  confirmationPhone: "payment_confirmation_phone",
  paypalEnabled: "payment_paypal_enabled",
  etransferEnabled: "payment_etransfer_enabled",
} as const;

/** Parse a jsonb/string truthy flag, defaulting when absent or malformed. */
function parseBool(raw: unknown, fallback: boolean): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    if (raw === "false") return false;
    if (raw === "true") return true;
  }
  return fallback;
}

/**
 * Build a complete PaymentSettings object from a raw key→value map (as returned
 * by the settings API / a `site_settings` query), falling back to the defaults
 * for any value that is missing or blank.
 */
export function resolvePaymentSettings(
  map: Record<string, unknown>
): PaymentSettings {
  const pickStr = (key: string, fallback: string): string => {
    const raw = map[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return value || fallback;
  };

  return {
    paypalUsername: pickStr(
      PAYMENT_SETTING_KEYS.paypalUsername,
      PAYMENT_DEFAULTS.paypalUsername
    ),
    etransferEmail: pickStr(
      PAYMENT_SETTING_KEYS.etransferEmail,
      PAYMENT_DEFAULTS.etransferEmail
    ),
    confirmationPhone: pickStr(
      PAYMENT_SETTING_KEYS.confirmationPhone,
      PAYMENT_DEFAULTS.confirmationPhone
    ),
    paypalEnabled: parseBool(
      map[PAYMENT_SETTING_KEYS.paypalEnabled],
      PAYMENT_DEFAULTS.paypalEnabled
    ),
    etransferEnabled: parseBool(
      map[PAYMENT_SETTING_KEYS.etransferEnabled],
      PAYMENT_DEFAULTS.etransferEnabled
    ),
  };
}

/**
 * Compose the "What payment methods do you accept?" FAQ answer from the current
 * settings, so the FAQ never drifts from the live checkout details. Honors the
 * per-method on/off toggles.
 */
export function buildPaymentMethodsAnswer(p: PaymentSettings): string {
  const parts: string[] = [];

  if (p.paypalEnabled) {
    parts.push(
      `Buyers worldwide pay via PayPal Friends & Family (username ${p.paypalUsername}).`
    );
  }
  if (p.etransferEnabled) {
    parts.push(
      `Canadian customers pay by Interac E-Transfer to ${p.etransferEmail}, then text the order number to ${p.confirmationPhone} to confirm.`
    );
  }

  if (parts.length === 0) {
    return "The exact payment details are shown on your order's payment page right after checkout.";
  }
  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Validation (shared by the admin form and the settings API)         */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the editable payment fields. Returns a map of field→error message
 * for any invalid field; an empty object means everything is valid. Fields are
 * only checked when the corresponding method is enabled.
 */
export function validatePaymentFields(input: {
  paypalUsername?: string;
  etransferEmail?: string;
  confirmationPhone?: string;
  paypalEnabled?: boolean;
  etransferEnabled?: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const paypalOn = input.paypalEnabled ?? true;
  const etransferOn = input.etransferEnabled ?? true;

  if (paypalOn) {
    const username = (input.paypalUsername ?? "").trim();
    if (!username) {
      errors.paypalUsername = "PayPal username is required while PayPal is enabled.";
    } else if (/\s/.test(username)) {
      errors.paypalUsername = "PayPal username cannot contain spaces.";
    } else if (username.length > 64) {
      errors.paypalUsername = "PayPal username is too long.";
    }
  }

  if (etransferOn) {
    const email = (input.etransferEmail ?? "").trim();
    if (!email) {
      errors.etransferEmail = "E-Transfer email is required while E-Transfer is enabled.";
    } else if (!EMAIL_RE.test(email)) {
      errors.etransferEmail = "Enter a valid email address.";
    }

    const phone = (input.confirmationPhone ?? "").trim();
    const digits = phone.replace(/\D/g, "");
    if (!phone) {
      errors.confirmationPhone = "Confirmation phone is required while E-Transfer is enabled.";
    } else if (digits.length < 7) {
      errors.confirmationPhone = "Enter a valid phone number.";
    }
  }

  return errors;
}
