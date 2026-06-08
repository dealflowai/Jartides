import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BlogCard from "@/components/blog/BlogCard";
import EditableText from "@/components/admin/EditableText";
import type { BlogPost } from "@/lib/types";

/**
 * Homepage "From the Blog" strip — shows the three most recent published posts.
 * Renders nothing until at least one post is published, so the homepage never
 * shows an empty section.
 */
export default async function BlogStrip() {
  let posts: BlogPost[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3);
    if (data) posts = data as BlogPost[];
  } catch {
    // Supabase may not be connected yet — render nothing.
  }

  if (posts.length === 0) return null;

  return (
    <section className="bg-[#f7f9fc] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 md:text-4xl">
              <EditableText settingKey="blog_strip_heading">
                FROM THE BLOG
              </EditableText>
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              <EditableText settingKey="blog_strip_subheading">
                Guides, product education, and updates from our team.
              </EditableText>
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6de3] transition-colors hover:text-[#0b3d7a]"
          >
            View all posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
