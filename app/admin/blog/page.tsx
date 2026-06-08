import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import Button from "@/components/ui/Button";
import BlogPostsTable from "@/components/admin/BlogPostsTable";
import type { BlogPost } from "@/lib/types";

export default async function AdminBlogPage() {
  await requireAdminPage();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as BlogPost[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Write and manage the articles shown on your public blog.
          </p>
        </div>
        <Button href="/admin/blog/new" size="sm">
          New Post
        </Button>
      </div>

      <BlogPostsTable posts={posts} />
    </div>
  );
}
