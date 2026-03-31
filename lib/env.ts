const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const optional = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "EASYPOST_API_KEY",
  "RESEND_API_KEY",
  "RESEND_DOMAIN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    const val = process.env[key];
    if (!val || val.startsWith("your_")) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\nCheck your .env.local file.`
    );
  }

  const unset = optional.filter((k) => {
    const v = process.env[k];
    return !v || v.startsWith("your_") || v.endsWith("_placeholder");
  });

  if (unset.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `[env] Optional variables not configured: ${unset.join(", ")}`
    );
  }
}
