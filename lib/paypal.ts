/**
 * PayPal REST API helpers.
 *
 * Uses PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET env vars.
 * Sandbox is used when CLIENT_ID starts with "sb-" or NODE_ENV !== "production".
 */

const SANDBOX_URL = "https://api-m.sandbox.paypal.com";
const LIVE_URL = "https://api-m.paypal.com";

export function getPayPalBaseUrl(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  if (clientId.startsWith("sb-") || process.env.NODE_ENV !== "production") {
    return SANDBOX_URL;
  }
  return LIVE_URL;
}

/**
 * Fetches an OAuth2 access token from PayPal using client credentials.
 * Tokens are short-lived (~9 hours) but we fetch a fresh one per request
 * to keep things simple and stateless.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  const baseUrl = getPayPalBaseUrl();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
