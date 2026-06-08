import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import BlogEditor from "@/components/admin/BlogEditor";
import type { BlogPost } from "@/lib/types";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single<BlogPost>();

  if (!data) notFound();

  return <BlogEditor post={data} />;
}
