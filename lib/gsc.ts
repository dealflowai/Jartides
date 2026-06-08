import crypto from "crypto";

// Google Search Console (Search Analytics API) client using a service account.
// Signs a JWT with the service account key, exchanges it for an access token,
// and queries the Search Analytics endpoint. No external SDK needed.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export function gscConfigured(): boolean {
  return !!(
    process.env.GSC_CLIENT_EMAIL &&
    process.env.GSC_PRIVATE_KEY &&
    process.env.GSC_SITE_URL
  );
}

export function gscSiteUrl(): string {
  return process.env.GSC_SITE_URL ?? "";
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;

  const clientEmail = (process.env.GSC_CLIENT_EMAIL ?? "").trim();
  // Vercel/.env store the PEM with literal "\n" - turn those back into real
  // newlines, and defensively strip accidental wrapping quotes / whitespace
  // (a common copy-paste mistake that breaks the JWT signature).
  let privateKey = (process.env.GSC_PRIVATE_KEY ?? "").trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now })
  );
  const unsigned = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64url");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: string; error_description?: string };
      detail = j.error_description || j.error || "";
    } catch {
      // body not JSON
    }
    throw new Error(
      `GSC auth failed (${res.status})${detail ? `: ${detail}` : ""}. Using GSC_CLIENT_EMAIL="${clientEmail || "(empty)"}" — confirm this exactly matches your service account.`
    );
  }
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
  return cachedToken.token;
}

export interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function querySearchAnalytics(params: {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}): Promise<GscRow[]> {
  const token = await getAccessToken();
  const site = encodeURIComponent(gscSiteUrl());
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions ?? [],
        rowLimit: params.rowLimit ?? 1000,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403) {
      throw new Error(
        "GSC returned 403. Add the service-account email as a user on the Search Console property, and check GSC_SITE_URL matches the property exactly."
      );
    }
    throw new Error(`GSC query failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { rows?: GscRow[] };
  return data.rows ?? [];
}
