import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const ids = request.nextUrl.searchParams.get("ids")?.trim();

  const supabase = await createClient();

  // Fetch by IDs (used by reorder)
  if (ids) {
    const idList = ids.split(",").filter(Boolean);
    if (idList.length === 0) return NextResponse.json([]);

    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, images")
      .in("id", idList);

    return NextResponse.json(data ?? []);
  }

  // Text search
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, images, category:categories(name)")
    .eq("active", true)
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(6);

  return NextResponse.json(products ?? []);
}
