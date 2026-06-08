import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import BlogCard from "@/components/blog/BlogCard";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog | Jartides Research Peptides",
  description:
    "Research peptide guides, product education, and company updates from the Jartides team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Jartides Research Peptides",
    description:
      "Research peptide guides, product education, and company updates from the Jartides team.",
  },
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data) posts = data as BlogPost[];
  } catch {
    // Supabase may not be connected yet — fall back to an empty list.
  }

  return (
    <>
      <PageHeader
        title="THE JARTIDES BLOG"
        description="Research peptide guides, product education, and updates from our team."
        breadcrumbs={[{ label: "Blog" }]}
        titleKey="blog_title"
        descriptionKey="blog_description"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[#dde2ea] bg-[#f7f9fc] py-20 text-center">
            <Newspaper className="mx-auto mb-4 h-10 w-10 text-[#1a6de3]/60" />
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              No posts yet
            </h2>
            <p className="mt-2 px-6 text-sm text-gray-500">
              We&apos;re working on our first articles. Check back soon for
              research peptide guides and updates.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
