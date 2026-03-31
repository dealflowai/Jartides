import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, images, category:categories(name)")
    .eq("active", true)
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(6);

  return NextResponse.json(products ?? []);
}
