/**
 * Converts a raw Supabase storage URL to the proxied /api/coa/ path.
 * If the URL is already a relative proxy path, returns it as-is.
 */
export function getCoaUrl(pdfUrl: string): string {
  // Already proxied
  if (pdfUrl.startsWith("/api/coa/")) return pdfUrl;

  // Raw Supabase URL — extract file path after the bucket name
  const marker = "/storage/v1/object/public/coa-documents/";
  const idx = pdfUrl.indexOf(marker);
  if (idx !== -1) {
    return `/api/coa/${pdfUrl.slice(idx + marker.length)}`;
  }

  // Unknown format — return as-is
  return pdfUrl;
}
