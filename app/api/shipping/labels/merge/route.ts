import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import { requireStaff } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";

const mergeSchema = z.object({
  labelUrls: z.array(z.string().url()).min(1).max(100),
});

// Merge multiple Shippo label PDFs into a single PDF for batch printing.
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

    const { labelUrls } = parsed.data;
    const merged = await PDFDocument.create();

    for (const url of labelUrls) {
      const res = await fetch(url);
      if (!res.ok) {
        logger.warn("Failed to fetch label for merge", { url, status: res.status });
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }

    if (merged.getPageCount() === 0) {
      return NextResponse.json(
        { error: "Could not fetch any labels" },
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
